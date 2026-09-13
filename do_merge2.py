import sqlite3

def merge_db2():
    main_db = 'scripts/scraper/gecmis_maclar.db'
    backup_db = 'gecmis_maclar_yedek_20260716_173509.db'
    
    conn = sqlite3.connect(main_db)
    conn.execute(f"ATTACH DATABASE '{backup_db}' AS backup")
    
    # Get columns of backup
    cur = conn.cursor()
    cur.execute("PRAGMA backup.table_info(gecmis_maclar)")
    backup_cols = [row[1] for row in cur.fetchall()]
    
    # Get columns of main
    cur.execute("PRAGMA main.table_info(gecmis_maclar)")
    main_cols = [row[1] for row in cur.fetchall()]
    
    # Find common columns
    common_cols = [col for col in backup_cols if col in main_cols]
    cols_str = ', '.join(common_cols)
    
    # Insert
    print("Merging data...")
    sql = f"INSERT OR IGNORE INTO main.gecmis_maclar ({cols_str}) SELECT {cols_str} FROM backup.gecmis_maclar"
    conn.execute(sql)
    conn.commit()
    
    matches = conn.execute("SELECT COUNT(*) FROM main.gecmis_maclar").fetchone()[0]
    leagues = conn.execute("SELECT COUNT(DISTINCT lig) FROM main.gecmis_maclar").fetchone()[0]
    
    print(f"Success! Total Matches: {matches}, Total Leagues: {leagues}")
    conn.execute("DETACH DATABASE backup")
    conn.close()

merge_db2()
