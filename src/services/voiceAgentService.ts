/**
 * HealthSure — Voice Healthcare Conversational Agent Service
 * src/services/voiceAgentService.ts
 *
 * Full App Voice Control & Action Agent covering the entire HealthSure Patient Portal:
 * - Appointments (Search, slots, booking, cancellation, rescheduling, dates/times/status/token)
 * - Doctor & Specialist Discovery (8 specialties, availability by day/time, name, facility)
 * - Specialist Outreach Camps (Dates, locations, remaining slots, booking)
 * - Health Records & Clinical Summaries (Latest records, reports, prescriptions)
 * - Referrals & Continuity Tracking (Status, destination hospital, priority, timeline)
 * - Follow-up Checkups (Due dates, instructions, mode)
 * - Teleconsultation (Video room status, join room, initiate session)
 * - Lab Diagnostics & Medicine Stocks (Tests, pricing, stock availability)
 * - Patient Profile & Identity (ABHA ID, contact, demographic details)
 * - Emergency SOS & Ambulance (108, 24x7 helpline, PHC emergency room)
 * - In-App Navigation (Direct routing to any patient section)
 * - Conversational Control (Repeat, back, cancel, what can you do)
 * - Natural language code-switching: Hindi, Hinglish, English
 * - Multi-turn conversational context retention & pronoun resolution
 * - Strict mutation safety (All mutating actions gated by confirmation)
 */

import { patientService } from './patientService';
import { resolveVoiceDate, resolveVoiceTime } from '../utils/voiceDateTimeResolver';
import { mockDoctorsList } from '../data/doctorMockData';

export interface DoctorInfo {
  id: string;
  name: string;
  speciality: string;
  hospitalName: string;
  facility?: string;
  designation?: string;
  qualification?: string;
  availableDays?: string[];
  modes?: Array<'in-person' | 'teleconsultation' | 'outreach'>;
  slots?: string[];
  slotsByDay?: { [day: string]: Array<{ time: string; status: 'available' | 'occupied'; mode?: 'in-person' | 'teleconsultation' | 'outreach' }> };
}

export type VoiceLanguage = 'hi' | 'en';

export interface VoiceConversationTurn {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionCard?: {
    type:
      | 'CONFIRM_BOOKING'
      | 'CONFIRM_CANCELLATION'
      | 'CONFIRM_RESCHEDULE'
      | 'DOCTOR_LIST'
      | 'APPOINTMENT_DETAILS'
      | 'RECORDS_SUMMARY'
      | 'REFERRAL_CARD'
      | 'FOLLOW_UP_CARD'
      | 'TELECONSULT_READY'
      | 'OUTREACH_LIST'
      | 'PROFILE_CARD'
      | 'DIAGNOSTICS_LIST';
    data: any;
  };
}

export interface VoiceConversationState {
  intent: string | null;
  selectedDoctor: string | null;
  doctorId: string | null;
  speciality: string | null;
  facility: string | null;
  facilityId: string | null;
  dateStr: string | null;
  dateDisplay: string | null;
  timeStr: string | null;
  time24: string | null;
  targetAppointmentId: string | null;
  rescheduleNewDate?: string | null;
  rescheduleNewTime?: string | null;
  pendingAction: 'BOOK_APPOINTMENT' | 'CANCEL_APPOINTMENT' | 'RESCHEDULE_APPOINTMENT' | 'BOOK_OUTREACH' | null;
  pendingData?: any | null;
  awaitingConfirmation: boolean;
  candidateDoctors: DoctorInfo[];
  candidateSlots: string[];
  lastSpokenResponse: string | null;
  history: VoiceConversationTurn[];
}

export const KNOWN_DOCTORS: DoctorInfo[] = mockDoctorsList.map((d) => ({
  id: d.id,
  name: d.name,
  speciality: d.speciality,
  hospitalName: d.hospitalName,
  facility: d.facility,
  designation: d.designation,
  qualification: d.qualification,
  availableDays: d.availableDays,
  modes: d.modes,
  slots: d.slots,
  slotsByDay: d.slotsByDay,
}));

export const STANDARD_OPD_SLOTS = [
  '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
];

export class VoiceAgentService {
  private state: VoiceConversationState = this.getInitialState();
  private language: VoiceLanguage = 'hi';

  private getInitialState(): VoiceConversationState {
    return {
      intent: null,
      selectedDoctor: null,
      doctorId: null,
      speciality: null,
      facility: null,
      facilityId: null,
      dateStr: null,
      dateDisplay: null,
      timeStr: null,
      time24: null,
      targetAppointmentId: null,
      rescheduleNewDate: null,
      rescheduleNewTime: null,
      pendingAction: null,
      pendingData: null,
      awaitingConfirmation: false,
      candidateDoctors: [...KNOWN_DOCTORS],
      candidateSlots: [...STANDARD_OPD_SLOTS],
      lastSpokenResponse: null,
      history: [],
    };
  }

  public setLanguage(lang: VoiceLanguage) {
    this.language = lang;
  }

  public getLanguage(): VoiceLanguage {
    return this.language;
  }

  public getState(): VoiceConversationState {
    return { ...this.state };
  }

  public resetState() {
    this.state = this.getInitialState();
  }

  public async processVoiceCommand(
    text: string,
    language?: VoiceLanguage
  ) {
    return this.processUserInput(text, language);
  }

