
const q1 = await fetch('http://localhost:8080/api/today-matches?date=today').then(r => r.json());
const matches = q1.matches;
const odds = matches.filter(x => x.oran_1).slice(0, 10).map(x => x.ev_sahibi + ' ' + x.oran_1);
console.log('Sample odds:', odds);

