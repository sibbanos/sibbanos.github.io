const genshinMainStats = {
    Flower: [
        'Flat HP',
    ],
    Plume: [
        'Flat ATK',
    ],
    Sands: [
        'HP%',
        'ATK%',
        'DEF%',
        'Elemental Mastery',
        'Energy Recharge',
    ],
    Goblet: [
        'HP%',
        'ATK%',
        'DEF%',
        'Elemental Mastery',
        'Anemo DMG',
        'Cryo DMG',
        'Dendro DMG',
        'Electro DMG',
        'Geo DMG',
        'Hydro DMG',
        'Pyro DMG',
        'Physical DMG',
    ],
    Circlet: [
        'HP%',
        'ATK%',
        'DEF%',
        'Elemental Mastery',
        'Crit Rate',
        'Crit DMG',
        'Healing Bonus',
    ],
};

const genshinCharactersWithoutElements = ['Traveler', 'Wonderland Manekin'];

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
        document.querySelector('#siteContainer').hidden = false;

        window[`Genshin${currentLocation[1]}`](currentLocation[2]);
    } else {
        GenshinCharacters();
    }
}

/**
 * Return class based on quality
 * 
 * @param {integer} quality 
 * @return {string}
 */
function qualityClass(quality) {
    switch (Number(quality)) {
        case 5:
            return ' from-apricot-500';
        case 4:
            return ' from-pastel-violet-500';
        case 3:
            return ' from-water-500';
        case 2:
            return ' from-tea-green-500';
        default:
            return ' from-light-gray-500';
    }
}

//#region Genshin

