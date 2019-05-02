import {
    MIDI_AUDIO_BUFFER_SIZE,
    MIDI_PATCH_URL,
    MIDI_AUDIO_S16LSB,
    MAX_I16,
    MIDI_ERROR,
    MIDI_LOAD_FILE,
    MIDI_LOAD_PATCH,
    MIDI_PLAY,
    MIDI_PAUSE,
    MIDI_RESUME,
    MIDI_STOP,
    MIDI_END,
} from './constants';

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

export default class MidiPlayer {
    constructor({ eventLogger, logging }) {
        const {
            platform,
            majorVersion,
            browserName,
        } = browserVersion();

        this.logging = logging;
        this.eventLogger = eventLogger;

        try {
            // iPhones not compatible with AudioContext?
            if ((
                platform === 'iPhone'
                || platform === 'iPod'
                || platform === 'iPad'
            ) && majorVersion <= 6) {
                this.audioMethod = 'none';
            } else {
                // vendor prefix
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.context = new AudioContext();
                this.audioMethod = 'WebAudioAPI';
            }
        } catch (e) {
            if (browserName === 'Microsoft Internet Explorer') {
                this.audioMethod = 'bgsound';
                // Android not compatible with AudioContext?
            } else if (browserName === 'Android') {
                this.audioMethod = 'none';
            } else {
                this.audioMethod = 'object';
            }
        }

        if (this.audioMethod === 'WebAudioAPI') {
            if (typeof Module === 'undefined') {
                this.emitUndefinedModuleError();
                this.play = () => this.emitUndefinedModuleError();
                this.pause = () => this.emitUndefinedModuleError();
                this.resume = () => this.emitUndefinedModuleError();
                this.stop = () => this.emitUndefinedModuleError();
                return;
            }

            this.play = this.playWebAudioAPI;
            this.pause = this.pauseWebAudioAPI;
            this.resume = this.resumeWebAudioAPI;
            this.stop = this.stopWebAudioAPI;
            this.audioStatus = `audioMethod: WebAudioAPI, sampleRate (Hz): ${this.context.sampleRate}, audioBufferSize (Byte): ${MIDI_AUDIO_BUFFER_SIZE}`;
        } else if (this.audioMethod === 'bgsound') {
            this.play = this.playBGSound;
            this.stop = this.stopBGSound;
            this.pause = () => { };
            this.resume = () => { };
            this.audioStatus = 'audioMethod: &lt;bgsound&gt;';
        } else if (this.audioMethod === 'object') {
            this.play = this.playObject;
            this.stop = this.stopObject;
            this.pause = () => { };
            this.resume = () => { };
            this.audioStatus = 'audioMethod: &lt;object&gt;';
        } else {
            this.emitAudioMethodNotFound();
            this.play = () => this.emitAudioMethodNotFound();
            this.pause = () => this.emitAudioMethodNotFound();
            this.resume = () => this.emitAudioMethodNotFound();
            this.stop = () => this.emitAudioMethodNotFound();
            this.audioStatus = 'audioMethod: No method found';
        }
    }

    emitAudioMethodNotFound() {
        this.emitEvent({
            event: MIDI_ERROR,
            message: 'No compatible audio method was found. MIDI playback does not work on this device.',
        });
    }

    emitUndefinedModuleError() {
        this.emitEvent({
            event: MIDI_ERROR,
            message: 'The \'Module\' object from the libTimidity.js library could not be found in the global scope.',
        });
    }

    emitEvent = (payload) => {
        if (this.eventLogger) {
            this.eventLogger(payload);
        } else if (this.logging) {
            console.log(payload);
        }
    }

    getNextWave(event) {
        const ev = event;
        const time = this.context.currentTime - this.startTime;

        this.emitEvent({
            event: MIDI_PLAY,
            time,
        });

        // collect new wave data from libtimidity into waveBuffer
        const readWaveBytes = Module.ccall(
            'mid_song_read_wave',
            'number',
            ['number', 'number', 'number', 'number'],
            [this.song, this.waveBuffer, MIDI_AUDIO_BUFFER_SIZE * 2, false],
        );
        if (readWaveBytes === 0) {
            this.stop();
            this.emitEvent({
                event: MIDI_END,
                time,
            });
            return;
        }

        for (let i = 0; i < MIDI_AUDIO_BUFFER_SIZE; i++) {
            if (i < readWaveBytes) {
                // convert PCM data from C sint16 to JavaScript number (range -1.0 .. +1.0)
                ev.outputBuffer.getChannelData(0)[i] = Module.getValue(this.waveBuffer + 2 * i, 'i16') / MAX_I16;
            } else {
                // fill end of buffer with zeroes, may happen at the end of a piece
                ev.outputBuffer.getChannelData(0)[i] = 0;
            }
        }
    }

