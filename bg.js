let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

function run() {
    browser.menus.create({
        id: "lens-screenshot",
        type: "normal",
        title: "Google Lens - Screenshot",
        contexts: ["audio", "editable", "frame", "link", "page", "password", "selection", "video"],
        onclick: e => {
            browser.tabs.executeScript({
                file: "/content.js"
            });
        }
    });

    browser.menus.create({
        id: "lens-image",
        type: "normal",
        title: "Google Lens - Image",
        contexts: ["image"],
        onclick: e => {
            searchBlob (e.srcUrl);
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
    let width, height

    let x = 0,
        y = 0;

    imgEl.onload = () => {
        if (msg) {
            width = msg.x2 - msg.x1;
            height = msg.y2 - msg.y1;
            x -= msg.x1;
            y -= msg.y1;
        } else {
            width = imgEl.naturalWidth;
            height = imgEl.naturalHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(imgEl, x, y);

        canvas.toBlob(blob => {
            search(blob);
        });
    }

    imgEl.src = img;
}

function search(image) {
    browser.tabs.query({active: true}).then(active=>{
        browser.tabs.create({url: "loading.html", index: active[0].index+1}).then(async tab=>{
            let data = new FormData();
            data.append('encoded_image', image, "screenshot.png");
            let req = await fetch("https://lens.google.com/upload?ep=ccm&s=&st=" + Date.now(), {
                referrer: '',
                mode: 'cors',
                method: 'POST',
                body: data
            });
            let response = await req.text();
            browser.tabs.update(tab.id,{ url: response.match(/<meta .*URL=(https?:\/\/.*)"/)[1] });
        });
    })
}
