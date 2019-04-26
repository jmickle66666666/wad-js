const DEFAULT_CONFIGURATION = {
    encoding: '8bit',
    channels: 1,
    sampleRate: 11025,
};

const MAX_VALUES = {
    '8bit': 255,
    '16bit': 65535,
    '32bit': 4294967295,
    '32bitFloat': 1,
};

const TYPED_ARRAYS = {
    '8bit': Uint8Array,
    '16bit': Uint16Array,
    '32bit': Uint32Array,
    '32bitFloat': Float32Array,
};

export default class PCMPlayer {
    getMaxValue() {
        return (
            MAX_VALUES[this.encoding]
            || MAX_VALUES[DEFAULT_CONFIGURATION.encoding]
        );
    }

    getTypedArray() {
        return (
            TYPED_ARRAYS[this.encoding]
            || TYPED_ARRAYS[DEFAULT_CONFIGURATION.encoding]
        );
    }

    createAudioContext() {
        this.audioCtx = new AudioContext();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 1;
        this.gainNode.connect(this.audioCtx.destination);
        this.startTime = this.audioCtx.currentTime;
    }

    constructor(initConfiguration) {
        const configuration = {
            ...DEFAULT_CONFIGURATION,
            ...initConfiguration,
        };

        const {
            encoding,
            channels,
            sampleRate,
        } = configuration;

        this.encoding = encoding;
        this.channels = channels;
        this.sampleRate = sampleRate;

        this.samples = new Float32Array();

        this.maxValue = this.getMaxValue();
        this.typedArray = this.getTypedArray();
        this.createAudioContext();
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

    getFormatedValue(data) {
        const float32 = new Float32Array(data.length);

        for (let i = 0; i < data.length; i++) {
            float32[i] = data[i] / this.maxValue;
        }

        console.log({ float32 });

        return float32;
    }

    play(input) {
        if (!this.isTypedArray(input)) {
            return;
        }

        this.samples = new Float32Array();

        const { typedArray } = this;
        const data = new typedArray(input.buffer, input.byteOffset, input.byteLength);

        const normalizedData = this.getFormatedValue(data);

        this.samples = normalizedData;

        const bufferSource = this.audioCtx.createBufferSource();
        const length = this.samples.length / this.channels;

        const audioBuffer = this.audioCtx.createBuffer(
            this.channels,
            length,
            this.sampleRate,
        );

        let audioData;
        let offset;
        // let decrement;

        for (let channel = 0; channel < this.channels; channel++) {
            audioData = audioBuffer.getChannelData(channel);
            offset = channel;
            // decrement = 25;
            for (let i = 0; i < length; i++) {
                audioData[i] = this.samples[offset];
                /* fadein */
                if (i < 25) {
                    // audioData[i] = (audioData[i] * i) / 25;
                }
                /* fadeout */
                if (i >= (length - 26)) {
                    // audioData[i] = (audioData[i] * decrement--) / 25;
                }
                offset += this.channels;
            }
        }

        if (this.startTime < this.audioCtx.currentTime) {
            this.startTime = this.audioCtx.currentTime;
        }

        console.log(`currentTime: ${this.audioCtx.currentTime}; duration: ${audioBuffer.duration}`);

        bufferSource.buffer = audioBuffer;
        bufferSource.connect(this.gainNode);
        bufferSource.start(this.startTime);
        this.startTime += audioBuffer.duration;
    }

    volume(volume) {
        this.gainNode.gain.value = volume;
    }

    destroy() {
        this.samples = null;
        this.audioCtx.close();
        this.audioCtx = null;
    }
}
