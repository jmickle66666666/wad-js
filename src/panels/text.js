// Data: Raw data to create preview from
// return: HTML element containing preview

function createTextPreview(text) {
    // Create parent element
    var element = document.createElement('div');

    // Create text preview element
    var textEl = document.createElement('div');
    textEl.style = "overflow: auto;";
    var height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    textEl.style.height = height * 0.9;
    textnode = document.createTextNode(text);
    textEl.appendChild(textnode);

    // Add elements to preview
    element.append(textEl);

    return element;
}
