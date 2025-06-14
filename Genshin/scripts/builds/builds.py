from bs4 import BeautifulSoup
import json
import re
import requests

# with open('Genshin/scripts/builds/builds.html', 'w', encoding='utf-8') as f:
#     url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRq-sQxkvdbvaJtQAGG6iVz2q2UN9FCKZ8Mkyis87QHFptcOU3ViLh0_PJyMxFSgwJZrd10kbYpQFl1/pubhtml#'
#     r = requests.get(url)
#     f.write(r.text)

with open('Genshin/scripts/artifacts/artifacts.json') as json_file:
    artifacts_json = json.load(json_file)
with open('Genshin/scripts/characters/characters.json') as json_file:
    characters_json = json.load(json_file)
with open('Genshin/scripts/weapons/weapons.json') as json_file:
    weapons_json = json.load(json_file)

# Create list of 2 pieces artifacts with same effect
artifacts_2_pieces = {
    '18% ATK' : [],
    '80 EM' : [],
    '25% Physical DMG' : [],
    '20% HP' : [],
    '15% Healing Bonus' : [],
    '20% Energy Recharge' : [],
    '15% Hydro DMG' : [],
    '15% Cryo DMG' : [],
    '15% Anemo DMG' : [],
}
for artifact in artifacts_json :
    artifact_info = artifacts_json[artifact]
    if artifact_info['bonuses'] :
        if '2' in artifact_info['bonuses'] :
            if 'ATK +18%' in artifact_info['bonuses']['2'] :
                artifacts_2_pieces['18% ATK'].append(artifact)
            if 'Increases Elemental Mastery by 80' in artifact_info['bonuses']['2'] :
                artifacts_2_pieces['80 EM'].append(artifact)
            if 'Physical DMG Bonus +25%' in artifact_info['bonuses']['2'] :
                artifacts_2_pieces['25% Physical DMG'].append(artifact)
            if 'HP +20%' in artifact_info['bonuses']['2'] :
                artifacts_2_pieces['20% HP'].append(artifact)
            if 'Healing Bonus +15%' in artifact_info['bonuses']['2'] :
                artifacts_2_pieces['15% Healing Bonus'].append(artifact)
            if 'Energy Recharge +20%' in artifact_info['bonuses']['2'] :
                artifacts_2_pieces['20% Energy Recharge'].append(artifact)
            if 'Hydro DMG Bonus +15%' in artifact_info['bonuses']['2'] :
                artifacts_2_pieces['15% Hydro DMG'].append(artifact)
            if 'Cryo DMG Bonus +15%' in artifact_info['bonuses']['2'] :
                artifacts_2_pieces['15% Cryo DMG'].append(artifact)
            if 'Anemo DMG Bonus +15%' in artifact_info['bonuses']['2'] :
                artifacts_2_pieces['15% Anemo DMG'].append(artifact)

# List of valid stat
valid_stats = [
    'ATK%',
    'HP%',
    'DEF%',
    'Flat ATK',
    'Flat HP',
    'Flat DEF',
    'Energy Recharge',
    'Elemental Mastery',
    'Physical DMG',
    'Pyro DMG',
    'Electro DMG',
    'Dendro DMG',
    'Hydro DMG',
    'Anemo DMG',
    'Geo DMG',
    'Cryo DMG',
    'Crit Rate',
    'Crit DMG',
    'Healing Bonus',
]

# Fix sheet error
correct_weapon_name = {
    "Tullaytulah's Remembrance" : "Tulaytullah's Remembrance",
    "Tullaytullah's Rememberance" : "Tulaytullah's Remembrance",
    "Tulaytullah's Rememberance" : "Tulaytullah's Remembrance",
    'Primoridal Jade Cutter' : 'Primordial Jade Cutter',
    'Freedom Sworn' : 'Freedom-Sworn',
    'Oathsworn Eye R5' : 'Oathsworn Eye',
    'Lost Prayer to Sacred Winds' : 'Lost Prayer to the Sacred Winds',
    'Lions Roar' : "Lion's Roar",
    'Ash Graven Drinking Horn' : 'Ash-Graven Drinking Horn',
    'Aquilla Favonia' : 'Aquila Favonia',
    'Wolf Fang' : 'Wolf-Fang',
    "''The Catch''" : '"The Catch"',
    'Sunny Morning Sleep In' : 'Sunny Morning Sleep-In',
}
def correctWeapon(weapon) :
    if weapon in correct_weapon_name :
        return correct_weapon_name[weapon]

    return weapon

