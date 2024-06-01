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
            width = Math.abs(msg.x2 - msg.x1);
            height = Math.abs(msg.y2 - msg.y1);
            x -= msg.x1;
            y -= msg.y1;
        } else {
            width = imgEl.naturalWidth;
            height = imgEl.naturalHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(imgEl, x, y);

        canvas.toBlob(async blob => {
            if(blob.size>20000000) {
                search(await compress(canvas,ctx,imgEl,x,y));
            }else{
                search(blob);
            }
        }, "image/webp");
    }

    imgEl.src = img;
}

async function compress(canvas, ctx, img, x, y) {
    canvas.width=canvas.width/2;
    canvas.height=canvas.height/2;
    ctx.drawImage(img,x,y,canvas.width,canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp"));
    console.log(blob);
    if(blob.size>20000000) {
        return await compress(canvas,ctx,img,x,y);
    }else{
        return blob;
    }
}

function decodeHTMLEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}

async function search(image) {
    const settings = await browser.storage.sync.get();
    browser.tabs.query({active: true}).then(active=>{
        browser.tabs.create({url: "loading.html", index: active[0].index+1, active: !settings.openInBG}).then(async tab=>{
            let data = new FormData();
            data.append('encoded_image', image, "screenshot.png");
            let req = await fetch("https://lens.google.com/upload?ep=ccm&s=&st=" + Date.now(), {
                referrer: '',
                mode: 'cors',
                method: 'POST',
                body: data
            })
            .then(res => {
                if (res.status === 200) {
                    return res;
                } else {
                    throw new Error(`${res.status} ${res.statusText}`);
                }
            })
            .then(data => data)
            .catch(e => {
                browser.tabs.sendMessage(tab.id, { type: "google-post-error" });
                throw e;
            });
            
            const url = req.url;
            const t_url = new URL(url, "https://lens.google.com").href
            
            if(settings.doNotLoad) {
                urlsToOpen.push({
                    tab: tab.id,
                    url: t_url
                });
            } else {
                browser.tabs.update(tab.id,{ url: t_url });
            }
            
        });
    })
}

let urlsToOpen = [];

function loadUrl(activeInfo) {
    const filtered = urlsToOpen.filter((v,i)=> v.tab == activeInfo.tabId);
    if(filtered.length == 1) {
        console.log(filtered[0].tab, filtered[0].url)
        browser.tabs.update(filtered[0].tab,{ url: filtered[0].url });
        urlsToOpen.splice(urlsToOpen.indexOf(filtered[0]), 1);
    }
}

browser.tabs.onActivated.addListener(loadUrl);
