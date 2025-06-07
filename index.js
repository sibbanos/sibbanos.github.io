let delegateInstance = {};

window.addEventListener('hashchange', () => {
    init();
});

init();

/**
 * Load page
 */
function init() {
    const url = window.location.hash;
    const currentLocation = url.split('#');

    if (currentLocation.length > 1) {
        document.querySelector('#landingPage').hidden = true;
        document.querySelector('#siteContainer').hidden = false;
    
        window[`${currentLocation[1]}${currentLocation[2]}`](currentLocation[3]);
    }
}

//#region Genshin

// Call filter function on button click
document.querySelectorAll('.genshinFilterButton').forEach((e) => {
    e.addEventListener('click', () => {
        const parentContainer = e.parentElement.parentElement;
        let everythingSelected = true;
        let everythingUnSelected = true;

        // Check if every button is selected
        for (const button of parentContainer.querySelectorAll('.genshinFilterButton')) {
            if (!button.parentElement.hidden && button.ariaSelected === 'false') {
                everythingSelected = false;
                break;
            }
        }

        // If every button is selected, unselect all except current one
        if (everythingSelected) {
            parentContainer.querySelectorAll('.genshinFilterButton').forEach((f) => {
                f.ariaSelected = false;
            });
            e.ariaSelected = true;
        } else {
            e.ariaSelected = e.ariaSelected === 'false';
        }

        // Check if nothing is selected
        for (const button of parentContainer.querySelectorAll('.genshinFilterButton')) {
            if (!button.parentElement.hidden && button.ariaSelected === 'true') {
                everythingUnSelected = false;
                break;
            }
        }

        // If nothing is selected, select all
        if (everythingUnSelected) {
            parentContainer.querySelectorAll('.genshinFilterButton').forEach((f) => {
                f.ariaSelected = true;
            });
        }

        genshinFilterList();
    });
});

// Call filter function when writing in search input
document.querySelector('#genshinSearch input').addEventListener('input', genshinFilterList);

// Set select value when switching tab
document.querySelector('#genshinCharacterBuildNavContainer').addEventListener('click', (e) => {
    document.querySelector('#genshinCharacterBuildNavSelect').value = e.target.dataset.hsTab;
});

// Show / hide collapse div
document.querySelector('#genshinCharacterBuildTabContainer').addEventListener('click', (e) => {
    if (e.target.name === 'collapse') {
        const shown = e.target.ariaSelected === 'false' ? false : true;
        document.querySelector(`#${e.target.dataset.target}`).ariaHidden = !shown;
        e.target.ariaSelected = !shown;

        if (shown) {
            e.target.textContent = 'Show less -';
        } else {
            e.target.textContent = 'Show more +';
        }
    }
});

// Create tooltip
tippy('[data-tippy-content]');

/**
 * Filter genshin list based on button clicked and search
 */
function genshinFilterList() {
    // Show everything
    document.querySelectorAll('.genshinCardContainer').forEach((e) => {
        e.hidden = false;
    });

    // Hide card if button his pressed
    document.querySelectorAll('.genshinFilterButton').forEach((e) => {
        if (e.ariaSelected === 'false') {
            document.querySelectorAll(`.genshinCardContainer[data-${e.dataset.type}="${e.dataset.value}"]`).forEach((f) => {
                f.hidden = true;
            });
        }
    });

    const searchValue = document.querySelector('#genshinSearch input').value;

    // Filter card based on search
    if (searchValue) {
        const searchArray = searchValue.split('');
        const searchRegex = new RegExp('.*?'+searchArray.join('.*?')+'.*?', 'i');

        document.querySelectorAll(`.genshinCardContainer`).forEach((f) => {
            const name = f.querySelector('.genshinCardName').textContent;
            if (!searchRegex.test(name)) {
                f.hidden = true;
            }
        });

        // Secret
        if (searchValue.toLowerCase() === 'fatfuck') {
            document.querySelector('#FatFuck').hidden = false;
            window.setTimeout(() => {
                document.querySelector('#FatFuck').ariaSelected = true;
            }, 1);
            window.setTimeout(() => {
                document.querySelector('#FatFuck').hidden = true;
                document.querySelector('#FatFuck').ariaSelected = false;
            }, 3000);
        }
    }
}

/**
 * Show genshin page and select current tab
 * 
 * @param {string|null} page 
 */
