
const q1 = await fetch('http://localhost:8080/api/matches').then(r => r.json());
console.log('Total pg matches:', q1.length);

