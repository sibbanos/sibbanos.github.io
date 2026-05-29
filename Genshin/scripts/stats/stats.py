import json
import yaml
from os import listdir
from os.path import isfile, join

# https://downgit.github.io/#/home?url=https://github.com/tmdict/mhy-tl/tree/main/src/data/builds

with open('Genshin/scripts/characters/characters.json') as json_file:
    characters = json.load(json_file)

build_dir = 'Genshin/scripts/stats/builds'
builds = [f for f in listdir(build_dir) if isfile(join(build_dir, f))]

for character in characters :
    build_name = character

    match character :
        case 'Arataki Itto' :
            build_name = 'itto'
        case 'Hu Tao' :
            build_name = 'hu-tao'
        case 'Kaedehara Kazuha' :
            build_name = 'kazuha'
        case 'Kamisato Ayaka' :
            build_name = 'ayaka'
        case 'Kamisato Ayato' :
            build_name = 'ayato'
        case 'Raiden Shogun' :
            build_name = 'raiden'
        case 'Sangonomiya Kokomi' :
            build_name = 'kokomi'
        case 'Tartaglia' :
            build_name = 'childe'
        case 'Yae Miko' :
            build_name = 'yae'
        case 'Yumemizuki Mizuki' :
            build_name = 'yumemizuki-mizuki'
        case 'Kujou Sara' :
            build_name = 'sara'
        case 'Kuki Shinobu' :
            build_name = 'shinobu'
        case 'Lan Yan' :
            build_name = 'lan-yan'
        case 'Shikanoin Heizou' :
            build_name = 'heizou'
        case 'Yun Jin' :
            build_name = 'yun-jin'

    character_build = [k for k in builds if build_name.lower() in k]

    characters[character]['stats'] = {}

    if character_build :
        if len(character_build) > 1 :
            match character :
                case 'Ganyu' :
                    character_build = ['ganyu.dps.yml']
                case 'Sangonomiya Kokomi' :
                    character_build = ['kokomi.healer.yml']
                case 'Mona' :
                    character_build = ['mona.support.yml']
                case 'Traveler' :
                    character_build = ['traveler-dendro.support.yml']
                case 'Zhongli' :
                    character_build = ['zhongli.shield.yml']
                case 'Amber' :
                    character_build = ['amber.burst.yml']
                case 'Bennett' :
                    character_build = ['bennett.healer.yml']
                case 'Kuki Shinobu' :
                    character_build = ['shinobu.reaction.yml']
                case 'Lisa' :
                    character_build = ['lisa.sub-dps.yml']
                case 'Xinyan' :
                    character_build = ['xinyan.dps.yml']
                case _ :
                    print('Fix me : '+character)
                    print(character_build)
                    exit(1)

        character_build = character_build[0]

        with open(build_dir+'/'+character_build) as stream:
            build = yaml.safe_load(stream)
            stats = build['stats']

            for stat in stats :
                key = list(stat)[0]
                value = stat[key]

                if value :
                    if character == 'Yun Jin' and key == 'crit' :
                        key = 'cr'

                    match key :
                        case 'crit' :
                            cr, cd = value.split('/')
                            characters[character]['stats']['Crit Rate'] = cr.strip()
                            characters[character]['stats']['Crit DMG'] = cd.strip()
                        case 'cr' :
                            characters[character]['stats']['Crit Rate'] = value
                        case 'cdmg' :
                            characters[character]['stats']['Crit DMG'] = value
                        case 'atk' :
                            characters[character]['stats']['ATK'] = value
                        case 'hp' :
                            characters[character]['stats']['HP'] = value
                        case 'def' :
                            characters[character]['stats']['DEF'] = value
                        case 'er' :
                            characters[character]['stats']['Energy Recharge'] = value
                        case 'em' :
                            characters[character]['stats']['Elemental Mastery'] = value
                        case 'heal' :
                            characters[character]['stats']['Healing Bonus'] = value


with open('Genshin/scripts/characters/characters.json', 'w') as file:
    file.write(json.dumps(characters, indent=4))

with open('Genshin/Ressources/characters.js', 'w') as file:
    file.write('let genshinCharacters = '+json.dumps(characters, indent=4)+';')