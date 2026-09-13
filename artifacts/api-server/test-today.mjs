
const q1 = await fetch('http://localhost:8080/api/today-matches?date=today').then(r => r.json());
console.log('Total today matches:', q1.length);
if (q1.length > 0) {
  console.log('First match keys:', Object.keys(q1[0]));
  const m = q1.find(x => x.oran_1 != null) || q1[0];
  console.log('Match with oran_1:', m.ev_sahibi, m.oran_1, m.oran_x, m.oran_2);
}

