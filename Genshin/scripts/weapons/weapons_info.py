from bs4 import BeautifulSoup
import json
import requests
import re

# with open('Genshin/scripts/weapons/weapons.html', 'w', encoding='utf-8') as f:
#     url = 'https://genshin-impact.fandom.com/wiki/Weapon/List/By_Weapon_Type'
#     r = requests.get(url)
#     f.write(r.text)

with open('Genshin/scripts/weapons/weapons.json') as json_file:
    weapons = json.load(json_file)

f = open('Genshin/scripts/weapons/weapons.html', encoding='utf8')
soup = BeautifulSoup(f, 'html.parser')
for weapon_type in soup.find_all('span', 'mw-headline') :
    weapon_type_name = weapon_type.get_text()
    weapon_list = weapon_type.parent.next_sibling.next_sibling.next_sibling.next_sibling.find_all('tr')

    for weapon in weapon_list[1:] :
        weapon_td_name = weapon.find('td').next_sibling.next_sibling
        weapon_name = weapon_td_name.find('a').get_text()
        weapon_link = 'https://genshin-impact.fandom.com'+weapon_td_name.find('a')['href']

        weapon_td_quality = weapon_td_name.next_sibling.next_sibling
        weapon_quality = weapon_td_quality.find('img')
        weapon_quality = weapon_quality['alt'].replace(' Stars', '')

        weapon_td_first_stat = weapon_td_quality.next_sibling.next_sibling
        weapon_first_stat = weapon_td_first_stat.get_text().split('(')[0]

        weapon_td_second_stat = weapon_td_first_stat.next_sibling.next_sibling

        if (weapon_td_second_stat.get_text().strip() != 'None') :
            weapon_second_stat_type = re.split(' \\d', weapon_td_second_stat.get_text())[0]
            weapon_second_stat = re.findall('\\d[^( ]*', weapon_td_second_stat.get_text())[0]
        else :
            weapon_second_stat_type = ''
            weapon_second_stat = ''

        weapon_td_ability = weapon_td_second_stat.next_sibling.next_sibling
        for br in weapon_td_ability.find_all('br'):
            br.replace_with("\n")
        weapon_ability = weapon_td_ability.get_text().strip()
        if (weapon_ability == 'None') :
            weapon_ability = ''

        if weapon_name not in weapons :
            weapons[weapon_name] = {
                'type' : weapon_type_name.rstrip('s'),
                'quality' : weapon_quality,
                'first_stat' : weapon_first_stat,
                'second_stat' : weapon_second_stat,
                'second_stat_type' : weapon_second_stat_type,
                'ability' : weapon_ability,
                'link' : weapon_link,
                'src' : 'Genshin/Weapons/'+weapon_type_name+'/'+weapon_name.replace('"', '')+'.png'
            }

with open('Genshin/scripts/weapons/weapons.json', 'w') as file:
    file.write(json.dumps(weapons, indent=4))