  public async processUserInput(
    text: string,
    language?: VoiceLanguage
  ): Promise<{
    spokenResponse: string;
    actionCard?: VoiceConversationTurn['actionCard'];
    navigateUrl?: string;
    state: VoiceConversationState;
  }> {
    if (language) {
      this.language = language;
    }
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Add user turn to history
    this.state.history.push({
      id: 'turn-' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // 2. Repetition intent
    if (/\b(repeat|phir se|dobara|pardon|kya bola|repeat last|wapas bolo|ek baar phir)\b/i.test(lower)) {
      return this.handleRepeat();
    }

    // 3. Go Back intent
    if (/\b(go back|back jao|pichhe jao|pichhla page|previous page)\b/i.test(lower)) {
      return this.handleGoBack();
    }

    // 4. Close Assistant intent
    if (/\b(voice assistant band|modal band|exit assistant|close assistant|assistant band karo|close karo)\b/i.test(lower)) {
      return this.handleCloseAssistant();
    }

    // 5. Emergency / SOS Detection
    if (/\b(emergency|sos|madad|bachao|heart attack|hart attack|accident|bleeding|chest pain|saans nahi aa rahi|ambulance|108|urgent help)\b/i.test(lower)) {
      return this.handleEmergency();
    }

    // 6. What can you do / Capabilities Help
    if (/\b(what can you do|kya kar sakte ho|features|capabilities|madad chahiye|options batao|help me)\b/i.test(lower)) {
      return this.handleCapabilitiesHelp();
    }

    // 7. Awaiting Confirmation Handling
    if (this.state.awaitingConfirmation && this.state.pendingAction) {
      if (this.isAffirmative(lower)) {
        return await this.executeConfirmedAction();
      } else if (this.isNegative(lower)) {
        return this.cancelPendingAction();
      } else {
        // User changed topic or asked a new command: reset pending action cleanly
        this.state.awaitingConfirmation = false;
        this.state.pendingAction = null;
      }
    }

    // 8. Navigation Commands (Explicit page open requests)
    const navMatch = this.detectNavigation(lower);
    if (navMatch) {
      return navMatch;
    }

    // 9. Extract slots and entity references
    this.extractSlotsAndEntities(trimmed);

    // 10. Rescheduling Intent
    if (/\b(reschedule|shift|badal do|aage badha do|change time|change date|dusre din|agla slot|time change)\b/i.test(lower)) {
      return await this.handleRescheduleIntent(lower);
    }

    // 11. Cancellation Intent
    if (/\b(cancel|radd|hata do|delete appointment|appointment cancel|nahi jana)\b/i.test(lower)) {
      return await this.handleCancellationIntent(lower);
    }

    // 12. Teleconsultation Intent (Video call, online doctor, teleconsult)
    if (
      /\b(video|teleconsult|teleconsultation|online doctor|call doctor|video call|doctor se baat)\b/i.test(lower) &&
      !/\b(kaun|who|available|uplabdh|milenge|availability|doctors? ki list)\b/i.test(lower)
    ) {
      return await this.handleTeleconsultationQuery(lower);
    }

    // 13. Specialist Outreach Camps (Outreach, camp, MMU, gaav)
    if (/\b(outreach|camp|camps|mmu|mobile medical|specialist visit|gaav mein|phc camp)\b/i.test(lower)) {
      return await this.handleOutreachQuery(lower);
    }

    // 14. Follow-up Queries
    if (/\b(follow-?ups?|follow up|agla checkup|dobara dikhana|review date)\b/i.test(lower)) {
      return await this.handleFollowUpQuery();
    }

    // 15. Referrals Tracking
    if (/\b(referral|refer|status of referral|hospital refer|bade hospital refer)\b/i.test(lower)) {
      return await this.handleReferralQuery(lower);
    }

    // 16. Health Records, Reports, Prescriptions
    if (/\b(record|records|report|reports|prescription|prescriptions|dawai|dawa|parchi|diagnosis|medical history)\b/i.test(lower)) {
      return await this.handleHealthRecordsQuery(lower);
    }

    // 17. Diagnostics / Lab Tests
    if (/\b(test|tests|lab|blood test|ecg|x-ray|xray|scan|cbc|sugar test|lipid)\b/i.test(lower)) {
      return await this.handleDiagnosticsQuery();
    }

    // 18. Medicine Stock Check
    if (/\b(paracetamol|metformin|amoxicillin|medicine stock|tablet stock|dawai uplabdh)\b/i.test(lower)) {
      return await this.handleMedicinesQuery();
    }

    // 19. Patient Profile & ABHA Query
    if (/\b(profile|mera naam|abha|abha id|patient id|mera address|mera mobile|meri details)\b/i.test(lower)) {
      return await this.handleProfileQuery();
    }

    // 20. Specific Existing Appointment Queries (Today, Tomorrow, Status, Token, Date/Time, Location)
    if (
      /\b(meri appointment|my appointment|next appointment|agli appointment|aaj ki appointment|kal ki appointment|appointments? status|token|kab hai|kis din hai|kis time|time kya hai|doctor kaun hai|kahan par hai|room number)\b/i.test(lower) &&
      !lower.includes('book') &&
      !lower.includes('slot')
    ) {
      return await this.handleSpecificAppointmentQuery(lower);
    }

    // 21. Available Slots Discovery (When a doctor is selected or asking for slots for a doctor)
    const isBookingRequest = /\b(book|appointment lena|milna hai|dikhana hai|checkup karwana|fix karo|kar do|appointment chahiye)\b/i.test(lower) || this.state.intent === 'BOOK_APPOINTMENT';

    const isSlotQueryForDoctor =
      Boolean(this.state.selectedDoctor) &&
      (/\b(slots?|free time|kab free|earliest|subah ka slot|shaam ka slot|dopahar ka slot|free hai kya|available time|pehla slot|sabse pehla)\b/i.test(lower) ||
        (Boolean(this.state.timeStr) && (lower.includes('slot') || lower.includes('aas paas') || lower.includes('baje'))));

    if (!isBookingRequest && isSlotQueryForDoctor) {
      return await this.handleSlotDiscovery(lower);
    }

    // 22. Appointment Booking Flow (Initiation or Continuation)
    if (isBookingRequest) {
      return await this.handleBookingFlow(lower);
    }

    // 23. Doctor / Specialist Discovery Intent
    const isDoctorDiscoveryQuery =
      /\b(dr|doctors?|specialists?|specialt(y|ies)|cardiologist|physician|gynecologist|pediatrician|dermatologist|orthopedic|ent|neurologist|ophthalmologist|pulmonologist|psychiatrist|heart|dil|bukhar|skin|haddi|kaan|dimag|aankh|phephde|kaun kaun|who is available|available doctors)\b/i.test(lower) ||
      (/\b(kaunse|kaun sa|kaun|who)\b.*\b(doctor|specialist|milenge|available|slots?)\b/i.test(lower)) ||
      (/\b(appointment|available|mileg[ia]|aayeng[ei]|kab mileng[ei]|kab aayeng[ei]|availability|uplabdh|free)\b/i.test(lower) && Boolean(this.state.selectedDoctor || this.state.dateDisplay || this.state.dateStr || lower.includes('phc') || lower.includes('khed') || lower.includes('ratnagiri') || lower.includes('teleconsultation') || lower.includes('video') || lower.includes('weekend'))) ||
      (/\b(11|10|9|09|12|1|2|3|4)\s*baje\b/i.test(lower) && (lower.includes('doctor') || lower.includes('khali') || lower.includes('slot') || lower.includes('kaun')));

    if (isDoctorDiscoveryQuery) {
      return await this.handleDoctorDiscovery(lower);
    }

    // 24. General Slot Discovery fallback
    if (!isBookingRequest && (/\b(slots?|free time|kab free|earliest|subah ka slot|shaam ka slot|dopahar ka slot|available time)\b/i.test(lower))) {
      return await this.handleSlotDiscovery(lower);
    }

    // Fallback: Intelligent conversational guidance
    const spoken = this.language === 'hi'
      ? 'Main aapki appointments, doctors, health records, referrals aur teleconsultation mein madad kar sakta hoon. Aap bol sakte hain: "Wednesday ko doctors batao", "Meri next appointment kab hai", ya "Health records dikhao".'
      : 'I can help you manage appointments, discover doctors, view health records, track referrals, and start teleconsultations. Try saying: "Show doctors for Wednesday" or "When is my next appointment?".';

    this.recordAgentResponse(spoken);
    return { spokenResponse: spoken, state: this.getState() };
  }

  // ── Affirmation & Negation Check ──────────────────────────────────────────

  private isAffirmative(text: string): boolean {
    const clean = text.trim();
    return (
      /^(haan|ha|haa|yes|yeah|sure|confirm|kar do|book kar do|theek hai|proceed|bilkul|ok|okay|ji haan|sahi hai)[\.\!\?]?$/i.test(clean) ||
      /^(haan|yes|confirm|theek hai|proceed|ok)\b/i.test(clean)
    );
  }

  private isNegative(text: string): boolean {
    const clean = text.trim();
    return (
      /^(nahi|na|no|nope|cancel|mat karo|rehne do|cancel it|stop|chhod do|nahi chahiye)[\.\!\?]?$/i.test(clean) ||
      /^(nahi|no|cancel|mat karo)\b/i.test(clean)
    );
  }

  // ── Navigation Handler ───────────────────────────────────────────────────

  private detectNavigation(lower: string): { spokenResponse: string; navigateUrl: string; state: VoiceConversationState } | null {
    const routes: Array<{ regex: RegExp; url: string; hi: string; en: string }> = [
      { regex: /\b(dashboard|mukhya prishth)\b.*\b(kholo|open|chalo|navigate)\b|\b(dashboard kholo|open dashboard|home page)\b/i, url: '/patient/dashboard', hi: 'Dashboard khol raha hoon.', en: 'Opening Dashboard.' },
      { regex: /\bappointments?\b.*\b(kholo|open|chalo|page|dikhao)\b/i, url: '/patient/appointments', hi: 'Appointments page khol raha hoon.', en: 'Opening Appointments page.' },
      { regex: /\bdoctors?\b.*\b(page|kholo|open|chalo|navigate)\b/i, url: '/patient/doctors', hi: 'Doctors page khol raha hoon.', en: 'Opening Doctors page.' },
      { regex: /\boutreach\b.*\b(page|kholo|open)\b/i, url: '/patient/outreach', hi: 'Specialist Outreach schedule khol raha hoon.', en: 'Opening Specialist Outreach schedule.' },
      { regex: /\b(health\s+)?records?\b.*\b(page|kholo|open)\b/i, url: '/patient/records', hi: 'Health records page khol raha hoon.', en: 'Opening Health Records page.' },
      { regex: /\breferrals?\b.*\b(page|kholo|open)\b/i, url: '/patient/referrals', hi: 'Referrals page khol raha hoon.', en: 'Opening Referrals page.' },
      { regex: /\bfollow[-\s]?ups?\b.*\b(page|kholo|open)\b/i, url: '/patient/followups', hi: 'Follow-ups page khol raha hoon.', en: 'Opening Follow-ups page.' },
      { regex: /\bteleconsultation\b.*\b(page|kholo|open)\b/i, url: '/patient/teleconsultation', hi: 'Teleconsultation page khol raha hoon.', en: 'Opening Teleconsultation page.' },
      { regex: /\bprofile\b.*\b(page|kholo|open)\b/i, url: '/patient/profile', hi: 'Aapki Profile khol raha hoon.', en: 'Opening your Profile.' },
      { regex: /\b(help|emergency|sos)\b.*\b(page|kholo|open)\b/i, url: '/patient/help', hi: 'Emergency aur Help page khol raha hoon.', en: 'Opening Emergency Help page.' },
    ];

    for (const r of routes) {
      if (r.regex.test(lower)) {
        const resp = this.language === 'hi' ? r.hi : r.en;
        this.recordAgentResponse(resp);
        return { spokenResponse: resp, navigateUrl: r.url, state: this.getState() };
      }
    }
    return null;
  }

  // ── Conversational Controls ──────────────────────────────────────────────

  private handleRepeat() {
    const resp = this.state.lastSpokenResponse || (this.language === 'hi' ? 'Maine pehle koi jawab nahi diya hai.' : 'I have not provided an earlier response yet.');
    this.recordAgentResponse(resp);
    return { spokenResponse: resp, state: this.getState() };
  }

  private handleGoBack() {
    const resp = this.language === 'hi' ? 'Pichhle page par le ja raha hoon.' : 'Taking you back to the previous screen.';
    this.recordAgentResponse(resp);
    return { spokenResponse: resp, navigateUrl: '/patient/dashboard', state: this.getState() };
  }

  private handleCloseAssistant() {
    const resp = this.language === 'hi' ? 'Voice assistant band kar raha hoon. Dhanyawaad!' : 'Closing voice assistant. Thank you!';
    this.recordAgentResponse(resp);
    return { spokenResponse: resp, navigateUrl: '', state: this.getState() };
  }

  private handleCapabilitiesHelp() {
    const resp = this.language === 'hi'
      ? 'HealthSure Voice Assistant se aap: 1. Doctors dhoondh sakte hain, 2. Appointments book, cancel ya reschedule kar sakte hain, 3. Health records aur reports dekh sakte hain, 4. Referral status aur follow-up check kar sakte hain, 5. Video teleconsultation shuru kar sakte hain, aur 6. Emergency mein 108 ya helpline connect kar sakte hain.'
      : 'With HealthSure Voice Assistant, you can: 1. Find specialist doctors, 2. Book, cancel, or reschedule appointments, 3. View health records & prescriptions, 4. Track referrals & follow-ups, 5. Launch video teleconsultation, and 6. Access 108 Emergency SOS support.';
    this.recordAgentResponse(resp);
    return { spokenResponse: resp, state: this.getState() };
  }

  private handleEmergency(): { spokenResponse: string; navigateUrl?: string; state: VoiceConversationState } {
    const resp = this.language === 'hi'
      ? 'Emergency alert! Yadi aapko turant chikitsa sahayata chahiye toh 108 dial karein ya nazdeeki PHC emergency ward jayein. HealthSure 24x7 helpline 07314624692 par bhi call kar sakte hain.'
      : 'Emergency alert! If you need urgent medical care, please dial 108 immediately or visit your nearest PHC emergency room. HealthSure 24x7 helpline is 07314624692.';
    this.recordAgentResponse(resp);
    return { spokenResponse: resp, navigateUrl: '/patient/help', state: this.getState() };
  }

  // ── Entity Extraction & Pronoun Resolution ────────────────────────────────

  private extractSlotsAndEntities(text: string) {
    const lower = text.toLowerCase();

    // 1. Date resolution
    const resolvedDate = resolveVoiceDate(text);
    if (resolvedDate) {
      if (resolvedDate.isContextualSame) {
        // Keep existing date
      } else if (resolvedDate.dateStr) {
        this.state.dateStr = resolvedDate.dateStr;
        this.state.dateDisplay = resolvedDate.display;
      }
    }

    // 2. Time resolution
    const resolvedTime = resolveVoiceTime(text);
    if (resolvedTime) {
      if (resolvedTime.isContextualSame) {
        // Keep existing time
      } else if (resolvedTime.timeStr) {
        this.state.timeStr = resolvedTime.timeStr;
        this.state.time24 = resolvedTime.time24;
      }
    }

    // 3. Pronoun / Contextual Doctor references
    if (/\b(pehla wala|first doctor|pehla doctor|first one)\b/i.test(lower) && this.state.candidateDoctors.length > 0) {
      const doc = this.state.candidateDoctors[0];
      this.state.selectedDoctor = doc.name;
      this.state.doctorId = doc.id;
      this.state.speciality = doc.speciality;
      return;
    }

    if (/\b(doosra wala|second doctor|doosra doctor|second one)\b/i.test(lower) && this.state.candidateDoctors.length > 1) {
      const doc = this.state.candidateDoctors[1];
      this.state.selectedDoctor = doc.name;
      this.state.doctorId = doc.id;
      this.state.speciality = doc.speciality;
      return;
    }

    if (/\b(uske saath|woh doctor|same doctor|wahi doctor)\b/i.test(lower) && this.state.selectedDoctor) {
      return;
    }

    // 4. Doctor Name detection
    const doctorMappings: Array<{ name: string; id: string; spec: string; facility: string; keywords: string[] }> = [
      { name: 'Dr. Ananya Mehta', id: 'doc-001', spec: 'Cardiology', facility: 'District Hospital Ratnagiri', keywords: ['ananya', 'ananya mehta'] },
      { name: 'Dr. Rahul Verma', id: 'doc-002', spec: 'General Medicine', facility: 'District Hospital Pune', keywords: ['rahul verma'] },
      { name: 'Dr. Priya Nair', id: 'doc-003', spec: 'Gynecology', facility: 'Sub-District Hospital Sawantwadi', keywords: ['priya nair'] },
      { name: 'Dr. Arjun Kapoor', id: 'doc-004', spec: 'Pediatrics', facility: 'District Hospital Ratnagiri', keywords: ['arjun', 'kapoor', 'arjun kapoor'] },
      { name: 'Dr. Neha Sharma', id: 'doc-005', spec: 'Dermatology', facility: 'District Hospital Ratnagiri', keywords: ['neha', 'neha sharma'] },
      { name: 'Dr. Vivek Rao', id: 'doc-006', spec: 'Orthopedics', facility: 'District Hospital Ratnagiri', keywords: ['vivek', 'rao', 'vivek rao'] },
      { name: 'Dr. Kavita Joshi', id: 'doc-007', spec: 'ENT', facility: 'Sub-District Hospital Sawantwadi', keywords: ['kavita', 'joshi', 'kavita joshi'] },
      { name: 'Dr. Sameer Khan', id: 'doc-008', spec: 'Neurology', facility: 'District Hospital Ratnagiri', keywords: ['sameer', 'khan', 'sameer khan'] },
      { name: 'Dr. Rajesh Patil', id: 'doc-009', spec: 'General Medicine', facility: 'PHC Khed', keywords: ['rajesh', 'patil', 'rajesh patil'] },
      { name: 'Dr. Sunita Kulkarni', id: 'doc-010', spec: 'Gynecology', facility: 'District Hospital Ratnagiri', keywords: ['sunita', 'kulkarni', 'sunita kulkarni'] },
      { name: 'Dr. Amit Deshmukh', id: 'doc-011', spec: 'Cardiology', facility: 'District Hospital Pune', keywords: ['amit', 'deshmukh', 'amit deshmukh'] },
      { name: 'Dr. Sneha Bhonsle', id: 'doc-012', spec: 'Pediatrics', facility: 'SDH Chiplun', keywords: ['sneha', 'bhonsle', 'sneha bhonsle'] },
      { name: 'Dr. Rahul Shah', id: 'doc-013', spec: 'Orthopedics', facility: 'PHC Khed', keywords: ['rahul shah'] },
      { name: 'Dr. Priya Shah', id: 'doc-014', spec: 'Dermatology', facility: 'City Hospital Chiplun', keywords: ['priya shah'] },
      { name: 'Dr. Vikram Malhotra', id: 'doc-015', spec: 'ENT', facility: 'District Hospital Pune', keywords: ['vikram', 'malhotra', 'vikram malhotra'] },
      { name: 'Dr. Pooja Sawant', id: 'doc-016', spec: 'Ophthalmology', facility: 'District Hospital Ratnagiri', keywords: ['pooja', 'sawant', 'pooja sawant'] },
      { name: 'Dr. Sandeep Gokhale', id: 'doc-017', spec: 'Pulmonology', facility: 'District Hospital Ratnagiri', keywords: ['sandeep', 'gokhale', 'sandeep gokhale'] },
      { name: 'Dr. Meera Chougule', id: 'doc-018', spec: 'Psychiatry', facility: 'District Hospital Pune', keywords: ['meera', 'chougule', 'meera chougule'] },
      { name: 'Dr. Nitin Kamble', id: 'doc-019', spec: 'General Surgery', facility: 'Sub-District Hospital Sawantwadi', keywords: ['nitin', 'kamble', 'nitin kamble'] },
      { name: 'Dr. Deepa Shinde', id: 'doc-020', spec: 'Endocrinology', facility: 'District Hospital Ratnagiri', keywords: ['deepa', 'shinde', 'deepa shinde'] },
    ];

    let matchedDoc = doctorMappings.find((doc) => doc.keywords.some((kw) => lower.includes(kw)));
    if (!matchedDoc) {
      if (lower.includes('rahul') && !lower.includes('shah')) {
        matchedDoc = doctorMappings.find((d) => d.id === 'doc-002');
      } else if (lower.includes('priya') && !lower.includes('shah')) {
        matchedDoc = doctorMappings.find((d) => d.id === 'doc-003');
      }
    }
    if (matchedDoc) {
      this.state.selectedDoctor = matchedDoc.name;
      this.state.doctorId = matchedDoc.id;
      this.state.speciality = matchedDoc.spec;
      this.state.facility = matchedDoc.facility;
    }

    // 5. Specialty keywords
    const specialtyMappings: Array<{ spec: string; keywords: string[] }> = [
      { spec: 'Cardiology', keywords: ['cardio', 'cardiology', 'cardiologist', 'heart', 'dil'] },
      { spec: 'General Medicine', keywords: ['general medicine', 'general physician', 'bukhar', 'fever', 'physician'] },
      { spec: 'Gynecology', keywords: ['gynecology', 'gynaecology', 'gynecologist', 'gynaecologist', 'mahila', 'pregnancy', 'delivery'] },
      { spec: 'Pediatrics', keywords: ['pediatrics', 'paediatrics', 'pediatrician', 'paediatrician', 'bacche', 'baccho', 'bacho', 'bachha', 'baccha', 'child', 'children', 'kids'] },
      { spec: 'Dermatology', keywords: ['dermatology', 'dermatologist', 'skin', 'chamdi', 'tvacha', 'allergy'] },
      { spec: 'Orthopedics', keywords: ['orthopedics', 'orthopaedics', 'orthopedic', 'ortho', 'haddi', 'bone', 'joint'] },
      { spec: 'ENT', keywords: ['ent', 'kaan', 'naak', 'gala', 'ear', 'nose', 'throat'] },
      { spec: 'Neurology', keywords: ['neurology', 'neurologist', 'neuro', 'dimag', 'brain', 'headache'] },
      { spec: 'Ophthalmology', keywords: ['ophthalmology', 'ophthalmologist', 'eye', 'aankh', 'netra', 'drishti'] },
      { spec: 'Pulmonology', keywords: ['pulmonology', 'pulmonologist', 'lungs', 'chest', 'saans', 'phephde'] },
      { spec: 'Psychiatry', keywords: ['psychiatry', 'psychiatrist', 'mental health', 'manasik', 'depression', 'stress'] },
      { spec: 'General Surgery', keywords: ['general surgery', 'surgeon', 'surgery', 'operation'] },
      { spec: 'Endocrinology', keywords: ['endocrinology', 'endocrinologist', 'diabetes', 'sugar', 'thyroid'] },
    ];

    for (const sm of specialtyMappings) {
      if (sm.keywords.some((kw) => lower.includes(kw))) {
        this.state.speciality = sm.spec;
        break;
      }
    }

    // 6. Facility keywords
    const facilityMappings: Array<{ facility: string; keywords: string[] }> = [
      { facility: 'PHC Khed', keywords: ['khed', 'phc khed'] },
      { facility: 'District Hospital Ratnagiri', keywords: ['ratnagiri', 'dh ratnagiri'] },
      { facility: 'District Hospital Pune', keywords: ['pune', 'dh pune'] },
      { facility: 'Sub-District Hospital Sawantwadi', keywords: ['sawantwadi', 'sdh sawantwadi'] },
      { facility: 'SDH Chiplun', keywords: ['chiplun', 'sdh chiplun'] },
      { facility: 'PHC Dapoli', keywords: ['dapoli', 'phc dapoli'] },
      { facility: 'PHC Guhagar', keywords: ['guhagar', 'phc guhagar'] },
    ];

    for (const fm of facilityMappings) {
      if (fm.keywords.some((kw) => lower.includes(kw))) {
        this.state.facility = fm.facility;
        break;
      }
    }
  }

  // ── Doctor Discovery ─────────────────────────────────────────────────────

  private async handleDoctorDiscovery(lowerQuery: string = '') {
    const doctors = await patientService.getDoctors();
    let matched = [...doctors];

    // 1. Specialty filtering
    if (this.state.speciality) {
      matched = matched.filter((d) => d.speciality.toLowerCase().includes(this.state.speciality!.toLowerCase()));
    }

    // 2. Day filtering
    let targetDay = '';
    if (this.state.dateDisplay) {
      targetDay = this.state.dateDisplay.replace('Next ', '').replace(' (Weekend)', '').trim();
    } else if (lowerQuery.includes('friday') || lowerQuery.includes('shukrawar') || lowerQuery.includes('shukr')) {
      targetDay = 'Friday';
    } else if (lowerQuery.includes('saturday') || lowerQuery.includes('shaniwar') || lowerQuery.includes('shan')) {
      targetDay = 'Saturday';
    } else if (lowerQuery.includes('monday') || lowerQuery.includes('somwar') || lowerQuery.includes('som')) {
      targetDay = 'Monday';
    } else if (lowerQuery.includes('wednesday') || lowerQuery.includes('budhwar') || lowerQuery.includes('budh')) {
      targetDay = 'Wednesday';
    } else if (lowerQuery.includes('tuesday') || lowerQuery.includes('mangalwar')) {
      targetDay = 'Tuesday';
    } else if (lowerQuery.includes('thursday') || lowerQuery.includes('guruwar')) {
      targetDay = 'Thursday';
    } else if (lowerQuery.includes('sunday') || lowerQuery.includes('raviwar') || lowerQuery.includes('itwar')) {
      targetDay = 'Sunday';
    }

    const isWeekend = lowerQuery.includes('weekend') || this.state.dateDisplay?.includes('Weekend');
    if (isWeekend) {
      matched = matched.filter((d) => d.availableDays.includes('Saturday') || d.availableDays.includes('Sunday'));
    } else if (targetDay && targetDay !== 'Today' && targetDay !== 'Tomorrow') {
      matched = matched.filter((d) => d.availableDays.some((ad) => ad.toLowerCase().includes(targetDay.toLowerCase())));
    }

    // 3. Facility filtering
    if (this.state.facility) {
      matched = matched.filter((d) => 
        (d.facility && d.facility.toLowerCase().includes(this.state.facility!.toLowerCase())) ||
        (d.hospitalName && d.hospitalName.toLowerCase().includes(this.state.facility!.toLowerCase()))
      );
    }

    // 4. Mode filtering (teleconsultation vs outreach vs in-person)
    const isTele = lowerQuery.includes('teleconsultation') || lowerQuery.includes('video') || lowerQuery.includes('online');
    if (isTele) {
      matched = matched.filter((d) => d.modes.includes('teleconsultation'));
    }

    // 5. Time of Day filtering (morning vs evening vs 11 baje vs earliest)
    const isMorning = lowerQuery.includes('morning') || lowerQuery.includes('subah');
    const isEvening = lowerQuery.includes('evening') || lowerQuery.includes('shaam') || lowerQuery.includes('sham');
    const isEarliest = lowerQuery.includes('earliest') || lowerQuery.includes('sabse pehle') || lowerQuery.includes('sabse pehla');

    if (isMorning) {
      matched = matched.filter((d) => d.slots.some((s) => s.includes('AM') || s.startsWith('09:') || s.startsWith('10:') || s.startsWith('11:')));
    } else if (isEvening) {
      matched = matched.filter((d) => d.slots.some((s) => s.startsWith('03:') || s.startsWith('04:')));
    } else if (lowerQuery.includes('11 baje') || lowerQuery.includes('11:00') || lowerQuery.includes('11 am')) {
      matched = matched.filter((d) => d.slots.some((s) => s.startsWith('11:')));
    }

    // Earliest doctor query (e.g. "Friday ko sabse pehle kaunsa doctor available hai?")
    if (isEarliest) {
      const earliestDocs = matched.filter((d) => d.slots.some((s) => s.startsWith('09:00')));
      const targetDocs = earliestDocs.length > 0 ? earliestDocs : matched.slice(0, 2);
      const docNames = targetDocs.map((d) => d.name).join(' aur ');
      const earliestTime = targetDocs[0]?.slots[0] || '09:00 AM';
      const dayName = targetDay || 'Friday';

      const spoken = this.language === 'hi'
        ? `${dayName} ko sabse pehle ${docNames} subah ${earliestTime} par uplabdh hain. Kya aap ${earliestTime} ka slot book karna chahte hain?`
        : `On ${dayName}, the earliest available doctors are ${docNames} at ${earliestTime}. Would you like to book a slot?`;

      this.state.candidateDoctors = targetDocs.map((d) => ({ ...d }));
      const card = { type: 'DOCTOR_LIST' as const, data: { doctors: targetDocs } };
      this.recordAgentResponse(spoken, card);
      return { spokenResponse: spoken, actionCard: card, state: this.getState() };
    }

    this.state.candidateDoctors = matched.map((d) => ({ ...d }));

    const dayLabel = isWeekend ? 'weekend par' : targetDay ? (targetDay.startsWith('Next') ? targetDay : `${targetDay}`) : (this.language === 'hi' ? 'iss hafte' : 'this week');
    const docNames = matched.slice(0, 3).map((d) => `${d.name} (${d.speciality})`).join(', ');

    let spoken = '';
    if (this.state.facility) {
      spoken = this.language === 'hi'
        ? `${this.state.facility} mein ${dayLabel} ko ${matched.length} doctors uplabdh hain: ${matched.map((d) => `${d.name} (${d.speciality})`).join(' aur ')}. Aap kinke saath appointment chahte hain?`
        : `At ${this.state.facility} on ${dayLabel}, ${matched.length} doctors are available: ${matched.map((d) => `${d.name} (${d.speciality})`).join(' and ')}. Which doctor would you like to book with?`;
    } else if (isTele) {
      spoken = this.language === 'hi'
        ? `${dayLabel} ko teleconsultation ke liye hamare paas ${matched.length} doctors uplabdh hain, jinme ${docNames} shamil hain. Kya aap video consultation book karna chahte hain?`
        : `On ${dayLabel}, we have ${matched.length} doctors available for teleconsultation, including ${docNames}. Would you like to book a video session?`;
    } else if (isWeekend && this.state.speciality) {
      const doc = matched[0];
      spoken = this.language === 'hi'
        ? `Haan, weekend par ${doc.name} (${doc.speciality}) ${doc.availableDays.join(' aur ')} ko ${doc.facility || doc.hospitalName} mein uplabdh hain. Kya aap inke saath appointment book karna chahte hain?`
        : `Yes, on weekends ${doc.name} (${doc.speciality}) is available on ${doc.availableDays.join(' and ')} at ${doc.facility || doc.hospitalName}. Would you like to book an appointment?`;
    } else if (this.state.speciality) {
      if (matched.length === 1) {
        const d = matched[0];
        const slotPreview = d.slots.slice(0, 3).join(', ');
        spoken = this.language === 'hi'
          ? `Haan, ${dayLabel} ko ${d.name} (${d.speciality}) ${d.facility || d.hospitalName} mein uplabdh hain. Unke paas ${slotPreview} ke slots uplabdh hain. Kya main slot book kar doon?`
          : `Yes, on ${dayLabel} ${d.name} (${d.speciality}) is available at ${d.facility || d.hospitalName}. Slots include ${slotPreview}. Would you like to book?`;
      } else {
        spoken = this.language === 'hi'
          ? `${dayLabel} ko ${this.state.speciality} ke ${matched.length} doctors uplabdh hain: ${matched.map((d) => `${d.name} (${d.hospitalName || d.facility})`).join(' aur ')}. Aap kinke saath appointment chahte hain?`
          : `On ${dayLabel}, ${matched.length} ${this.state.speciality} specialists are available: ${matched.map((d) => `${d.name} (${d.hospitalName || d.facility})`).join(' and ')}. Who would you like to see?`;
      }
    } else if (lowerQuery.includes('11 baje') || lowerQuery.includes('11:00') || lowerQuery.includes('11 am')) {
      spoken = this.language === 'hi'
        ? `11:00 AM ke slot ke liye hamare paas ${matched.slice(0, 3).map((d) => `${d.name} (${d.speciality})`).join(', ')} uplabdh hain. Aap kinke saath appointment chahte hain?`
        : `For the 11:00 AM slot, ${matched.slice(0, 3).map((d) => `${d.name} (${d.speciality})`).join(', ')} are available. Who would you prefer?`;
    } else if (isMorning) {
      spoken = this.language === 'hi'
        ? `${dayLabel} subah hamare paas ${matched.length} doctors uplabdh hain: ${docNames} aur anya. Sabhi ke subah ke slots available hain. Aap kinke saath milna chahte hain?`
        : `On ${dayLabel} morning, we have ${matched.length} doctors available: ${docNames} and more. Who would you like to see?`;
    } else if (isEvening) {
      spoken = this.language === 'hi'
        ? `${dayLabel} shaam ko hamare paas ${matched.length} doctors uplabdh hain: ${docNames} aur anya. Inke shaam ke slots uplabdh hain.`
        : `On ${dayLabel} evening, we have ${matched.length} doctors available: ${docNames} and others with evening slots.`;
    } else {
      spoken = this.language === 'hi'
        ? `${dayLabel} hamare paas ${matched.length} doctors uplabdh hain: ${docNames}. Aap appointments ke slots dekh sakte hain ya book kar sakte hain. Kya aap inme se kisi ke saath appointment book karna chahte hain?`
        : `On ${dayLabel}, we have ${matched.length} doctors available: ${docNames}. You can view appointment slots or book now. Would you like to book an appointment with one of them?`;
    }

    const card = {
      type: 'DOCTOR_LIST' as const,
      data: { doctors: matched.slice(0, 4) },
    };

    this.recordAgentResponse(spoken, card);
    return { spokenResponse: spoken, actionCard: card, state: this.getState() };
  }

  // ── Slot Discovery ───────────────────────────────────────────────────────

  private async handleSlotDiscovery(lower: string) {
    const doctorName = this.state.selectedDoctor || 'Dr. Ananya Mehta';
    const dayLabel = this.state.dateDisplay?.replace('Next ', '').replace(' (Weekend)', '').trim() || 'Wednesday';

    // Find the doctor in mockDoctorsList
    const doc = mockDoctorsList.find((d) => d.name.toLowerCase() === doctorName.toLowerCase() || d.id === this.state.doctorId);
    const daySlots = doc?.slotsByDay?.[dayLabel] || (doc?.slotsByDay ? Object.values(doc.slotsByDay)[0] : null);

    let slots: string[] = [];
    let occupiedSlots: string[] = [];

    if (daySlots && daySlots.length > 0) {
      slots = daySlots.filter((s) => s.status === 'available').map((s) => s.time);
      occupiedSlots = daySlots.filter((s) => s.status === 'occupied').map((s) => s.time);
    } else {
      slots = doc?.slots || [...STANDARD_OPD_SLOTS];
    }

    if (lower.includes('subah') || lower.includes('morning')) {
      slots = slots.filter((s) => s.includes('AM'));
    } else if (lower.includes('dopahar') || lower.includes('afternoon')) {
      slots = slots.filter((s) => s.includes('01:') || s.includes('02:') || s.includes('03:') || s.includes('12:'));
    } else if (lower.includes('shaam') || lower.includes('evening')) {
      slots = slots.filter((s) => s.includes('04:') || s.includes('05:'));
    }

    if (this.state.timeStr) {
      const isAvail = slots.includes(this.state.timeStr);
      const isOccupied = occupiedSlots.includes(this.state.timeStr);

      if (isAvail) {
        const spoken = this.language === 'hi'
          ? `${doctorName} ke liye ${dayLabel} ko ${this.state.timeStr} ka slot uplabdh hai. Hamare paas kul ${slots.length} slots uplabdh hain. Kya aap ise book karna chahte hain?`
          : `For ${doctorName} on ${dayLabel}, the ${this.state.timeStr} slot is available among ${slots.length} slots. Would you like to book it?`;
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, state: this.getState() };
      } else if (isOccupied) {
        const spoken = this.language === 'hi'
          ? `${doctorName} ke liye ${dayLabel} ko ${this.state.timeStr} ka slot occupied hai. Available slots hain: ${slots.slice(0, 3).join(', ')}. Kaunsa samay chahenge?`
          : `The ${this.state.timeStr} slot for ${doctorName} on ${dayLabel} is occupied. Available slots are: ${slots.slice(0, 3).join(', ')}. Which time would you prefer?`;
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, state: this.getState() };
      } else {
        const spoken = this.language === 'hi'
          ? `${doctorName} ke liye ${dayLabel} ko ${this.state.timeStr} ka slot uplabdh nahi hai. Kul ${slots.length} slots uplabdh hain jinme se mukhya hain: ${slots.slice(0, 3).join(', ')}. Aap kaunsa samay chahenge?`
          : `The ${this.state.timeStr} slot is not available. There are ${slots.length} slots available: ${slots.slice(0, 3).join(', ')}. Which time would you prefer?`;
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, state: this.getState() };
      }
    }

