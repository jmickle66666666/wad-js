function makeUL(array) {
	// Create the list element:
	var list = document.createElement('ol');
	list.id = "lumpUL";

	for(var i = 0; i < array.length; i++) {
		// Create the list item:
		var item = document.createElement('li');

		// Set its contents:
		var span = document.createElement('span');
		span.innerHTML += getIcon(array[i][0]);
		var name = document.createTextNode(' '+array[i][1]);
		span.appendChild(name);
		item.appendChild(span);

		item.id='item';

		// Add it to the list:
		list.appendChild(item);
	}

	// Finally, return the constructed list:
	return list;
}

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

function createImagePreview(data) {
	var blob = new Blob([data]);
	imageEl = new Image();
	imageEl.src = URL.createObjectURL(blob);
	$('#preview').append(imageEl);
}

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
