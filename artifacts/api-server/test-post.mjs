
const q1 = await fetch('http://localhost:8080/api/matches/find-similar', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ oddsHome: 1.42, oddsDraw: 4.5, oddsAway: 6.5, maxResults: 8 })
}).then(r => r.json());

const q2 = await fetch('http://localhost:8080/api/matches/find-similar', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ oddsHome: 1.96, oddsDraw: 3.0, oddsAway: 4.5, maxResults: 8 })
}).then(r => r.json());

console.log('Q1 matches:', q1.map(x => x.match.homeTeam).join(', '));
console.log('Q2 matches:', q2.map(x => x.match.homeTeam).join(', '));

