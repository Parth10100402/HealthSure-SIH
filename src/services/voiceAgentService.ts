/**
 * Voice Agent Conversational Service for HealthSure
 *
 * Implements conversational intelligence over real patient data:
 * - Multi-turn conversational memory & slot filling
 * - Real backend data queries (doctors, outreach, appointments, records, referrals, teleconsultations)
 * - Confirmation-gated state mutations (appointments booking & cancellation)
 * - Natural language response generation in Hindi, Hinglish, and English
 */

import { patientService } from './patientService';
import { resolveVoiceDate, resolveVoiceTime } from '../utils/voiceDateTimeResolver';

export interface DoctorInfo {
  id: string;
  name: string;
  speciality: string;
  hospitalName: string;
  designation?: string;
}

export type VoiceLanguage = 'hi' | 'en';

export interface VoiceConversationTurn {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'CONFIRM_BOOKING' | 'CONFIRM_CANCELLATION' | 'DOCTOR_LIST' | 'RECORDS_SUMMARY' | 'REFERRAL_CARD' | 'TELECONSULT_READY';
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
  pendingAction: 'BOOK_APPOINTMENT' | 'CANCEL_APPOINTMENT' | null;
  targetAppointmentId: string | null;
  awaitingConfirmation: boolean;
  history: VoiceConversationTurn[];
}

export class VoiceAgentService {
  private state: VoiceConversationState = {
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
    pendingAction: null,
    targetAppointmentId: null,
    awaitingConfirmation: false,
    history: [],
  };

