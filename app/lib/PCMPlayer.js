const DEFAULTS = {
    encoding: '16bitInt',
    channels: 1,
    sampleRate: 8000,
    flushingTime: 1000,
};

export default class PCMPlayer {
    constructor(options) {
        this.options = { ...DEFAULTS, ...options };
        this.samples = new Float32Array();
        this.flush = this.flush.bind(this);
        this.interval = setInterval(this.flush, this.options.flushingTime);
        this.maxValue = this.getMaxValue();
        this.typedArray = this.getTypedArray();
        this.createContext();
    }

    getMaxValue() {
        const encodings = {
            '8bitInt': 128,
            '16bitInt': 32768,
            '32bitInt': 2147483648,
            '32bitFloat': 1,
        };


        return encodings[this.options.encoding] ? encodings[this.options.encoding] : encodings['16bitInt'];
    }

    getTypedArray() {
        const typedArrays = {
            '8bitInt': Int8Array,
            '16bitInt': Int16Array,
            '32bitInt': Int32Array,
            '32bitFloat': Float32Array,
        };

        return typedArrays[this.options.encoding] ? typedArrays[this.options.encoding] : typedArrays['16bitInt'];
    }

    createContext() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 1;
        this.gainNode.connect(this.audioCtx.destination);
        this.startTime = this.audioCtx.currentTime;
    }

    isTypedArray(data) {
        const isTypedArray = (
            data.byteLength
            && data.buffer
            && data.buffer.constructor === ArrayBuffer
        );

        if (!isTypedArray) {
            console.error('Data is not an array buffer.');
        }

        return isTypedArray;
    }

    feed(input) {
        if (!this.isTypedArray(input)) return;
        const data = this.getFormatedValue(input);
        const tmp = new Float32Array(this.samples.length + data.length);
        tmp.set(this.samples, 0);
        tmp.set(data, this.samples.length);
        this.samples = tmp;
    }

    getFormatedValue(input) {
        const data = new this.typedArray(input.buffer);
        const float32 = new Float32Array(data.length);

        for (let i = 0; i < data.length; i++) {
            float32[i] = data[i] / this.maxValue;
        }
        return float32;
    }

    volume(volume) {
        this.gainNode.gain.value = volume;
    }

    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.samples = null;
        this.audioCtx.close();
        this.audioCtx = null;
    }

    flush() {
        if (!this.samples.length) return;
        const bufferSource = this.audioCtx.createBufferSource();
        const length = this.samples.length / this.options.channels;
        const audioBuffer = this.audioCtx.createBuffer(
            this.options.channels,
            length,
            this.options.sampleRate,
        );
        let audioData;
        let channel;
        let offset;
        let i;
        let decrement;

        for (channel = 0; channel < this.options.channels; channel++) {
            audioData = audioBuffer.getChannelData(channel);
            offset = channel;
            decrement = 50;
            for (i = 0; i < length; i++) {
                audioData[i] = this.samples[offset];
                /* fadein */
                if (i < 50) {
                    audioData[i] = (audioData[i] * i) / 50;
                }
                /* fadeout */
                if (i >= (length - 51)) {
                    audioData[i] = (audioData[i] * decrement--) / 50;
                }
                offset += this.options.channels;
            }
        }

        if (this.startTime < this.audioCtx.currentTime) {
            this.startTime = this.audioCtx.currentTime;
        }
        console.log(`start vs current ${this.startTime} vs ${this.audioCtx.currentTime} duration: ${audioBuffer.duration}`);
        bufferSource.buffer = audioBuffer;
        bufferSource.connect(this.gainNode);
        // bufferSource.start(this.startTime);
        this.startTime += audioBuffer.duration;
        this.samples = new Float32Array();
    }
}
