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

function createLumpList(wad) {
	for (var i = 0; i < wad.lumps.length; i++) {
		self.lumpnames.push([wad.detectLumpType(i),wad.lumps[i].name]);
	}

	$('#lumpTable').show();
	$('#lumpList').html(makeUL(self.lumpnames));

	$('#lumpUL').delegate('li', 'click', function (e) {
		$('#preview').html('');
		$('#preview').show();
		while (e.target.id != 'item') e.target=e.target.parentNode;

		var li = e.target,
			i = 0;

		while ( li.previousElementSibling ) {
			li = li.previousElementSibling;
			i += 1;   
		}

		lumptype = wad.detectLumpType(i);

		switch (lumptype) {

			case PNG:
				$('#preview').html("");
				$('#preview').append(createImagePreview(wad.getLump(i)));
				break;
			case MP3:
			case MUSIC:
				$('#preview').html("");
				$('#preview').append(createAudioPreview(wad.getLump(i)));
				break;
			case MUS:
				$('#preview').html("");
				$('#preview').append(createMIDIPreview(mus2midi(wad.getLump(i))));
				break;
			case MIDI:
				$('#preview').html("");
				$('#preview').append(createMIDIPreview(wad.getLump(i)));
				break;
			case TEXT:
				$('#preview').html("");
				$('#preview').append(createTextPreview(wad.getLumpAsText(i)));
				break;
			case PLAYPAL:
				playpal = Object.create(Playpal);
				playpal.load(wad.getLump(i));
				$("#preview").html("");
				document.getElementById("preview").appendChild(playpal.toCanvas());
				break;
			case COLORMAP:
				colormap = Object.create(Colormap);
				colormap.load(wad.getLump(i));
				$("#preview").html("");
				document.getElementById("preview").appendChild(colormap.toCanvas(wad));
				break;
			case FLAT:
				flat = Object.create(Flat);
				flat.load(wad.getLump(i));
				$("#preview").html("");
				document.getElementById("preview").appendChild(flat.toCanvas(wad));
				break;
			case GRAPHIC:
				graphic = Object.create(Graphic);
				graphic.load(wad.getLump(i));
				$("#preview").html("");
				document.getElementById("preview").appendChild(graphic.toCanvas(wad));
				break;
			case ENDOOM:
				endoom = Object.create(Endoom);
				endoom.onLoad = function() {
					$("#preview").html("");
					document.getElementById("preview").appendChild(endoom.toCanvas());
				};
				endoom.load(wad.getLump(i));
				$("#preview").html("");

				break;
			case MAP:
				map = Object.create(MapData);
				map.load(wad,wad.lumps[i].name);
				$("#preview").html("");
				var width = window.innerWidth
					|| document.documentElement.clientWidth
					|| document.body.clientWidth;
				var height = window.innerHeight
					|| document.documentElement.clientHeight
					|| document.body.clientHeight;
				document.getElementById("preview").appendChild(map.toCanvas((width - $('#lumpList').width()) * 0.8,height * 0.8));
				break;
			case MAPDATA:
				mapdata = Object.create(MapData);
				switch (wad.lumps[i].name) {
					case "VERTEXES":
						mapdata.parseVertexes(wad.getLump(i));
						$("#preview").html("Total vertexes: "+mapdata.vertexes.length.toString());
						break;
					case "LINEDEFS":
						mapdata.parseLinedefs(wad.getLump(i));
						$("#preview").html("Total linedefs: "+mapdata.linedefs.length.toString());
						break;
					case "SIDEDEFS":
						mapdata.parseSidedefs(wad.getLump(i));
						$("#preview").html("Total sidedefs: "+mapdata.sidedefs.length.toString());
						break;
					case "SECTORS":
						mapdata.parseSectors(wad.getLump(i));
						$("#preview").html("Total sectors: "+mapdata.sectors.length.toString());
						break;
					case "THINGS":
						mapdata.parseThings(wad.getLump(i));

						var tht = mapdata.getThingTable();
						var tab = "";
						for (var prop in tht) {
							if (tht.hasOwnProperty(prop)) {
								tab += mapdata.getDoomThingName(parseInt(prop));
								tab += "s: "+tht[prop]+"<br>";
							}
						}

						$("#preview").html("Total things: "+mapdata.things.length.toString()+"<p>"+tab);


						break;
					default:
						$("#preview").html("Unable to preview "+wad.lumps[i].name+" lumps");
						break;
				}
				break;
			case "...":
				$('#preview').html("Unable to preview this lump, and can't detect it's type<br>");
				var but = document.createElement('button');
				but.onclick = function viewAsText() {
					$('#preview').html("");
					createTextPreview(self.wad.getLumpAsText(i));
				};
				but.innerHTML="View as text";
				$('#preview').append(but);
				break;
			default:
				$('#preview').html("Unable to preview "+lumptype+" lumps");
				break;

		}
	});
}