const bg_checkbox = document.querySelector("#bg_checkbox");

browser.storage.sync.get().then(
    item => {
        bg_checkbox.checked = item.openInBG
    },
    error => {
        console.error(error);
    }
);

bg_checkbox.addEventListener("change", ()=>{
    browser.storage.sync.set({
        openInBG: bg_checkbox.checked
    });
})
