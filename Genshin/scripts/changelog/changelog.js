const menu = document.querySelectorAll('.switcherItem, .switcherItemActive');
const wait = 5000;
let text = '';
let timeout = 0;
menu.forEach(lien => {
    const name = lien.textContent.trim();
    if (name === 'Changelogs') {
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
    element.setAttribute('download', 'changelog.html');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}, timeout);