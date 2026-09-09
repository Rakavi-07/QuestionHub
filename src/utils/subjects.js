/**
 * QuestionHub is exclusively for SRM Physiotherapy (BPT) students.
 *
 * Single hardcoded source of truth for which subjects exist under which
 * semester. Mirrors server/utils/subjects.js. Used to populate Semester and
 * Subject selectors (registration, and later the student dashboard /
 * admin upload workflow).
 */

export const PHYSIOTHERAPY_SUBJECTS = {
  1: [
    { code: 'BPT19101', name: 'Human Anatomy I' },
    { code: 'BPT19102', name: 'Human Physiology I' },
    { code: 'BPT19103', name: 'Clinical Biochemistry' },
    { code: 'BPT19104', name: 'Sociology' },
    { code: 'BPT19105', name: 'English and Communication Skills' },
  ],
  2: [
    { code: 'BPT19201', name: 'Human Anatomy II' },
    { code: 'BPT19202', name: 'Human Physiology II' },
    { code: 'BPT19203', name: 'Biomechanics I' },
    { code: 'BPT19204', name: 'Psychology' },
  ],
  3: [
    { code: 'BPT19301', name: 'Biomechanics II' },
    { code: 'BPT19302', name: 'Exercise Therapy I' },
    { code: 'BPT19303', name: 'Pathology' },
    { code: 'BPT19304', name: 'Microbiology' },
    { code: 'BPT19305', name: 'Pharmacology' },
  ],
  4: [
    { code: 'BPT19401', name: 'Exercise Therapy II' },
    { code: 'BPT19402', name: 'Electrotherapy (LMHF)' },
    { code: 'BPT19403', name: 'Bio Physics' },
    { code: 'BPT19404', name: 'Ethics and Management in Physiotherapy' },
  ],
  5: [
    { code: 'BPT19501', name: 'Evaluation Measurements and Outcome Measures' },
    { code: 'BPT19502', name: 'Orthopedic Conditions for Physiotherapist' },
    { code: 'BPT19503', name: 'General Surgery, Plastic Surgery and OBG' },
    { code: 'BPT19504', name: 'General Medicine, Paediatrics and Psychiatry' },
    { code: 'BPT19505', name: 'Community Medicine' },
  ],
  6: [
    { code: 'BPT19601', name: 'PT in Orthopedic Conditions' },
    { code: 'BPT19602', name: 'PT in General Medicine and General Surgery' },
    { code: 'BPT19603', name: 'Neurological Conditions for Physiotherapists' },
    { code: 'BPT19604', name: 'Research Methodology and Biostatistics' },
    { code: 'BPT19605', name: 'Pain Mechanism and Management' },
    { code: 'BPT19607', name: 'Work Physiology' },
  ],
  7: [
    { code: 'BPT19701', name: 'PT in Neurological Disorders' },
    { code: 'BPT19702', name: 'Community Based Physiotherapy I' },
    { code: 'BPT19703', name: 'Health Promotion and Fitness' },
    { code: 'BPT19704', name: 'Cardiovascular and Pulmonary Conditions' },
    { code: 'BPT197E1', name: 'Tele Rehabilitation' },
    { code: 'BPT197E2', name: 'Hospital and Healthcare Services Marketing' },
  ],
  8: [
    { code: 'BPT19801', name: 'PT in Cardio Pulmonary Diseases' },
    { code: 'BPT19802', name: 'Community Based Physiotherapy II' },
    { code: 'BPT19805', name: 'Evidence Based Practice' },
    { code: 'BPT198E1', name: 'Pediatric Physiotherapy' },
    { code: 'BPT198E2', name: 'PT in Hand Conditions' },
  ],
};

export const SEMESTER_OPTIONS = Object.keys(PHYSIOTHERAPY_SUBJECTS)
  .map(Number)
  .sort((a, b) => a - b)
  .map((sem) => ({ value: sem, label: `Semester ${sem}` }));

export function getSubjectsForSemester(semester) {
  return PHYSIOTHERAPY_SUBJECTS[Number(semester)] || [];
}
