from bs4 import BeautifulSoup
import os
import requests

# with open('Genshin/scripts/weapons/weapons.html', 'w', encoding='utf-8') as f:
#     url = 'https://genshin-impact.fandom.com/wiki/Weapon/List/By_Weapon_Type'
#     r = requests.get(url)
#     f.write(r.text)

f = open('Genshin/scripts/weapons/weapons.html', encoding='utf8')
soup = BeautifulSoup(f, 'html.parser')
for weapon_type in soup.find_all('span', 'mw-headline') :
    weapon_type_name = weapon_type.get_text()
    weapon_list = weapon_type.parent.next_sibling.next_sibling.next_sibling.next_sibling.find_all('tr')

    for weapon in weapon_list[1:] :
        weapon_img = weapon.find('img')['data-src'].split('/scale-to-width-down')[0]
        weapon_name = weapon.find('img').parent['title'].replace('"', '')
        image_location = 'Genshin/Weapons/'+weapon_type_name+'/'+weapon_name+'.png'

        if (not os.path.isfile(image_location)) :
            img_data = requests.get(weapon_img).content
            with open(image_location, 'wb') as handler:
                handler.write(img_data)
