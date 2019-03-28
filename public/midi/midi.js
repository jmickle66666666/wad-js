
// eslint-disable-next-line
(function (globalParam) {
    const global = globalParam;
    let audioMethod;
    let context = 0;
    let source = 0;
    const audioBufferSize = 8192;
    let waveBuffer;
    let midiFileBuffer;
    let readWaveBytes = 0;
    let song = 0;
    const BASE_URL = '/public/midi/';
    let startTime = 0;
    let audioStatus = '';

    function browserVersion() {
        const nAgt = navigator.userAgent;
        let browserName = navigator.appName;
        let fullVersion = `${parseFloat(navigator.appVersion)}`;
        let majorVersion = parseInt(navigator.appVersion, 10);
        let nameOffset;
        let verOffset;
        let ix;

        /* eslint-disable */
        // In Opera, the true version is after "Opera" or after "Version"
        if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
            browserName = 'Opera';
            fullVersion = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                fullVersion = nAgt.substring(verOffset + 8);
            }
        }
        // In MSIE, the true version is after "MSIE" in userAgent
        else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
            browserName = 'Microsoft Internet Explorer';
            fullVersion = nAgt.substring(verOffset + 5);
        }
        // Since IE 11, "MSIE" is not part of the user Agent
        // the true version is after "rv"?
        else if ((verOffset = nAgt.indexOf('Trident')) !== -1) {
            browserName = 'Microsoft Internet Explorer';
            if ((verOffset = nAgt.indexOf('rv:')) !== -1) {
                fullVersion = nAgt.substring(verOffset + 3);
            } else {
                fullVersion = '0.0'; // hm?
            }
        }
        // In Chrome, the true version is after "Chrome"
        else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
            browserName = 'Chrome';
            fullVersion = nAgt.substring(verOffset + 7);
        }
        // The default Andorid Browser does not have "Chrome" in its userAgent
        else if ((verOffset = nAgt.indexOf('Android')) !== -1) {
            browserName = 'Android';
            fullVersion = nAgt.substring(verOffset + 8);
        }
        // In Safari, the true version is after "Safari" or after "Version"
        else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
            browserName = 'Safari';
            fullVersion = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                fullVersion = nAgt.substring(verOffset + 8);
            }
        }
        // In Firefox, the true version is after "Firefox"
        else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
            browserName = 'Firefox';
            fullVersion = nAgt.substring(verOffset + 8);
        }
        // In most other browsers, "name/version" is at the end of userAgent
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1)
            < (verOffset = nAgt.lastIndexOf('/'))) {
            browserName = nAgt.substring(nameOffset, verOffset);
            fullVersion = nAgt.substring(verOffset + 1);
            if (browserName.toLowerCase() === browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }
        // trim the fullVersion string at semicolon/space if present
        if ((ix = fullVersion.indexOf(';')) !== -1) {
            fullVersion = fullVersion.substring(0, ix);
        }
        if ((ix = fullVersion.indexOf(' ')) !== -1) {
            fullVersion = fullVersion.substring(0, ix);
        }
        /* eslint-enable */

        majorVersion = parseInt(`${fullVersion}`, 10);
        if (Number.isNaN(majorVersion)) {
            fullVersion = `${parseFloat(navigator.appVersion)}`;
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        const bv = {
            browserName,
            fullVersion,
            majorVersion,
            appName: navigator.appName,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
        };

        return bv;
    }

    function requireScript(file, callback) {
        const script = document.getElementsByTagName('script')[0];
        const newjs = document.createElement('script');

        // IE
        newjs.onreadystatechange = () => {
            if (newjs.readyState === 'loaded' || newjs.readyState === 'complete') {
                newjs.onreadystatechange = null;
                callback();
            }
        };

        // others
        newjs.onload = () => {
            callback();
        };

        newjs.onerror = () => {
            MIDIjs.message_callback(`Error: Cannot load  JavaScript filet ${file}`);
        };

        newjs.src = file;
        newjs.type = 'text/javascript';
        script.parentNode.insertBefore(newjs, script);
    }

    function getNextWave(event) {
        const ev = event;
        const playerEvent = {};
        playerEvent.time = context.currentTime - startTime;
        MIDIjs.player_callback(playerEvent);
        // collect new wave data from libtimidity into waveBuffer
        readWaveBytes = Module.ccall('mid_song_read_wave', 'number',
            ['number', 'number', 'number', 'number'],
            [song, waveBuffer, audioBufferSize * 2, false]);
        if (readWaveBytes === 0) {
            stopWebAudioAPI();
            return;
        }

        const maxI16 = 2 ** 15;
        for (let i = 0; i < audioBufferSize; i++) {
            if (i < readWaveBytes) {
                // convert PCM data from C sint16 to JavaScript number (range -1.0 .. +1.0)
                ev.outputBuffer.getChannelData(0)[i] = Module.getValue(waveBuffer + 2 * i, 'i16') / maxI16;
            } else {
                MIDIjs.message_callback('Filling 0 at end of buffer');
                ev.outputBuffer.getChannelData(0)[i] = 0; // fill end of buffer with zeroes, may happen at the end of a piece
            }
        }
    }

    function loadMissingPatch(url, path, filename) {
        const request = new XMLHttpRequest();
        request.open('GET', path + filename, true);
        request.responseType = 'arraybuffer';

        request.onerror = () => {
            MIDIjs.message_callback(`Error: Cannot retrieve patch file ${path}${filename}`);
        };

        request.onload = () => {
            if (request.status !== 200) {
                MIDIjs.message_callback(`Error: Cannot retrieve patch filee ${path}${filename} : ${request.status}`);
                return;
            }

            num_missing--;
            FS.createDataFile('pat/', filename, new Int8Array(request.response), true, true);
            MIDIjs.message_callback(`Loading instruments: ${num_missing}`);
            if (num_missing == 0) {
                stream = Module.ccall('mid_istream_open_mem', 'number',
                    ['number', 'number', 'number'],
                    [midiFileBuffer, midiFileArray.length, false]);
                const MID_AUDIO_S16LSB = 0x8010; // signed 16-bit samples
                const options = Module.ccall('mid_create_options', 'number',
                    ['number', 'number', 'number', 'number'],
                    [context.sampleRate, MID_AUDIO_S16LSB, 1, audioBufferSize * 2]);
                song = Module.ccall('mid_song_load', 'number', ['number', 'number'], [stream, options]);
                rval = Module.ccall('mid_istream_close', 'number', ['number'], [stream]);
                Module.ccall('mid_song_start', 'void', ['number'], [song]);

                // create script Processor with buffer of size audioBufferSize and a single output channel
                source = context.createScriptProcessor(audioBufferSize, 0, 1);
                waveBuffer = Module._malloc(audioBufferSize * 2);
                source.onaudioprocess = getNextWave; // add eventhandler for next buffer full of audio data
                source.connect(context.destination); // connect the source to the context's destination (the speakers)
                startTime = context.currentTime;
                MIDIjs.message_callback(`Playing: ${url} ...`);
            }
        };
        request.send();
    }

    function unmuteiOSHack() {
        // iOS unmutes web audio when playing a buffer source
        // the buffer may be initialized to all zeroes (=silence)
        const sinusBuffer = context.createBuffer(1, 44100, 44100);
        freq = 440; // Hz
        for (i = 0; i < 48000; i++) {
            sinusBuffer.getChannelData(0)[i] = 0; // Math.sin(i / 48000 * 2 * Math.PI * freq);
        }
        const bufferSource = context.createBufferSource(); // creates a sound source
        bufferSource.buffer = sinusBuffer;
        bufferSource.connect(context.destination); // connect the source to the context's destination (the speakers)
        bufferSource.start(0); // play the bufferSource now
    }

    function playWebAudioAPI(url) {
        stopWebAudioAPI();

        // get this scripts URL
        let libtimidity_url = '';
        for (let i = 0; i < document.scripts.length; i++) {
            var script_src = document.scripts[i].src;
            const index = script_src.lastIndexOf('midi.js');
            if (index === script_src.length - 7) {
                libtimidity_url = `${BASE_URL}libtimidity.js`;
                break;
            }
        }

        // script already loaded ? Right after page load, this will not be the case
        for (let i = 0; i < document.scripts.length; i++) {
            var script_src = document.scripts[i].src;
            if (libtimidity_url === script_src) {
                playWebAudioAPIWithScriptLoaded(url);
                return;
            }
        }
        MIDIjs.message_callback('Loading libtimidity ... ');
        if (navigator.platform === 'iPad' || navigator.platform === 'iPhone' || navigator.platform === 'iPod') {
            // Unmute works only after return of the user generated event. So we let the event return and play with delay
            // from the callback after libtimidity will have been loaded
            // otherwise the first playWebAudioAPI() call after page load would remain silent on iOS devices
            unmuteiOSHack();
        }
        requireScript(libtimidity_url, () => { playWebAudioAPIWithScriptLoaded(url); });
    }

    function playWebAudioAPIWithScriptLoaded(url) {
        // Download url from server, url must honor same origin restriction
        MIDIjs.message_callback(`Loading MIDI file ${url} ...`);
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onerror = () => {
            MIDIjs.message_callback(`Error: Cannot retrieve MIDI file ${url}`);
        };

        request.onload = () => {
            if (request.status !== 200) {
                MIDIjs.message_callback(`Error: Cannot retrieve MIDI file ${url} : ${request.status}`);
                return;
            }

            MIDIjs.message_callback(`MIDI file loaded: ${url}`);

            midiFileArray = new Int8Array(request.response);
            midiFileBuffer = Module._malloc(midiFileArray.length);
            Module.writeArrayToMemory(midiFileArray, midiFileBuffer);

            rval = Module.ccall('mid_init', 'number', [], []);
            stream = Module.ccall('mid_istream_open_mem', 'number',
                ['number', 'number', 'number'],
                [midiFileBuffer, midiFileArray.length, false]);
            const MID_AUDIO_S16LSB = 0x8010; // signed 16-bit samples
            const options = Module.ccall('mid_create_options', 'number',
                ['number', 'number', 'number', 'number'],
                [context.sampleRate, MID_AUDIO_S16LSB, 1, audioBufferSize * 2]);
            song = Module.ccall('mid_song_load', 'number', ['number', 'number'], [stream, options]);
            rval = Module.ccall('mid_istream_close', 'number', ['number'], [stream]);

            num_missing = Module.ccall('mid_song_get_num_missing_instruments', 'number', ['number'], [song]);
            if (num_missing > 0) {
                for (let i = 0; i < num_missing; i++) {
                    const missingPatch = Module.ccall('mid_song_get_missing_instrument', 'string', ['number', 'number'], [song, i]);
                    loadMissingPatch(url, `${BASE_URL}pat/`, missingPatch);
                }
            } else {
                Module.ccall('mid_song_start', 'void', ['number'], [song]);
                // create script Processor with auto buffer size and a single output channel
                source = context.createScriptProcessor(audioBufferSize, 0, 1);
                waveBuffer = Module._malloc(audioBufferSize * 2);
                source.onaudioprocess = getNextWave; // add eventhandler for next buffer full of audio data
                source.connect(context.destination); // connect the source to the context's destination (the speakers)
                startTime = context.currentTime;
                MIDIjs.message_callback(`Playing: ${url} ...`);
            }
        };
        request.send();
    }

    function stopWebAudioAPI() {
        if (source) {
            // terminate playback
            source.disconnect();

            // hack: without this, Firfox 25 keeps firing the onaudioprocess callback
            source.onaudioprocess = 0;

            source = 0;

            // free libtimitdiy ressources
            Module._free(waveBuffer);
            Module._free(midiFileBuffer);
            Module.ccall('mid_song_free', 'void', ['number'], [song]);
            song = 0;
            Module.ccall('mid_exit', 'void', [], []);
            source = 0;
        }
        MIDIjs.message_callback(audioStatus);
        const playerEvent = {};
        playerEvent.time = 0;
        MIDIjs.player_callback(playerEvent);
    }

    function playBGSound(url) {
        stopBGSound();

        let sounddiv = document.getElementById('scorioMIDI');
        if (!sounddiv) {
            sounddiv = document.createElement('div');
            sounddiv.setAttribute('id', 'scorioMIDI');

            // hack: without the nbsp or some other character the bgsound will not be inserted
            sounddiv.innerHTML = `&nbsp;<bgsound src="${url}" volume="100"/>`;
            document.body.appendChild(sounddiv);
        } else {
            sounddiv.lastChild.setAttribute('src', url);
        }
        source = sounddiv;
        MIDIjs.message_callback(`Playing ${url} ...`);
    }

    function stopBGSound() {
        if (source) {
            const sounddiv = source;
            sounddiv.lastChild.setAttribute('src', 'midi/silence.mid');
            source = 0;
        }
        MIDIjs.message_callback(audioStatus);
    }

    function playObject(url) {
        stopObject();

        let sounddiv = document.getElementById('scorioMIDI');
        if (!sounddiv) {
            sounddiv = document.createElement('div');
            sounddiv.setAttribute('id', 'scorioMIDI');

            sounddiv.innerHTML = `<object data="${url}" autostart="true" volume="100" type="audio/mid"></object>`;
            document.body.appendChild(sounddiv);
        } else {
            sounddiv.lastChild.setAttribute('data', url);
        }
        source = sounddiv;
        MIDIjs.message_callback(`Playing ${url} ...`);
    }

    function stopObject() {
        if (source) {
            const sounddiv = source;

            sounddiv.parentNode.removeChild(sounddiv);
            source = 0;
        }
        MIDIjs.message_callback(audioStatus);
    }

    const bv = browserVersion();
    try {
        if ((bv.platform == 'iPhone' || bv.platform == 'iPod' || bv.platform == 'iPad')
            && bv.majorVersion <= 6) {
            audioMethod = 'none';
        } else {
            // Fix up for prefixing
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();
            audioMethod = 'WebAudioAPI';
        }
    } catch (e) {
        if (bv.browserName == 'Microsoft Internet Explorer') {
            audioMethod = 'bgsound';
        } else if (bv.browserName == 'Android') {
            audioMethod = 'none';
        } else {
            audioMethod = 'object';
        }
    }

    global.MIDIjs = {};

    // default: write messages to browser console
    global.MIDIjs.message_callback = (message) => { console.log(message); };
    global.MIDIjs.player_callback = () => { };
    global.MIDIjs.get_audioStatus = () => audioStatus;

    global.MIDIjs.unmuteiOSHack = unmuteiOSHack;

    if (audioMethod === 'WebAudioAPI') {
        global.MIDIjs.play = playWebAudioAPI;
        global.MIDIjs.stop = stopWebAudioAPI;
        audioStatus = `${'audioMethod: WebAudioAPI'
            + ', sampleRate (Hz): '}${context.sampleRate
        }, audioBufferSize (Byte): ${audioBufferSize}`;
    } else if (audioMethod === 'bgsound') {
        global.MIDIjs.play = playBGSound;
        global.MIDIjs.stop = stopBGSound;
        audioStatus = 'audioMethod: &lt;bgsound&gt;';
    } else if (audioMethod === 'object') {
        global.MIDIjs.play = playObject;
        global.MIDIjs.stop = stopObject;
        audioStatus = 'audioMethod: &lt;object&gt;';
    } else {
        global.MIDIjs.play = () => { };
        global.MIDIjs.stop = () => { };
        audioStatus = 'audioMethod: No method found';
    }
}(this));
