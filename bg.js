let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

function run() {
    browser.menus.create({
        id: "lens",
        type: "normal",
        title: "To Google Lens",
        contexts: ["all"],
        onclick: e => {
            browser.tabs.executeScript({
                file: "/content.js"
            });
        }
    });
}

browser.runtime.onMessage.addListener(msg => {
    browser.tabs.captureVisibleTab().then(img => {
        searchBlob (img, msg);
    }, e => {
        console.error(e);
    });
});

run();

function searchBlob (img, msg) {
    let imgEl = new Image();

    imgEl.onload = () => {
        canvas.width = msg.x2 - msg.x1;
        canvas.height = msg.y2 - msg.y1;
        ctx.drawImage(imgEl, 0 - msg.x1, 0 - msg.y1);
        canvas.toBlob(blob => {
            search(blob);
        });
    }

    imgEl.src = img;
}

async function search(image) {
    let data = new FormData();
    data.append('encoded_image', image, "screenshot.png");
    let req = await fetch("https://lens.google.com/upload?ep=ccm&s=&st=" + Date.now(), {
        referrer: '',
        mode: 'cors',
        method: 'POST',
        body: data
    });
    let response = await req.text();
    browser.tabs.create({ url: response.match(/<meta .*URL=(https?:\/\/.*)"/)[1] });
}
