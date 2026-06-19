fetch('http://localhost:5000/api/hq/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'hq@allido.com', password: 'hq123' })
}).then(res => res.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(console.error);
