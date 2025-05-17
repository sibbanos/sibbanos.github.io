from bs4 import BeautifulSoup
import json
import requests

# with open('Genshin/scripts/artifacts/artifacts.html', 'w', encoding='utf-8') as f:
#     url = 'https://genshin-impact.fandom.com/wiki/Artifact/Sets'
#     r = requests.get(url)
#     f.write(r.text)

with open('Genshin/scripts/artifacts/artifacts.json') as json_file:
    artifacts = json.load(json_file)

f = open('Genshin/scripts/artifacts/artifacts.html', encoding='utf8')
soup = BeautifulSoup(f, 'html.parser')
for artifact in soup.find('table').find_all('tr')[1:] :
    artifact_td_name = artifact.find('td')
    artifact_name = artifact_td_name.find('a').get_text()
    artifact_link = 'https://genshin-impact.fandom.com'+artifact_td_name.find('a')['href']

    artifact_td_quality = artifact_td_name.next_sibling.next_sibling
    artifact_quality = artifact_td_quality.get_text().replace('★', '').strip().split('-')
    if (len(artifact_quality) == 2) :
        artifact_quality = list(range(int(artifact_quality[0]), int(artifact_quality[1]) + 1))
    else :
        artifact_quality[0] = int(artifact_quality[0])

    artifact_td_pieces = artifact_td_quality.next_sibling.next_sibling
    artifact_pieces_list = artifact_td_pieces.find_all('span', 'item')
    artifact_pieces = []

    for piece in artifact_pieces_list :
        artifact_pieces.append(piece.find('img')['alt'])

    artifact_td_bonuses = artifact_td_pieces.next_sibling.next_sibling
    artifact_bonuses = artifact_td_bonuses.get_text().strip()
    if artifact_bonuses :
        if '4 Piece:' in artifact_bonuses :
            _artifact_bonuses = artifact_bonuses.split('4 Piece:')
            artifact_bonuses = {
                2 : _artifact_bonuses[0].replace('2 Piece:', '').strip(),
                4 : _artifact_bonuses[1].strip()
            }
        else :
            artifact_bonuses = artifact_bonuses.replace('1 Piece:', '').strip()
            artifact_bonuses = {1 : artifact_bonuses}

    pieces = []
    pieces_number = len(artifact_pieces)
    pieces_order = {
        1 : ['Circlet'],
        2 : ['Flower', 'Plume'],
        5 : ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet'],
    }
    i = 0
    for piece in artifact_pieces :
        pieces.append({
            'name' : piece,
            'type' : pieces_order[pieces_number][i],
            'src' : 'Genshin/Artifacts/'+artifact_name+'/'+piece+'.png'
        })
        i += 1

    if artifact_name not in artifacts :
        artifacts[artifact_name] = {
            'link' : artifact_link,
            'quality' : artifact_quality,
            'pieces' : pieces,
            'bonuses' : artifact_bonuses
        }

with open('Genshin/scripts/artifacts/artifacts.json', 'w') as file:
    file.write(json.dumps(artifacts, indent=4))
