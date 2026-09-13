
const q1 = await fetch('http://localhost:8080/api/live-matches').then(r => r.json());
console.log('Total live matches:', q1.length);
q1.forEach((m, idx) => {
  console.log('Match', idx, m.homeTeam, m.awayTeam, m.pre_match_odds);
});

