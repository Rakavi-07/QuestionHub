async function main() {
  const url = 'https://res.cloudinary.com/kd4msjzu/raw/upload/v1786732078/questionhub/question-papers/semester-1/BPT19101.pdf';
  const response = await fetch(url, { method: 'GET' });
  console.log('Status:', response.status);
  console.log('Headers:');
  for (const [key, value] of response.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }
}

main().catch(console.error);
