// Data: Raw data to create preview from
// return: HTML element containing preview
function createAudioPreview(data) {
    // Create parent element
    var element = document.createElement('div');

    // Create information panel
    var textEl = document.createElement('div');
    textnode = document.createTextNode('Artist - Title');
    textEl.appendChild(textnode);

    // Create audio player
    var blob = new Blob([data]);
    audioEl = new Audio(URL.createObjectURL(blob));
    audioEl.controls = true;
    console.log(audioEl);

    // Create loop button
    var loopCheckbox = document.createElement('input');
    loopCheckbox.type = 'checkbox';
    var label = document.createElement('span');
    label.innerHTML = 'loop';
    label.for = loopCheckbox;
    loopCheckbox.onclick = function () { audioEl.loop = loopCheckbox.checked; }

    // Add data to preview
    element.append(textEl);
    element.append(audioEl);
    element.append(document.createElement('br'));
    element.append(loopCheckbox);
    element.append(label);

    return element;
}
