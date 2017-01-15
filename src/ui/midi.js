function createMIDIPreview(data) {
    var midiURL = URL.createObjectURL(new Blob([data]));
    var play = function() { MIDIjs.play(midiURL); }
    var stop = function() { MIDIjs.stop(); }

    var playButton = document.createElement('button');
    playButton.innerHTML='<i class="material-icons">play_arrow</i>';
    playButton.onclick = play;
    $('#preview').append(playButton);

    var stopButton = document.createElement('button');
    stopButton.innerHTML='<i class="material-icons">stop</i>';
    stopButton.onclick = stop;
    $('#preview').append(stopButton);
}
