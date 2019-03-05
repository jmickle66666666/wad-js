// Data: Raw data to create preview from
// return: HTML element containing preview

function createTextPreview(text) {
    var textEl = document.createElement('div');
    textEl.id = "textPreview";
    textnode = document.createTextNode(text);
    textEl.appendChild(textnode);

    return textEl;
}
