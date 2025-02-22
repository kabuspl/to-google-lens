const browser = chrome;

let down = false;
let startX = 0;
let startY = 0;
let cont, selector;

function setupSelector() {
    if (cont) cont.remove();
    if (selector) selector.remove();

    cont = document.createElement("div");
    cont.style.zIndex = "1000001";
    cont.style.position = "fixed";
    cont.style.top = "0";
    cont.style.left = "0";
    cont.style.width = "100%";
    cont.style.height = "100%";
    cont.style.setProperty("background", "rgba(0,0,0,.6)", "important");
    cont.style.mixBlendMode = "hard-light";
    cont.style.cursor = "crosshair";

    cont.addEventListener("mousedown", e => {
        startSelection(e.clientX,e.clientY);
    });

    cont.addEventListener("touchstart", e => {
        startSelection(e.touches[0].clientX,e.touches[0].clientY);
    });

    cont.addEventListener("mousemove", e => {
        moveSelection(e.clientX, e.clientY);
    });

    cont.addEventListener("touchmove", e => {
        moveSelection(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
    });

    cont.addEventListener("mouseup", e => {
        stopSelection(e.clientX, e.clientY);
    });

    cont.addEventListener("touchend", e => {
        stopSelection(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        e.preventDefault();
    });

    selector = document.createElement("div");
    selector.style.zIndex = "1000002";
    selector.style.position = "fixed";
    selector.style.top = "0";
    selector.style.left = "0";
    selector.style.width = "0";
    selector.style.height = "0";
    selector.style.setProperty("background", "rgba(255,255,255,.33)", "important");
    selector.style.setProperty("outline", "white 2px solid", "important");
    cont.appendChild(selector);

    (document.fullscreenElement||document.body).appendChild(cont);
}

function startSelection(x,y) {
    down = true;
    selector.style.left = x + "px";
    selector.style.top = y + "px";
    startX = x;
    startY = y;
}

function moveSelection(x,y) {
    if (!down) return;
    if (x - startX < 0) {
        selector.style.left = x + "px";
        selector.style.width = (startX - x) + "px";
    } else {
        selector.style.left = startX + "px";
        selector.style.width = (x - startX) + "px";
    }
    if (y - startY < 0) {
        selector.style.top = y + "px";
        selector.style.height = (startY - y) + "px";
    } else {
        selector.style.top = startY + "px";
        selector.style.height = (y - startY) + "px";
    }
}



function stopSelection(x,y) {
    down = false;
    let x1, y1, x2, y2;
    if (x - startX < 0) {
        x1 = x;
        x2 = startX;
    } else {
        x1 = startX;
        x2 = x;
    }
    if (y - startY < 0) {
        y1 = y;
        y2 = startY;
    } else {
        y1 = startY;
        y2 = y;
    }
    browser.runtime.sendMessage(null, {
        type: "capture",
        x1: x1 * window.devicePixelRatio,
        y1: y1 * window.devicePixelRatio,
        x2: x2 * window.devicePixelRatio,
        y2: y2 * window.devicePixelRatio
    }, msg => {
        if (msg.type != "returnImage") return;

        processImage(msg)
    });
    selector.remove();
    cont.remove();
}

function processImage(msg) {
    let imgEl = new Image();
    let width, height

    let x = 0,
        y = 0;

    imgEl.onload = () => {
        if (msg.type == "returnImage") {
            width = Math.abs(msg.x2 - msg.x1);
            height = Math.abs(msg.y2 - msg.y1);
            x -= msg.x1;
            y -= msg.y1;
        } else {
            width = imgEl.naturalWidth;
            height = imgEl.naturalHeight;
        }

        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        let ctx = canvas.getContext("2d");

        ctx.drawImage(imgEl, x, y);

        canvas.toBlob(async blob => {
            if(blob.size > 20000000) {
                browser.runtime.sendMessage({ type: "finalImage", image: await compress(canvas, ctx, imgEl, x, y), imageType: "image/webp" });
            } else {
                browser.runtime.sendMessage({ type: "finalImage", image: new Uint8Array(await blob.arrayBuffer()), imageType: "image/webp"});
            }

        }, "image/webp");
    }

    imgEl.src = msg.image;
}

async function compress(canvas, ctx, img, x, y) {
    canvas.width=canvas.width/2;
    canvas.height=canvas.height/2;
    ctx.drawImage(img,x,y,canvas.width,canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp"));
    if(blob.size>20000000) {
        return await compress(canvas,ctx,img,x,y);
    }else{
        return new Uint8Array(await blob.arrayBuffer());
    }
}

window.addEventListener ('keyup', e => {
    if (e.code === "Escape") {
        selector.remove();
        cont.remove();
    }
}, false);

browser.runtime.onMessage.addListener(msg => {
    switch(msg.type) {
        case "captureArea":
            setupSelector();
            break;
        case "captureImg":
            processImage(msg);
            break;
    }
})
