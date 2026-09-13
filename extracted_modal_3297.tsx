            targetMatch: {
              date: match.tarih || match.date,
              time: match.saat || match.time,
              league: match.lig || match.league,
              homeTeam: match.ev_sahibi || match.homeTeam,
              awayTeam: match.deplasman || match.awayTeam,
              oddsHome: match.oran_1 ? Number(match.oran_1) : undefined,
              oddsDraw: match.oran_x ? Number(match.oran_x) : undefined,
              oddsAway: match.oran_2 ? Number(match.oran_2) : undefined,
              altOdds: match.alt_orani ? Number(match.alt_orani) : undefined,
              ustOdds: match.ust_orani ? Number(match.ust_orani) : undefined,
              varOdds: match.kg_var ? Number(match.kg_var) : undefined,
              yokOdds: match.kg_yok ? Number(match.kg_yok) : undefined,
            },
            referenceMatches: simData.map((d: any) => ({
              ...d.match,
              id: d.match.id != null ? String(d.match.id) : undefined,
              similarityScore: d.similarityScore
            })),
            config: {