  private language: VoiceLanguage = 'hi';

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
    this.state = {
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
      pendingAction: null,
      targetAppointmentId: null,
      awaitingConfirmation: false,
      history: [],
    };
  }

  /**
   * Process incoming user speech transcript or text input
   */
  public async processUserInput(text: string): Promise<{
    spokenResponse: string;
    actionCard?: VoiceConversationTurn['actionCard'];
    navigateUrl?: string;
    state: VoiceConversationState;
  }> {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Add user turn to history
    this.state.history.push({
      id: 'turn-' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // 2. Check if we are waiting for confirmation of a pending action
    if (this.state.awaitingConfirmation && this.state.pendingAction) {
      if (this.isAffirmative(lower)) {
        return await this.executeConfirmedAction();
      } else if (this.isNegative(lower)) {
        return this.cancelPendingAction();
      }
    }

    // 3. Emergency / SOS Detection
    if (/\b(emergency|sos|madad|bachao|hart attack|accident|bleeding|chest pain|saans nahi aa rahi)\b/i.test(lower)) {
      return this.handleEmergency();
    }

    // 4. Check Navigation Intent
    const navMatch = this.detectNavigation(lower);
    if (navMatch) {
      return navMatch;
    }

    // 5. Check Teleconsultation Intent
    if (/\b(video|teleconsult|teleconsultation|call doctor|doctor se baat|online doctor)\b/i.test(lower)) {
      return await this.handleTeleconsultationQuery(lower);
    }

    // 6. Check Health Records Intent
    if (/\b(record|records|report|reports|prescription|dawa|parchi|dawai|test result)\b/i.test(lower)) {
      return await this.handleHealthRecordsQuery();
    }

    // 7. Check Referral Intent
    if (/\b(referral|refer|status of referral|hospital refer)\b/i.test(lower)) {
      return await this.handleReferralQuery();
    }

    // 8. Check Existing Appointment Query (Lookup)
    if (/\b(meri appointment|my appointment|next appointment|kab hai appointment|appointment status)\b/i.test(lower) && !lower.includes('cancel') && !lower.includes('book')) {
      return await this.handleAppointmentLookup();
    }

    // 9. Check Cancellation Intent
    if (/\b(cancel|radd|hata do|delete appointment|appointment cancel)\b/i.test(lower)) {
      return await this.handleCancellationIntent(lower);
    }

    // 10. Extract slot information (Date, Time, Doctor, Specialty)
    this.extractSlots(trimmed);

    // 11. Check Appointment Booking Intent or Booking Flow Continuation
    if (/\b(book|appointment|milna|dikhana|checkup|le lo|fix karo|kar do)\b/i.test(lower) || this.state.intent === 'BOOK_APPOINTMENT') {
      return await this.handleBookingFlow(lower);
    }

    // 12. Check Doctor / Availability Discovery Intent
    if (/\b(doctor|specialist|available|kaun|schedule|outreach|cardiology|medicine|dermatology|orthopedics)\b/i.test(lower)) {
      return await this.handleDoctorDiscovery(lower);
    }

    // Fallback general guidance
    const spoken = this.language === 'hi'
      ? 'Main aapki HealthSure appointments, doctor search, health records aur referral check karne mein madad kar sakta hoon. Aap mujhse bol sakte hain, jaise: "Wednesday ko doctors batao" ya "Meri next appointment kab hai?".'
      : 'I can help you find doctors, book appointments, check health records and referral status. Try saying: "Show available doctors for Wednesday" or "When is my next appointment?".';

    this.recordAgentResponse(spoken);
    return { spokenResponse: spoken, state: this.getState() };
  }

  private isAffirmative(text: string): boolean {
    return /\b(haan|ha|haa|yes|yeah|sure|confirm|kar do|book|theek hai|proceed|bilkul|ok|okay)\b/i.test(text);
  }

  private isNegative(text: string): boolean {
    return /\b(nahi|na|no|nope|cancel|mat karo|rehne do|cancel it|stop)\b/i.test(text);
  }

  private detectNavigation(lower: string): { spokenResponse: string; navigateUrl: string; state: VoiceConversationState } | null {
    if (/\b(appointments? kholo|open appointments?|appointment page|mere appointments dikhao)\b/i.test(lower)) {
      const resp = this.language === 'hi' ? 'Appointments page khol raha hoon.' : 'Opening Appointments page.';
      this.recordAgentResponse(resp);
      return { spokenResponse: resp, navigateUrl: '/patient/appointments', state: this.getState() };
    }
    if (/\b(outreach kholo|open outreach|camps? kholo|specialist visit)\b/i.test(lower)) {
      const resp = this.language === 'hi' ? 'Specialist outreach camps khol raha hoon.' : 'Opening Specialist Outreach schedule.';
      this.recordAgentResponse(resp);
      return { spokenResponse: resp, navigateUrl: '/patient/outreach', state: this.getState() };
    }
    if (/\b(records? kholo|open records?|prescriptions? kholo)\b/i.test(lower)) {
      const resp = this.language === 'hi' ? 'Health records page khol raha hoon.' : 'Opening Health Records page.';
      this.recordAgentResponse(resp);
      return { spokenResponse: resp, navigateUrl: '/patient/records', state: this.getState() };
    }
    if (/\b(referrals? kholo|open referrals?|referral page)\b/i.test(lower)) {
      const resp = this.language === 'hi' ? 'Referrals page khol raha hoon.' : 'Opening Referrals page.';
      this.recordAgentResponse(resp);
      return { spokenResponse: resp, navigateUrl: '/patient/referrals', state: this.getState() };
    }
    return null;
  }

  private handleEmergency(): { spokenResponse: string; navigateUrl?: string; state: VoiceConversationState } {
    const resp = this.language === 'hi'
      ? 'Emergency alert! Yadi aapko turant chikitsa sahayata chahiye toh 108 dial karein ya nazdeeki PHC emergency ward jayein. HealthSure helpline 07314624692 par bhi call kar sakte hain.'
      : 'Emergency alert! If you need urgent medical care, please dial 108 immediately or visit your nearest PHC emergency room. HealthSure helpline is 07314624692.';
    this.recordAgentResponse(resp);
    return { spokenResponse: resp, navigateUrl: '/patient/help', state: this.getState() };
  }

  private extractSlots(text: string) {
    const lower = text.toLowerCase();

    // Date
    const resolvedDate = resolveVoiceDate(text);
    if (resolvedDate) {
      this.state.dateStr = resolvedDate.dateStr;
      this.state.dateDisplay = resolvedDate.display;
    }

    // Time
    const resolvedTime = resolveVoiceTime(text);
    if (resolvedTime) {
      this.state.timeStr = resolvedTime.timeStr;
      this.state.time24 = resolvedTime.time24;
    }

    // Doctors check
    const knownDoctors = [
      { name: 'Dr. Ananya Mehta', id: 'doc-001', spec: 'Cardiology', keywords: ['ananya', 'mehta', 'heart', 'dil', 'cardio', 'cardiology'] },
      { name: 'Dr. Rahul Verma', id: 'doc-002', spec: 'General Medicine', keywords: ['rahul', 'verma', 'general physician', 'medicine', 'bukhar', 'fever'] },
      { name: 'Dr. Priya Nair', id: 'doc-003', spec: 'Gynecology', keywords: ['priya', 'nair', 'gynecology', 'gynaecology', 'mahila'] },
      { name: 'Dr. Arjun Kapoor', id: 'doc-004', spec: 'Pediatrics', keywords: ['arjun', 'kapoor', 'pediatrics', 'bacche', 'child'] },
      { name: 'Dr. Neha Sharma', id: 'doc-005', spec: 'Dermatology', keywords: ['neha', 'sharma', 'dermatology', 'skin', 'chamdi', 'tvacha'] },
      { name: 'Dr. Vivek Rao', id: 'doc-006', spec: 'Orthopedics', keywords: ['vivek', 'rao', 'orthopedics', 'ortho', 'haddi', 'bone'] },
      { name: 'Dr. Kavita Joshi', id: 'doc-007', spec: 'ENT', keywords: ['kavita', 'joshi', 'ent', 'kaan', 'naak', 'gala', 'ear'] },
      { name: 'Dr. Sameer Khan', id: 'doc-008', spec: 'Neurology', keywords: ['sameer', 'khan', 'neurology', 'neuro', 'dimag', 'brain'] },
    ];

    for (const doc of knownDoctors) {
      if (doc.keywords.some((kw) => lower.includes(kw))) {
        this.state.selectedDoctor = doc.name;
        this.state.doctorId = doc.id;
        this.state.speciality = doc.spec;
        break;
      }
    }
  }

  private async handleDoctorDiscovery(_query?: string) {
    const [doctors, outreach] = await Promise.all([
      patientService.getDoctors(),
      patientService.getOutreachEvents(),
    ]);

    let matchedDocs: DoctorInfo[] = doctors;
    if (this.state.speciality) {
      matchedDocs = doctors.filter((d) => d.speciality.toLowerCase().includes(this.state.speciality!.toLowerCase()));
    }

    let relevantOutreach = outreach;
    if (this.state.dateStr) {
      relevantOutreach = outreach.filter((o) => o.date === this.state.dateStr);
    }

    const docNames = matchedDocs.slice(0, 3).map((d) => `${d.name} (${d.speciality})`).join(', ');
    const dayLabel = this.state.dateDisplay || 'iss hafte';

    let spoken = '';
    if (this.language === 'hi') {
      spoken = `${dayLabel} hamare paas ${matchedDocs.length} doctors uplabdh hain: ${docNames}. Kya aap inme se kisi ke saath appointment book karna chahte hain?`;
    } else {
      spoken = `On ${dayLabel}, we have ${matchedDocs.length} doctors available: ${docNames}. Would you like to book an appointment with one of them?`;
    }

    this.recordAgentResponse(spoken, {
      type: 'DOCTOR_LIST',
      data: { doctors: matchedDocs.slice(0, 4), outreach: relevantOutreach.slice(0, 2) },
    });

    return {
      spokenResponse: spoken,
      actionCard: {
        type: 'DOCTOR_LIST' as const,
        data: { doctors: matchedDocs.slice(0, 4), outreach: relevantOutreach.slice(0, 2) },
      },
      state: this.getState(),
    };
  }

  private async handleBookingFlow(_query?: string) {
    this.state.intent = 'BOOK_APPOINTMENT';

    // 1. Missing Doctor?
    if (!this.state.selectedDoctor) {
      const spoken = this.language === 'hi'
        ? 'Aap kis doctor ya speciality ke saath appointment book karna chahte hain? Jaise: Dr. Ananya Mehta (Cardiology) ya Dr. Rahul Verma (General Medicine)?'
        : 'Which doctor or speciality would you like to consult? For example: Dr. Ananya Mehta (Cardiology) or Dr. Rahul Verma (General Medicine)?';
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    // 2. Missing Date?
    if (!this.state.dateStr) {
      const spoken = this.language === 'hi'
        ? `Aap ${this.state.selectedDoctor} ke saath kis din appointment chahte hain? Jaise: Wednesday, Kal, ya Parso?`
        : `What date would you like to see ${this.state.selectedDoctor}? For example: Wednesday, Tomorrow, or Friday?`;
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

    // All 3 present! Trigger Confirmation Card
    this.state.pendingAction = 'BOOK_APPOINTMENT';
    this.state.awaitingConfirmation = true;

    const spoken = this.language === 'hi'
      ? `Maine ${this.state.selectedDoctor} ke saath ${this.state.dateDisplay || this.state.dateStr} ko subah ${this.state.timeStr} ki appointment taiyar kar li hai. Kya main ise book kar doon? Haan ya Naa bolein.`
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
    return {
      spokenResponse: spoken,
      actionCard: card,
      state: this.getState(),
    };
  }

  private async executeConfirmedAction() {
    if (this.state.pendingAction === 'BOOK_APPOINTMENT') {
      try {
        const created = await patientService.bookAppointment({
          doctorName: this.state.selectedDoctor || 'Dr. Ananya Mehta',
          doctorId: this.state.doctorId || 'doc-001',
          doctorQualification: 'MD, DM Specialist',
          speciality: this.state.speciality || 'Cardiology',
          facility: this.state.facility || 'PHC Khed',
          facilityId: this.state.facilityId || 'fac-phc-01',
          facilityType: 'PHC',
          date: this.state.dateStr || '2026-09-02',
          time: this.state.timeStr || '11:00 AM',
          type: 'in-person',
          roomNumber: 'OPD Room 2',
          reasonForVisit: 'Voice Agent Voice Booking Consultation',
          instructions: 'Please arrive 15 minutes before slot with valid ID.',
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
      } catch (err: any) {
        const spoken = this.language === 'hi'
          ? 'Kshama karein, appointment book karne mein samasya aayi. Kripya punah prayas karein.'
          : 'Sorry, there was an issue booking your appointment. Please try again.';
        this.state.pendingAction = null;
        this.state.awaitingConfirmation = false;
        this.recordAgentResponse(spoken);
        return { spokenResponse: spoken, state: this.getState() };
      }
    }

    if (this.state.pendingAction === 'CANCEL_APPOINTMENT' && this.state.targetAppointmentId) {
      try {
        const success = await patientService.cancelAppointment(this.state.targetAppointmentId);
        const spoken = success
          ? (this.language === 'hi'
            ? 'Aapki appointment safaltapoorvak cancel kar di gayi hai.'
            : 'Your appointment has been successfully cancelled.')
          : (this.language === 'hi'
            ? 'Appointment cancel nahi ho saki. Kripya direct page par check karein.'
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

    this.state.pendingAction = null;
    this.state.awaitingConfirmation = false;
    return { spokenResponse: 'Action cancelled.', state: this.getState() };
  }

  private cancelPendingAction() {
    this.state.pendingAction = null;
    this.state.awaitingConfirmation = false;
    const spoken = this.language === 'hi'
      ? 'Theek hai, maine yeh action cancel kar diya hai. Main aapki aur kya madad kar sakta hoon?'
      : 'Understood, I cancelled this action. How else can I assist you?';
    this.recordAgentResponse(spoken);
    return { spokenResponse: spoken, state: this.getState() };
  }

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

  private async handleAppointmentLookup() {
    const apts = await patientService.getAppointments();
    const active = apts.filter((a) => a.status === 'confirmed' || a.status === 'pending');

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

    this.recordAgentResponse(spoken);
    return { spokenResponse: spoken, state: this.getState() };
  }

  private async handleHealthRecordsQuery() {
    const records = await patientService.getHealthRecords();
    if (records.length === 0) {
      const spoken = this.language === 'hi'
        ? 'Aapke pass abhi koi uploaded health record nahi mila.'
        : 'No health records found for your account.';
      this.recordAgentResponse(spoken);
      return { spokenResponse: spoken, state: this.getState() };
    }

    const latest = records[0];
    const recordTitle = latest.title || (latest as any).diagnosis || 'Clinical Assessment';
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

  private async handleReferralQuery() {
    const referrals = await patientService.getReferrals();
    if (referrals.length === 0) {
      const spoken = this.language === 'hi'
        ? 'Aapke pass koi active referral nahi hai.'
        : 'You have no active referrals.';
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
      return {
        spokenResponse: spoken,
        actionCard: card,
        navigateUrl: '/patient/teleconsultation',
        state: this.getState(),
      };
    }

    const spoken = this.language === 'hi'
      ? 'Abhi koi active teleconsultation session nahi mila. Aap Teleconsultation section se doctor ke saath session shuru kar sakte hain.'
      : 'No active teleconsultation session found. You can initiate one from the Teleconsultation page.';

    this.recordAgentResponse(spoken);
    return { spokenResponse: spoken, navigateUrl: '/patient/teleconsultation', state: this.getState() };
  }

  private recordAgentResponse(text: string, actionCard?: VoiceConversationTurn['actionCard']) {
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
