
const q1 = await fetch('http://localhost:8080/api/matches/find-similar', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ oddsHome: 1.42, oddsDraw: 4.5, oddsAway: 6.5, maxResults: 8 })
}).then(r => r.json());

const targetMatch = {
  homeTeam: 'TestHome',
  awayTeam: 'TestAway',
  oddsHome: 1.42,
  oddsDraw: 4.5,
  oddsAway: 6.5
};

const referenceMatches = q1.map(x => x.match);

const result = await fetch('http://localhost:8080/api/analyze', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ targetMatch, referenceMatches })
}).then(r => r.json());

console.log('Result tablo_satirlari length:', result.tablo_satirlari?.length);

