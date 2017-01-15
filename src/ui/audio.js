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

    // Add data to preview
    $('#preview').append(textEl);
    $('#preview').append(audioEl);
}