// Call filter function on button click
document.querySelectorAll('.genshinFilterButton').forEach((e) => {
    e.addEventListener('click', () => {
        const parentContainer = e.parentElement;
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

// Rank weapon against all or f2p only
document.querySelector('#genshinWeaponRankF2POnly').addEventListener('change', (e) => {
    genshinWeaponUsage(e.currentTarget.dataset.weaponName, e.currentTarget.checked);
});

// Show BiS only or all
document.querySelector('#genshinArtifactBiSOnly').addEventListener('change', (e) => {
    genshinArtifactUsage(e.currentTarget.dataset.artifactName, e.currentTarget.checked);
});

// Build Finder change type
document.querySelectorAll('#genshinBuildFinderType .option').forEach((e) => {
    e.addEventListener('click', () => {
        genshinBuildFinderReset(e);

        // Find build
        findBuild();
    });
});

// Build Finder change set
document.querySelector('#genshinBuildFinderSetContainer').addEventListener('click', (e) => {
    const option = e.target.closest('.option');
    if (option) {
        // Change button value and text
        document.querySelector('#genshinBuildFinderSet').dataset.value = option.dataset.set;
        document.querySelector('#genshinBuildFinderSet button span').innerHTML = option.innerHTML;
    
        // Close list
        document.querySelector('#genshinBuildFinderSet').classList.remove('open');
        document.querySelector('#genshinBuildFinderSet .hs-dropdown-menu').classList.add('hidden');
    
        // Find build
        findBuild();
    }
});

// Filter build finder set
document.querySelector('#genshinBuildFinderSetSearch input').addEventListener('input', genshinBuildFinderFilterArtifact);

// Hide sub stat when main stat change
document.querySelectorAll('#genshinBuildFinderMainStatContainer input').forEach((e) => {
    e.addEventListener('change', () => {
        genshinBuildFinderHideSubStats();

        // Find build
        findBuild();
    });
});

// Prevent 5 sub stat from being checked
document.querySelectorAll('#genshinBuildFinderSubStatContainer input').forEach((e) => {
    e.addEventListener('change', (f) => {
        if (document.querySelectorAll('#genshinBuildFinderSubStatContainer input:checked').length > 4) {
            f.currentTarget.checked = false;
        } else {
            // Find build
            findBuild();
        }
    });
});

// Disable build finder BiS only if use as 5 piece is checked
document.querySelector('#genshinBuildFinderUseAs5Piece').addEventListener('change', (e) => {
    const genshinBuildFinderBiSOnly = document.querySelector('#genshinBuildFinderBiSOnly');
    if (e.currentTarget.checked) {
        genshinBuildFinderBiSOnly.parentElement.classList.add('opacity-40');
        genshinBuildFinderBiSOnly.disabled = true;
    } else {
        genshinBuildFinderBiSOnly.parentElement.classList.remove('opacity-40');
        genshinBuildFinderBiSOnly.disabled = false;
    }
});

// Find build on change
document.querySelectorAll('#genshinBuildFinderNumbersOfSubStat, #genshinBuildFinderUseAs5Piece, #genshinBuildFinderBiSOnly').forEach((e) => {
    e.addEventListener('change', findBuild);
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
    }
}

/**
 * Reset form
 * 
 * @param {Object} e 
 */
function genshinBuildFinderReset(e) {
    const type = e.dataset.type;

    // Do nothing if same type has current one
    if (type !== document.querySelector('#genshinBuildFinderType').dataset.value) {
        // Change button value and text
        document.querySelector('#genshinBuildFinderType').dataset.value = type;
        document.querySelector('#genshinBuildFinderType button span').innerHTML = e.innerHTML;

        // Show search set input
        document.querySelector('#genshinBuildFinderSetSearch').hidden = false;

        // Show options
        document.querySelector('#genshinBuildFinderOptionsContainer').hidden = false;

        // Empty set list
        const genshinBuildFinderSetContainer = document.querySelector('#genshinBuildFinderSetContainer');
        genshinBuildFinderSetContainer.innerHTML = '';

        // Sort artifacts by name
        const sortedArtifacts = {};
        Object.keys(genshinArtifacts).sort().forEach((key) => {
            sortedArtifacts[key] = genshinArtifacts[key];
        });

        // Get previous set
        const selectedSet = document.querySelector('#genshinBuildFinderSet').dataset.value;

        // Reset set button text
        document.querySelector('#genshinBuildFinderSet button span').innerHTML = 'Set';

        // Create each set row
        for (setName in sortedArtifacts) {
            const artifact = genshinArtifacts[setName];

            for (pieceIndex in artifact['pieces']) {
                piece = artifact['pieces'][pieceIndex];

                // Test if current set has current piece type
                if (type === piece['type']) {
                    const template = document.querySelector("#genshinBuildFinderSetRow");
                    const clone = document.importNode(template.content, true);

                    // Set dataset
                    clone.querySelector('div').dataset.set = setName;

                    // Set src
                    clone.querySelector('img').src = piece['src']['artifact'];

                    // Set text
                    clone.querySelector('span').textContent = setName;

                    // If current set is the selected set change button text
                    if (selectedSet === setName) {
                        document.querySelector('#genshinBuildFinderSet button span').innerHTML = clone.querySelector('div').innerHTML;
                    }

                    genshinBuildFinderSetContainer.appendChild(clone);

                    continue;
                }
            }
        }

        // Keep current filter
        genshinBuildFinderFilterArtifact();

        // Get previous main stat
        const genshinBuildFinderMainStatContainer = document.querySelector('#genshinBuildFinderMainStatContainer');
        const checkedMainStat = genshinBuildFinderMainStatContainer.querySelector('input:checked');

        // Hide every main stat
        genshinBuildFinderMainStatContainer.querySelectorAll('div').forEach((f) => {
            f.hidden = true;
        });

        let checked = false;

        // Show available main stat
        genshinMainStats[type].forEach((f) => {
            const reducedMainStat = f.replace('%', '').replace(' ', '');

            // Show main stat
            const input = document.querySelector(`#genshinBuildFinderMainStat${reducedMainStat}`);
            input.parentElement.hidden = false;

            // If current main stat is the selected stat, check it
            if (checkedMainStat !== null && checkedMainStat.value === f) {
                input.checked = true;
                checked = true;
            }
        })

        // If nothing checked, check first element
        if (!checked) {
            genshinBuildFinderMainStatContainer.querySelector('div:not([hidden]) > input').checked = true;
        }

        // Hide sub stat
        genshinBuildFinderHideSubStats();
    }
}

/**
 * Filter build finder set list
 */
function genshinBuildFinderFilterArtifact() {
    const searchValue = document.querySelector('#genshinBuildFinderSetSearch input').value;

    if (searchValue) {
        const searchArray = searchValue.split('');
        const searchRegex = new RegExp('.*?'+searchArray.join('.*?')+'.*?', 'i');

        document.querySelectorAll(`#genshinBuildFinderSetContainer .option`).forEach((f) => {
            const name = f.querySelector('span').textContent; 
            if (!searchRegex.test(name)) {
                f.hidden = true;
            } else {
                f.hidden = false;
            }
        });
    } else {
        document.querySelectorAll(`#genshinBuildFinderSetContainer .option`).forEach((f) => {
            f.hidden = false;
        });
    }
}

/**
 * Hide sub stat equal to main stat
 */
function genshinBuildFinderHideSubStats() {
    const checkedMainStat = document.querySelector('#genshinBuildFinderMainStatContainer input:checked').value;
    const input = document.querySelector(`#genshinBuildFinderSubStatContainer input[value="${checkedMainStat}"]`);

    // Show every sub stat
    document.querySelectorAll('#genshinBuildFinderSubStatContainer input').forEach((e) => {
        e.disabled = false;
        e.parentElement.classList.remove('opacity-40');
    });

    // If sub stat exist, hide it and uncheck it
    if (input) {
        input.disabled = true;
        input.checked = false;
        input.parentElement.classList.add('opacity-40');
    }
}

/**
 * Find build based on form
 */
function findBuild() {
    const type = document.querySelector('#genshinBuildFinderType').dataset.value;
    const set = document.querySelector('#genshinBuildFinderSet').dataset.value;

    // Only find build if both set and piece type are provided
    if (set && type) {   
        const mainStat = document.querySelector('#genshinBuildFinderMainStatContainer input:checked').value;
        const numberOfSubStat = Number(document.querySelector('#genshinBuildFinderNumbersOfSubStat').value);
        const useAs5Piece = document.querySelector('#genshinBuildFinderUseAs5Piece').checked;
        const biSOnly = document.querySelector('#genshinBuildFinderBiSOnly').checked;
        let subStat = [];

        // Get all checked sub stat
        document.querySelectorAll('#genshinBuildFinderSubStatContainer input:checked').forEach((e) => {
            subStat.push(e.value);
        });

        // Empty found builds
        document.querySelector('#genshinBuildFinderResults').innerHTML = 'Nobody';

        // Don't need to find if not enough sub stat
        if (subStat.length >= numberOfSubStat) {
            let buildFounds = [];

            // For each character
            for (characterName in genshinBuilds) {
                const builds = genshinBuilds[characterName];

                // For each build
                for (buildName in builds) {
                    const build = builds[buildName];
                    const artifacts = build.artifacts;

                    // Use a function to break both 'for' with return;
                    (function() {
                        // For each artifact
                        for (artifactRank in artifacts) {
                            const buildArtifacts = artifacts[artifactRank];

                            for (let i = 0; i < buildArtifacts.length; i++) {
                                // If current set or use as 5 piece is checked
                                if (buildArtifacts[i] === set || useAs5Piece) {
                                    let subStatsFound = 0;

                                    // Test if piece type have multiple main stats
                                    if (typeof build['main_stats'][type] !== 'undefined') {
                                        // Test if select main stat isn't in main stat build
                                        if (!build['main_stats'][type].includes(mainStat)) {
                                            return;
                                        }
                                    }

                                    // Count how many checked sub stat are in sub stat build
                                    for (const subStatRank in build['sub_stats']) {
                                        if (subStat.includes(build['sub_stats'][subStatRank])) {
                                            subStatsFound++;
                                        }

                                        // Break if enough sub stats found
                                        if (subStatsFound === numberOfSubStat) {
                                            break;
                                        }
                                    }

                                    // Test if enough sub stats found
                                    if (subStatsFound < numberOfSubStat) {
                                        return;
                                    }

                                    // Add build to found list
                                    buildFounds.push({
                                        characterName: characterName,
                                        buildName: buildName,
                                    });

                                    return;
                                }

                                // If BiS is checked and use as 5 piece isn't checked get only first artifact
                                if (biSOnly && !useAs5Piece) {
                                    return;
                                }
                            }
                        }
                    })();
                }
            }

            if (buildFounds.length) {
                document.querySelector('#genshinBuildFinderResults').innerHTML = '';

                // Show each build
                buildFounds.forEach((build) => {
                    const characterName = build.characterName;
                    const characterInfo = genshinCharacters[characterName];
                    const template = document.querySelector("#genshinCard");
                    const clone = document.importNode(template.content, true);
    
                    // Change background based on quality
                    clone.querySelector('.genshinCardIcon').className += qualityClass(characterInfo.quality);
                    
                    // Set value
                    clone.querySelector('.genshinCardContainer').href = `#Character#${characterName}`;
                    clone.querySelector('.genshinCardIcon').src = characterInfo.src.character;
                    clone.querySelector('.genshinCardName').innerHTML = `${characterName}<br>${build.buildName}`;
                    clone.querySelector('.genshinCardWeapon').src = characterInfo.src.weapon;
                    clone.querySelector('.genshinCardRank').remove();
    
                    // Remove element for Traveler and Manekin
                    if (!genshinCharactersWithoutElements.includes(characterName)) {
                        clone.querySelector('.genshinCardElement').src = characterInfo.src.element;
                    } else {
                        clone.querySelector('.genshinCardElement').remove();
                    }
    
                    document.querySelector('#genshinBuildFinderResults').appendChild(clone);
                });
            }
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
    document.querySelector('#genshinArtifact').hidden = true;
    document.querySelector('#genshinBuildFinder').hidden = true;
    document.querySelector('#genshinCharacter').hidden = true;
    document.querySelector('#genshinWeapon').hidden = true;
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

    // Create parent row
    const row = document.createElement('div');
    row.className = 'flex flex-wrap gap-5 justify-center';

    // Create character card
    for (const character in genshinCharacters) {
        const characterInfo = genshinCharacters[character];
        const template = document.querySelector("#genshinCard");
        const clone = document.importNode(template.content, true);

        // Change background based on quality
        clone.querySelector('.genshinCardIcon').className += qualityClass(characterInfo.quality);

        // Set dataset
        clone.querySelector('.genshinCardContainer').dataset.element = characterInfo.element;
        clone.querySelector('.genshinCardContainer').dataset.quality = characterInfo.quality;
        clone.querySelector('.genshinCardContainer').dataset.weapon = characterInfo.weapon;
        
        // Set value
        clone.querySelector('.genshinCardContainer').href = `#Character#${character}`;
        clone.querySelector('.genshinCardIcon').src = characterInfo.src.character;
        clone.querySelector('.genshinCardName').textContent = character;
        clone.querySelector('.genshinCardWeapon').src = characterInfo.src.weapon;

        // Remove element for Traveler and Manekin
        if (!genshinCharactersWithoutElements.includes(character)) {
            clone.querySelector('.genshinCardElement').src = characterInfo.src.element;
        } else {
            clone.querySelector('.genshinCardElement').remove();
        }

        // Remove rank
        clone.querySelector('.genshinCardRank').remove();

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

    // Create parent row
    const row = document.createElement('div');
    row.className = 'flex flex-wrap gap-5 justify-center';

    // Create weapon card
    for (const weapon in genshinWeapons) {
        const weaponInfo = genshinWeapons[weapon];
        const template = document.querySelector("#genshinCard");
        const clone = document.importNode(template.content, true);

        // Change background based on quality
        clone.querySelector('.genshinCardIcon').className += qualityClass(weaponInfo.quality);

        // Set dataset
        clone.querySelector('.genshinCardContainer').dataset.quality = weaponInfo.quality;
        clone.querySelector('.genshinCardContainer').dataset.weapon = weaponInfo.type;

        // Set value
        clone.querySelector('.genshinCardContainer').href = `#Weapon#${weapon}`;
        clone.querySelector('.genshinCardIcon').src = weaponInfo.src.weapon;
        clone.querySelector('.genshinCardName').textContent = weapon;
        clone.querySelector('.genshinCardWeapon').src = weaponInfo.src.weapon_type;
        
        // Remove element & rank
        clone.querySelector('.genshinCardElement').remove();
        clone.querySelector('.genshinCardRank').remove();

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
        clone.querySelector('.genshinCardIcon').className += qualityClass(artifactMaxQuality);

        // Set dataset
        clone.querySelector('.genshinCardContainer').dataset.quality = artifactMaxQuality;

        // Set value
        clone.querySelector('.genshinCardContainer').href = `#Artifact#${artifact}`;
        clone.querySelector('.genshinCardIcon').src = artifactInfo.pieces[0].src.artifact;
        clone.querySelector('.genshinCardName').textContent = artifact;

        // Remove element & rank & weapon
        clone.querySelector('.genshinCardElement').remove();
        clone.querySelector('.genshinCardRank').remove();
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
    document.querySelector('#genshinBuildFinder').hidden = false;
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
    document.querySelector('#genshinCharacterInfo').innerHTML = '';
    document.querySelector('#genshinCharacterBuildNavSelect').innerHTML = '';
    document.querySelector('#genshinCharacterBuildNavContainer').innerHTML = '';
    document.querySelector('#genshinCharacterBuildTabContainer').innerHTML = '';

    // Decode character name
    character = decodeURI(character);

    // Get character info
    const characterInfo = genshinCharacters[character];

    const template = document.querySelector("#genshinHeaderInfo");
    const clone = document.importNode(template.content, true);

    // Set character info
    clone.querySelector('.genshinIcon').src = characterInfo.src.character;
    clone.querySelector('.genshinIcon').className += qualityClass(characterInfo.quality);
    clone.querySelector('.genshinName').textContent = character;
    clone.querySelector('.genshinName').href = characterInfo.link;
    clone.querySelector('.genshinWeaponTypeIcon').src = characterInfo.src.weapon;
    clone.querySelector('.genshinWeaponType').textContent = characterInfo.weapon;
    clone.querySelector('.genshinQuality').src = `Genshin/Ressources/Quality/${characterInfo.quality}.png`;

    // Hide element for Traveler and Manekin
    if (!genshinCharactersWithoutElements.includes(character)) {
        clone.querySelector('.genshinElement').src = characterInfo.src.element;
        clone.querySelector('.genshinElement').parentNode.hidden = false;
    } else {
        clone.querySelector('.genshinElement').parentNode.hidden = true;
    }

    // Add character info to page
    document.querySelector('#genshinCharacterInfo').append(clone);

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
            clone.querySelector('a').href = `#Weapon#${weaponName}`;
            clone.querySelector('.genshinWeaponRank').textContent = `${j}.`;
            clone.querySelector('img').src = weapon.src.weapon;
            clone.querySelector('img').className += qualityClass(weapon.quality);
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
                clone.querySelector('a').href = `#Artifact#${artifactName}`;
                clone.querySelector('.genshinArtifactRank').textContent = `${j}.`;
                clone.querySelector('img').src = artifactInfo.pieces[0].src.artifact;
                clone.querySelector('img').className += qualityClass(artifactMaxQuality);
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
                artifactList.forEach((artifactName) => {
                    const artifactInfo = genshinArtifacts[artifactName];
                    const artifactMaxQuality = artifactInfo['quality'][artifactInfo['quality'].length - 1];

                    const templateArtifact = document.querySelector("#genshinCharacterBuildArtifactContainer");
                    const cloneArtifact = document.importNode(templateArtifact.content, true);

                    cloneArtifact.querySelector('a').href = `#Artifact#${artifactName}`;
                    cloneArtifact.querySelector('.genshinArtifactIcon').src = artifactInfo.pieces[0].src.artifact;
                    cloneArtifact.querySelector('.genshinArtifactIcon').className += qualityClass(artifactMaxQuality);
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
                clone.querySelector('.weaponImage').className += qualityClass(weaponInfo.quality);
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

                clone.querySelector('.artifactName').textContent = artifactName;
                clone.querySelector('.artifactImage').className += qualityClass(artifactMaxQuality);
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
    document.querySelector('#genshinWeapon').hidden = false;
    document.querySelector('#genshinWeaponRankF2POnly').checked = false;

    // Empty page
    document.querySelector('#genshinWeaponInfo').innerHTML = '';

    // Decode weapon name
    weapon = decodeURI(weapon);

    // Get weapon info
    const weaponInfo = genshinWeapons[weapon];
    let abilityDescription = weaponInfo.ability;
    let abilityName = '';

    // Separate ability name and description
    if (abilityDescription) {
        let ability = abilityDescription.split('\n');
        abilityName = ability[0];
        ability.shift();
        abilityDescription = ability.join('<br>');
    }

    const template = document.querySelector("#genshinHeaderInfo");
    const clone = document.importNode(template.content, true);

    // Set weapon info
    clone.querySelector('.genshinIcon').src = weaponInfo.src.weapon;
    clone.querySelector('.genshinIcon').className += qualityClass(weaponInfo.quality);
    clone.querySelector('.genshinName').textContent = weapon;
    clone.querySelector('.genshinName').href = weaponInfo.link;
    clone.querySelector('.genshinWeaponTypeIcon').src = weaponInfo.src.weapon_type;
    clone.querySelector('.genshinWeaponType').textContent = weaponInfo.type;
    clone.querySelector('.genshinQuality').src = `Genshin/Ressources/Quality/${weaponInfo.quality}.png`;
    clone.querySelector('.genshinElement').parentElement.remove();

    // Add weapon info to page
    document.querySelector('#genshinWeaponInfo').append(clone);

    // Set weapon ability
    if (abilityName) {
        document.querySelector('#genshinWeaponAbilityName').textContent = abilityName;
        document.querySelector('#genshinWeaponAbilityDescription').innerHTML = abilityDescription;
        document.querySelector('#genshinWeaponAbility').hidden = false;
    } else {
        document.querySelector('#genshinWeaponAbility').hidden = true;
    }

    // Set weapon stat
    document.querySelector('#genshinWeaponBaseATK').textContent = weaponInfo.first_stat;
    if (weaponInfo.second_stat) {
        document.querySelector('#genshinWeaponSecondaryStat').textContent = `${weaponInfo.second_stat_type} ${weaponInfo.second_stat}`;
        document.querySelector('#genshinWeaponSecondaryStatContainer').hidden = false;
    } else {
        document.querySelector('#genshinWeaponSecondaryStatContainer').hidden = true;
    }

    // Set checkbox dataset
    document.querySelector('#genshinWeaponRankF2POnly').dataset.weaponName = weapon;

    // Hide checkbox if weapon is a 5*
    if (Number(weaponInfo.quality) === 5) {
        document.querySelector('#genshinWeaponRankF2POnlyContainer').hidden = true;
    } else {
        document.querySelector('#genshinWeaponRankF2POnlyContainer').hidden = false;
    }

    // Show usage by build
    genshinWeaponUsage(weapon);
}

/**
 * Show weapon usage by build
 * 
 * @param {string} weaponName 
 * @param {Boolean} f2p 
 */
function genshinWeaponUsage(weaponName, f2p = false) {
    // Empty usage
    document.querySelector('#genshinWeaponUsage1').innerHTML = '<span class="font-bold">Nobody</span>';
    document.querySelector('#genshinWeaponUsage2').innerHTML = '<span class="font-bold">Nobody</span>';
    document.querySelector('#genshinWeaponUsage3').innerHTML = '<span class="font-bold">Nobody</span>';
    document.querySelector('#genshinWeaponUsageOther').innerHTML = '<span class="font-bold">Nobody</span>';

    let weaponUsage = {};

    // For each character
    for (characterName in genshinBuilds) {
        const builds = genshinBuilds[characterName];

        // For each build
        for (buildName in builds) {
            const weapons = builds[buildName].weapons;
            let f2pRank = 1;

            // For each weapon
            for (weaponRank in weapons) {
                // If weapon is in build
                if (weapons[weaponRank] === weaponName) {
                    // If f2p only get f2p rank
                    if (f2p) {
                        weaponRank = f2pRank;
                    }

                    // Create entry in object
                    if (typeof weaponUsage[weaponRank] === 'undefined') {
                        weaponUsage[weaponRank] = [];
                    }

                    // Add weapon to usage list
                    weaponUsage[weaponRank].push({
                        characterName: characterName,
                        buildName: buildName,
                    });

                    break;
                }

                // Add +1 if weapon is 4* or below
                if (f2p && Number(genshinWeapons[weapons[weaponRank]].quality) < 5) {
                    f2pRank++;
                }
            }
        }
    }

    // Empty div if there is at least 1 character
    for (weaponRank in weaponUsage) {
        if (Number(weaponRank) >= 4) {
            document.querySelector('#genshinWeaponUsageOther').innerHTML = '';
            break;
        }

        document.querySelector(`#genshinWeaponUsage${weaponRank}`).innerHTML = '';
    }

    // Show each usage
    for (weaponRank in weaponUsage) {
        weaponUsage[weaponRank].forEach((build) => {
            const characterName = build.characterName;
            const characterInfo = genshinCharacters[characterName];
            const template = document.querySelector("#genshinCard");
            const clone = document.importNode(template.content, true);

            // Change background based on quality
            clone.querySelector('.genshinCardIcon').className += qualityClass(characterInfo.quality);
            
            // Set value
            clone.querySelector('.genshinCardContainer').href = `#Character#${characterName}`;
            clone.querySelector('.genshinCardIcon').src = characterInfo.src.character;
            clone.querySelector('.genshinCardName').innerHTML = `${characterName}<br>${build.buildName}`;
            clone.querySelector('.genshinCardWeapon').src = characterInfo.src.weapon;

            // If weapon rank is 4 or more show rank in card
            if (Number(weaponRank) >= 4) {
                clone.querySelector('.genshinCardRank').textContent = weaponRank;
            } else {
                clone.querySelector('.genshinCardRank').remove();
            }

            // Remove element for Traveler and Manekin
            if (!genshinCharactersWithoutElements.includes(characterName)) {
                clone.querySelector('.genshinCardElement').src = characterInfo.src.element;
            } else {
                clone.querySelector('.genshinCardElement').remove();
            }

            document.querySelector(`#genshinWeaponUsage${Number(weaponRank) >= 4 ? 'Other' : weaponRank}`).appendChild(clone);
        });
    }
}

/**
 * Show genshin artifact
 * 
 * @param {string} artifact 
 */
function GenshinArtifact(artifact) {
    // Show default content
    genshinPage();
    document.querySelector('#genshinArtifact').hidden = false;
    document.querySelector('#genshinArtifactBiSOnly').checked = true;

    // Empty page
    document.querySelector('#genshinArtifactInfo').innerHTML = '';

    // Decode artifact name
    artifact = decodeURI(artifact);

    // Get artifact info
    const artifactInfo = genshinArtifacts[artifact];
    const artifactMaxQuality = artifactInfo['quality'][artifactInfo['quality'].length - 1];

    const template = document.querySelector("#genshinHeaderInfo");
    const clone = document.importNode(template.content, true);

    // Set artifact info
    clone.querySelector('.genshinIcon').src = artifactInfo.pieces[0].src.artifact;
    clone.querySelector('.genshinIcon').className += qualityClass(artifactMaxQuality);
    clone.querySelector('.genshinName').textContent = artifact;
    clone.querySelector('.genshinName').href = artifactInfo.link;
    clone.querySelector('.genshinQuality').src = `Genshin/Ressources/Quality/${artifactMaxQuality}.png`;
    clone.querySelector('.genshinWeaponType').parentElement.remove();
    clone.querySelector('.genshinElement').parentElement.remove();

    // Add artifact info to page
    document.querySelector('#genshinArtifactInfo').append(clone);

    // Remove bonus if not necessary
    if (artifactInfo.bonuses === "") {
        document.querySelector('#genshinArtifactBonuses').hidden = true;
    } else {
        document.querySelector('#genshinArtifactBonuses').hidden = false;

        // Test if 1 bonus or 2 bonus
        if (artifactInfo.bonuses[1]) {
            document.querySelector('#genshinArtifactAbilityNumber2').textContent = 1;
            document.querySelector('#genshinArtifactAbilityDescription2').textContent = artifactInfo.bonuses[1];
            document.querySelector('#genshinArtifactAbility4').hidden = true;
        } else {
            document.querySelector('#genshinArtifactAbilityNumber2').textContent = 2;
            document.querySelector('#genshinArtifactAbilityDescription2').textContent = artifactInfo.bonuses[2];
            document.querySelector('#genshinArtifactAbilityDescription4').textContent = artifactInfo.bonuses[4];
            document.querySelector('#genshinArtifactAbility4').hidden = false;
        }
    }
    
    // Set checkbox dataset
    document.querySelector('#genshinArtifactBiSOnly').dataset.artifactName = artifact;

    genshinArtifactUsage(artifact, true);
}

/**
 * Show artifact usage by build
 * 
 * @param {string} artifactName 
 * @param {Boolean} bis 
 */
function genshinArtifactUsage(artifactName, bis = false) {
    // Empty page    
    document.querySelector('#genshinArtifactMainStatSands .genshinArtifactMainStats').innerHTML = '';
    document.querySelector('#genshinArtifactMainStatGoblet .genshinArtifactMainStats').innerHTML = '';
    document.querySelector('#genshinArtifactMainStatCirclet .genshinArtifactMainStats').innerHTML = '';
    document.querySelector('#genshinArtifactSubStats').innerHTML = '';

    // Empty usage
    document.querySelector('#genshinArtifactUsage1').innerHTML = '<span class="font-bold">Nobody</span>';
    document.querySelector('#genshinArtifactUsageOther').innerHTML = '<span class="font-bold">Nobody</span>';

    document.querySelector('#genshinArtifactUsageOtherContainer').hidden = bis;

    let artifactUsage = {};
    let mainStatSandsUsage = [];
    let mainStatGobletUsage = [];
    let mainStatCircletUsage = [];
    let subStatsUsage = [];

    // For each character
    for (characterName in genshinBuilds) {
        const builds = genshinBuilds[characterName];

        // For each build
        for (buildName in builds) {
            const build = builds[buildName];
            const artifacts = build.artifacts;

            // Use a function to break both 'for' with return;
            (function() {
                // For each artifact
                for (artifactRank in artifacts) {
                    const buildArtifacts = artifacts[artifactRank];
    
                    for (let i = 0; i < buildArtifacts.length; i++) {
                        if (buildArtifacts[i] === artifactName) {
                            // Create entry in object
                            if (typeof artifactUsage[artifactRank] === 'undefined') {
                                artifactUsage[artifactRank] = [];
                            }
        
                            // Add artifact to usage list
                            artifactUsage[artifactRank].push({
                                characterName: characterName,
                                buildName: buildName,
                            });

                            mainStatSandsUsage.push(...build.main_stats.Sands);
                            mainStatGobletUsage.push(...build.main_stats.Goblet);
                            mainStatCircletUsage.push(...build.main_stats.Circlet);
                            subStatsUsage.push(...Object.values(build.sub_stats));

                            return;
                        }
                    }

                    // If BiS get only first artifact
                    if (bis) {
                        return;
                    }
                }
            })();
        }
    }

    mainStatSandsUsage = mainStatSandsUsage.filter((value, index, array) => array.indexOf(value) === index);
    mainStatGobletUsage = mainStatGobletUsage.filter((value, index, array) => array.indexOf(value) === index);
    mainStatCircletUsage = mainStatCircletUsage.filter((value, index, array) => array.indexOf(value) === index);
    subStatsUsage = subStatsUsage.filter((value, index, array) => array.indexOf(value) === index);

    // Set sands main stats
    for (mainStatSandsIndex in mainStatSandsUsage) {
        const mainStatSands = mainStatSandsUsage[mainStatSandsIndex];

        // Create main stat
        const template = document.querySelector("#genshinCharacterBuildStat");
        const clone = document.importNode(template.content, true);
        clone.querySelector('img').src = `Genshin/Ressources/Stats/${mainStatSands.replace('%', '')}.png`;
        clone.querySelector('span').innerHTML = mainStatSands;
        // If there is another main stat, separate them with a |
        if (typeof mainStatSandsUsage[Number(mainStatSandsIndex) + 1] !== 'undefined') {
            clone.querySelector('span').innerHTML += '&nbsp;|';
        }
        document.querySelector('#genshinArtifactMainStatSands .genshinArtifactMainStats').appendChild(clone);
    }

    // Set goblet main stats
    for (mainStatGobletIndex in mainStatGobletUsage) {
        const mainStatGoblet = mainStatGobletUsage[mainStatGobletIndex];

        // Create main stat
        const template = document.querySelector("#genshinCharacterBuildStat");
        const clone = document.importNode(template.content, true);
        clone.querySelector('img').src = `Genshin/Ressources/Stats/${mainStatGoblet.replace('%', '')}.png`;
        clone.querySelector('span').innerHTML = mainStatGoblet;
        // If there is another main stat, separate them with a |
        if (typeof mainStatGobletUsage[Number(mainStatGobletIndex) + 1] !== 'undefined') {
            clone.querySelector('span').innerHTML += '&nbsp;|';
        }
        document.querySelector('#genshinArtifactMainStatGoblet .genshinArtifactMainStats').appendChild(clone);
    }

    // Set circlet main stats
    for (mainStatCircletIndex in mainStatCircletUsage) {
        const mainStatCirclet = mainStatCircletUsage[mainStatCircletIndex];

        // Create main stat
        const template = document.querySelector("#genshinCharacterBuildStat");
        const clone = document.importNode(template.content, true);
        clone.querySelector('img').src = `Genshin/Ressources/Stats/${mainStatCirclet.replace('%', '')}.png`;
        clone.querySelector('span').innerHTML = mainStatCirclet;
        // If there is another main stat, separate them with a |
        if (typeof mainStatCircletUsage[Number(mainStatCircletIndex) + 1] !== 'undefined') {
            clone.querySelector('span').innerHTML += '&nbsp;|';
        }
        document.querySelector('#genshinArtifactMainStatCirclet .genshinArtifactMainStats').appendChild(clone);
    }

    // Fill sub stats
    for (subStatIndex in subStatsUsage) {
        const subStat = subStatsUsage[subStatIndex];

        // Create sub stat
        const template = document.querySelector("#genshinCharacterBuildStat");
        const clone = document.importNode(template.content, true);
        clone.querySelector('img').src = `Genshin/Ressources/Stats/${subStat.replace('%', '')}.png`;
        clone.querySelector('span').innerHTML = subStat;
        // If there is another sub stat, separate them with a |
        if (typeof subStatsUsage[Number(subStatIndex) + 1] !== 'undefined') {
            clone.querySelector('span').innerHTML += '&nbsp;|';
        }
        document.querySelector('#genshinArtifactSubStats').appendChild(clone);
    }

    // Empty div if there is at least 1 character
    for (artifactRank in artifactUsage) {
        if (Number(artifactRank) >= 2) {
            document.querySelector('#genshinArtifactUsageOther').innerHTML = '';
            break;
        }

        document.querySelector(`#genshinArtifactUsage${artifactRank}`).innerHTML = '';
    }

    // Show each usage
    for (artifactRank in artifactUsage) {
        artifactUsage[artifactRank].forEach((build) => {
            const characterName = build.characterName;
            const characterInfo = genshinCharacters[characterName];
            const template = document.querySelector("#genshinCard");
            const clone = document.importNode(template.content, true);

            // Change background based on quality
            clone.querySelector('.genshinCardIcon').className += qualityClass(characterInfo.quality);
            
            // Set value
            clone.querySelector('.genshinCardContainer').href = `#Character#${characterName}`;
            clone.querySelector('.genshinCardIcon').src = characterInfo.src.character;
            clone.querySelector('.genshinCardName').innerHTML = `${characterName}<br>${build.buildName}`;
            clone.querySelector('.genshinCardWeapon').src = characterInfo.src.weapon;

            // If artifact rank is 2 or more show rank in card
            if (Number(artifactRank) >= 2) {
                clone.querySelector('.genshinCardRank').textContent = artifactRank;
            } else {
                clone.querySelector('.genshinCardRank').remove();
            }

            // Remove element for Traveler and Manekin
            if (!genshinCharactersWithoutElements.includes(characterName)) {
                clone.querySelector('.genshinCardElement').src = characterInfo.src.element;
            } else {
                clone.querySelector('.genshinCardElement').remove();
            }

            document.querySelector(`#genshinArtifactUsage${Number(artifactRank) >= 2 ? 'Other' : artifactRank}`).appendChild(clone);
        });
    }
}

//#endregion Genshin