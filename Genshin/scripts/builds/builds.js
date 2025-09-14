const elements = ['Anemo', 'Cryo', 'Dendro', 'Electro', 'Geo', 'Hydro', 'Pyro'];
const menu = document.querySelectorAll('.switcherItem');
const wait = 2500;
let text = '';
let timeout = 0;
menu.forEach(lien => {
    const element = lien.textContent.trim();
    if (elements.includes(element)) {
        window.setTimeout(() => {
            lien.click();
        }, timeout);
        timeout += wait;
        window.setTimeout(() => {
            text += document.querySelector('iframe').contentWindow.document.body.querySelector('table').outerHTML;
        }, timeout);
        timeout += 100;
    }
});
window.setTimeout(() => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'builds.html');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}, timeout);