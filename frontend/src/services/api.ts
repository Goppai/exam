export async function extractExam(file: File, subject = 'auto') {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`/api/extract?subject=${subject}`, {
    method: 'POST',
    body: form,
  });
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function explainQuestion(subject: string, question: any) {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, question }),
  });
  return res.json();
}
