import { db } from './config/firebaseAdmin.js';

const SEED_FAMILY_MEMBERS = [
  {
    id: 'mem-1',
    name: 'Parth Sharma',
    relation: 'Self',
    age: 20,
    gender: 'Male',
    bloodGroup: 'B+',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    phone: '+91 98765 43210',
    email: 'parth.sharma@healthsure.org',
    heightCm: 178,
    weightKg: 72,
    allergies: ['Penicillin'],
    chronicConditions: ['None'],
    abhaId: '91-8472-9102-4412',
    insurancePolicyNumber: 'SH-8821904'
  },
  {
    id: 'mem-2',
    name: 'Rajesh Sharma',
    relation: 'Father',
    age: 45,
    gender: 'Male',
    bloodGroup: 'O+',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    phone: '+91 98765 43211',
    email: 'rajesh.sharma@healthsure.org',
    heightCm: 172,
    weightKg: 78,
    allergies: ['Sulfa Drugs'],
    chronicConditions: ['Hypertension', 'Mild Hyperlipidemia'],
    abhaId: '91-8472-9102-4413',
    insurancePolicyNumber: 'SH-8821905'
  },
  {
    id: 'mem-3',
    name: 'Priya Sharma',
    relation: 'Mother',
    age: 42,
    gender: 'Female',
    bloodGroup: 'A+',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    phone: '+91 98765 43212',
    email: 'priya.sharma@healthsure.org',
    heightCm: 162,
    weightKg: 64,
    allergies: ['Dust Mites'],
    chronicConditions: ['Thyroid (Hypothyroidism)'],
    abhaId: '91-8472-9102-4414',
    insurancePolicyNumber: 'SH-8821906'
  },
  {
    id: 'mem-4',
    name: 'Ananya Sharma',
    relation: 'Daughter',
    age: 12,
    gender: 'Female',
    bloodGroup: 'B+',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
    phone: '+91 98765 43210',
    email: 'ananya.sharma@healthsure.org',
    heightCm: 145,
    weightKg: 38,
    allergies: ['Peanuts'],
    chronicConditions: ['None'],
    abhaId: '91-8472-9102-4415',
    insurancePolicyNumber: 'SH-8821907'
  }
];