function genshinPage(page = null) {
    // Show genshin page
    document.querySelector('#genshinPage').hidden = false;

    // Scroll to top
    document.querySelector('#genshinPage').scrollIntoView({ behavior: "smooth" });

    // Hide container
    document.querySelector('#genshinCharacter').hidden = true;
    document.querySelector('#genshinList').hidden = true;

    // Empty content
    document.querySelector('#genshinListContainer').innerHTML = '';

    // Unselect all tab
    document.querySelectorAll('.genshinNav').forEach((nav) => {
        nav.ariaSelected = false;
    });
    
    // Select current tab
    if (page) {
        document.querySelector(`#genshinNav${page}`).ariaSelected = true;
    }
}

/**
 * Show or hide filter
 * 
 * @param {Array|false} quality 
 * @param {Boolean} element 
 * @param {Boolean} weapon 
 */
function genshinShowFilter(quality = [4, 5], element = true, weapon = true) {
    // Reset input
    document.querySelector('#genshinSearch input').value = '';
    document.querySelectorAll('.genshinFilterButton').forEach((e) => {
        e.ariaSelected = true;
    });

    // Show filter separator
    document.querySelector('#genshinFilterSeparator1').hidden = false;
    document.querySelector('#genshinFilterSeparator2').hidden = false;

    // Show or hide filter
    document.querySelector('#genshinQualityFilter').hidden = !quality;
    document.querySelector('#genshinElementFilter').hidden = !element;
    document.querySelector('#genshinWeaponFilter').hidden = !weapon;

    // Hide separator
    if (!quality || !element) {
        document.querySelector('#genshinFilterSeparator1').hidden = true;
    }
    if ((!quality && !element) || !weapon) {
        document.querySelector('#genshinFilterSeparator2').hidden = true;
    }

    // Show or hide quality
    document.querySelectorAll('.genshinFilterButton[data-type="quality"]').forEach((e) => {
        if (quality && quality.includes(Number(e.dataset.value))) {
            e.hidden = false;
        } else {
            e.hidden = true;
        }
    });
}

/**
 * Show genshin character list
 */
function GenshinCharacters() {
    // Show default content
    genshinPage('Characters');
    document.querySelector('#genshinList').hidden = false;

    // Show filter
    genshinShowFilter();

    // Sort character by quality
    genshinCharacters = Object.fromEntries(
        Object.entries(genshinCharacters).sort(([, a], [, b]) => b.quality - a.quality)
    );

    // Create parent row
    const row = document.createElement('div');
    row.className = 'flex flex-wrap gap-5 justify-center';

    // Create character card
    for (const character in genshinCharacters) {
        const characterInfo = genshinCharacters[character];
        const template = document.querySelector("#genshinCard");
        const clone = document.importNode(template.content, true);

        // Change background based on quality
        if (characterInfo.quality == 5) {
            clone.querySelector('.genshinCardIcon').className += ' from-apricot-500';
        } else {
            clone.querySelector('.genshinCardIcon').className += ' from-pastel-violet-500';
        }

        // Set dataset
        clone.querySelector('.genshinCardContainer').dataset.element = characterInfo.element;
        clone.querySelector('.genshinCardContainer').dataset.quality = characterInfo.quality;
        clone.querySelector('.genshinCardContainer').dataset.weapon = characterInfo.weapon;
        
        // Set value
        clone.querySelector('.genshinCardContainer').href = `#Genshin#Character#${character}`;
        clone.querySelector('.genshinCardIcon').src = characterInfo.src.character;
        clone.querySelector('.genshinCardName').textContent = character;
        clone.querySelector('.genshinCardWeapon').src = characterInfo.src.weapon;

        // Remove element for Traveler
        if (character !== 'Traveler') {
            clone.querySelector('.genshinCardElement').src = characterInfo.src.element;
        } else {
            clone.querySelector('.genshinCardElement').remove();
        }

        row.appendChild(clone);
    }

    document.querySelector('#genshinListContainer').appendChild(row);
}

/**
 * Show genshin weapon list
 */
