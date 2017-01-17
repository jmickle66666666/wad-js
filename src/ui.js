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
	progress++;
	var bar = (36 * progress) / ((wad.numlumps * 16) / 128);
	var loadingbar = '[';
	for (var i = 0; i < bar; i++) loadingbar += '.';
	for (i = bar; i < 36; i++) loadingbar += '&nbsp;';
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

		createLumpList(wad);
	}
}
