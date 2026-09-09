/**
 * Phase 5 API Verification Script
 * Run from: server/ directory
 * Usage: node verify-phase5.mjs <studentEmail> <studentPassword>
 */

const BASE = 'http://localhost:5000/api';
const [,, EMAIL, PASSWORD] = process.argv;

if (!EMAIL || !PASSWORD) {
  console.log('Usage: node verify-phase5.mjs <studentEmail> <studentPassword>');
  console.log('Example: node verify-phase5.mjs student@srmist.edu.in password123');
  process.exit(1);
}

async function run() {
  console.log('=== Phase 5 API Verification ===\n');

  // ── 1. Student login ─────────────────────────────────────────────
  console.log('1. Student login...');
  const loginRes = await fetch(`${BASE}/auth/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginData = await loginRes.json();
  console.log(`   Status: ${loginRes.status} | ${loginData.message || loginData.status || ''}`);

  if (!loginData.token) {
    console.log('   ✗ Login failed. Check email/password and ensure account is Approved.');
    process.exit(1);
  }

  const token = loginData.token;
  const studentSemester = loginData.student?.semester;
  const studentName = loginData.student?.fullName;
  console.log(`   ✓ Logged in as: ${studentName} | Semester: ${studentSemester}`);

  // ── 2. GET /api/question-papers ─────────────────────────────────
  console.log('\n2. Fetching question papers for student semester...');
  const papersRes = await fetch(`${BASE}/question-papers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const papersData = await papersRes.json();
  console.log(`   Status: ${papersRes.status}`);
  console.log(`   Returned semester: ${papersData.semester} (expected: ${studentSemester})`);
  console.log(`   Papers count: ${papersData.papers?.length ?? 0}`);
  
  const hasPublicId = papersData.papers?.some(p => 'publicId' in p);
  console.log(`   publicId exposed? ${hasPublicId ? '✗ YES (BUG)' : '✓ No'}`);
  papersData.papers?.forEach(p => console.log(`     - [${p.subjectCode}] ${p.subjectName}`));

  // ── 3. Semester injection attempt ──────────────────────────────
  console.log('\n3. Semester injection test (?semester=99 added to request)...');
  const hackRes = await fetch(`${BASE}/question-papers?semester=99`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const hackData = await hackRes.json();
  const injectionBlocked = hackData.semester === studentSemester;
  console.log(`   Status: ${hackRes.status} | Returned semester: ${hackData.semester}`);
  console.log(`   Injection blocked? ${injectionBlocked ? '✓ YES' : '✗ NO (BUG)'}`);

  // ── 4. GET /api/question-papers/saved ──────────────────────────
  console.log('\n4. Fetching saved papers...');
  const savedRes = await fetch(`${BASE}/question-papers/saved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const savedData = await savedRes.json();
  console.log(`   Status: ${savedRes.status} | Saved count: ${savedData.savedPapers?.length ?? 0}`);

  // ── 5. Save a paper (if any uploaded for this semester) ────────
  const firstPaper = papersData.papers?.[0];
  if (firstPaper) {
    console.log(`\n5. Save test: saving [${firstPaper.subjectCode}]...`);
    const saveRes = await fetch(`${BASE}/question-papers/${firstPaper._id}/save`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const saveData = await saveRes.json();
    console.log(`   Status: ${saveRes.status} | ${saveData.message}`);

    // Verify it appears in saved list
    const savedAfterRes = await fetch(`${BASE}/question-papers/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const savedAfterData = await savedAfterRes.json();
    const found = savedAfterData.savedPapers?.some(p => p._id === firstPaper._id);
    console.log(`   Appears in saved list? ${found ? '✓ YES' : '✗ NO'}`);

    // Unsave
    console.log(`\n6. Unsave test: removing [${firstPaper.subjectCode}]...`);
    const unsaveRes = await fetch(`${BASE}/question-papers/${firstPaper._id}/save`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const unsaveData = await unsaveRes.json();
    console.log(`   Status: ${unsaveRes.status} | ${unsaveData.message}`);

    const savedAfterUnsaveRes = await fetch(`${BASE}/question-papers/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const savedAfterUnsave = await savedAfterUnsaveRes.json();
    const removed = !savedAfterUnsave.savedPapers?.some(p => p._id === firstPaper._id);
    console.log(`   Removed from saved list? ${removed ? '✓ YES' : '✗ NO'}`);
  } else {
    console.log('\n5. No papers uploaded for this semester — save/unsave test skipped.');
    console.log('   Upload a paper via admin first, then re-run.');
  }

  // ── 6. Unauthenticated access check ────────────────────────────
  console.log('\n7. No-token access (should be 401)...');
  const noTokenRes = await fetch(`${BASE}/question-papers`);
  console.log(`   Status: ${noTokenRes.status} ${noTokenRes.status === 401 ? '✓' : '✗ (expected 401)'}`);

  // ── 7. Student accessing admin route ──────────────────────────
  console.log('\n8. Student accessing /api/admin/stats (should be 403)...');
  const adminApiRes = await fetch(`${BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Status: ${adminApiRes.status} ${adminApiRes.status === 403 ? '✓' : '✗ (expected 403)'}`);

  console.log('\n=== Verification Complete ===');
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
