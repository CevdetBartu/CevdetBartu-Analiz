
const q1 = await fetch('http://localhost:8080/api/today-matches?date=today').then(r => r.json());
console.log('Keys in response:', Object.keys(q1));

