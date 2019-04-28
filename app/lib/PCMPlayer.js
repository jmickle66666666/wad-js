import {
    PCM_ERROR,
    PCM_PLAY,
    PCM_STOP,
    PCM_END,
    DEFAULT_PCM_SAMPLE_RATE,
    DEFAULT_PCM_CONFIGURATION,
    PCM_MAX_VALUES,
    PCM_TYPED_ARRAYS,
} from './constants';

export default class PCMPlayer {
    constructor(initConfiguration) {
        const configuration = {
            ...DEFAULT_PCM_CONFIGURATION,
            ...initConfiguration,
        };

        const {
            eventLogger,
            logging,
            encoding,
            channels,
            volume,
        } = configuration;

        this.eventLogger = eventLogger;
        this.logging = logging;
        this.encoding = encoding;
        this.channels = channels;

        this.samples = new Float32Array();

        this.maxValue = this.getMaxValue();
        this.typedArray = this.getTypedArray();

        this.volume = volume;
    }

    getMaxValue() {
        return (
            PCM_MAX_VALUES[this.encoding]
            || PCM_MAX_VALUES[DEFAULT_PCM_CONFIGURATION.encoding]
        );
    }

    getTypedArray() {
        return (
            PCM_TYPED_ARRAYS[this.encoding]
            || PCM_TYPED_ARRAYS[DEFAULT_PCM_CONFIGURATION.encoding]
        );
    }

    createAudioContext() {
        this.audioCtx = new AudioContext();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.connect(this.audioCtx.destination);
        this.setVolume();
    }

    emitEvent(payload) {
        if (this.eventLogger) {
            this.eventLogger(payload);
        } else if (this.logging) {
            console.log(payload);
        }
    }

    isTypedArray(data) {
        const isTypedArray = (
            data
            && data.byteLength
            && data.buffer
            && data.buffer.constructor === ArrayBuffer
        );

        return isTypedArray;
    }

    isArrayBuffer(data) {
        const isArrayBuffer = data instanceof ArrayBuffer;
        return isArrayBuffer;
    }

    getFormatedValue(data) {
        const float32 = new Float32Array(data.length);

        for (let i = 0; i < data.length; i++) {
            float32[i] = data[i] / this.maxValue;
        }

        return float32;
    }

    play({ data: input, sampleRate }) {
        this.createAudioContext();

        const isTypedArray = this.isTypedArray(input);
        const isArrayBuffer = this.isArrayBuffer(input);
        if (!isTypedArray && !isArrayBuffer) {
            const message = 'Data is not an array buffer.';
            this.emitEvent({
                event: PCM_ERROR,
                message,
            });

            return;
        }

        const { typedArray } = this;
        const data = isArrayBuffer ? new typedArray(input) : new typedArray(input.buffer, input.byteOffset, input.byteLength);

        const normalizedData = this.getFormatedValue(data);

        this.samples = normalizedData;


        this.bufferSource = this.audioCtx.createBufferSource();
        const length = this.samples.length / this.channels;

        this.audioBuffer = this.audioCtx.createBuffer(
            this.channels,
            length,
            sampleRate || DEFAULT_PCM_SAMPLE_RATE,
        );

        let audioData;
        let offset;

        for (let channel = 0; channel < this.channels; channel++) {
            audioData = this.audioBuffer.getChannelData(channel);
            offset = channel;
            for (let i = 0; i < length; i++) {
                audioData[i] = this.samples[offset];
                offset += this.channels;
            }
        }

        // reduce volume to zero
        this.gainNode.gain.setValueAtTime(0, 0);

        this.bufferSource.buffer = this.audioBuffer;
        this.bufferSource.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);

        // fade in
        this.gainNode.gain.linearRampToValueAtTime(this.volume, 0.030);

        this.bufferSource.start(0);

        this.emitEvent({
            event: PCM_PLAY,
            time: 0,
        });

        this.watchPlayback();
    }

    stop() {
        this.destroyAudioContext();
        this.emitEvent({ event: PCM_STOP });
    }

    watchPlayback() {
        this.playbackWatcher = setInterval(() => {
            if (this.audioCtx) {
                const time = this.audioCtx.currentTime;
                this.emitEvent({
                    event: PCM_PLAY,
                    time,
                });

                if (time + 0.24 >= this.audioBuffer.duration) {
                    // fade out
                    this.gainNode.gain.linearRampToValueAtTime(0, this.audioBuffer.duration);
                }

                if (time >= this.audioBuffer.duration) {
                    this.emitEvent({ event: PCM_END });
                    clearInterval(this.playbackWatcher);
                }
            }
        }, 10);
    }

    setVolume() {
        this.gainNode.gain.value = this.volume;
    }

    destroyAudioContext() {
        this.samples = new Float32Array();
        this.audioCtx.close();
        this.audioCtx = null;
        clearInterval(this.playbackWatcher);
    }
}
