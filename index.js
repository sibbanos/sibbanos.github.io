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
    document.querySelectorAll('.genshinQualityFilterButton').forEach((e) => {
        if (quality && quality.includes(Number(e.querySelector('.genshinFilterButton').dataset.value))) {
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
    for (character in genshinCharacters) {
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
    for (weapon in genshinWeapons) {
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
    for (artifact in genshinArtifacts) {
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
    document.querySelector('#genshinCharacterWeaponTypeIcon').src = characterInfo.src.weapon;
    document.querySelector('#genshinCharacterWeaponType').textContent = characterInfo.weapon;
    document.querySelector('#genshinCharacterQuality').src = `Genshin/Ressources/Quality/${characterInfo.quality}.png`;

    // Hide element for Traveler
    if (character !== 'Traveler') {
        document.querySelector('#genshinCharacterElement').src = characterInfo.src.element;
        document.querySelector('#genshinCharacterElement').hidden = false;
    } else {
        document.querySelector('#genshinCharacterElement').hidden = true;
    }

    const builds = genshinBuilds[character];
    let i = 1;

    // Show each build
    for (const build in builds) {
        const buildInfo = builds[build];

        const id = `hs-tab-to-select-${i}`;

        // Create select build option
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
        tab.innerHTML = `<pre>${JSON.stringify(buildInfo, '', 4)}</pre>`;
        document.querySelector('#genshinCharacterBuildTabContainer').appendChild(tab);

        i++;
    }

    // Init tabs
    HSTabs.autoInit();
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