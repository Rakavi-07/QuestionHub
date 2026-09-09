import 'dotenv/config';

const pdfText = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 18 Tf 50 70 Td (QuestionHub PDF OK) Tj ET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000062 00000 n \n0000000123 00000 n \n0000000245 00000 n \n0000000376 00000 n \ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n462\n%%EOF\n';

async function main() {
  // 1. Login
  const loginRes = await fetch('http://localhost:5000/api/auth/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@srmist.edu.in', password: 'Admin@123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Login successful:', !!token);

  // 2. Replace PDF
  console.log('Testing Replace endpoint...');
  const replaceForm = new FormData();
  replaceForm.append('pdf', new Blob([Buffer.from(pdfText, 'binary')], { type: 'application/pdf' }), 'questionhub-replaced.pdf');

  const replaceRes = await fetch('http://localhost:5000/api/admin/question-papers/BPT19101', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: replaceForm,
  });
  console.log('Replace status:', replaceRes.status);
  const replaceJson = await replaceRes.json();
  console.log('Replace response:', JSON.stringify(replaceJson, null, 2));

  // 3. Delete PDF
  console.log('Testing Delete endpoint...');
  const deleteRes = await fetch('http://localhost:5000/api/admin/question-papers/BPT19101', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Delete status:', deleteRes.status);
  console.log('Delete response:', await deleteRes.text());
}

main().catch(console.error);