function GenshinWeapons() {
    // Show default content
    genshinPage('Weapons');
    document.querySelector('#genshinList').hidden = false;

    // Show filter
    genshinShowFilter([1, 2, 3, 4, 5], false);

    // Sort weapon by name
    genshinWeapons = Object.keys(genshinWeapons).sort().reduce((r, k) => (r[k] = genshinWeapons[k], r), {});

    // Sort weapon by quality
    genshinWeapons = Object.fromEntries(Object.entries(genshinWeapons).sort(([, a], [, b]) => b.quality - a.quality));

    // Create parent row
    const row = document.createElement('div');
    row.className = 'flex flex-wrap gap-5 justify-center';

    // Create weapon card
    for (const weapon in genshinWeapons) {
        const weaponInfo = genshinWeapons[weapon];
        const template = document.querySelector("#genshinCard");
        const clone = document.importNode(template.content, true);

        // Change background based on quality
        switch (Number(weaponInfo.quality)) {
            case 5:
                clone.querySelector('.genshinCardIcon').className += ' from-apricot-500';
                break;
            case 4:
                clone.querySelector('.genshinCardIcon').className += ' from-pastel-violet-500';
                break;
            case 3:
                clone.querySelector('.genshinCardIcon').className += ' from-water-500';
                break;
            case 2:
                clone.querySelector('.genshinCardIcon').className += ' from-tea-green-500';
                break;
            default:
                clone.querySelector('.genshinCardIcon').className += ' from-light-gray-500';
                break;
        }

        // Set dataset
        clone.querySelector('.genshinCardContainer').dataset.quality = weaponInfo.quality;
        clone.querySelector('.genshinCardContainer').dataset.weapon = weaponInfo.type;

        // Set value
        clone.querySelector('.genshinCardContainer').href = `#Genshin#Weapon#${weapon}`;
        clone.querySelector('.genshinCardIcon').src = weaponInfo.src.weapon;
        clone.querySelector('.genshinCardName').textContent = weapon;
        clone.querySelector('.genshinCardWeapon').src = weaponInfo.src.weapon_type;

        // Remove element
        clone.querySelector('.genshinCardElement').remove();

        row.appendChild(clone);
    }

    document.querySelector('#genshinListContainer').appendChild(row);
}

/**
 * Show genshin artifact list
 */
function GenshinArtifacts() {
    // Show default content
    genshinPage('Artifacts');
    document.querySelector('#genshinList').hidden = false;

    // Show filter
    genshinShowFilter([1, 3, 4, 5], false, false);

    // Sort artifact by name
    genshinArtifacts = Object.keys(genshinArtifacts).sort().reduce((r, k) => (r[k] = genshinArtifacts[k], r), {});

    // Sort artifact by quality
    genshinArtifacts = Object.fromEntries(Object.entries(genshinArtifacts).sort(([, a], [, b]) => b.quality[b.quality.length - 1] - a.quality[a.quality.length - 1]));

    // Create parent row
    const row = document.createElement('div');
    row.className = 'flex flex-wrap gap-5 justify-center';

    // Create artifact card
    for (const artifact in genshinArtifacts) {
        const artifactInfo = genshinArtifacts[artifact];
        const artifactMaxQuality = artifactInfo['quality'][artifactInfo['quality'].length - 1];
        const template = document.querySelector("#genshinCard");
        const clone = document.importNode(template.content, true);

        // Change background based on quality
        switch (artifactMaxQuality) {
            case 5:
                clone.querySelector('.genshinCardIcon').className += ' from-apricot-500';
                break;
            case 4:
                clone.querySelector('.genshinCardIcon').className += ' from-pastel-violet-500';
                break;
            case 3:
                clone.querySelector('.genshinCardIcon').className += ' from-water-500';
                break;
            default:
                clone.querySelector('.genshinCardIcon').className += ' from-light-gray-500';
                break;
        }

        // Set dataset
        clone.querySelector('.genshinCardContainer').dataset.quality = artifactMaxQuality;

        // Set value
        clone.querySelector('.genshinCardContainer').href = `#Genshin#Artifact#${artifact}`;
        clone.querySelector('.genshinCardIcon').src = artifactInfo.pieces[0].src.artifact;
        clone.querySelector('.genshinCardName').textContent = artifact;

        // Remove element & weapon
        clone.querySelector('.genshinCardElement').remove();
        clone.querySelector('.genshinCardWeapon').remove();

        row.appendChild(clone);
    }

    document.querySelector('#genshinListContainer').appendChild(row);
}

/**
 * Show genshin build finder
 */
