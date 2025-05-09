from bs4 import BeautifulSoup
import os
import requests

# with open('Genshin/scripts/characters/characters.html', 'w', encoding='utf-8') as f:
#     url = 'https://genshin-impact.fandom.com/wiki/Character/List'
#     r = requests.get(url)
#     f.write(r.text)

f = open('Genshin/scripts/characters/characters.html', encoding='utf8')
soup = BeautifulSoup(f, 'html.parser')
for character in soup.find('table').find_all('tr')[1:] :
    character_td_img = character.find('td')
    character_img = character_td_img.find('img')['data-src'].split('/scale-to-width-down')[0]
    character_td_name = character_td_img.next_sibling.next_sibling
    character_name = character_td_name.find('a').get_text()
    character_td_element = character_td_name.next_sibling.next_sibling.next_sibling.next_sibling
    if (character_td_element.get_text().strip() == 'None') :
        character_element = 'None'
    else :
        character_element = character_td_element.find_all('a')[1].get_text()
    image_location = 'Genshin/Characters/'+character_element+'/'+character_name+'.png'

    if (not os.path.isfile(image_location)) :
        img_data = requests.get(character_img).content
        with open(image_location, 'wb') as handler:
            handler.write(img_data)
