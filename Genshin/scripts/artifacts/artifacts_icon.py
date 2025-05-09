from bs4 import BeautifulSoup
import os
import requests

# with open('Genshin/scripts/artifacts/artifacts.html', 'w', encoding='utf-8') as f:
#     url = 'https://genshin-impact.fandom.com/wiki/Artifact/Sets'
#     r = requests.get(url)
#     f.write(r.text)

f = open('Genshin/scripts/artifacts/artifacts.html', encoding='utf8')
soup = BeautifulSoup(f, 'html.parser')
for artifact in soup.find('table').find_all('tr')[1:] :
    artifact_td_name = artifact.find('td')
    artifact_name = artifact_td_name.find('a').get_text()

    artifact_td_pieces = artifact_td_name.next_sibling.next_sibling.next_sibling.next_sibling
    artifact_pieces = artifact_td_pieces.find_all('span', 'item')

    for piece in artifact_pieces :
        piece_img_cell = piece.find('img')
        piece_name = piece_img_cell['alt']

        if piece_img_cell.has_attr('data-src') :
            piece_img = piece_img_cell['data-src'].split('/scale-to-width-down')[0]
        else :
            piece_img = piece_img_cell['src'].split('/scale-to-width-down')[0]

        dir_location = 'Genshin/Artifacts/'+artifact_name
        image_location = dir_location+'/'+piece_name+'.png'

        if (not os.path.isdir(dir_location)) :
            os.mkdir(dir_location)

        if (not os.path.isfile(image_location)) :
            img_data = requests.get(piece_img).content
            with open(image_location, 'wb') as handler:
                handler.write(img_data)
