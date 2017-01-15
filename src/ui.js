var self = this;
var lumpnames = ["a","b","c"];
var fileInput = document.getElementById('fileInput');
var fileDisplayArea = document.getElementById('test');
var lumpList = null;
var loadingInterval;
var errors = document.getElementById('errors');

$('#preview').hide();
$('#lumpTable').hide();
$('#loading').hide();

var progress = 0;

var wad = Object.create(Wad);

function initWad() {
	self.errormsg = null;
	$(errors).html("");
	$('#preview').hide();
	$('#lumpTable').hide();
	$('#loading').show();
	progress = 0;

	if (self.lumpList) self.lumpList.destructor();
	self.lumpnames = [];

	wad = Object.create(Wad);
	wad.onProgress = updateLoading;

	wad.onLoad = wadOnLoad;
}

function loadURL() {
	initWad();
	wad.loadURL(document.getElementById('urlInput').value);
}

fileInput.addEventListener('change', function(e) {
	initWad();
	var file = fileInput.files[0];
	console.log(file);
	wad.load(file);
});

var updateLoading = function(e) {
	progress += 8;
	var bar = (35 * progress) / (wad.numlumps);
	var loadingbar = '[';
	for (var i = 0; i < bar; i++) loadingbar += '.';
	for (i = bar; i < 35; i++) loadingbar += '&nbsp;';
	document.getElementById('loading').innerHTML = loadingbar + ']';
};

function getIcon(lumpType) {
	if (lumpType == MAP) return '<img src="icons/map.png">';
	if (lumpType == MAPDATA) return '<img src="icons/mapdata.png">';
	if (lumpType == TEXT) return '<img src="icons/text.png">';
	if (lumpType == PLAYPAL) return '<img src="icons/playpal.png">';
	if (lumpType == ENDOOM) return '<img src="icons/endoom.png">';
	if (lumpType == COLORMAP) return '<img src="icons/colormap.png">';
	if (lumpType == MUSIC) return '<img src="icons/music.png">';
	if (lumpType == MIDI) return '<img src="icons/midi.png">';
	if (lumpType == MP3) return '<img src="icons/mp3.png">';
	if (lumpType == GRAPHIC) return '<img src="icons/graphic.png">';
	if (lumpType == FLAT) return '<img src="icons/flat.png">';
	if (lumpType == PNG) return '<img src="icons/png.png">';
	if (lumpType == MUS) return '<img src="icons/mus.png">';
	if (lumpType == MARKER) return '<img src="icons/marker.png">';
	if (lumpType == PNAMES) return '<img src="icons/pnames.png">';
	if (TEXTUREx.indexOf(lumpType) >= 0) return '<img src="icons/texturex.png">';
	else return '<img src="icons/unknown.png">';
}

function wadOnLoad(e) {

	$('#loading').hide();

	if (self.errormsg != null) {
		$(errors).html(self.errormsg);
	} else {

		for (var i = 0; i < wad.lumps.length; i++) {
			self.lumpnames.push([wad.detectLumpType(i),wad.lumps[i].name]);
		}

		$('#lumpTable').show();
		$('#lumpList').html(makeUL(self.lumpnames));

		$('#lumpUL li.item').on('click', function (e) {
			$('#preview').html('');
			$('#preview').show();

			var li = $(this);
			var i = li.attr("class").split(' ')[2];

			lumptype = li.attr("class").split(' ')[1];

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
}
