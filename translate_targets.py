import json
import difflib

tr_to_en = {
    'İngiltere': 'England',
    'İtalya': 'Italy',
    'İspanya': 'Spain',
    'Almanya': 'Germany',
    'Fransa': 'France',
    'Portekiz': 'Portugal',
    'Türkiye': 'Turkey',
    'Hollanda': 'Netherlands',
    'Rusya': 'Russia',
    'Belçika': 'Belgium',
    'Yunanistan': 'Greece',
    'Ukrayna': 'Ukraine',
    'Çek Cumhuriyeti': 'Czech Republic',
    'Danimarka': 'Denmark',
    'Polonya': 'Poland',
    'İskoçya': 'Scotland',
    'İsviçre': 'Switzerland',
    'Norveç': 'Norway',
    'Avusturya': 'Austria',
    'Sırbistan': 'Serbia',
    'İsveç': 'Sweden',
    'Romanya': 'Romania',
    'Hırvatistan': 'Croatia',
    'Bulgaristan': 'Bulgaria',
    'İsrail': 'Israel',
    'Kıbrıs': 'Cyprus',
    'Macaristan': 'Hungary',
    'Azerbaycan': 'Azerbaijan',
    'Slovakya': 'Slovakia',
    'Kazakistan': 'Kazakhstan',
    'Belarus': 'Belarus',
    'Slovenya': 'Slovenia',
    'Litvanya': 'Lithuania',
    'Letonya': 'Latvia',
    'Ermenistan': 'Armenia',
    'Arnavutluk': 'Albania',
    'Bosna-Hersek': 'Bosnia & Herzegovina',
    'Malta': 'Malta',
    'Finlandiya': 'Finland',
    'Gürcistan': 'Georgia',
    'Kosova': 'Kosovo',
    'İrlanda': 'Ireland',
    'İzlanda': 'Iceland',
    'Kuzey Makedonya': 'North Macedonia',
    'Karadağ': 'Montenegro',
    'Estonya': 'Estonia',
    'Kuzey İrlanda': 'Northern Ireland',
    'Andorra': 'Andorra',
    'Moldova': 'Moldova',
    'Lüksemburg': 'Luxembourg',
    'Faroe Adaları': 'Faroe Islands',
    'Galler': 'Wales',
    'Cebelitarık': 'Gibraltar',
    'San Marino': 'San Marino'
}

with open('target_leagues.json', 'r', encoding='utf-8') as f:
    user_list = json.load(f)

translated_list = []
for item in user_list:
    if ' - ' in item:
        trn, cat = item.rsplit(' - ', 1)
        # Check if country needs translation
        if cat in tr_to_en:
            cat = tr_to_en[cat]
        translated_list.append(f"{trn} - {cat}")
    else:
        translated_list.append(item)

with open('translated_targets.json', 'w', encoding='utf-8') as f:
    json.dump(translated_list, f, ensure_ascii=False, indent=2)
print("Translated targets saved.")