    initWebAudioPlayback = () => {
        this.context = new AudioContext();
        // create script Processor with auto buffer size and a single output channel
        this.source = this.context.createScriptProcessor(MIDI_AUDIO_BUFFER_SIZE, 0, 1);
        this.waveBuffer = Module._malloc(MIDI_AUDIO_BUFFER_SIZE * 2);
        this.source.onaudioprocess = event => this.getNextWave(event); // add eventhandler for next buffer full of audio data
        this.source.connect(this.context.destination); // connect the source to the context's destination (the speakers)
        this.startTime = this.context.currentTime;

        this.emitEvent({ event: MIDI_PLAY, time: 0 });
    }

    loadMissingPatch(path, filename) {
        const request = new XMLHttpRequest();
        request.open('GET', `${path}${filename}`, true);
        request.responseType = 'arraybuffer';

        request.onerror = () => this.emitEvent({
            event: MIDI_ERROR,
            message: `Cannot retrieve MIDI patch '${filename}'.`,
        });

        request.onload = () => {
            if (request.status !== 200) {
                this.emitEvent({
                    event: MIDI_ERROR,
                    message: `Cannot retrieve MIDI patch '${filename}' (status code: ${request.status}).`,
                });
                return;
            }

            this.missingPatchCount = this.missingPatchCount - 1;
            FS.createDataFile(
                'pat/',
                filename,
                new Int8Array(request.response),
                true,
                true,
            );

            if (this.missingPatchCount === 0) {
                this.stream = Module.ccall(
                    'mid_istream_open_mem',
                    'number',
                    ['number', 'number', 'number'],
                    [this.midiFileBuffer, this.midiFileArray.length, false],
                );

                const options = Module.ccall(
                    'mid_create_options',
                    'number',
                    ['number', 'number', 'number', 'number'],
                    [this.context.sampleRate, MIDI_AUDIO_S16LSB, 1, MIDI_AUDIO_BUFFER_SIZE * 2],
                );

                this.song = Module.ccall(
                    'mid_song_load',
                    'number',
                    ['number', 'number'],
                    [this.stream, options],
                );

                Module.ccall(
                    'mid_istream_close',
                    'number',
                    ['number'],
                    [this.stream],
                );

                Module.ccall(
                    'mid_song_start',
                    'void',
                    ['number'],
                    [this.song],
                );

                this.initWebAudioPlayback();
            }
        };
        request.send();
    }

    loadSong = (arrayBuffer) => {
        this.midiFileArray = new Int8Array(arrayBuffer);
        this.midiFileBuffer = Module._malloc(this.midiFileArray.length);
        Module.writeArrayToMemory(this.midiFileArray, this.midiFileBuffer);

        Module.ccall(
            'mid_init',
            'number',
            [],
            [],
        );

        this.stream = Module.ccall(
            'mid_istream_open_mem',
            'number',
            ['number', 'number', 'number'],
            [this.midiFileBuffer, this.midiFileArray.length, false],
        );

        const options = Module.ccall(
            'mid_create_options',
            'number',
            ['number', 'number', 'number', 'number'],
            [this.context.sampleRate, MIDI_AUDIO_S16LSB, 1, MIDI_AUDIO_BUFFER_SIZE * 2],
        );

        this.song = Module.ccall(
            'mid_song_load',
            'number',
            ['number', 'number'],
            [this.stream, options],
        );
        Module.ccall(
            'mid_istream_close',
            'number',
            ['number'],
            [this.stream],
        );

        this.missingPatchCount = Module.ccall(
            'mid_song_get_num_missing_instruments',
            'number',
            ['number'],
            [this.song],
        );

        if (this.missingPatchCount > 0) {
            this.emitEvent({
                event: MIDI_LOAD_PATCH,
                message: 'Loading MIDI patches...',
            });

            for (let i = 0; i < this.missingPatchCount; i++) {
                const missingPatch = Module.ccall(
                    'mid_song_get_missing_instrument',
                    'string',
                    ['number', 'number'],
                    [this.song, i],
                );

                this.loadMissingPatch(
                    MIDI_PATCH_URL,
                    missingPatch,
                );
            }
        } else {
            Module.ccall(
                'mid_song_start',
                'void', ['number'],
                [this.song],
            );

            this.initWebAudioPlayback();
        }
    }

    playWebAudioAPIWithScriptLoaded(url, name) {
        this.emitEvent({
            event: MIDI_LOAD_FILE,
            message: `Loading '${name}'...`,
        });

        // Download url from server, url must honor same origin restriction
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onerror = () => this.emitEvent({
            event: MIDI_ERROR,
            message: `Could not retrieve MIDI for '${name}'.`,
        });

        request.onload = () => {
            try {
                if (request.status !== 200) {
                    this.emitEvent({
                        event: MIDI_ERROR,
                        message: `Could not retrieve MIDI for '${name}' (status code: ${request.status}).`,
                    });

                    return;
                }

                this.loadSong(request.response);
            } catch (error) {
                this.emitEvent({
                    event: MIDI_ERROR,
                    message: error,
                });
            }
        };
        request.send();
    }