# Fix sheet error
correct_artifact_name = {
    'Marechausse Hunter' : 'Marechaussee Hunter',
    'Ocean Hued Clam' : 'Ocean-Hued Clam',
    'Emblem Of Severed Fate' : 'Emblem of Severed Fate',
    '18 ATK%' : '18% ATK',
    '20% ER' : '20% Energy Recharge',
    '15% Hydro DMG Bonus' : '15% Hydro DMG',
}
def correctArtifact(artifact) :
    if artifact in correct_artifact_name :
        return correct_artifact_name[artifact]

    return artifact

# Fix sheet error
correct_stat_name = {
    'DMG' : 'Crit DMG',
    'Electro Damage' : 'Electro DMG',
    'Electro DMG%' : 'Electro DMG',
    'Energy Recharge%' : 'Energy Recharge',
    'Healing Bonus%' : 'Healing Bonus',
    'Crit Rate%' : 'Crit Rate',
    'Physical DMG%' : 'Physical DMG',
    'Cryo DMG%' : 'Cryo DMG',
    'Anemo Damage' : 'Anemo DMG',
    'Geo DMG%' : 'Geo DMG',
    'DEF' : 'DEF%',
    'ER%' : 'Energy Recharge',
    'Atk%' : 'ATK%',
}
def correctStat(stat) :
    if stat in correct_stat_name :
        return correct_stat_name[stat]

    return stat

i = 0
builds = {}
f = open('Genshin/scripts/builds/builds.html', encoding='utf8')
soup = BeautifulSoup(f, 'html.parser')

# Get elements order, only used by Traveler
elements = []
for element in soup.find_all('li')[4:] :
    elements.append(element.find('a').get_text().strip())

