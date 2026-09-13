        const flattenedSimData = simData.map((d: any) => ({
          ...d.match,
          id: d.match.id != null ? String(d.match.id) : undefined,
          similarityScore: d.similarityScore
        }));
        
        // Analyze expects { targetMatch, referenceMatches, config }
        const analyzeRes = await fetchWithAuth(`${BASE_URL}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
            referenceMatches: flattenedSimData,
            config: {
              oddsWeight: 1.0,
              leagueWeight: 1.0,
              cardWeight: 0.5
            }
          })
        });

        if (!analyzeRes.ok) {
          const errData = await analyzeRes.text();
          throw new Error(`Failed to fetch analysis: ${errData}`);
        }
        
        const analysisData = await analyzeRes.json();
        
        if (isMounted) {
          setSimilarMatches(flattenedSimData);
          setAnalyzeResponse(analysisData);
        }