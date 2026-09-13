
const q1 = await fetch('http://localhost:8080/api/today-matches?date=today').then(r => r.json());
const matches = q1.matches;
console.log('Total matches:', matches.length);
if (matches.length > 0) {
  const m = matches.find(x => x.oran_1 != null) || matches[0];
  console.log('Match with oran_1:', m.ev_sahibi, m.oran_1, m.oran_x, m.oran_2);
}

