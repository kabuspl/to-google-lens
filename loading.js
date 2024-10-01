browser.runtime.onMessage.addListener(async (request) => {
    const settings = await browser.storage.sync.get();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = request.url;
    form.enctype = "multipart/form-data";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.name = "encoded_image";

    const file = new File([request.image], "screenshot.webp", { type: request.image.type });

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
