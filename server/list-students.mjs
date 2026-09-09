/**
 * Lists all approved students so we can pick one for testing.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Student from './models/Student.js';

await mongoose.connect(process.env.MONGO_URI);
const students = await Student.find({ status: 'Approved' })
  .select('fullName email semester status')
  .lean();
console.log('Approved students:');
if (!students.length) {
  console.log('  None found. Register and approve one first.');
} else {
  students.forEach(s => console.log(`  - ${s.fullName} | ${s.email} | Semester ${s.semester}`));
}
await mongoose.disconnect();
