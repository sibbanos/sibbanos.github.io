window.addEventListener("hashchange", () => {
    init();
});

init();

function init() {
    const url = window.location.hash;
    const currentLocation = url.split('#');

    if (currentLocation.length > 1) {
        showGame(currentLocation[1]);
    }
}

function showGame(game) {
    document.querySelector('#landingPage').hidden = true;
    console.log(game)
}
