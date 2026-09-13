
const q1 = await fetch('http://localhost:8080/api/live-matches').then(r => r.json());
if (q1.length > 0) {
  const m = q1[0];
  console.log(Object.keys(m));
  console.log('pre_match_odds:', m.pre_match_odds);
}

