
const q1 = await fetch('http://localhost:8080/api/matches/find-similar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    oddsHome: 2.1, oddsDraw: 3.2, oddsAway: 3.1, league: 'GREEK CUP QUALIFICATION', oddsType: 'CLOSING'
  })
}).then(r => r.json());

const q2 = await fetch('http://localhost:8080/api/matches/find-similar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    oddsHome: 1.5, oddsDraw: 4.0, oddsAway: 5.0, league: 'PREMIER LEAGUE', oddsType: 'CLOSING'
  })
}).then(r => r.json());

console.log('Q1 top:', q1[0]?.match?.homeTeam, q1[0]?.match?.awayTeam, 'Score:', q1[0]?.similarityScore);
console.log('Q2 top:', q2[0]?.match?.homeTeam, q2[0]?.match?.awayTeam, 'Score:', q2[0]?.similarityScore);

