const browser = chrome;

function run() {
    browser.contextMenus.create({
        id: "lens-screenshot",
        type: "normal",
        title: "Google Lens - Screenshot",
        contexts: ["all"]
    });

    browser.contextMenus.create({
        id: "lens-image",
        type: "normal",
        title: "Google Lens - Image",
        contexts: ["image"]
    });

    browser.contextMenus.onClicked.addListener((info, tab) => {
        switch(info.menuItemId) {
            case "lens-screenshot":
                browser.tabs.sendMessage(tab.id, {
                    type: "captureArea"
                });
                break;
            case "lens-image":
                fetch(info.srcUrl).then(data => data.blob()).then(async blob => {
                    let array = new Uint8Array(await blob.arrayBuffer());
                    const base64 = btoa(String.fromCharCode.apply(null, array));

                    browser.tabs.sendMessage(tab.id, {
                        type: "captureImg",
                        image: `data:${blob.type};base64,${base64}`,
                    });
                });
                break;
        }
    });
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch(msg.type) {
        case "capture":
            browser.tabs.captureVisibleTab().then(img => {
                sendResponse({
                    type: "returnImage",
                    image: img,
                    x1: msg.x1,
                    y1: msg.y1,
                    x2: msg.x2,
                    y2: msg.y2
                });
            }, e => {
                console.error(e);
            });
            break;
        case "finalImage":
            search(msg.image, msg.imageType);
            break;
    }
    return true;
});

run();

function decodeHTMLEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}

async function search(image, imageType) {
    const settings = await browser.storage.sync.get();
    browser.tabs.query({active: true}).then(active=>{
        browser.tabs.create({url: "loading.html", index: active[0].index+1, active: !(settings.openInBG || false)}).then(async tab=>{
            browser.tabs.onUpdated.addListener((tabId, changeInfo, tabUpdate) => {
                if (tabUpdate.id == tab.id && changeInfo.status == "complete") {
                    browser.tabs.sendMessage(tab.id, { url: `https://lens.google.com/v3/upload?ep=ccm&s=&st=${Date.now()}`, image, imageType })
                }
            });
        });
    })
}
