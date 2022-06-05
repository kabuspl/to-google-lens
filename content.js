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

cont.addEventListener("mousedown", e => {
    down = true;
    selector.style.left = e.clientX + "px";
    selector.style.top = e.clientY + "px";
    startX = e.clientX;
    startY = e.clientY;
});

cont.addEventListener("mousemove", e => {
    if (down) {
        if (e.clientX - startX < 0) {
            selector.style.left = e.clientX + "px";
            selector.style.width = (startX - e.clientX) + "px";
        } else {
            selector.style.width = (e.clientX - startX) + "px";
        }
        if (e.clientY - startY < 0) {
            selector.style.top = e.clientY + "px";
            selector.style.height = (startY - e.clientY) + "px";
        } else {
            selector.style.height = (e.clientY - startY) + "px";
        }
    }
})

cont.addEventListener("mouseup", e => {
    down = false;
    let x1, y1, x2, y2;
    if (e.clientX - startX < 0) {
        x1 = e.clientX;
        x2 = startX;
    } else {
        x1 = startX;
        x2 = e.clientX;
    }
    if (e.clientY - startY < 0) {
        y1 = e.clientY;
        y2 = startY;
    } else {
        y1 = startY;
        y2 = e.clientY;
    }
    browser.runtime.sendMessage({ x1: x1, y1: y1, x2: x2, y2: y2 });
    selector.remove();
    cont.remove();
})

document.body.appendChild(cont);

undefined;
