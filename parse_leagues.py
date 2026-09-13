import json

raw_list = """Premier League - İngiltere
Serie A - İtalya
LaLiga - İspanya
Bundesliga - Almanya
Ligue 1 - Fransa
Liga Portugal - Portekiz
Süper Lig - Türkiye
Eredivisie - Hollanda
Premier Liga - Rusya
Jupiler Pro League - Belçika
Super League 1 - Yunanistan
Premier Ligi - Ukrayna
Chance Liga - Çek Cumhuriyeti
Superliga - Danimarka
Ekstraklasa - Polonya
Premiership - İskoçya
Super League - İsviçre
Eliteserien - Norveç
Bundesliga - Avusturya
Super liga Srbije - Sırbistan
Allsvenskan - İsveç
SuperLiga - Romanya
SuperSport HNL - Hırvatistan
efbet Liga - Bulgaristan
Ligat ha'Al - İsrail
Cyprus League - Kıbrıs
NB I. - Macaristan
Premyer Liqa - Azerbaycan
Niké Liga - Slovakya
Premier Liga - Kazakistan
Vışeyşaya Liga - Belarus
Prva Liga - Slovenya
Toplyga - Litvanya
Virsliga - Letonya
Premier League - Ermenistan
Kategoria Superiore - Arnavutluk
BH Premier Lig - Bosna-Hersek
Premier League Opening Round - Malta
Veikkausliiga - Finlandiya
Erovnuli Liga - Gürcistan
Superliga e Kosovës - Kosova
Premier Division - İrlanda
Besta deild - İzlanda
Prva liga - Kuzey Makedonya
Meridianbet 1. CFL - Karadağ
Premium Liiga - Estonya
Premiership - Kuzey İrlanda
Primera Divisió - Andorra
Super Liga - Moldova
BGL Ligue - Lüksemburg
Meistaradeildin - Faroe Adaları
Cymru Premier - Galler
Gibraltar Football League - Cebelitarık
Camp. Sammarinese - San Marino
Gozo League - Malta
Championship - İngiltere
2. Bundesliga - Almanya
LaLiga2 - İspanya
Serie B - İtalya
Ligue 2 - Fransa
Liga Portugal 2 - Portekiz
1.Lig - Türkiye
1.Division - Rusya
Keuken Kampioen Divisie - Hollanda
Challenger Pro League - Belçika
Superettan - İsveç
OBOS-ligaen - Norveç
Betclic 1 Liga - Polonya
1.Division - Danimarka
Super League 2 - Yunanistan
2. Liga - Avusturya
Prva liga Srbije - Sırbistan
ChNL - Çek Cumhuriyeti
Challenge League - İsviçre
Liga 2 - Romanya
Persha Liga - Ukrayna
Vtora Liga - Bulgaristan
Liga Leumit - İsrail
Prva NL - Hırvatistan
NB II. - Macaristan
Pershaya Liga - Belarus
BH 1. Lig - Bosna-Hersek
Kategoria e Parë - Arnavutluk
Championship - İskoçya
Druga Liga - Slovenya
II. Liga - Slovakya
Prva Liga RS - Bosna-Hersek
Lengjudeild - İzlanda
Ykkösliiga - Finlandiya
First League - Ermenistan
Challenge League - Malta
B' Katigorias - Kıbrıs
Ehrenpromotion - Lüksemburg
I Lyga - Litvanya
Pervaya Liga - Kazakistan
Championship - Kuzey İrlanda
Druga Liga - Karadağ
Erovnuli Liga 2 - Gürcistan
Futbola Pirmā līga - Letonya
First Division - İrlanda
Cymru North - Galler

deild - Faroe Adaları
Cymru South - Galler
Esiliiga - Estonya
Segona Divisió - Andorra
Liga 1 - Moldova
League One - İngiltere
Lig - Almanya
Primera Federación - Gr. II - İspanya
Serie C - B - İtalya
Serie C - C - İtalya
Serie C - A - İtalya
Primera Federación - Gr. I - İspanya
Division A (Phase 2) - Rusya
Ligue 3 - Fransa
Division A (Phase 1) - Rusya
2.Lig Kırmızı - Türkiye
2.Lig Beyaz - Türkiye
CFL - Çek Cumhuriyeti
Liga 3 - Portekiz
Promotion League - İsviçre
2.Division - Danimarka
1ste Nationale FFA - Belçika
Betclic 2 Liga - Polonya
MSFL - Çek Cumhuriyeti
1ste Nationale VV - Belçika
League One - İskoçya
Druga Liga - Ukrayna
Tweede Divisie - Hollanda
PostNord-ligaen Avd. 2 - Norveç
Ettan Norra - İsveç
RL Nord - Avusturya
RL Süd - Avusturya
Ettan Södra - İsveç
PostNord-ligaen Avd. 1 - Norveç
RL West - Avusturya
Regionalliga Ost - Avusturya
Ykkönen - Finlandiya
2. deild - İzlanda
National Amateur League I - Malta
Intermedia - Kuzey İrlanda
Esiliiga B - Estonya
National League - İrlanda
League Two - İngiltere
Regionalliga Bayern - Almanya
Regionalliga Südwest - Almanya
Regionalliga Nordost - Almanya
Segunda Federación - Gr. III - İspanya
Segunda Federación - Gr. II - İspanya
Segunda Federación - Gr. V - İspanya
Serie D - B - İtalya
Regionalliga West - Almanya
Segunda Federación - Gr. IV - İspanya
Serie D - D - İtalya
Regionalliga Nord - Almanya
Serie D - C - İtalya
Serie D - H - İtalya
Segunda Federación - Gr. I - İspanya
Serie D - E - İtalya
Serie D - F - İtalya
Serie D - A - İtalya
Serie D - G - İtalya
Serie D - I - İtalya
2. Division B - Rusya
Norsk Tipping-Ligaen avd. 4 - Norveç
Norsk Tipping-Ligaen avd. 2 - Norveç
Betclic 3 Liga - Gruppe 4 - Polonya
National 1 - Grp. C - Fransa
2de Nationale VV B - Belçika
Betclic 3 Liga - Gruppe 3 - Polonya
National 1 - Grp. B - Fransa
Norsk Tipping-Ligaen avd. 5 - Norveç
National 1 - Grp. A - Fransa

Liga gr. 1 - İsviçre
LL Niederösterreich - Avusturya
3.Lig Grup 2 - Türkiye
3.Lig Grup 3 - Türkiye

Liga gr. 2 - İsviçre
Betclic 3 Liga - Gruppe 2 - Polonya
2de Nationale VV A - Belçika
Norsk Tipping-Ligaen avd. 6 - Norveç
Betclic 3 Liga - Gruppe 1 - Polonya
CP - Série A - Portekiz
League Two - İskoçya
Liga gr. 3 - İsviçre
CP - Série C - Portekiz
CP - Série D - Portekiz
Derde Divisie A - Hollanda
3.Lig Grup 1 - Türkiye
CP - Série B - Portekiz
2de Nationale FFA - Belçika
Norsk Tipping-Ligaen avd. 1 - Norveç
3.Division - Danimarka
Norsk Tipping-Ligaen avd. 3 - Norveç
Kakkonen - Lohko A - Finlandiya
Kakkonen - Lohko C - Finlandiya
Derde Divisie B - Hollanda
Burgenlandliga - Avusturya
Kärntner Liga - Avusturya
OÖ Liga - Avusturya
Salzburger Liga - Avusturya
LL Steiermark - Avusturya
Tiroler Liga - Avusturya
Eliteliga Vorarlberg - Avusturya
Wiener Stadtliga - Avusturya
Kakkonen - Lohko B - Finlandiya
National League - İngiltere
National 2 - Grp. E - Fransa
National 2 - Grp. F - Fransa
National 2 - Grp. G - Fransa
Oberliga Niederrhein - Almanya
National 2 - Grp. D - Fransa
Oberliga Baden-Württemberg - Almanya
National 2 - Grp. H - Fransa
OL RP/Saar - Almanya
Bayernliga Nord - Almanya
Lowland League - İskoçya
National 2 - Grp. B - Fransa
3de Nationale VV B - Belçika
OL Niedersachsen - Almanya
Hessenliga - Almanya
National 2 - Grp. C - Fransa
Oberliga Westfalen - Almanya
2. Liga Inter - Gr. 5 - İsviçre
Bayernliga Süd - Almanya
NOFV-Oberliga Süd - Almanya
Kolmonen Etelä C - Finlandiya
National 2 - Grp. A - Fransa
Kolmonen Itäinen - Finlandiya
Kolmonen Etelä A - Finlandiya
Mittelrheinliga - Almanya
Highland League - İskoçya
Kolmonen Läntinen - Finlandiya
Kolmonen Pohjoinen - Finlandiya
3de Nationale VV A - Belçika
2. Liga Inter - Gr. 1 - İsviçre
2. Liga Inter - Gr. 2 - İsviçre
2. Liga Inter - Gr. 3 - İsviçre
2. Liga Inter - Gr. 4 - İsviçre
Kolmonen Etelä B - Finlandiya
NOFV-Oberliga Nord - Almanya
Oberliga Hamburg - Almanya
Bremenliga - Almanya
Oberliga Schleswig-Holstein - Almanya
National League South - İngiltere
National League North - İngiltere
Westfalenliga 1 - Almanya
LL Mittelrhein 1 - Almanya
Brandenburgliga - Almanya
LL Bayern-N/W - Almanya
LL Bayern-S/O - Almanya
LL Mittelrhein 2 - Almanya
LL Hannover - Almanya
VL Baden - Almanya
LL Niederrhein-Gr. 2 - Almanya
LL Lüneburg - Almanya
LL Weser-Ems - Almanya
Rheinlandliga - Almanya
Berlin-Liga - Almanya
LL Bayern-N/O - Almanya
LL Bayern-S/W - Almanya
Westfalenliga 2 - Almanya
LL Bayern-Mitte - Almanya
Landesliga Hansa - Almanya
Landesliga Bremen - Almanya
Landesliga Hammonia - Almanya
Landesliga Holstein - Almanya
Saarlandliga - Almanya
Landesliga Schleswig - Almanya
LL Braunschweig - Almanya
LL Niederrhein-Gr. 1 - Almanya
Sachsenliga - Almanya
Thüringenliga - Almanya
VL Württemberg - Almanya
VL Hessen-Mitte - Almanya
VL Hessen-Nord - Almanya
VL Hessen-Süd - Almanya
VL Meckl.-Vorpommern - Almanya
VL Sachsen-Anhalt - Almanya
VL Südbaden - Almanya
VL Südwest - Almanya
Primavera 1 - İtalya
Liga Next Gen - Portekiz
O21 Div. 1 Fall - Hollanda
U19 Nachwuchsliga - Gr. G - Almanya
Primavera 2 - A - İtalya
U19 Süper Lig - Türkiye
U19 Nachwuchsliga - Gr. C - Almanya
U19 Nachwuchsliga - Gr. D - Almanya
Omladinska liga - Sırbistan
Primavera 2 - B - İtalya
U19 Nachwuchsliga - Gr. E - Almanya
U19 M-Liga - Rusya
U19 Nachwuchsliga - Gr. B - Almanya
National U19 - Grp. B - Fransa
U18 Elite 1 - Belçika
U21 Pro League - Belçika
U19 Nachwuchsliga - Gr. I - Almanya
Super League U19 - Yunanistan
U19 Nachwuchsliga - Gr. H - Almanya
O21 Div. 2 Fall - Hollanda
U19 Elite League - İsviçre
ÖFB Jugendliga U18 - Avusturya
U19 Eliitliiga Meistriliiga - Estonya
U19 Ulusal - A Grubu - Fransa
Youth League POL - Polonya
U19 Nachwuchsliga - Gr. F - Almanya
Premier Liga 2 - Ukrayna
U19 Boys League - Danimarka
National U19 - Grp. D - Fransa
NextGen Liga - Slovenya
U19 Eliitliiga Esiliiga - Estonya
I. Liga SD - Slovakya
U18 Premier League - İngiltere
U-19 Elites Grupa - Letonya
P18 SM Qualifi. - Finlandiya
Premijer Liga BiH U19 - Bosna-Hersek
U19 Div. 2 Fall - Hollanda
P18 SM - Finlandiya
Premijer Liga BiH U17 - Bosna-Hersek
Under 18 - İtalya
U17 Nachwuchsliga - Gr. A - Almanya
U17 Nachwuchsliga - Gr. B - Almanya
U17 Nachwuchsliga - Gr. C - Almanya
U17 Nachwuchsliga - Gr. D - Almanya
U17 Nachwuchsliga - Gr. E - Almanya
U17 Nachwuchsliga - Gr. F - Almanya
U17 Nachwuchsliga - Gr. G - Almanya
U17 Nachwuchsliga - Gr. H - Almanya
U19 Nachwuchsliga - Gr. A - Almanya
U18-PA - Ermenistan
U17 Elite League - İsviçre

liga U19 - Çek Cumhuriyeti
U19 Boys Division - Danimarka
U17 Eliitliiga Esiliiga - Estonya
National U17 - Grp. A - Fransa
National U17 - Grp. B - Fransa
National U17 - Grp. C - Fransa
National U17 - Grp. D - Fransa
National U17 - Grp. E - Fransa
National U17 - Grp. F - Fransa
National U19 - Grp. C - Fransa
Under 17 - A - İtalya
Under 17 - B - İtalya
Under 17 - C - İtalya
ÖFB Jugendliga U16 - Avusturya
QJ League - Kazakistan
U19 Div. 1 Fall - Hollanda
Kadetska liga - Sırbistan
YFL U17 - Rusya
YFL U16 - Rusya
İtalya Kupası - İtalya
Kral Kupası - İspanya
DFB Pokal - Almanya
Taça de Portugal - Portekiz
KNVB Beker - Hollanda
Rusya Kupası - Rusya
Kypello Elladas - Yunanistan
MOL Cup - Çek Cumhuriyeti
Betano Pokalen - Danimarka
NM-Cup - Norveç
Swiss Cup - İsviçre
SFA Cup - İskoçya
ÖFB-Cup - Avusturya
Svenska Cupen - İsveç
STS Puchar Polski - Polonya
Ukrayna Kupası - Ukrayna
Kypello Kyprou - Kıbrıs
Cupa Romaniei - Romanya
Kazakistan Kupası - Kazakistan
Beyaz Rusya Kupası - Belarus
Litvanya Kupası - Litvanya
Latvijas Kauss - Letonya
Suomen Cup - Finlandiya
David Kipiani Cup - Gürcistan
FAI Cup - İrlanda
Eesti Karikas - Estonya
Løgmanssteypið - Faroe Adaları
Hrvatski nogometni kup - Hırvatistan
Rock Cup - Cebelitarık
Slovnaft Cup - Slovakya
Mjólkurbikar - İzlanda
Croky Cup - Belçika
FL-Cup - Lihtenştayn
Magyar Kupa - Macaristan
İsviçre Kupası Elemeleri - İsviçre
Moldovan Cup - Moldova
Community Shield - İngiltere
Trophée des Champions - Fransa
DFL-Supercup - Almanya
Supercoppa Italiana - İtalya
TFF Süper Kupa - Türkiye
Supertaça - Portekiz
Johan Cruijff Schaal - Hollanda
Rusya Süper Kupası - Rusya
Volkswagen Süper Kupası - Belçika
Super Cup - Yunanistan
Superpuchar - Polonya
Bulgaristan Süper Kupası - Bulgaristan
Aluf haAlufim - İsrail
Supercupa Romaniei - Romanya
Cypriot Super Cup - Kıbrıs
Georgian Super Cup - Gürcistan
Kasachischer Supercup - Kazakistan
Lithuanian Supercup - Litvanya
Superkupa e Shqipërisë - Arnavutluk
President's Cup - İrlanda
Meistarakeppni - İzlanda
NIFL Charity Shield - Kuzey İrlanda
Stórsteypadystur - Faroe Adaları
Coupe de la Ligue - Lüksemburg
Pepe Reyes Cup - Cebelitarık
Supercoppa San Marino - San Marino
2. Division A Playoff 2 - Rusya
U19 Eliitliiga Meistriliiga Playoffs - Estonya
Scottish League Two Play Offs - İskoçya
U19 Eliitliiga Qualification - Estonya
EFL Cup - İngiltere
League Cup - İskoçya
Liigacup - Finlandiya
Lengjubikarinn - İzlanda
National League Cup - İngiltere
Ykkösliigacup - Finlandiya
Coppa Primavera - İtalya
DFB-Pokal der Junioren - Almanya
Premier League 2 - İngiltere
Future Cup - Danimarka
EFL Trophy - İngiltere
Coppa Serie C - İtalya
Coppa Serie D - İtalya
Bayernpokal - Almanya
Niederrheinpokal - Almanya
Leinster Senior Cup - İrlanda
Westfalenpokal - Almanya
Mittelrheinpokal - Almanya
Hessenpokal - Almanya
Copa Federación - İspanya
Niedersachsenpokal (3. und 4. Liga) - Almanya
Badenpokal - Almanya
Württembergpokal - Almanya
Sachsenpokal - Almanya
Mecklenburg-Vorpommern-Pokal - Almanya
Berliner Pokal - Almanya
Thüringenpokal - Almanya
Challenge Cup - İskoçya
Schleswig-Holstein-Pokal - Almanya
Munster Senior Cup - İrlanda
Landespokal Rheinland - Almanya
Brandenburgpokal - Almanya
Sachsen-Anhalt-Pokal - Almanya
Hamburgpokal - Almanya
Südbadenpokal - Almanya
Südwestpokal - Almanya
Bremenpokal - Almanya
Niedersachsenpokal (Amateure) - Almanya
Kypello Amateur - Yunanistan
Regions Cup - Finlandiya
Supercoppa Primavera - İtalya
UEFA Şampiyonlar Ligi
UEFA Süper Kupası
UEFA Avrupa Ligi
UEFA Konferans Ligi
UEFA Avrupa Ligi Elemeleri
UEFA Şampiyonlar Ligi Elemeleri
UEFA Gençlik Ligi
UEFA Konferans Ligi Elemeleri
Baltic Cup
UEFA Nations League Play-Off
UEFA Uluslar Ligi Finalleri
UEFA Uluslar Ligi A
UEFA Uluslar Ligi B
UEFA Uluslar Ligi C
UEFA Uluslar Ligi D
Avrupa Şampiyonası Play-Off
Avrupa Şampiyonası
Avrupa Şampiyonası Elemeleri"""

filtered = [line.strip() for line in raw_list.split('\n') if line.strip()]

# Format: "League - Country" or "League" (for UEFA ones)
# We will save this to a json file to be read by the scraper.
import json
with open('target_leagues.json', 'w', encoding='utf-8') as f:
    json.dump(filtered, f, ensure_ascii=False, indent=2)

print(f"Saved {len(filtered)} target leagues.")
