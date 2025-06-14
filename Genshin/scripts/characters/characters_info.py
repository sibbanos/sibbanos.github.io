from bs4 import BeautifulSoup
import json
import requests

# with open('Genshin/scripts/characters/characters.html', 'w', encoding='utf-8') as f:
#     url = 'https://genshin-impact.fandom.com/wiki/Character/List'
#     r = requests.get(url)
#     f.write(r.text)

with open('Genshin/scripts/characters/characters.json') as json_file:
    characters = json.load(json_file)

f = open('Genshin/scripts/characters/characters.html', encoding='utf8')
soup = BeautifulSoup(f, 'html.parser')
for character in soup.find('table').find_all('tr')[1:] :
    character_td_name = character.find('td').next_sibling.next_sibling
    character_name = character_td_name.find('a').get_text()
    character_link = 'https://genshin-impact.fandom.com'+character_td_name.find('a')['href']

    character_td_quality = character_td_name.next_sibling.next_sibling
    character_quality = character_td_quality.find('img')
    character_quality = character_quality['alt'].replace(' Stars', '')

    character_td_element = character_td_quality.next_sibling.next_sibling
    if (character_td_element.get_text().strip() == 'None') :
        character_element = 'None'
    else :
        character_element = character_td_element.find_all('a')[1].get_text()

    character_td_weapon = character_td_element.next_sibling.next_sibling
    character_weapon = character_td_weapon.find_all('a')[1].get_text()

    if character_name not in characters :
        characters[character_name] = {
            'element' : character_element,
            'quality' : character_quality,
            'weapon' : character_weapon,
            'link' : character_link,
            'src' : {
                'character' : 'Genshin/Characters/'+character_element+'/'+character_name+'.png',
                'element' : 'Genshin/Ressources/Elements/'+character_element+'.png',
                'weapon' : 'Genshin/Ressources/Weapons/'+character_weapon+'.png',
            },
        }

# Sort by name
characters = dict(sorted(characters.items()))

# Sort by quality
characters = dict(sorted(characters.items(), key=lambda item: item[1]['quality'], reverse=True))

with open('Genshin/scripts/characters/characters.json', 'w') as file:
    file.write(json.dumps(characters, indent=4))

with open('Genshin/Ressources/characters.js', 'w') as file:
    file.write('let genshinCharacters = '+json.dumps(characters, indent=4)+';')