# Get all the table with build
for character_list in soup.find_all('table')[4:] :
    # Reset
    character_name = ''
    weapons_multirows = False
    artifacts_multirows = False
    main_stats_multirows = False
    sub_stats_multirows = False

    # Check each row for information
    for row in character_list.find('tbody').find_all('tr') :
        # Get current element
        element = elements[i]

        cell = row.find_all('td')[1]

        # Check if current row is the name of the character
        if (cell.has_attr('colspan') and cell.has_attr('rowspan')) or cell.get_text().title() == 'Mavuika' :
            # Reset
            weapons_multirows = False
            artifacts_multirows = False
            main_stats_multirows = False
            sub_stats_multirows = False

            character_name = cell.get_text().title().split(' (')[0]

            # exit if character isn't known
            if character_name not in characters_json :
                print('Fix me (character) : '+character_name+' '+element)
                exit(1)

            continue

        # Fix for Wanderer first build
        if (cell.find('img')) :
            cell = cell.next_sibling

        # Check if current row is a top build
        if character_name and cell.get_text().find('✩') > -1 :
            # Reset
            weapons = {}
            artifacts = {}
            main_stats = {}
            sub_stats = {}

            # Get build name
            for br in cell.find_all('br'):
                br.replace_with(' ')
            build_name = cell.get_text().replace('✩', '').strip()

            current_cell = cell

            if not weapons_multirows :
                current_cell = current_cell.next_sibling
                weapons_cell = current_cell
                if weapons_cell.has_attr('rowspan') :
                    weapons_multirows = True
                
                # Fix for Beidou
                if (character_name == 'Beidou') :
                    current_cell = row.previous_sibling.find_all('td')[2]

            if not artifacts_multirows :
                current_cell = current_cell.next_sibling
                artifacts_cell = current_cell
                if artifacts_cell.has_attr('rowspan') :
                    artifacts_multirows = True

            if not main_stats_multirows :
                current_cell = current_cell.next_sibling
                main_stats_cell = current_cell
                if main_stats_cell.has_attr('rowspan') :
                    main_stats_multirows = True

            if not sub_stats_multirows :
                current_cell = current_cell.next_sibling
                sub_stats_cell = current_cell
                if sub_stats_cell.has_attr('rowspan') :
                    sub_stats_multirows = True

            # Get weapons list
            for br in weapons_cell.find_all('br'):
                br.replace_with("weapon_separator")
            weapons_list = weapons_cell.get_text().strip().split('weapon_separator')
            weapons_list = list(filter(None, weapons_list))

            # Get weapons
            j = 1
            for weapon in weapons_list :
                if weapon.startswith('≈') or weapon[0].isdigit() :
                    weapon = weapon.replace('!', '').split('(')[0].split(' [')[0]
                    weapon = re.sub('≈', '', weapon)
                    weapon = re.sub('[0-9]*\\.', '', weapon).strip()
                    weapon = correctWeapon(weapon)

                    # Skip for Noelle
                    if weapon == 'Other damaging options' :
                        continue

                    # exit if weapon isn't known
                    if (weapon not in weapons_json) :
                        print('Fix me (weapon) : '+character_name+' '+element+' '+build_name+' '+weapon)
                        exit(1)

                    weapons[j] = weapon
                    j += 1

            # Get artifacts list
            for br in artifacts_cell.find_all('br'):
                br.replace_with("artifact_separator")
            artifacts_list = artifacts_cell.get_text().strip().split('artifact_separator')
            artifacts_list = list(filter(None, artifacts_list))

            # Get artifacts
            j = 1

            for artifact in artifacts_list :
                artifact = artifact.strip()
                if artifact.startswith('≈') or artifact[0].isdigit() :
                    if '(4)' in artifact :
                        _artifact = [artifact.split('(4)')[0]]
                    else :
                        _artifact = []

                        artifact_temp = artifact.split('/')
                        for __artifact in artifact_temp :
                            __artifact = __artifact.strip()
                            _artifact = _artifact + __artifact.split('(2)')

                    artifact = []

                    for __artifact in _artifact :
                        __artifact = __artifact.split('[')[0]
                        __artifact = __artifact.replace('Mixes of', '')
                        __artifact = __artifact.replace('Mixes of', '')
                        __artifact = __artifact.replace('+', '')
                        __artifact = __artifact.replace('*', '')
                        __artifact = __artifact.replace('≈', '')
                        __artifact = re.sub(r'\band\b', '', __artifact, flags=re.IGNORECASE).strip()
                        __artifact = re.sub(r'\bany\b', '', __artifact, flags=re.IGNORECASE).strip()
                        __artifact = re.sub(r'\bset\b', '', __artifact, flags=re.IGNORECASE).strip()
                        __artifact = re.sub('[0-9]*\\.', '', __artifact, flags=re.IGNORECASE).strip()
                        __artifact = correctArtifact(__artifact)

                        # Skip empty value and Noelle
                        if __artifact in ['', 'Other damaging options (see DPS)'] :
                            continue

                        if __artifact in artifacts_2_pieces :
                            for ___artifact in artifacts_2_pieces[__artifact] :
                                artifact.append(___artifact)
                        else :
                            artifact.append(__artifact)

                    # exit if artifact isn't known
                    for _artifact in artifact :
                        if (_artifact not in artifacts_json) :
                            print('Fix me (artifact) : '+character_name+' '+element+' '+build_name+' '+_artifact)
                            exit(1)

                    if artifact :
                        artifact = list(dict.fromkeys(artifact))
                        artifacts[j] = artifact
                    j += 1

            # Get main stats list
            for br in main_stats_cell.find_all('br'):
                br.replace_with("main_stat_separator")
            main_stats_list = main_stats_cell.get_text().strip().split('main_stat_separator')
            main_stats_list = list(filter(None, main_stats_list))

            # Get main stats
            for main_stat in main_stats_list :
                if main_stat.startswith('Sands') :
                    artifact_type = 'Sands'
                elif main_stat.startswith('Goblet') :
                    artifact_type = 'Goblet'
                elif main_stat.startswith('Circlet') :
                    artifact_type = 'Circlet'
                else :
                    # print('Unknown (main stat) : '+character_name+' '+element+' '+build_name+' '+main_stat)
                    continue

                if artifact_type not in main_stats :
                    main_stats[artifact_type] = []

                main_stat = main_stat.replace(artifact_type, '').strip().strip('-').strip(':').split('/')
                for _main_stat in main_stat :
                    _main_stat = _main_stat.strip().strip('*')
                    _main_stat = correctStat(_main_stat)

                    if _main_stat == 'CRIT' :
                        main_stats[artifact_type].append('Crit Rate')
                        main_stats[artifact_type].append('Crit DMG')
                        continue

                    # exit if main stat isn't known
                    if _main_stat not in valid_stats :
                        print('Fix me (main stat) : '+character_name+' '+element+' '+build_name+' '+_main_stat)
                        exit(1)

                    main_stats[artifact_type].append(_main_stat)

            # Get sub stats list
            for br in sub_stats_cell.find_all('br'):
                br.replace_with("sub_stat_separator")
            sub_stats_list = sub_stats_cell.get_text().strip().split('sub_stat_separator')
            sub_stats_list = list(filter(None, sub_stats_list))

            # Get sub stats
            j = 1
            for sub_stat in sub_stats_list :
                if sub_stat.startswith('≈') or sub_stat[0].isdigit() :
                    if not sub_stat[0].isdigit() :
                        sub_stat = sub_stat.replace('≈', '')
                    sub_stat = sub_stat.replace('until requirement is met', '')
                    sub_stat = sub_stat.replace('(higher prio in Vaporize/Melt comps)', '')
                    sub_stat = sub_stat.replace('[Only for Favonius Greatsword]', '')
                    sub_stat = sub_stat.replace('(Until Requirement)', '')
                    sub_stat = sub_stat.replace('(if bursting every rotation)', '')
                    sub_stat = re.sub('[0-9]*\\.', '', sub_stat).strip()
                    if '≈' in sub_stat :
                        sub_stat = sub_stat.split('≈')
                    elif '=' in sub_stat :
                        sub_stat = sub_stat.split('=')
                    else :
                        sub_stat = sub_stat.split('/')

                    for _sub_stat in sub_stat :
                        _sub_stat = _sub_stat.strip().strip('*').strip()
                        _sub_stat = correctStat(_sub_stat)

                        if _sub_stat == 'CRIT' :
                            sub_stats[j] = 'Crit Rate'
                            j += 1
                            sub_stats[j] = 'Crit DMG'
                            j += 1
                            continue

                        # exit if sub stat isn't known
                        if _sub_stat not in valid_stats :
                            print('Fix me (sub stat) : '+character_name+' '+element+' '+build_name+' '+_sub_stat)
                            exit(1)

                        sub_stats[j] = _sub_stat
                        j += 1

            if character_name == 'Traveler' and element.upper() not in build_name :
                build_name = element.upper()+' '+build_name
            if character_name not in builds :
                builds[character_name] = {}
            builds[character_name][build_name] = {
                'weapons' : weapons,
                'artifacts' : artifacts,
                'main_stats' : main_stats,
                'sub_stats' : sub_stats,
            }

    i += 1

with open('Genshin/scripts/builds/builds.json', 'w') as file:
    file.write(json.dumps(builds, indent=4))

with open('Genshin/Ressources/builds.js', 'w') as file:
    file.write('let genshinBuilds = '+json.dumps(builds, indent=4)+';')