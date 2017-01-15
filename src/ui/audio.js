function createAudioPreview(data) {
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
    $('#preview').append(textEl);
    $('#preview').append(audioEl);
}