    playWebAudioAPI({ arrayBuffer, url, name }) {
        this.stop();
        if (navigator.platform === 'iPad' || navigator.platform === 'iPhone' || navigator.platform === 'iPod') {
            // Unmute works only after return of the user generated event. So we let the event return and play with delay
            // from the callback after libtimidity will have been loaded
            // otherwise the first playWebAudioAPI() call after page load would remain silent on iOS devices
            this.unmuteiOSHack();
        }

        if (url) {
            this.playWebAudioAPIWithScriptLoaded(url, name);
        } else if (arrayBuffer) {
            this.emitEvent({
                event: MIDI_LOAD_FILE,
                message: `Loading '${name}'...`,
            });
            this.loadSong(arrayBuffer);
        } else {
            this.emitEvent({
                event: MIDI_ERROR,
                message: 'Unknown source. Must pass either url or arrayBuffer.',
            });
        }

        return true;
    }

    stopWebAudioAPI() {
        if (this.source) {
            // terminate playback
            this.source.disconnect();

            // hack: without this, Firfox 25 keeps firing the onaudioprocess callback
            this.source.onaudioprocess = 0;

            this.source = 0;

            // free libtimitdiy ressources
            Module._free(this.waveBuffer);
            Module._free(this.midiFileBuffer);

            Module.ccall(
                'mid_song_free',
                'void',
                ['number'],
                [this.song],
            );

            Module.ccall(
                'mid_exit',
                'void',
                [],
                [],
            );

            this.song = 0;
        }

        this.emitEvent({
            event: MIDI_STOP,
            time: 0,
        });

        return true;
    }

    pauseWebAudioAPI() {
        this.context.suspend();

        const time = this.context.currentTime - this.startTime;
        this.emitEvent({
            event: MIDI_PAUSE,
            time,
        });
        return true;
    }

    resumeWebAudioAPI() {
        this.context.resume();

        const time = this.context.currentTime - this.startTime;
        this.emitEvent({
            event: MIDI_RESUME,
            time,
        });

        return true;
    }

    unmuteiOSHack() {
        // iOS unmutes web audio when playing a buffer source
        // the buffer may be initialized to all zeroes (=silence)
        const sinusBuffer = this.context.createBuffer(1, 44100, 44100);
        for (let i = 0; i < 48000; i++) {
            sinusBuffer.getChannelData(0)[i] = 0; // Math.sin(i / 48000 * 2 * Math.PI * freq);
        }
        const bufferSource = this.context.createBufferSource(); // creates a sound source
        bufferSource.buffer = sinusBuffer;
        bufferSource.connect(this.context.destination); // connect the source to the context's destination (the speakers)
        bufferSource.start(0); // play the bufferSource now
    }

    playBGSound(url) {
        this.stopBGSound();

        let sounddiv = document.getElementById('midiPlayer');
        if (!sounddiv) {
            sounddiv = document.createElement('div');
            sounddiv.setAttribute('id', 'midiPlayer');

            // hack: without the nbsp or some other character the bgsound will not be inserted
            sounddiv.innerHTML = `&nbsp;<bgsound src="${url}" volume="100"/>`;
            document.body.appendChild(sounddiv);
        } else {
            sounddiv.lastChild.setAttribute('src', url);
        }
        this.source = sounddiv;
        this.message_callback(`Playing ${url} ...`);
        return true;
    }

    stopBGSound() {
        if (this.source) {
            const sounddiv = this.source;
            sounddiv.lastChild.setAttribute('src', 'midi/silence.mid');
            this.source = 0;
        }
        this.message_callback(this.audioStatus);
        return true;
    }

    playObject(url) {
        this.stopObject();

        let sounddiv = document.getElementById('midiPlayer');
        if (!sounddiv) {
            sounddiv = document.createElement('div');
            sounddiv.setAttribute('id', 'midiPlayer');

            sounddiv.innerHTML = `<object data="${url}" autostart="true" volume="100" type="audio/mid"></object>`;
            document.body.appendChild(sounddiv);
        } else {
            sounddiv.lastChild.setAttribute('data', url);
        }
        this.source = sounddiv;
        this.message_callback(`Playing ${url} ...`);
        return true;
    }

    stopObject() {
        if (this.source) {
            const sounddiv = this.source;
            sounddiv.parentNode.removeChild(sounddiv);
            this.source = 0;
        }
        this.message_callback(this.audioStatus);
        return true;
    }
}
