// Data: Raw data to create preview from
// return: HTML element containing preview

function createMIDIPreview(data) {
    // Create parent element
    var element = document.createElement('div');

    // MIDI playback functionality
    var midiURL = URL.createObjectURL(new Blob([data]));
    var play = function() { MIDIjs.play(midiURL); }
    var stop = function() { MIDIjs.stop(); }

    // Play button
    var playButton = document.createElement('button');
    playButton.innerHTML='<i class="material-icons">play_arrow</i>';
    playButton.onclick = play;
    
    // Stop button
    var stopButton = document.createElement('button');
    stopButton.innerHTML='<i class="material-icons">stop</i>';
    stopButton.onclick = stop;

    // Add elements to preview
    element.append(playButton);
    element.append(stopButton);

    return element;
}
