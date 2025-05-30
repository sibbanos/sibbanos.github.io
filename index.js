window.addEventListener("hashchange", () => {
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

function genshinLandingPage(page) {
    // Show home page
    document.querySelector('#genshinLandingPage').hidden = false;

    // Empty card
    document.querySelector('#genshinContainer').innerHTML = '';

    // Select tab
    document.querySelectorAll('.genshinNav').forEach((nav) => {
        nav.ariaSelected = false;
    });
    document.querySelector(`#genshinNav${page}`).ariaSelected = true;
}

function GenshinCharacters() {
    genshinLandingPage('Characters');

    genshinCharacters = Object.fromEntries(
        Object.entries(genshinCharacters).sort(([, a], [, b]) => b.quality - a.quality)
    );

    const row = document.createElement('div');
    row.className = 'flex flex-wrap gap-4 justify-center';

    for (character in genshinCharacters) {
        const characterInfo = genshinCharacters[character];
        const template = document.querySelector("#characterCard");
        const clone = document.importNode(template.content, true);

        if (characterInfo.quality == 5) {
            clone.querySelector('.characterContainer').className += ' from-apricot-500';
        } else {
            clone.querySelector('.characterContainer').className += ' from-pastel-violet-500';
        }

        clone.querySelector('.characterIcon').src = characterInfo.src.character;
        clone.querySelector('.characterName').textContent = character;
        clone.querySelector('.characterWeapon').src = characterInfo.src.weapon;

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