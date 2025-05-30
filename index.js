window.addEventListener('hashchange', () => {
    init();
});

init();

function init() {
    const url = window.location.hash;
    const currentLocation = url.split('#');

    if (currentLocation.length > 1) {
        showGame(currentLocation[1], currentLocation[2]);
    }
}

function showGame(game, tab) {
    document.querySelector('#landingPage').hidden = true;
    window[`${game}${tab}`]();
}

//#region Genshin

document.querySelectorAll('.genshinFilter').forEach((e) => {
    e.addEventListener('click', () => {
        e.ariaSelected = e.ariaSelected === 'false';
        genshinFilterCharacter();
    });
});

document.querySelector('#genshinSearchCharacter').addEventListener('input', genshinFilterCharacter);

function genshinFilterCharacter() {
    document.querySelectorAll('.genshinCharacterCard').forEach((e) => {
        e.hidden = false;
    });

    document.querySelectorAll('.genshinFilter').forEach((e) => {
        if (e.ariaSelected === 'false') {
            document.querySelectorAll(`.genshinCharacterCard[data-${e.dataset.type}="${e.dataset.value}"]`).forEach((f) => {
                f.hidden = true;
            });
        }
    });

    const searchValue = document.querySelector('#genshinSearchCharacter').value;

    if (searchValue) {
        const searchArray = searchValue.split('');
        const searchRegex = new RegExp('.*?'+searchArray.join('.*?')+'.*?', 'i');

        document.querySelectorAll(`.genshinCharacterCard`).forEach((f) => {
            const characterName = f.querySelector('.characterName').textContent;
            if (!searchRegex.test(characterName)) {
                f.hidden = true;
            }
        });
    }
}

function genshinLandingPage(page) {
    // Show home page
    document.querySelector('#genshinLandingPage').hidden = false;

    // Empty container
    document.querySelector('#genshinContainer').innerHTML = '';

    // Hide filter
    document.querySelector('#genshinCharacterFilter').hidden = true;

    // Select tab
    document.querySelectorAll('.genshinNav').forEach((nav) => {
        nav.ariaSelected = false;
    });
    document.querySelector(`#genshinNav${page}`).ariaSelected = true;
}

function GenshinCharacters() {
    genshinLandingPage('Characters');

    // Show filter
    document.querySelector('#genshinCharacterFilter').hidden = false;

    // Sort character by quality
    genshinCharacters = Object.fromEntries(
        Object.entries(genshinCharacters).sort(([, a], [, b]) => b.quality - a.quality)
    );

    // Create parent row
    const row = document.createElement('div');
    row.className = 'flex flex-wrap gap-4 justify-center';

    // Create character card
    for (character in genshinCharacters) {
        const characterInfo = genshinCharacters[character];
        const template = document.querySelector("#characterCard");
        const clone = document.importNode(template.content, true);

        // Change background based on quality
        if (characterInfo.quality == 5) {
            clone.querySelector('.characterContainer').className += ' from-apricot-500';
        } else {
            clone.querySelector('.characterContainer').className += ' from-pastel-violet-500';
        }

        clone.querySelector('.genshinCharacterCard').dataset.element = characterInfo.element;
        clone.querySelector('.genshinCharacterCard').dataset.quality = characterInfo.quality;
        clone.querySelector('.genshinCharacterCard').dataset.weapon = characterInfo.weapon;
        clone.querySelector('.characterIcon').src = characterInfo.src.character;
        clone.querySelector('.characterName').textContent = character;
        clone.querySelector('.characterWeapon').src = characterInfo.src.weapon;

        // Remove element for Traveler
        if (character !== 'Traveler') {
            clone.querySelector('.characterElement').src = characterInfo.src.element;
        } else {
            clone.querySelector('.characterElement').remove()
        }

        row.appendChild(clone);
    }

    document.querySelector('#genshinContainer').appendChild(row);
}

function GenshinWeapons() {
    genshinLandingPage('Weapons');
}

function GenshinArtifacts() {
    genshinLandingPage('Artifacts');
}

function GenshinBuildFinder() {
    genshinLandingPage('BuildFinder');
}

//#endregion Genshin