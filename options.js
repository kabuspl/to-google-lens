const bg_checkbox = document.querySelector("#bg_checkbox");
const doNotLoad_checkbox = document.querySelector("#doNotLoad_checkbox");


browser.storage.sync.get().then(
    item => {
        console.log(item);
        bg_checkbox.checked = item.openInBG || false;
        doNotLoad_checkbox.checked = item.doNotLoad || false;
        if(!bg_checkbox.checked) {
            doNotLoad_checkbox.disabled = true;
        }
    },
    error => {
        console.error(error);
    }
);

bg_checkbox.addEventListener("change", ()=>{
    doNotLoad_checkbox.disabled = !bg_checkbox.checked;
    browser.storage.sync.set({
        openInBG: bg_checkbox.checked,
        doNotLoad: bg_checkbox.checked ? doNotLoad_checkbox.checked : false
    });
});

doNotLoad_checkbox.addEventListener("change", ()=>{
    browser.storage.sync.set({
        doNotLoad: doNotLoad_checkbox.checked
    });
});
