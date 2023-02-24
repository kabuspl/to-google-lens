document.querySelector(".get-perm").addEventListener("click",()=>{
    browser.permissions.request({
        origins: ["<all_urls>"]
    }).then(()=>{
        window.close();
    });
})