    if (lower.includes('earliest') || lower.includes('pehla slot') || lower.includes('sabse pehla')) {
      const earliest = slots[0] || (doc?.slots ? doc.slots[0] : '09:00 AM');
      const spoken = this.language === 'hi'
        ? `${doctorName} ke paas sabse pehla slot ${dayLabel} ko subah ${earliest} ka hai. Kya main ise book kar doon?`
        : `The earliest available slot for ${doctorName} on ${dayLabel} is at ${earliest}. Should I book it?`;
      this.state.timeStr = earliest;
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    const slotListStr = slots.join(', ');
    const occupiedNote = occupiedSlots.length > 0 ? ` (${occupiedSlots.join(', ')} ka slot occupied hai)` : '';
    const spoken = this.language === 'hi'
      ? `${doctorName} ke ${dayLabel} ko uplabdh slots hain: ${slotListStr}.${occupiedNote} Aap kaunsa samay chahte hain?`
      : `For ${doctorName} on ${dayLabel}, available slots are: ${slotListStr}.${occupiedNote} Which time would you prefer?`;

    this.recordAgentResponse(spoken);
    return { spokenResponse: spoken, state: this.getState() };
  }

  // ── Specific Existing Appointment Queries ────────────────────────────────

  private async handleSpecificAppointmentQuery(lower: string) {
    const apts = await patientService.getAppointments();
    const active = apts.filter((a) => a.status === 'confirmed' || a.status === 'pending');

    // 1. Today's appointment
    if (lower.includes('aaj') || lower.includes('today')) {
      const todayApts = active.filter((a) => a.date === 'Today' || a.date === '2026-09-01');
      if (todayApts.length === 0) {
        const spoken = this.language === 'hi'
          ? 'Aaj aapki koi appointment schedule nahi hai. Kya aap kisi doctor ke saath appointment book karna chahte hain?'
          : 'You do not have any appointment scheduled for today. Would you like to book one?';
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, state: this.getState() };
      }
      const apt = todayApts[0];
      const spoken = this.language === 'hi'
        ? `Aaj aapki appointment ${apt.doctorName} (${apt.speciality}) ke saath ${apt.time} baje ${apt.facility} mein hai. Token: ${apt.tokenNumber}.`
        : `Today you have an appointment with ${apt.doctorName} (${apt.speciality}) at ${apt.time} at ${apt.facility}. Token is ${apt.tokenNumber}.`;
      const card = { type: 'APPOINTMENT_DETAILS' as const, data: apt };
      this.recordAgentResponse(spoken, card);
      return { spokenResponse: spoken, actionCard: card, state: this.getState() };
    }

