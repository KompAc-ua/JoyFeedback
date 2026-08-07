class Microphone {
    constructor(fftSize = 2048) {
        this.initialized = false;
        this.fftSize = fftSize;

        // Отключаем встроенную обработку WebRTC на уровне захвата
        const constraints = {
            audio: {
                echoCancellation: false,    // Отключает эхоподавление
                noiseSuppression: false,    // Отключает шумоподавление (иначе срезает частоты)
                autoGainControl: true,     // Отключает авторегулировку уровня
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                this.audioContext = new AudioContext();
                this.microphone = this.audioContext.createMediaStreamSource(stream);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = this.fftSize;
                this.analyser.smoothingTimeConstant = 0.82; // чуть мягче

                this.bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(this.bufferLength); // ← для frequency data
                
                this.microphone.connect(this.analyser);
                this.initialized = true;
            })
            .catch(err => {
                console.error("Микрофон не доступен:", err);
                alert("Не удалось получить доступ к микрофону: " + err.message);
            });
    }

    getSamples() {
        if (!this.initialized) return new Array(this.bufferLength).fill(0);
        
        this.analyser.getByteFrequencyData(this.dataArray);
        // Возвращаем копию массива частот (0..255)
        return [...this.dataArray];
    }

    getVolume() {
        if (!this.initialized) return new Array(this.bufferLength).fill(0);
        
        this.analyser.getByteTimeDomainData(this.dataArray);
        let normSamples = [...this.dataArray].map(e => e/128 - 1);
        // console.log(normSamples);
        return normSamples;
    }

    // Полезный геттер
    get sampleRate() {
        return this.audioContext?.sampleRate || 44100;
    }
}