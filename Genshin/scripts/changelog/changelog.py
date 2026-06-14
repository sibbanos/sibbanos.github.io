from bs4 import BeautifulSoup
import json

changelog = []
date = ''
info = ''
rowspan_date = 1
row_info = ''
rowspan_version = 1
start = False
version = ''

f = open('Genshin/scripts/changelog/changelog.html', encoding='utf8')
soup = BeautifulSoup(f, 'html.parser')

for row in soup.find_all('tr') :
    # Reset
    row_info = ''
    if rowspan_date < 2 :
        row_date = ''
    else :
        row_date = date
    if rowspan_version < 2 :
        row_version = ''
    else :
        row_version = version
    rowspan_date -= 1
    rowspan_version -= 1

    # Search header row
    if start == False :
        td = row.find_all('td')
        if len(td) > 2 and td[1].get_text() == 'Date' :
            start = True
        continue

    # Check each row for information
    for td in row.find_all('td') :
        text = td.get_text()
        if text :
            if row_date == '' :
                if td.has_attr('rowspan') :
                    rowspan_date = int(td['rowspan'])
                date = text
                row_date = text
                continue
            if row_version == '' :
                if td.has_attr('rowspan') :
                    rowspan_version = int(td['rowspan'])
                version = text
                row_version = text
                continue

            row_info = text
            break

    # Skip April 1st row
    if date == 'March 32, 2026' :
        continue

    # Stop if row is empty
    if row_info == '' :
        break

    changelog.append({
        'date' : row_date,
        'version' : row_version,
        'info' : row_info,
    })

changelog.reverse()

with open('Genshin/scripts/changelog/changelog.json', 'w') as file:
    file.write(json.dumps(changelog, indent=4))

with open('Genshin/Ressources/changelog.js', 'w') as file:
    file.write('let genshinChangelog = '+json.dumps(changelog, indent=4)+';')