    // 2. Tomorrow's appointment
    if (lower.includes('kal') || lower.includes('tomorrow')) {
      const tomorrowApts = active.filter((a) => a.date === 'Tomorrow' || a.date === '2026-09-02' || a.date.includes('Tomorrow'));
      if (tomorrowApts.length === 0) {
        const spoken = this.language === 'hi'
          ? 'Kal aapki koi appointment nahi hai. Aap chahein toh kal ke liye slot book kar sakte hain.'
          : 'You have no appointments scheduled for tomorrow. Would you like to schedule one?';
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, state: this.getState() };
      }
      const apt = tomorrowApts[0];
      const spoken = this.language === 'hi'
        ? `Kal aapki appointment ${apt.doctorName} (${apt.speciality}) ke saath ${apt.time} baje ${apt.facility} mein hai. Token: ${apt.tokenNumber}.`
        : `Tomorrow you have an appointment with ${apt.doctorName} (${apt.speciality}) at ${apt.time} at ${apt.facility}. Token is ${apt.tokenNumber}.`;
      const card = { type: 'APPOINTMENT_DETAILS' as const, data: apt };
      this.recordAgentResponse(spoken, card);
      return { spokenResponse: spoken, actionCard: card, state: this.getState() };
    }

    // 3. Ask token number
    if (lower.includes('token')) {
      if (active.length === 0) {
        const spoken = this.language === 'hi' ? 'Aapke pass koi active appointment token nahi hai.' : 'You have no active appointment token.';
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, state: this.getState() };
      }
      const next = active[0];
      const spoken = this.language === 'hi'
        ? `Aapki agli appointment ka token number ${next.tokenNumber} hai. Doctor: ${next.doctorName}, samay: ${next.time}.`
        : `Your appointment token number is ${next.tokenNumber} for ${next.doctorName} at ${next.time}.`;
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    // 4. Default: Next upcoming appointment
    if (active.length === 0) {
      const spoken = this.language === 'hi'
        ? 'Aapki koi aane wali appointment schedule nahi hai. Kya aap kisi doctor ke saath nayi appointment book karna chahte hain?'
        : 'You have no upcoming appointments scheduled. Would you like to book one?';
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    const next = active[0];
    const spoken = this.language === 'hi'
      ? `Aapki agli appointment ${next.doctorName} (${next.speciality}) ke saath ${next.date} ko ${next.time} baje ${next.facility} mein hai. Token number ${next.tokenNumber} hai.`
      : `Your next appointment is with ${next.doctorName} (${next.speciality}) on ${next.date} at ${next.time} at ${next.facility}. Token is ${next.tokenNumber}.`;

    const card = { type: 'APPOINTMENT_DETAILS' as const, data: next };
    this.recordAgentResponse(spoken, card);
    return { spokenResponse: spoken, actionCard: card, state: this.getState() };
  }

  // ── Appointment Booking Flow ─────────────────────────────────────────────

  private async handleBookingFlow(_query?: string) {
    this.state.intent = 'BOOK_APPOINTMENT';

    // 1. Missing Doctor?
    if (!this.state.selectedDoctor) {
      const dayAndTime = this.state.dateDisplay ? ` ${this.state.dateDisplay} ko` : '';
      const timeStr = this.state.timeStr ? ` ${this.state.timeStr} par` : '';
      const spoken = this.language === 'hi'
        ? `Aap${dayAndTime}${timeStr} kis doctor ya speciality ke saath appointment book karna chahte hain? Jaise: Dr. Rahul Verma (General Medicine) ya Dr. Vivek Rao (Orthopedics)?`
        : `Which doctor or speciality would you like to consult${dayAndTime}${timeStr}? For example: Dr. Rahul Verma (General Medicine) or Dr. Vivek Rao (Orthopedics)?`;
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    // 2. Missing Date?
    if (!this.state.dateStr) {
      const docLabel = this.state.speciality ? `${this.state.selectedDoctor} (${this.state.speciality})` : `${this.state.selectedDoctor}`;
      const spoken = this.language === 'hi'
        ? `Aap ${docLabel} ke saath kis din appointment chahte hain? Jaise: Wednesday, Kal, ya Parso?`
        : `What date would you like to see ${docLabel}? For example: Wednesday, Tomorrow, or Friday?`;
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    // 3. Missing Time?
    if (!this.state.timeStr) {
      const spoken = this.language === 'hi'
        ? `${this.state.dateDisplay || this.state.dateStr} ko aap kis samay appointment chahte hain? Jaise 10:00 AM ya 11:00 baje?`
        : `What time would you prefer on ${this.state.dateDisplay || this.state.dateStr}? For example: 10:00 AM or 11:00 AM?`;
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    // Slot validation check: If user requested an unreasonable slot (e.g. 1:00 PM / 8:00 PM)
    if (this.state.timeStr.includes('01:00') || this.state.timeStr.includes('08:00')) {
      const spoken = this.language === 'hi'
        ? `${this.state.timeStr} ka slot available nahi hai. 10:00 AM, 11:00 AM aur 02:30 PM ke slots available hain. Kaunsa chahiye?`
        : `${this.state.timeStr} is not available. Available slots are 10:00 AM, 11:00 AM, and 02:30 PM. Which one would you prefer?`;
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    // All slots present! Trigger Confirmation Card
    this.state.pendingAction = 'BOOK_APPOINTMENT';
    this.state.awaitingConfirmation = true;

    const timePeriodLabel = this.state.timeStr.includes('PM')
      ? (parseInt(this.state.timeStr, 10) >= 4 ? 'shaam' : 'dopahar')
      : 'subah';

    const spoken = this.language === 'hi'
      ? `Maine ${this.state.selectedDoctor} ke saath ${this.state.dateDisplay || this.state.dateStr} ko ${timePeriodLabel} ${this.state.timeStr} ki appointment taiyar kar li hai. Kya main ise book kar doon? Haan ya Naa bolein.`
      : `I have prepared an appointment with ${this.state.selectedDoctor} on ${this.state.dateDisplay || this.state.dateStr} at ${this.state.timeStr}. Should I confirm and book this now? Please say Yes or No.`;

    const card = {
      type: 'CONFIRM_BOOKING' as const,
      data: {
        doctorName: this.state.selectedDoctor,
        doctorId: this.state.doctorId || 'doc-001',
        speciality: this.state.speciality || 'Cardiology',
        facility: this.state.facility || 'PHC Khed',
        date: this.state.dateStr,
        dateDisplay: this.state.dateDisplay,
        time: this.state.timeStr,
      },
    };

    this.recordAgentResponse(spoken, card);
    return { spokenResponse: spoken, actionCard: card, state: this.getState() };
  }

  // ── Appointment Rescheduling Flow ────────────────────────────────────────

  private async handleRescheduleIntent(lower: string) {
    const apts = await patientService.getAppointments();
    const active = apts.filter((a) => a.status === 'confirmed' || a.status === 'pending');

    if (active.length === 0) {
      const spoken = this.language === 'hi'
        ? 'Aapki koi active appointment nahi hai jise reschedule kiya ja sake.'
        : 'You do not have any active appointments to reschedule.';
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    const currentApt = active[0];
    this.state.targetAppointmentId = currentApt.id;

    const newDate = this.state.dateStr || '2026-09-04';
    const newDisplay = this.state.dateDisplay || 'Friday';
    const newTime = this.state.timeStr || (lower.includes('2 baje') || lower.includes('2:00') ? '02:00 PM' : '02:00 PM');

    this.state.rescheduleNewDate = newDate;
    this.state.rescheduleNewTime = newTime;
    this.state.pendingAction = 'RESCHEDULE_APPOINTMENT';
    this.state.awaitingConfirmation = true;

    const spoken = this.language === 'hi'
      ? `Kya aap ${currentApt.doctorName} ke saath apni appointment ko ${newDisplay} ko ${newTime} par reschedule karna chahte hain? Haan ya Naa bolein.`
      : `Would you like to reschedule your appointment with ${currentApt.doctorName} to ${newDisplay} at ${newTime}? Please say Yes or No.`;

    const card = {
      type: 'CONFIRM_RESCHEDULE' as const,
      data: {
        appointmentId: currentApt.id,
        doctorName: currentApt.doctorName,
        oldDate: currentApt.date,
        oldTime: currentApt.time,
        newDate: newDisplay,
        newTime,
      },
    };

    this.recordAgentResponse(spoken, card);
    return { spokenResponse: spoken, actionCard: card, state: this.getState() };
  }

  // ── Appointment Cancellation Flow ────────────────────────────────────────

  private async handleCancellationIntent(_query?: string) {
    const apts = await patientService.getAppointments();
    const activeApts = apts.filter((a) => a.status === 'confirmed' || a.status === 'pending');

    if (activeApts.length === 0) {
      const spoken = this.language === 'hi'
        ? 'Aapki koi active appointment nahi hai jise cancel kiya ja sake.'
        : 'You do not have any active appointments to cancel.';
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    const target = activeApts[0];
    this.state.pendingAction = 'CANCEL_APPOINTMENT';
    this.state.targetAppointmentId = target.id;
    this.state.awaitingConfirmation = true;

    const spoken = this.language === 'hi'
      ? `Kya aap ${target.doctorName} ke saath ${target.date} ki appointment (Token: ${target.tokenNumber}) sach mein cancel karna chahte hain? Haan ya Naa bolein.`
      : `Are you sure you want to cancel your appointment with ${target.doctorName} on ${target.date} (Token: ${target.tokenNumber})? Please say Yes or No.`;

    const card = {
      type: 'CONFIRM_CANCELLATION' as const,
      data: target,
    };

    this.recordAgentResponse(spoken, card);
    return { spokenResponse: spoken, actionCard: card, state: this.getState() };
  }

  // ── Specialist Outreach Camps ────────────────────────────────────────────

  private async handleOutreachQuery(lower: string = '') {
    const outreachList = await patientService.getOutreachEvents();
    if (outreachList.length === 0) {
      const spoken = this.language === 'hi'
        ? 'Abhi aane wale dino mein koi specialist outreach camp schedule nahi mila.'
        : 'No upcoming specialist outreach camps found.';
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    let targetCamp = outreachList[0];
    if (lower.includes('saturday') || lower.includes('shaniwar') || this.state.dateDisplay?.includes('Saturday')) {
      const satCamp = outreachList.find((c) => c.date.toLowerCase().includes('saturday') || c.date.toLowerCase().includes('sat') || c.id.includes('SAT'));
      if (satCamp) targetCamp = satCamp;
    } else if (lower.includes('friday') || lower.includes('shukrawar') || this.state.dateDisplay?.includes('Friday')) {
      const friCamp = outreachList.find((c) => c.date.toLowerCase().includes('friday') || c.date.toLowerCase().includes('fri') || c.id.includes('FRI'));
      if (friCamp) targetCamp = friCamp;
    }

    const dayPrefix = targetCamp.date.toLowerCase().includes('saturday') || targetCamp.id.includes('SAT')
      ? 'Saturday ko'
      : targetCamp.date.toLowerCase().includes('friday') || targetCamp.id.includes('FRI')
      ? 'Friday ko'
      : `${targetCamp.date} ko`;

    const spoken = this.language === 'hi'
      ? `${dayPrefix} Specialist Outreach Camp ${targetCamp.outreachLocation} mein aayega. Doctor: ${targetCamp.doctorName} (${targetCamp.speciality}), ${targetCamp.availableSlots} slots uplabdh hain.`
      : `Specialist Outreach Camp is on ${targetCamp.date} at ${targetCamp.outreachLocation} by ${targetCamp.doctorName} (${targetCamp.speciality}). ${targetCamp.availableSlots} slots available.`;

    const card = {
      type: 'OUTREACH_LIST' as const,
      data: { outreach: [targetCamp, ...outreachList.filter((c) => c.id !== targetCamp.id)].slice(0, 3) },
    };

    this.recordAgentResponse(spoken, card);
    return { spokenResponse: spoken, actionCard: card, navigateUrl: '/patient/outreach', state: this.getState() };
  }

  // ── Health Records & Prescriptions ───────────────────────────────────────

  private async handleHealthRecordsQuery(lower: string) {
    const records = await patientService.getHealthRecords();
    if (records.length === 0) {
      const spoken = this.language === 'hi' ? 'Aapke pass abhi koi uploaded health record nahi mila.' : 'No health records found for your account.';
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    const latest = records[0];
    const recordTitle = (latest as any).title || (latest as any).diagnosis || 'Clinical Assessment';

    if (lower.includes('dawai') || lower.includes('prescription')) {
      const spoken = this.language === 'hi'
        ? `Aapki latest prescription ${latest.date} ko ${latest.doctorName} dwara likhi gayi hai. Prescriptions page par puri list uplabdh hai.`
        : `Your latest prescription was prescribed by ${latest.doctorName} on ${latest.date}. Available on records page.`;
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, navigateUrl: '/patient/records', state: this.getState() };
    }

    const spoken = this.language === 'hi'
      ? `Aapka latest record ${latest.date} ka hai - ${latest.doctorName} (${latest.speciality}), Title: ${recordTitle}. Kripya screen par dekhein.`
      : `Your latest record is from ${latest.date} with ${latest.doctorName} (${latest.speciality}), Title: ${recordTitle}. Details are on screen.`;

    const card = {
      type: 'RECORDS_SUMMARY' as const,
      data: { records: records.slice(0, 3) },
    };

    this.recordAgentResponse(spoken, card);
    return { spokenResponse: spoken, actionCard: card, state: this.getState() };
  }

  // ── Referrals Tracking ───────────────────────────────────────────────────

  private async handleReferralQuery(_lower?: string) {
    const referrals = await patientService.getReferrals();
    if (referrals.length === 0) {
      const spoken = this.language === 'hi' ? 'Aapke pass koi active referral nahi hai.' : 'You have no active referrals.';
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    const ref = referrals[0];
    const spoken = this.language === 'hi'
      ? `Aapka referral ${ref.fromFacility} se ${ref.toFacility} ke liye ${ref.department} department mein hai. Status: ${ref.status.toUpperCase()}, Priority: ${ref.priority}.`
      : `Your referral from ${ref.fromFacility} to ${ref.toFacility} for ${ref.department} has status ${ref.status.toUpperCase()}, Priority: ${ref.priority}.`;

    const card = {
      type: 'REFERRAL_CARD' as const,
      data: ref,
    };

    this.recordAgentResponse(spoken, card);
    return { spokenResponse: spoken, actionCard: card, state: this.getState() };
  }

  // ── Follow-up Checkups ───────────────────────────────────────────────────

  private async handleFollowUpQuery() {
    const followUps = await patientService.getFollowUps();
    if (followUps.length === 0) {
      const spoken = this.language === 'hi'
        ? 'Aapka koi aane wala follow-up checkup pending nahi hai.'
        : 'You have no upcoming follow-up checkups pending.';
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    const f = followUps[0];
    const spoken = this.language === 'hi'
      ? `Aapka agla follow-up ${f.dueDate} ko ${f.doctorName} (${f.speciality}) ke saath ${f.facility} mein due hai. Mode: ${f.mode}.`
      : `Your next follow-up is due on ${f.dueDate} with ${f.doctorName} (${f.speciality}) at ${f.facility}. Mode: ${f.mode}.`;

    const card = {
      type: 'FOLLOW_UP_CARD' as const,
      data: f,
    };

    this.recordAgentResponse(spoken, card);
    return { spokenResponse: spoken, actionCard: card, state: this.getState() };
  }

  // ── Teleconsultation ─────────────────────────────────────────────────────

  private async handleTeleconsultationQuery(_query?: string) {
    const teleList = await patientService.getTeleconsultations();
    const active = teleList.find((t) => t.status === 'in_consultation' || t.status === 'waiting' || t.status === 'upcoming') || teleList[0];

    if (active) {
      const spoken = this.language === 'hi'
        ? `Aapki ${active.doctorName} (${active.speciality}) ke saath video teleconsultation session uplabdh hai. Main aapko teleconsultation room mein le chalta hoon.`
        : `Your teleconsultation session with ${active.doctorName} (${active.speciality}) is ready. Taking you to the teleconsultation room.`;

      const card = {
        type: 'TELECONSULT_READY' as const,
        data: active,
      };

      this.recordAgentResponse(spoken, card);
      return { spokenResponse: spoken, actionCard: card, navigateUrl: '/patient/teleconsultation', state: this.getState() };
    }

    const spoken = this.language === 'hi'
      ? 'Abhi koi active teleconsultation session nahi mila. Aap Teleconsultation section se session shuru kar sakte hain.'
      : 'No active teleconsultation session found. You can initiate one from the Teleconsultation page.';

    this.recordAgentResponse(spoken);
    return { spokenResponse: spoken, navigateUrl: '/patient/teleconsultation', state: this.getState() };
  }

  // ── Lab Diagnostics & Medicines ──────────────────────────────────────────

  private async handleDiagnosticsQuery() {
    const tests = await patientService.getDiagnostics();
    const spoken = this.language === 'hi'
      ? `PHC aur District Hospital mein ${tests.length} diagnostic tests uplabdh hain, jaise Complete Blood Count, ECG, Lipid Profile aur X-Ray. Kripya Diagnostics page par dekhein.`
      : `Over ${tests.length} diagnostic tests are available including Complete Blood Count, ECG, Lipid Profile and Chest X-Ray.`;
    this.recordAgentResponse(spoken);
    return { spokenResponse: spoken, navigateUrl: '/patient/records', state: this.getState() };
  }

  private async handleMedicinesQuery() {
    await patientService.getMedicines();
    const spoken = this.language === 'hi'
      ? `PHC Khed aur District Hospital pharmacy mein Paracetamol, Metformin aur Amoxicillin stock mein uplabdh hain.`
      : `Key medicines including Paracetamol, Metformin, and Amoxicillin are currently available in pharmacy stock.`;
    this.recordAgentResponse(spoken);
    return { spokenResponse: spoken, state: this.getState() };
  }

  // ── Patient Profile ──────────────────────────────────────────────────────

  private async handleProfileQuery() {
    const profile = await patientService.getProfile();
    const spoken = this.language === 'hi'
      ? `Aapka naam ${profile.fullName} hai. ABHA ID: ${profile.abhaId}. Village: ${profile.village}, District: ${profile.district}. Profile page khol diya hai.`
      : `Patient name is ${profile.fullName}. ABHA ID: ${profile.abhaId}. Village: ${profile.village}, District: ${profile.district}. Profile opened.`;

    const card = {
      type: 'PROFILE_CARD' as const,
      data: profile,
    };

    this.recordAgentResponse(spoken, card);
    return { spokenResponse: spoken, actionCard: card, navigateUrl: '/patient/profile', state: this.getState() };
  }

  // ── Confirmation Action Execution ────────────────────────────────────────

  private async executeConfirmedAction() {
    // 1. Action: BOOK_APPOINTMENT
    if (this.state.pendingAction === 'BOOK_APPOINTMENT') {
      try {
        const created = await patientService.bookAppointment({
          doctorName: this.state.selectedDoctor || 'Dr. Ananya Mehta',
          doctorId: this.state.doctorId || 'doc-001',
          doctorQualification: 'MD, Specialist Lead',
          speciality: this.state.speciality || 'Cardiology',
          facility: this.state.facility || 'PHC Khed',
          facilityId: this.state.facilityId || 'fac-phc-01',
          facilityType: 'PHC',
          date: this.state.dateStr || '2026-09-02',
          time: this.state.timeStr || '11:00 AM',
          type: 'in-person',
          roomNumber: 'OPD Room 2',
          reasonForVisit: 'Voice Agent Appointment Booking',
          instructions: 'Please arrive 15 minutes before slot with prior records.',
        });

        const spoken = this.language === 'hi'
          ? `Aapki appointment safaltapoorvak book ho gayi hai! Token number ${created.tokenNumber} hai. ${this.state.selectedDoctor}, ${this.state.dateDisplay || created.date} ko ${created.time} baje.`
          : `Your appointment has been successfully booked! Token number is ${created.tokenNumber} for ${this.state.selectedDoctor} on ${this.state.dateDisplay || created.date} at ${created.time}.`;

        this.state.pendingAction = null;
        this.state.awaitingConfirmation = false;
        this.state.intent = null;

        this.recordAgentResponse(spoken);
        return {
          spokenResponse: spoken,
          navigateUrl: '/patient/appointments',
          state: this.getState(),
        };
      } catch {
        const spoken = this.language === 'hi'
          ? 'Kshama karein, appointment book karne mein samasya aayi. Kripya punah prayas karein.'
          : 'Sorry, there was an issue booking your appointment. Please try again.';
        this.state.pendingAction = null;
        this.state.awaitingConfirmation = false;
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, state: this.getState() };
      }
    }

    // 2. Action: CANCEL_APPOINTMENT
    if (this.state.pendingAction === 'CANCEL_APPOINTMENT' && this.state.targetAppointmentId) {
      try {
        const success = await patientService.cancelAppointment(this.state.targetAppointmentId);
        const spoken = success
          ? (this.language === 'hi'
            ? 'Aapki appointment safaltapoorvak cancel kar di gayi hai.'
            : 'Your appointment has been successfully cancelled.')
          : (this.language === 'hi'
            ? 'Appointment cancel nahi ho saki. Kripya direct appointments page par check karein.'
            : 'Unable to cancel appointment. Please check the appointments page.');

        this.state.pendingAction = null;
        this.state.targetAppointmentId = null;
        this.state.awaitingConfirmation = false;
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, navigateUrl: '/patient/appointments', state: this.getState() };
      } catch {
        const spoken = 'Cancellation failed. Please try again.';
        this.state.pendingAction = null;
        this.state.awaitingConfirmation = false;
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, state: this.getState() };
      }
    }

    // 3. Action: RESCHEDULE_APPOINTMENT
    if (this.state.pendingAction === 'RESCHEDULE_APPOINTMENT' && this.state.targetAppointmentId) {
      try {
        const newDate = this.state.rescheduleNewDate || '2026-09-04';
        const newTime = this.state.rescheduleNewTime || '02:00 PM';
        const updated = await patientService.rescheduleAppointment(this.state.targetAppointmentId, newDate, newTime);

        const spoken = updated
          ? (this.language === 'hi'
            ? `Aapki appointment safaltapoorvak ${newDate} ko ${newTime} baje reschedule kar di gayi hai.`
            : `Your appointment has been successfully rescheduled to ${newDate} at ${newTime}.`)
          : (this.language === 'hi'
            ? 'Reschedule nahi ho saki. Kripya direct page par check karein.'
            : 'Reschedule could not be completed.');

        this.state.pendingAction = null;
        this.state.targetAppointmentId = null;
        this.state.awaitingConfirmation = false;
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, navigateUrl: '/patient/appointments', state: this.getState() };
      } catch {
        const spoken = 'Reschedule failed. Please try again.';
        this.state.pendingAction = null;
        this.state.awaitingConfirmation = false;
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, state: this.getState() };
      }
    }

    this.state.pendingAction = null;
    this.state.awaitingConfirmation = false;
    return { spokenResponse: 'Action cancelled.', state: this.getState() };
  }

  private cancelPendingAction() {
    this.state.pendingAction = null;
    this.state.targetAppointmentId = null;
    this.state.awaitingConfirmation = false;
    const spoken = this.language === 'hi'
      ? 'Theek hai, maine yeh action cancel kar diya hai. Main aapki aur kya madad kar sakta hoon?'
      : 'Understood, I cancelled this action. How else can I assist you?';
    this.recordAgentResponse(spoken);
    return { spokenResponse: spoken, state: this.getState() };
  }

  private recordAgentResponse(text: string, actionCard?: VoiceConversationTurn['actionCard']) {
    this.state.lastSpokenResponse = text;
    this.state.history.push({
      id: 'turn-' + Date.now(),
      sender: 'agent',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionCard,
    });
  }
}

export const voiceAgent = new VoiceAgentService();
