
const q1 = await fetch('http://localhost:8080/api/live-matches').then(r => r.json());
console.log('Total live matches:', q1.length);
if (q1.length > 0) {
  const m = q1[0];
  console.log('First match odds:', m.oran_1, m.oran_x, m.oran_2);
}

