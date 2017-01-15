function createTextPreview(text) {
    var textEl = document.createElement('div');
    textEl.style = "overflow: auto;";
    var height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    textEl.style.height = height * 0.9;
    textnode = document.createTextNode(text);
    textEl.appendChild(textnode);
    $('#preview').append(textEl);
}