function GenshinBuildFinder() {
    // Show default content
    genshinPage('BuildFinder');
}

/**
 * Show genshin character
 * 
 * @param {string} character 
 */
function GenshinCharacter(character) {
    // Show default content
    genshinPage();
    document.querySelector('#genshinCharacter').hidden = false;

    // Destroy previous tabs if exist
    if (document.querySelector('#genshinCharacterBuildNavContainer').innerHTML !== '') {
        const {element} = HSTabs.getInstance(document.querySelector('#genshinCharacterBuildNavContainer'), true);
        element.destroy();
    } else {
        // Add role manually, to prevent the tab from initialising when empty
        document.querySelector('#genshinCharacterBuildNavContainer').role = 'tablist';
    }

    // Destroy previous instance
    if (delegateInstance[0]) {
        delegateInstance[0].destroy();
    }

    // Empty page
    document.querySelector('#genshinCharacterBuildNavSelect').innerHTML = '';
    document.querySelector('#genshinCharacterBuildNavContainer').innerHTML = '';
    document.querySelector('#genshinCharacterBuildTabContainer').innerHTML = '';

    // Decoce character name
    character = decodeURI(character);

    // Get character info
    const characterInfo = genshinCharacters[character];

    // Set character info
    document.querySelector('#genshinCharacterIcon').src = characterInfo.src.character;
    document.querySelector('#genshinCharacterName').textContent = character;
    document.querySelector('#genshinCharacterName').href = characterInfo.link;
    document.querySelector('#genshinCharacterWeaponTypeIcon').src = characterInfo.src.weapon;
    document.querySelector('#genshinCharacterWeaponType').textContent = characterInfo.weapon;
    document.querySelector('#genshinCharacterQuality').src = `Genshin/Ressources/Quality/${characterInfo.quality}.png`;

    // Hide element for Traveler
    if (character !== 'Traveler') {
        document.querySelector('#genshinCharacterElement').src = characterInfo.src.element;
        document.querySelector('#genshinCharacterElement').parentNode.hidden = false;
    } else {
        document.querySelector('#genshinCharacterElement').parentNode.hidden = true;
    }

    const builds = genshinBuilds[character];
    let i = 1;

    // Create each build
    for (const build in builds) {
        const buildInfo = builds[build];
        const id = `hs-tab-to-select-${i}`;

        // Create select option
        const option = document.createElement('option');
        option.value = `#${id}`;
        option.textContent = build;
        document.querySelector('#genshinCharacterBuildNavSelect').appendChild(option);

        // Create nav button
        const template = document.querySelector("#genshinCharacterBuildNav");
        const clone = document.importNode(template.content, true);
        clone.querySelector('button').dataset.hsTab = `#${id}`;
        clone.querySelector('button').id = `${id}-button`;
        clone.querySelector('button').textContent = build;
        clone.querySelector('button').setAttribute('aria-controls', id);
        // Make first button active
        if (i === 1) {
            clone.querySelector('button').ariaSelected = true;
            clone.querySelector('button').classList += ' active';
        } else {
            clone.querySelector('button').ariaSelected = false;
        }
        document.querySelector('#genshinCharacterBuildNavContainer').appendChild(clone);

        // Create tab
        const tab = document.createElement('div');
        tab.setAttribute('aria-labelledby', `${id}-button`);
        tab.role = 'tabpanel';
        tab.id = `${id}`;
        // Hide every tab except first one
        if (i > 1) {
            tab.classList = 'hidden';
        }

        // Create tab content
        const templateBuildContent = document.querySelector("#genshinCharacterBuildContent");
        const cloneBuildContent = document.importNode(templateBuildContent.content, true);

        // Set sands main stats
        for (const mainStatSandsIndex in buildInfo['main_stats']['Sands']) {
            const mainStatSands = buildInfo['main_stats']['Sands'][mainStatSandsIndex];

            // Create main stat
            const template = document.querySelector("#genshinCharacterBuildStat");
            const clone = document.importNode(template.content, true);
            clone.querySelector('img').src = `Genshin/Ressources/Stats/${mainStatSands.replace('%', '')}.png`;
            clone.querySelector('span').innerHTML = mainStatSands;
            // If there is another main stat, separate them with a /
            if (typeof buildInfo['main_stats']['Sands'][Number(mainStatSandsIndex) + 1] !== 'undefined') {
                clone.querySelector('span').innerHTML += '&nbsp;/';
            }
            cloneBuildContent.querySelector('.genshinMainStatSands .genshinMainStats').appendChild(clone);
        }

        // Set goblet main stats
        for (const mainStatGobletIndex in buildInfo['main_stats']['Goblet']) {
            const mainStatGoblet = buildInfo['main_stats']['Goblet'][mainStatGobletIndex];

            // Create main stat
            const template = document.querySelector("#genshinCharacterBuildStat");
            const clone = document.importNode(template.content, true);
            clone.querySelector('img').src = `Genshin/Ressources/Stats/${mainStatGoblet.replace('%', '')}.png`;
            clone.querySelector('span').innerHTML = mainStatGoblet;
            // If there is another main stat, separate them with a /
            if (typeof buildInfo['main_stats']['Goblet'][Number(mainStatGobletIndex) + 1] !== 'undefined') {
                clone.querySelector('span').innerHTML += '&nbsp;/';
            }
            cloneBuildContent.querySelector('.genshinMainStatGoblet .genshinMainStats').appendChild(clone);
        }

        // Set circlet main stats
        for (const mainStatCircletIndex in buildInfo['main_stats']['Circlet']) {
            const mainStatCirclet = buildInfo['main_stats']['Circlet'][mainStatCircletIndex];

            // Create main stat
            const template = document.querySelector("#genshinCharacterBuildStat");
            const clone = document.importNode(template.content, true);
            clone.querySelector('img').src = `Genshin/Ressources/Stats/${mainStatCirclet.replace('%', '')}.png`;
            clone.querySelector('span').innerHTML = mainStatCirclet;
            // If there is another main stat, separate them with a /
            if (typeof buildInfo['main_stats']['Circlet'][Number(mainStatCircletIndex) + 1] !== 'undefined') {
                clone.querySelector('span').innerHTML += '&nbsp;/';
            }
            cloneBuildContent.querySelector('.genshinMainStatCirclet .genshinMainStats').appendChild(clone);
        }

        // Fill sub stats
        for (const subStatIndex in buildInfo['sub_stats']) {
            const subStat = buildInfo['sub_stats'][subStatIndex];

            // Create sub stat
            const template = document.querySelector("#genshinCharacterBuildStat");
            const clone = document.importNode(template.content, true);
            clone.querySelector('img').src = `Genshin/Ressources/Stats/${subStat.replace('%', '')}.png`;
            clone.querySelector('span').innerHTML = subStat;
            // If there is another sub stat, separate them with a >
            if (typeof buildInfo['sub_stats'][Number(subStatIndex) + 1] !== 'undefined') {
                clone.querySelector('span').innerHTML += '&nbsp;>';
            }
            cloneBuildContent.querySelector('.genshinSubStats').appendChild(clone);
        }

        let j = 1;
        // Create weapons
        for (const weaponIndex in buildInfo['weapons']) {
            const weaponName = buildInfo['weapons'][weaponIndex];
            const weapon = genshinWeapons[weaponName];

            // Create weapon
            const template = document.querySelector("#genshinCharacterBuildWeapon");
            const clone = document.importNode(template.content, true);
            clone.querySelector('.genshinWeaponRank').textContent = `${j}.`;
            clone.querySelector('img').src = weapon.src.weapon;
            switch (Number(weapon.quality)) {
                case 5:
                    clone.querySelector('img').className += ' from-apricot-500';
                    break;
                case 4:
                    clone.querySelector('img').className += ' from-pastel-violet-500';
                    break;
                case 3:
                    clone.querySelector('img').className += ' from-water-500';
                    break;
                case 2:
                    clone.querySelector('img').className += ' from-tea-green-500';
                    break;
                default:
                    clone.querySelector('img').className += ' from-light-gray-500';
                    break;
            }
            clone.querySelector('.genshinWeaponName').textContent = weaponName;
            cloneBuildContent.querySelector('.genshinBuildWeapons').appendChild(clone);
            j++;
        }

        j = 1;
        // Create artifacts
        for (const artifactIndex in buildInfo['artifacts']) {
            let artifactList = buildInfo['artifacts'][artifactIndex];

            // Test If :
            // 4 piece set 
            // 2 + 2 piece set 
            // any 2 piece set 
            if (artifactList.length === 1) {
                const artifactName = artifactList[0];
                const artifactInfo = genshinArtifacts[artifactName];
                const artifactMaxQuality = artifactInfo['quality'][artifactInfo['quality'].length - 1];

                // Create artifact
                const template = document.querySelector("#genshinCharacterBuildArtifact");
                const clone = document.importNode(template.content, true);
                clone.querySelector('.genshinArtifactRank').textContent = `${j}.`;
                clone.querySelector('img').src = artifactInfo.pieces[0].src.artifact;
                switch (artifactMaxQuality) {
                    case 5:
                        clone.querySelector('img').className += ' from-apricot-500';
                        break;
                    case 4:
                        clone.querySelector('img').className += ' from-pastel-violet-500';
                        break;
                    case 3:
                        clone.querySelector('img').className += ' from-water-500';
                        break;
                    default:
                        clone.querySelector('img').className += ' from-light-gray-500';
                        break;
                }
                clone.querySelector('.genshinArtifactName').textContent = artifactName;
                cloneBuildContent.querySelector('.genshinBuildArtifacts').appendChild(clone);
            } else {
                // Create artifact container
                const template = document.querySelector("#genshinCharacterBuildArtifactMultiple");
                const clone = document.importNode(template.content, true);
                clone.querySelector('.genshinArtifactRank').textContent = `${j}.`;

                // Hide text 'Any 2 of' if only 2 set else create id
                if (artifactList.length === 2) {
                    clone.querySelector('.genshinArtifactsMultiple').remove();
                } else {
                    const uuid = self.crypto.randomUUID();
                    clone.querySelector('.genshinArtifactsShowOther').dataset.target += uuid;
                    clone.querySelector('.genshinArtifactsOther').id += uuid;
                }

                // Sort by quality
                artifactList.sort((a, b) => {
                    a = genshinArtifacts[a];
                    b = genshinArtifacts[b];

                    return b['quality'][b['quality'].length - 1] - a['quality'][a['quality'].length - 1]
                });

                let k = 0;

                // Create artifact
                artifactList.forEach(artifactName => {
                    const artifactInfo = genshinArtifacts[artifactName];
                    const artifactMaxQuality = artifactInfo['quality'][artifactInfo['quality'].length - 1];

                    const templateArtifact = document.querySelector("#genshinCharacterBuildArtifactContainer");
                    const cloneArtifact = document.importNode(templateArtifact.content, true);

                    cloneArtifact.querySelector('.genshinArtifactIcon').src = artifactInfo.pieces[0].src.artifact;
                    let classQuality = ' from-light-gray-500';
                    switch (artifactMaxQuality) {
                        case 5:
                            classQuality = ' from-apricot-500';
                            break;
                        case 4:
                            classQuality = ' from-pastel-violet-500';
                            break;
                        case 3:
                            classQuality = ' from-water-500';
                            break;
                    }
                    cloneArtifact.querySelector('.genshinArtifactIcon').className += classQuality;
                    cloneArtifact.querySelector('.genshinArtifactName').textContent = artifactName;

                    // Show only 2 first set
                    if (k <= 1) {
                        clone.querySelector('.genshinArtifactsContainer').insertBefore(cloneArtifact, clone.querySelector('.genshinArtifactsOther'));
                    } else {
                        clone.querySelector('.genshinArtifactsOther').append(cloneArtifact);
                    }

                    k++;
                });

                cloneBuildContent.querySelector('.genshinBuildArtifacts').appendChild(clone);
            }

            j++;
        }

        // Add content to tab
        tab.appendChild(cloneBuildContent);

        // Add tab to page
        document.querySelector('#genshinCharacterBuildTabContainer').appendChild(tab);

        i++;
    }

    // Init tabs
    HSTabs.autoInit();

    // Init tooltip
    delegateInstance = tippy.delegate('#genshinCharacter', {
        allowHTML: true,
        animation: false,
        content(reference) {
            // Test if weapon or artifact
            if (reference.dataset.type === 'weapon') {
                const weaponName = reference.querySelector('.genshinWeaponName').textContent;
                const weaponInfo = genshinWeapons[weaponName];
    
                const template = document.querySelector("#genshinCharacterBuildWeaponTooltip");
                const clone = document.importNode(template.content, true);
    
                // Change background based on quality
                let classQuality = ' from-light-gray-500';
                switch (Number(weaponInfo.quality)) {
                    case 5:
                        classQuality = ' from-apricot-500';
                        break;
                    case 4:
                        classQuality = ' from-pastel-violet-500';
                        break;
                    case 3:
                        classQuality = ' from-water-500';
                        break;
                    case 2:
                        classQuality = ' from-tea-green-500';
                        break;
                }
    
                let abilityDescription = weaponInfo.ability;
                let abilityName = '';
    
                // Separate ability name and description
                if (abilityDescription) {
                    let ability = abilityDescription.split('\n');
                    abilityName = ability[0];
                    ability.shift();
                    abilityDescription = ability.join('<br>');
                }
    
                clone.querySelector('.weaponName').textContent = weaponName;
                clone.querySelector('.weaponImage').className += classQuality;
                clone.querySelector('.weaponImage').src = weaponInfo.src.weapon;
                clone.querySelector('.weaponBaseATK').textContent = weaponInfo.first_stat;
                clone.querySelector('.weaponSecondaryStat').textContent = `${weaponInfo.second_stat_type} ${weaponInfo.second_stat}`;
                clone.querySelector('.weaponAbilityName').textContent = abilityName;
                clone.querySelector('.weaponAbilityDescription').innerHTML = abilityDescription;
    
                return clone;
            } else {
                const artifactName = reference.querySelector('.genshinArtifactName').textContent;
                const artifactInfo = genshinArtifacts[artifactName];
                const artifactMaxQuality = artifactInfo['quality'][artifactInfo['quality'].length - 1];

                const template = document.querySelector("#genshinCharacterBuildArtifactTooltip");
                const clone = document.importNode(template.content, true);
    
                // Change background based on quality
                let classQuality = ' from-light-gray-500';
                switch (artifactMaxQuality) {
                    case 5:
                        classQuality = ' from-apricot-500';
                        break;
                    case 4:
                        classQuality = ' from-pastel-violet-500';
                        break;
                    case 3:
                        classQuality = ' from-water-500';
                        break;
                }

                clone.querySelector('.artifactName').textContent = artifactName;
                clone.querySelector('.artifactImage').className += classQuality;
                clone.querySelector('.artifactImage').src = artifactInfo.pieces[0].src.artifact;

                // Remove second bonus if not necessary
                if (artifactInfo.bonuses === "" || artifactInfo.bonuses[1] || reference.dataset.type === 'artifactMultiple') {
                    clone.querySelector('.artifactAbility4').remove();
                }

                // Remove first bonus if not necessary
                if (artifactInfo.bonuses === "") {
                    clone.querySelector('.artifactAbility2').remove();
                } else {
                    // Test if 1 piece bonus or 2 pieces bonus
                    if (artifactInfo.bonuses[1]) {
                        clone.querySelector('.artifactAbilityNumber2').textContent = 1;
                        clone.querySelector('.artifactAbilityDescription2').textContent = artifactInfo.bonuses[1];
                    } else {
                        clone.querySelector('.artifactAbilityDescription2').textContent = artifactInfo.bonuses[2];

                        // Set 4 pieces bonus if necessary
                        if (reference.dataset.type !== 'artifactMultiple') {
                            clone.querySelector('.artifactAbilityDescription4').textContent = artifactInfo.bonuses[4];
                        }
                    }
                }

                return clone;
            }
        },
        followCursor: true,
        placement: 'auto',
        render(instance) {
            const popper = document.createElement('div');
            const box = document.createElement('div');

            popper.appendChild(box);
            box.appendChild(instance.props.content);

            return {
                popper,
            };
        },
        target: '.genshinBuildTooltip',
    });
}

/**
 * Show genshin weapon
 * 
 * @param {string} weapon 
 */
function GenshinWeapon(weapon) {
    // Show default content
    genshinPage();

    weapon = decodeURI(weapon);
    const weaponInfo = genshinWeapons[weapon];
    console.log(weaponInfo)
}

/**
 * Show genshin artifact
 * 
 * @param {string} artifact 
 */
function GenshinArtifact(artifact) {
    // Show default content
    genshinPage();

    artifact = decodeURI(artifact);
    const artifactInfo = genshinArtifacts[artifact];
    console.log(artifactInfo)
}

//#endregion Genshin