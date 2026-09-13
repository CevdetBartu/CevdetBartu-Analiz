with open('dump_line.txt', encoding='utf-8') as f:
    l = f.read()
    start = l.find('"CodeContent":"')
    if start != -1:
        # Find the end of the CodeContent string by looking for the next key in the JSON object
        # which is usually "Description" or "Overwrite" or "TargetFile"
        end1 = l.find('","Description"', start)
        end2 = l.find('","Overwrite"', start)
        end3 = l.find('","TargetFile"', start)
        ends = [e for e in [end1, end2, end3] if e != -1]
        
        if ends:
            end = min(ends)
            code = l[start+15:end]
            with open('artifacts/football-app/src/components/AnalysisModal.tsx', 'w', encoding='utf-8') as out:
                out.write(code.encode('utf-8').decode('unicode_escape'))
            print("Successfully extracted AnalysisModal.tsx!")
        else:
            print("Could not find end of CodeContent")
    else:
        print("Could not find start of CodeContent")
