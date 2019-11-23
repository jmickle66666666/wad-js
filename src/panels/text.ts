// Data: Raw data to create preview from
// return: HTML element containing preview

export function createTextPreview(text) {
    var textEl = document.createElement("div");
    textEl.id = "textPreview";
    const textnode = document.createTextNode(text);
    textEl.appendChild(textnode);

    return textEl;
}
