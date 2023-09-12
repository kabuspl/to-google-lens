cont = document.createElement("div");
cont.style.zIndex = "1000001";
cont.style.position = "fixed";
cont.style.top = "0";
cont.style.left = "0";
cont.style.width = "100%";
cont.style.height = "100%";
cont.style.setProperty("background", "rgba(0,0,0,.5)", "important");
cont.style.mixBlendMode = "hard-light";
cont.style.cursor = "crosshair";

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

down = false,
    startX = 0,
    startY = 0;

function startSelection(x,y) {
    down = true;
    selector.style.left = x + "px";
    selector.style.top = y + "px";
    startX = x;
    startY = y;
}

cont.addEventListener("mousedown", e => {
    startSelection(e.clientX,e.clientY);
});

cont.addEventListener("touchstart", e => {
    startSelection(e.touches[0].clientX,e.touches[0].clientY);
});

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

cont.addEventListener("mousemove", e => {
    moveSelection(e.clientX, e.clientY);
});

cont.addEventListener("touchmove", e => {
    moveSelection(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
});

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
    browser.runtime.sendMessage({ x1: x1 * window.devicePixelRatio, y1: y1 * window.devicePixelRatio, x2: x2 * window.devicePixelRatio, y2: y2 * window.devicePixelRatio });
    selector.remove();
    cont.remove();
}

cont.addEventListener("mouseup", e => {
    stopSelection(e.clientX, e.clientY);
});

cont.addEventListener("touchend", e => {
    stopSelection(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    e.preventDefault();
});

window.addEventListener ('keyup', e => {
    if (e.code === "Escape") {
        selector.remove();
        cont.remove();
    }
}, false);

(document.fullscreenElement||document.body).appendChild(cont);

undefined;
