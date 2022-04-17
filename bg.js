let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

function run() {
    let icon = "lightmode.png";
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        icon = "darkmode.png";
    }
    browser.menus.create({
        id: "lens",
        type: "normal",
        title: "Google Lens",
        contexts: ["all"],
        icons: {
            "32": icon
        }
    });

    browser.menus.onClicked.addListener(e => {
        browser.tabs.executeScript({
            file: "/content.js"
        });
    })
}

browser.runtime.onMessage.addListener(msg => {
    browser.tabs.captureVisibleTab().then(img => {
        let imgEl = new Image();
        imgEl.src = img;
        imgEl.onload = () => {
            canvas.width = msg.x2 - msg.x1;
            canvas.height = msg.y2 - msg.y1;
            ctx.drawImage(imgEl, 0 - msg.x1, 0 - msg.y1);
            console.log(canvas.toDataURL());
            canvas.toBlob(blob => {
                search(blob);
            })
        }
    }, e => {
        console.error(e);
    });
});

run();

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