// Seed 50 Top Indian Hospitals
const SEED_HOSPITALS = [
  { id: 'hosp-1', name: 'AIIMS New Delhi', city: 'Delhi', state: 'Delhi', hospitalType: 'Government', rating: 4.9, reviewCount: 14850, distanceKm: 3.2, emergency24x7: true, consultationFee: 500, bedCount: 2478, specialties: ['Cardiology', 'Neurology', 'Oncology', 'Nephrology', 'Orthopaedics'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'Ayushman Bharat', 'Government CGHS'], image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80', address: 'Ansari Nagar, New Delhi - 110029' },
  { id: 'hosp-2', name: 'Apollo Hospitals Indraprastha Delhi', city: 'Delhi', state: 'Delhi', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 9240, distanceKm: 5.4, emergency24x7: true, consultationFee: 1500, bedCount: 710, specialties: ['Cardiology', 'Liver Transplant', 'Neurosurgery', 'Oncology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80', address: 'Sarita Vihar, Delhi Mathura Road, New Delhi - 110076' },
  { id: 'hosp-3', name: 'Max Super Speciality Hospital Saket', city: 'Delhi', state: 'Delhi', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 8120, distanceKm: 4.1, emergency24x7: true, consultationFee: 1400, bedCount: 530, specialties: ['Cardiac Surgery', 'Oncology', 'Orthopaedics', 'Pulmonology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'], image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80', address: 'Press Enclave Marg, Saket, New Delhi - 110017' },
  { id: 'hosp-4', name: 'Fortis Escorts Heart Institute Delhi', city: 'Delhi', state: 'Delhi', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 11400, distanceKm: 6.8, emergency24x7: true, consultationFee: 1600, bedCount: 310, specialties: ['Cardiology', 'Cardiothoracic Surgery', 'Vascular Surgery'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'], image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80', address: 'Okhla Road, Sukhdev Vihar, New Delhi - 110025' },
  { id: 'hosp-5', name: 'Medanta The Medicity Gurugram', city: 'NCR', state: 'Delhi', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 12900, distanceKm: 8.2, emergency24x7: true, consultationFee: 1650, bedCount: 1250, specialties: ['Heart Institute', 'Cancer Institute', 'Neurosciences', 'Urology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'], image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80', address: 'Sector 38, Gurugram, Haryana - 122001' },
  { id: 'hosp-6', name: 'Sir Ganga Ram Hospital Delhi', city: 'Delhi', state: 'Delhi', hospitalType: 'Private Multi-Speciality', rating: 4.7, reviewCount: 7600, distanceKm: 3.8, emergency24x7: true, consultationFee: 1200, bedCount: 675, specialties: ['Gastroenterology', 'Nephrology', 'Urology', 'Cardiology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'], image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80', address: 'Rajinder Nagar, New Delhi - 110060' },
  { id: 'hosp-7', name: 'BLK-Max Super Speciality Hospital Delhi', city: 'Delhi', state: 'Delhi', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 6890, distanceKm: 4.5, emergency24x7: true, consultationFee: 1350, bedCount: 650, specialties: ['Bone Marrow Transplant', 'Oncology', 'Cardiology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'], image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80', address: 'Pusa Road, Rajendra Place, New Delhi - 110005' },
  { id: 'hosp-8', name: 'Manipal Hospital Dwarka Delhi', city: 'Delhi', state: 'Delhi', hospitalType: 'Private Multi-Speciality', rating: 4.7, reviewCount: 5410, distanceKm: 7.1, emergency24x7: true, consultationFee: 1250, bedCount: 380, specialties: ['Cardiology', 'Orthopaedics', 'Neurology', 'Pediatrics'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'], image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80', address: 'Sector 6, Dwarka, New Delhi - 110075' },
  { id: 'hosp-9', name: 'Artemis Hospital Gurugram', city: 'NCR', state: 'Delhi', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 6120, distanceKm: 9.3, emergency24x7: true, consultationFee: 1450, bedCount: 400, specialties: ['Cardiology', 'Oncology', 'Orthopaedics', 'Neurosurgery'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80', address: 'Sector 51, Gurugram, Haryana - 122001' },
  { id: 'hosp-10', name: 'Fortis Memorial Research Institute Gurugram', city: 'NCR', state: 'Delhi', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 8400, distanceKm: 8.8, emergency24x7: true, consultationFee: 1600, bedCount: 1000, specialties: ['Pediatric Surgery', 'Oncology', 'Neurology', 'Robotic Surgery'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'], image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80', address: 'Sector 44, Gurugram, Haryana - 122002' },

  { id: 'hosp-11', name: 'AIIMS Bathinda', city: 'Bathinda', state: 'Punjab', hospitalType: 'Government', rating: 4.8, reviewCount: 4200, distanceKm: 2.1, emergency24x7: true, consultationFee: 300, bedCount: 750, specialties: ['General Medicine', 'Cardiology', 'Orthopaedics'], insuranceAccepted: ['Ayushman Bharat', 'Government CGHS'], image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80', address: 'Dabwali Road, Bathinda, Punjab - 151001' },
  { id: 'hosp-12', name: 'Fortis Hospital Mohali', city: 'Mohali', state: 'Punjab', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 7800, distanceKm: 1.1, emergency24x7: true, consultationFee: 1200, bedCount: 355, specialties: ['Cardiology', 'Orthopaedics', 'Neurosurgery', 'Oncology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80', address: 'Sector 62, Phase VIII, Mohali, Punjab - 160062' },
  { id: 'hosp-13', name: 'Max Super Speciality Hospital Mohali', city: 'Mohali', state: 'Punjab', hospitalType: 'Super Speciality', rating: 4.7, reviewCount: 5600, distanceKm: 2.3, emergency24x7: true, consultationFee: 1100, bedCount: 220, specialties: ['Cancer Care', 'Cardiology', 'Orthopaedics'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80', address: 'Phase 6, Mohali, Punjab - 160055' },
  { id: 'hosp-14', name: 'Ivy Hospital Mohali', city: 'Mohali', state: 'Punjab', hospitalType: 'Private Multi-Speciality', rating: 4.6, reviewCount: 3400, distanceKm: 3.0, emergency24x7: true, consultationFee: 900, bedCount: 200, specialties: ['Oncology', 'Nephrology', 'Cardiology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'Ayushman Bharat'], image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80', address: 'Sector 71, Mohali, Punjab - 160071' },
  { id: 'hosp-15', name: 'Sohana Hospital Mohali', city: 'Mohali', state: 'Punjab', hospitalType: 'Private Multi-Speciality', rating: 4.7, reviewCount: 4900, distanceKm: 2.8, emergency24x7: true, consultationFee: 800, bedCount: 300, specialties: ['Ophthalmology', 'Cardiology', 'Orthopaedics'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'Ayushman Bharat'], image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80', address: 'Sector 77, Mohali, Punjab - 160071' },
  { id: 'hosp-16', name: 'Amandeep Hospital Amritsar', city: 'Amritsar', state: 'Punjab', hospitalType: 'Private Multi-Speciality', rating: 4.8, reviewCount: 5200, distanceKm: 1.2, emergency24x7: true, consultationFee: 950, bedCount: 250, specialties: ['Orthopaedics', 'Neuro Trauma', 'Plastic Surgery'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'Ayushman Bharat'], image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80', address: 'GT Road, Model Town, Amritsar, Punjab - 143001' },
  { id: 'hosp-17', name: 'SPS Hospitals Ludhiana', city: 'Ludhiana', state: 'Punjab', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 6100, distanceKm: 2.0, emergency24x7: true, consultationFee: 1000, bedCount: 350, specialties: ['Cardiology', 'Gastroenterology', 'Oncology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80', address: 'Sherpur Chowk, Ludhiana, Punjab - 141003' },
  { id: 'hosp-18', name: 'Christian Medical College Ludhiana', city: 'Ludhiana', state: 'Punjab', hospitalType: 'Private Multi-Speciality', rating: 4.7, reviewCount: 6800, distanceKm: 1.8, emergency24x7: true, consultationFee: 600, bedCount: 750, specialties: ['Stroke Center', 'General Surgery', 'Cardiology'], insuranceAccepted: ['Star Health', 'Ayushman Bharat', 'Government CGHS'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80', address: 'Brown Road, Ludhiana, Punjab - 141008' },
  { id: 'hosp-19', name: 'Dayanand Medical College Hospital Ludhiana', city: 'Ludhiana', state: 'Punjab', hospitalType: 'Private Multi-Speciality', rating: 4.8, reviewCount: 7900, distanceKm: 1.4, emergency24x7: true, consultationFee: 700, bedCount: 1000, specialties: ['Gastroenterology', 'Cardiology', 'Nephrology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'Ayushman Bharat'], image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80', address: 'Civil Lines, Ludhiana, Punjab - 141001' },
  { id: 'hosp-20', name: 'Manipal Hospital Patiala', city: 'Patiala', state: 'Punjab', hospitalType: 'Private Multi-Speciality', rating: 4.7, reviewCount: 3100, distanceKm: 2.2, emergency24x7: true, consultationFee: 850, bedCount: 180, specialties: ['Cardiology', 'Orthopaedics', 'Gastroenterology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80', address: 'Urban Estate Phase II, Patiala, Punjab - 147002' },

  { id: 'hosp-21', name: 'Tata Memorial Hospital Mumbai', city: 'Mumbai', state: 'Maharashtra', hospitalType: 'Government Apex Institute', rating: 4.9, reviewCount: 16400, distanceKm: 4.2, emergency24x7: true, consultationFee: 400, bedCount: 700, specialties: ['Surgical Oncology', 'Radiation Oncology', 'Medical Oncology'], insuranceAccepted: ['Ayushman Bharat', 'Government CGHS', 'Star Health'], image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80', address: 'Parel, Mumbai, Maharashtra - 400012' },
  { id: 'hosp-22', name: 'Kokilaben Dhirubhai Ambani Hospital Mumbai', city: 'Mumbai', state: 'Maharashtra', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 11200, distanceKm: 6.1, emergency24x7: true, consultationFee: 1800, bedCount: 750, specialties: ['Robotic Surgery', 'Neurosciences', 'Cardiac Sciences'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80', address: 'Andheri West, Mumbai, Maharashtra - 400053' },
  { id: 'hosp-23', name: 'Lilavati Hospital Mumbai', city: 'Mumbai', state: 'Maharashtra', hospitalType: 'Private Multi-Speciality', rating: 4.8, reviewCount: 8900, distanceKm: 5.0, emergency24x7: true, consultationFee: 1600, bedCount: 323, specialties: ['Cardiology', 'Nephrology', 'Neurology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80', address: 'Bandra West, Mumbai, Maharashtra - 400050' },
  { id: 'hosp-24', name: 'P.D. Hinduja Hospital Mumbai', city: 'Mumbai', state: 'Maharashtra', hospitalType: 'Private Multi-Speciality', rating: 4.8, reviewCount: 7400, distanceKm: 4.8, emergency24x7: true, consultationFee: 1550, bedCount: 400, specialties: ['Pulmonology', 'Oncology', 'Cardiology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80', address: 'Mahim, Mumbai, Maharashtra - 400016' },
  { id: 'hosp-25', name: 'Nanavati Max Super Speciality Hospital Mumbai', city: 'Mumbai', state: 'Maharashtra', hospitalType: 'Super Speciality', rating: 4.7, reviewCount: 6300, distanceKm: 7.2, emergency24x7: true, consultationFee: 1500, bedCount: 350, specialties: ['Digestive Care', 'Bone Marrow Transplant', 'Cardiology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80', address: 'Vile Parle West, Mumbai, Maharashtra - 400056' },
  { id: 'hosp-26', name: 'Jaslok Hospital Mumbai', city: 'Mumbai', state: 'Maharashtra', hospitalType: 'Private Multi-Speciality', rating: 4.8, reviewCount: 6700, distanceKm: 3.5, emergency24x7: true, consultationFee: 1600, bedCount: 348, specialties: ['Nephrology', 'IVF', 'Cardiology', 'Oncology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80', address: 'Pedder Road, Mumbai, Maharashtra - 400026' },

  { id: 'hosp-27', name: 'Manipal Hospital Old Airport Road Bangalore', city: 'Bengaluru', state: 'Karnataka', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 11800, distanceKm: 4.0, emergency24x7: true, consultationFee: 1400, bedCount: 600, specialties: ['Organ Transplant', 'Oncology', 'Cardiology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80', address: 'HAL Old Airport Road, Bengaluru, Karnataka - 560017' },
  { id: 'hosp-28', name: 'Narayana Health City Bangalore', city: 'Bengaluru', state: 'Karnataka', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 14200, distanceKm: 12.0, emergency24x7: true, consultationFee: 800, bedCount: 3000, specialties: ['Cardiac Surgery', 'Bone Marrow Transplant', 'Oncology'], insuranceAccepted: ['Ayushman Bharat', 'Star Health', 'HDFC ERGO'], image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80', address: 'Hosur Road, Bengaluru, Karnataka - 560099' },
  { id: 'hosp-29', name: 'Apollo Hospitals Bangalore', city: 'Bengaluru', state: 'Karnataka', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 8400, distanceKm: 7.5, emergency24x7: true, consultationFee: 1350, bedCount: 250, specialties: ['Cardiology', 'Oncology', 'Orthopaedics'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80', address: 'Bannerghatta Road, Bengaluru, Karnataka - 560076' },
  { id: 'hosp-30', name: 'Aster CMI Hospital Bangalore', city: 'Bengaluru', state: 'Karnataka', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 7100, distanceKm: 6.2, emergency24x7: true, consultationFee: 1300, bedCount: 500, specialties: ['Liver Transplant', 'Neurosciences', 'Cardiology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80', address: 'Hebbal, Bengaluru, Karnataka - 560092' },

  { id: 'hosp-31', name: 'Apollo Hospitals Greams Road Chennai', city: 'Chennai', state: 'Tamil Nadu', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 15100, distanceKm: 3.5, emergency24x7: true, consultationFee: 1500, bedCount: 560, specialties: ['Cardiology', 'Proton Therapy', 'Orthopaedics'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80', address: 'Greams Road, Chennai, Tamil Nadu - 600006' },
  { id: 'hosp-32', name: 'MIOT International Chennai', city: 'Chennai', state: 'Tamil Nadu', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 7800, distanceKm: 8.0, emergency24x7: true, consultationFee: 1200, bedCount: 1000, specialties: ['Orthopaedics', 'Thoracic Surgery', 'Hepatology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80', address: 'Manapakkam, Chennai, Tamil Nadu - 600089' },
  { id: 'hosp-33', name: 'MGM Healthcare Chennai', city: 'Chennai', state: 'Tamil Nadu', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 6200, distanceKm: 4.8, emergency24x7: true, consultationFee: 1400, bedCount: 400, specialties: ['Heart & Lung Transplant', 'Neurosciences', 'ECMO'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80', address: 'Aminjikarai, Chennai, Tamil Nadu - 600029' },
  { id: 'hosp-34', name: 'Christian Medical College Vellore', city: 'Vellore', state: 'Tamil Nadu', hospitalType: 'Government Apex Institute', rating: 4.9, reviewCount: 18900, distanceKm: 14.0, emergency24x7: true, consultationFee: 350, bedCount: 3000, specialties: ['Hematology', 'Gastroenterology', 'Neurology'], insuranceAccepted: ['Ayushman Bharat', 'Government CGHS', 'Star Health'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80', address: 'Ida Scudder Road, Vellore, Tamil Nadu - 632004' },

  { id: 'hosp-35', name: 'Amrita Hospital Kochi', city: 'Kochi', state: 'Kerala', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 11400, distanceKm: 5.2, emergency24x7: true, consultationFee: 850, bedCount: 1350, specialties: ['Hand Surgery', 'Head Oncology', 'Cardiology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'Ayushman Bharat'], image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80', address: 'Edappally, Kochi, Kerala - 682041' },
  { id: 'hosp-36', name: 'Aster Medcity Kochi', city: 'Kochi', state: 'Kerala', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 8200, distanceKm: 6.5, emergency24x7: true, consultationFee: 1100, bedCount: 670, specialties: ['Robotic Surgery', 'Cardiac Sciences', 'Neurosciences'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80', address: 'Cheranalloor, Kochi, Kerala - 682027' },

  { id: 'hosp-37', name: 'Yashoda Hospitals Hyderabad', city: 'Hyderabad', state: 'Telangana', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 9600, distanceKm: 4.1, emergency24x7: true, consultationFee: 1200, bedCount: 1000, specialties: ['Cardiology', 'Neurosurgery', 'Oncology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80', address: 'Somajiguda, Hyderabad, Telangana - 500082' },
  { id: 'hosp-38', name: 'KIMS Hospitals Hyderabad', city: 'Hyderabad', state: 'Telangana', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 8800, distanceKm: 5.8, emergency24x7: true, consultationFee: 1150, bedCount: 1000, specialties: ['Heart Transplant', 'Nephrology', 'Robotic Surgery'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80', address: 'Secunderabad, Hyderabad, Telangana - 500003' },
  { id: 'hosp-39', name: 'CARE Hospitals Hyderabad', city: 'Hyderabad', state: 'Telangana', hospitalType: 'Super Speciality', rating: 4.7, reviewCount: 7200, distanceKm: 4.5, emergency24x7: true, consultationFee: 1100, bedCount: 435, specialties: ['Cardiology', 'Cardiac Surgery', 'Vascular Surgery'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80', address: 'Banjara Hills, Hyderabad, Telangana - 500034' },

  { id: 'hosp-40', name: 'Ruby Hall Clinic Pune', city: 'Pune', state: 'Maharashtra', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 8100, distanceKm: 3.8, emergency24x7: true, consultationFee: 1300, bedCount: 600, specialties: ['Cardiology', 'Oncology', 'Neurosciences'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80', address: 'Sassoon Road, Pune, Maharashtra - 411001' },
  { id: 'hosp-41', name: 'Sahyadri Hospitals Pune', city: 'Pune', state: 'Maharashtra', hospitalType: 'Private Multi-Speciality', rating: 4.7, reviewCount: 6400, distanceKm: 4.2, emergency24x7: true, consultationFee: 1200, bedCount: 900, specialties: ['Neurosurgery', 'Hematology', 'Cardiology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80', address: 'Deccan Gymkhana, Pune, Maharashtra - 411004' },

  { id: 'hosp-42', name: 'PGIMER Chandigarh', city: 'Chandigarh', state: 'Chandigarh', hospitalType: 'Government Apex Institute', rating: 4.9, reviewCount: 17200, distanceKm: 2.5, emergency24x7: true, consultationFee: 300, bedCount: 2200, specialties: ['Cardiology', 'Neurology', 'Nephrology'], insuranceAccepted: ['Ayushman Bharat', 'Government CGHS'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80', address: 'Sector 12, Chandigarh - 160012' },
  { id: 'hosp-43', name: 'SGPGIMS Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', hospitalType: 'Government Apex Institute', rating: 4.8, reviewCount: 9100, distanceKm: 6.0, emergency24x7: true, consultationFee: 400, bedCount: 1200, specialties: ['Gastroenterology', 'Endocrinology', 'Nephrology'], insuranceAccepted: ['Ayushman Bharat', 'Government CGHS'], image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80', address: 'Rae Bareli Road, Lucknow, UP - 226014' },
  { id: 'hosp-44', name: 'AIIMS Rishikesh', city: 'Rishikesh', state: 'Uttarakhand', hospitalType: 'Government', rating: 4.8, reviewCount: 5400, distanceKm: 4.5, emergency24x7: true, consultationFee: 300, bedCount: 960, specialties: ['Trauma Surgery', 'Cardiology', 'Orthopaedics'], insuranceAccepted: ['Ayushman Bharat', 'Government CGHS'], image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80', address: 'Virbhadra Road, Rishikesh, Uttarakhand - 249203' },
  { id: 'hosp-45', name: 'AIIMS Jodhpur', city: 'Jodhpur', state: 'Rajasthan', hospitalType: 'Government', rating: 4.8, reviewCount: 4800, distanceKm: 3.9, emergency24x7: true, consultationFee: 300, bedCount: 860, specialties: ['Cardiology', 'Neurosurgery', 'Pediatrics'], insuranceAccepted: ['Ayushman Bharat', 'Government CGHS'], image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80', address: 'Basni Industrial Area, Jodhpur, Rajasthan - 342005' },
  { id: 'hosp-46', name: 'HCG Cancer Centre Bengaluru', city: 'Bengaluru', state: 'Karnataka', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 5200, distanceKm: 5.0, emergency24x7: true, consultationFee: 1400, bedCount: 240, specialties: ['CyberKnife Robotics', 'Medical Oncology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80', address: 'Sampangi Rama Nagar, Bengaluru, Karnataka - 560027' },
  { id: 'hosp-47', name: 'Narayana Health Bangalore', city: 'Bengaluru', state: 'Karnataka', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 6800, distanceKm: 11.5, emergency24x7: true, consultationFee: 900, bedCount: 1400, specialties: ['Bone Marrow Transplant', 'Pediatric Oncology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'Ayushman Bharat'], image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80', address: 'Anekal Taluk, Bengaluru, Karnataka - 560099' },
  { id: 'hosp-48', name: 'Apollo Hospitals Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', hospitalType: 'Super Speciality', rating: 4.8, reviewCount: 7600, distanceKm: 6.8, emergency24x7: true, consultationFee: 1250, bedCount: 300, specialties: ['Cardiology', 'Joint Replacement', 'Nephrology'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80', address: 'Bhat GIDC Estate, Ahmedabad, Gujarat - 382428' },
  { id: 'hosp-49', name: 'MGM Healthcare Chennai', city: 'Chennai', state: 'Tamil Nadu', hospitalType: 'Super Speciality', rating: 4.9, reviewCount: 4500, distanceKm: 9.1, emergency24x7: true, consultationFee: 1450, bedCount: 350, specialties: ['Cardiothoracic Surgery', 'Neurosciences'], insuranceAccepted: ['Star Health', 'HDFC ERGO', 'ICICI Lombard'], image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80', address: 'OMR Road, Chennai, Tamil Nadu - 600119' },
  { id: 'hosp-50', name: 'AIIMS Bhopal', city: 'Bhopal', state: 'Madhya Pradesh', hospitalType: 'Government', rating: 4.8, reviewCount: 5100, distanceKm: 3.4, emergency24x7: true, consultationFee: 300, bedCount: 960, specialties: ['Cardiology', 'General Surgery', 'Neurology'], insuranceAccepted: ['Ayushman Bharat', 'Government CGHS'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80', address: 'Saket Nagar, Bhopal, MP - 462020' }
];

const SEED_DOCTORS = [
  { id: 'doc-1', name: 'Dr. Balram Bhargava', specialty: 'Cardiologist', department: 'Cardiology', hospitalName: 'AIIMS New Delhi', hospitalId: 'hosp-1', gender: 'Male', experienceYears: 28, languages: ['English', 'Hindi'], patientRating: 4.9, reviewsCount: 420, consultationFee: 500, availableToday: true, onlineConsultation: true, offlineConsultation: true, avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', availableSlots: ['10:00 AM', '11:30 AM', '04:30 PM'], availableDays: ['Mon', 'Wed', 'Fri'] },
  { id: 'doc-2', name: 'Dr. Padma Srivastava', specialty: 'Neurologist', department: 'Neurology', hospitalName: 'AIIMS New Delhi', hospitalId: 'hosp-1', gender: 'Female', experienceYears: 24, languages: ['English', 'Hindi'], patientRating: 4.9, reviewsCount: 380, consultationFee: 500, availableToday: true, onlineConsultation: true, offlineConsultation: true, avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78c00?auto=format&fit=crop&w=300', availableSlots: ['09:30 AM', '12:00 PM'], availableDays: ['Tue', 'Thu'] },
  { id: 'doc-3', name: 'Dr. Rajesh Malhotra', specialty: 'Orthopaedic Surgeon', department: 'Orthopaedics', hospitalName: 'AIIMS New Delhi', hospitalId: 'hosp-1', gender: 'Male', experienceYears: 26, languages: ['English', 'Hindi'], patientRating: 4.8, reviewsCount: 310, consultationFee: 500, availableToday: true, onlineConsultation: false, offlineConsultation: true, avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300', availableSlots: ['10:30 AM', '02:00 PM'], availableDays: ['Mon', 'Thu'] },
  { id: 'doc-4', name: 'Dr. G. K. Rath', specialty: 'Oncologist', department: 'Oncology', hospitalName: 'AIIMS New Delhi', hospitalId: 'hosp-1', gender: 'Male', experienceYears: 30, languages: ['English', 'Hindi'], patientRating: 4.9, reviewsCount: 450, consultationFee: 500, availableToday: false, onlineConsultation: true, offlineConsultation: true, avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', availableSlots: ['11:00 AM', '03:00 PM'], availableDays: ['Wed', 'Fri'] },
  { id: 'doc-5', name: 'Dr. Sandeep Guleria', specialty: 'Nephrologist', department: 'Nephrology', hospitalName: 'AIIMS New Delhi', hospitalId: 'hosp-1', gender: 'Male', experienceYears: 25, languages: ['English', 'Hindi'], patientRating: 4.8, reviewsCount: 290, consultationFee: 500, availableToday: true, onlineConsultation: true, offlineConsultation: true, avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300', availableSlots: ['09:00 AM', '01:00 PM'], availableDays: ['Mon', 'Tue'] },

  { id: 'doc-6', name: 'Dr. Ashok Seth', specialty: 'Cardiologist', department: 'Cardiology', hospitalName: 'Apollo Hospitals Indraprastha Delhi', hospitalId: 'hosp-2', gender: 'Male', experienceYears: 32, languages: ['English', 'Hindi'], patientRating: 4.9, reviewsCount: 540, consultationFee: 1500, availableToday: true, onlineConsultation: true, offlineConsultation: true, avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', availableSlots: ['11:00 AM', '04:00 PM'], availableDays: ['Mon', 'Wed'] },
  { id: 'doc-7', name: 'Dr. Anupam Sibal', specialty: 'Gastroenterologist', department: 'Gastroenterology', hospitalName: 'Apollo Hospitals Indraprastha Delhi', hospitalId: 'hosp-2', gender: 'Male', experienceYears: 22, languages: ['English', 'Hindi'], patientRating: 4.8, reviewsCount: 310, consultationFee: 1500, availableToday: true, onlineConsultation: true, offlineConsultation: true, avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300', availableSlots: ['10:00 AM', '02:30 PM'], availableDays: ['Tue', 'Thu'] },

  { id: 'doc-8', name: 'Dr. Simran Kaur', specialty: 'Neurologist', department: 'Neurology', hospitalName: 'Fortis Hospital Mohali', hospitalId: 'hosp-12', gender: 'Female', experienceYears: 16, languages: ['English', 'Hindi', 'Punjabi'], patientRating: 4.8, reviewsCount: 230, consultationFee: 1200, availableToday: true, onlineConsultation: true, offlineConsultation: true, avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78c00?auto=format&fit=crop&w=300', availableSlots: ['11:00 AM', '02:00 PM'], availableDays: ['Mon', 'Wed'] },
  { id: 'doc-9', name: 'Dr. H. K. Bali', specialty: 'Cardiologist', department: 'Cardiology', hospitalName: 'Fortis Hospital Mohali', hospitalId: 'hosp-12', gender: 'Male', experienceYears: 25, languages: ['English', 'Hindi', 'Punjabi'], patientRating: 4.9, reviewsCount: 490, consultationFee: 1200, availableToday: true, onlineConsultation: true, offlineConsultation: true, avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', availableSlots: ['10:00 AM', '01:30 PM'], availableDays: ['Mon', 'Wed'] },
  { id: 'doc-10', name: 'Dr. Manjeet Singh', specialty: 'Orthopaedic Surgeon', department: 'Orthopaedics', hospitalName: 'Amandeep Hospital Amritsar', hospitalId: 'hosp-16', gender: 'Male', experienceYears: 21, languages: ['English', 'Hindi', 'Punjabi'], patientRating: 4.9, reviewsCount: 380, consultationFee: 950, availableToday: true, onlineConsultation: true, offlineConsultation: true, avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300', availableSlots: ['09:30 AM', '12:30 PM'], availableDays: ['Mon', 'Thu'] }
];

const MOCK_REPORTS = [
  {
    id: 'rep-1',
    title: 'Complete Blood Count (CBC)',
    date: '2026-08-05',
    category: 'Hematology',
    summary: 'Hemoglobin 14.5 g/dL (Normal). Platelet count 260,000 /µL (Optimal).',
    status: 'Optimal',
    fileUrl: '#',
    keyFindings: ['Hemoglobin 14.5 g/dL (Normal Range 13.0 - 17.0)', 'WBC 6,800 /µL (Normal Range 4,000 - 11,000)', 'Platelets 260,000 /µL (Optimal)'],
    parameters: [
      { name: 'Hemoglobin', value: '14.5', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: 'Normal' },
      { name: 'Total Leukocyte Count', value: '6,800', unit: '/µL', referenceRange: '4,000 - 11,000', status: 'Normal' },
      { name: 'Platelet Count', value: '260,000', unit: '/µL', referenceRange: '150,000 - 450,000', status: 'Normal' }
    ]
  }
];

const MOCK_MEDICINES = [
  {
    id: 'med-1',
    medicineName: 'Telmisartan 40mg',
    dosage: '1 Tablet Daily',
    frequency: 'Once Daily (Morning)',
    timeOfDay: '08:00 AM',
    takenToday: true,
    prescribedBy: 'Dr. Balram Bhargava',
    instructions: 'Take after breakfast with water'
  }
];

const MOCK_FAMILY_MEMBERS = [
  {
    id: 'mem-1',
    name: 'Parth Sharma',
    relation: 'Self',
    age: 20,
    gender: 'Male',
    bloodGroup: 'B+',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    phone: '+91 98765 43210',
    email: 'parth.sharma@healthsure.org',
    heightCm: 178,
    weightKg: 72,
    allergies: ['Penicillin'],
    chronicConditions: ['None'],
    abhaId: '91-8472-9102-4412',
    insurancePolicyNumber: 'SH-8821904'
  },
  {
    id: 'mem-2',
    name: 'Rajesh Sharma',
    relation: 'Father',
    age: 45,
    gender: 'Male',
    bloodGroup: 'O+',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    phone: '+91 98765 43211',
    email: 'rajesh.sharma@healthsure.org',
    heightCm: 172,
    weightKg: 78,
    allergies: ['Sulfa Drugs'],
    chronicConditions: ['Hypertension', 'Mild Hyperlipidemia'],
    abhaId: '91-8472-9102-4413',
    insurancePolicyNumber: 'SH-8821905'
  },
  {
    id: 'mem-3',
    name: 'Priya Sharma',
    relation: 'Mother',
    age: 42,
    gender: 'Female',
    bloodGroup: 'A+',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    phone: '+91 98765 43212',
    email: 'priya.sharma@healthsure.org',
    heightCm: 162,
    weightKg: 64,
    allergies: ['Dust Mites'],
    chronicConditions: ['Thyroid (Hypothyroidism)'],
    abhaId: '91-8472-9102-4414',
    insurancePolicyNumber: 'SH-8821906'
  },
  {
    id: 'mem-4',
    name: 'Ananya Sharma',
    relation: 'Daughter',
    age: 12,
    gender: 'Female',
    bloodGroup: 'B+',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
    phone: '+91 98765 43210',
    email: 'ananya.sharma@healthsure.org',
    heightCm: 145,
    weightKg: 38,
    allergies: ['Peanuts'],
    chronicConditions: ['None'],
    abhaId: '91-8472-9102-4415',
    insurancePolicyNumber: 'SH-8821907'
  }
];

const MOCK_APPOINTMENTS = [
  {
    id: 'apt-1',
    doctorName: 'Dr. Balram Bhargava',
    doctorSpecialty: 'Cardiologist',
    hospitalName: 'AIIMS New Delhi',
    date: 'Today',
    timeSlot: '04:30 PM',
    status: 'Confirmed',
    type: 'Offline',
    patientName: 'Parth Sharma',
    patientId: 'mem-1',
    consultationFee: 500,
    tokenNumber: 12
  }
];

async function seedDatabase() {
  if (!db) {
    console.error('[Seeder] Error: Firestore db connection is null.');
    process.exit(1);
  }

  console.log('[Seeder] Seeding 50 Top Indian Hospitals into Cloud Firestore project healthsure-1dca1...');

  try {
    for (const mem of SEED_FAMILY_MEMBERS) {
      await db.collection('familyMembers').doc(mem.id).set(mem, { merge: true });
    }
    console.log(`[Seeder] Seeded ${SEED_FAMILY_MEMBERS.length} family members.`);

    for (const hosp of SEED_HOSPITALS) {
      await db.collection('hospitals').doc(hosp.id).set(hosp, { merge: true });
    }
    console.log(`[Seeder] Seeded ${SEED_HOSPITALS.length} hospitals.`);

    for (const doc of SEED_DOCTORS) {
      await db.collection('doctors').doc(doc.id).set(doc, { merge: true });
    }
    console.log(`[Seeder] Seeded ${SEED_DOCTORS.length} doctors.`);

    console.log('[Seeder] Database seeding of 50 Top Indian Hospitals completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Error during database seeding:', err);
    process.exit(1);
  }
}

seedDatabase();
