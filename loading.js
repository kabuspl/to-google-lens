const browser = chrome;

browser.runtime.onMessage.addListener(async (request) => {
    const settings = await browser.storage.sync.get();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = request.url;
    form.enctype = "multipart/form-data";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.name = "encoded_image";

    let reconstructedArray = new Uint8Array(Object.keys(request.image).length);
    for(let index of Object.keys(request.image)) {
        reconstructedArray[index] = request.image[index];
    }

    const file = new File([new Blob([reconstructedArray], {type: request.imageType})], "screenshot.webp", { type: request.imageType });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    fileInput.files = dataTransfer.files;

    form.append(fileInput);

    document.body.append(form);

    if (settings.doNotLoad || false) {
        document.addEventListener("focus", () => {
            form.submit();
        })
    } else {
        form.submit();
    }
});
