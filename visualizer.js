function main() {
    const spectrumCanvas = document.getElementById('soundSpectrum');
    const spectrumCtx = spectrumCanvas.getContext('2d');
    spectrumCanvas.width = 256;
    spectrumCanvas.height = 128;

    // Canvas для графика пиковой громкости
    const peakCanvas = document.getElementById('peakCanvas');
    const peakCtx = peakCanvas.getContext('2d');
    peakCanvas.width = 256;
    peakCanvas.height = 128;

    class Bar {
        constructor(x, y, width) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.totalHeight = 0;
            this.peakHeight = 0; // Запоминаем высоту пика для градиента
            this.decay = 0.95;

            this.palette = {
                base: '#f0f8ff',
                low: 'rgb(120, 120, 120)',
                mid: 'rgb(70, 110, 70)',
                high: 'rgb(70, 70, 180)',
                peak: 'rgb(180, 70, 70)'
            };
        }

        update(micInput) {
            let val = micInput * 128;

            if (val > this.totalHeight) {
                this.totalHeight = val;
                this.peakHeight = val; // Обновляем пик при рывке вверх
            } else {
                this.totalHeight *= this.decay;
                // НЕ сбрасываем peakHeight мгновенно
                if (this.totalHeight <= 1) {
                    this.peakHeight = 0;
                }
            }

            if (this.totalHeight > 128) this.totalHeight = 128;
            if (this.totalHeight < 0) this.totalHeight = 0;
        }

        draw(ctx) {
            if (this.totalHeight < 1) return;

            const {
                x,
                y,
                width: w,
                totalHeight: h,
                peakHeight: ph
            } = this;

            // Считаем "силу" градиента по пиковой высоте
            const colorVal = Math.min(255, (ph / 128) * 255);

            // ВАЖНО: Градиент всегда от 0 до ТЕКУЩЕЙ высоты h
            const grad = ctx.createLinearGradient(0, y, 0, y - h);
            grad.addColorStop(0, this.palette.base);

            let activeColor;

            if (colorVal < 100) {
                activeColor = this.palette.low;
                grad.addColorStop(1, activeColor);
            } else if (colorVal <= 160) {
                activeColor = this.palette.mid;
                grad.addColorStop(0.5, this.palette.mid);
                grad.addColorStop(1, activeColor);
            } else if (colorVal <= 210) {
                activeColor = this.palette.high;
                grad.addColorStop(0.3, this.palette.mid);
                grad.addColorStop(0.7, this.palette.high);
                grad.addColorStop(1, activeColor);
            } else {
                activeColor = this.palette.peak;
                grad.addColorStop(0.2, this.palette.mid);
                grad.addColorStop(0.5, this.palette.high);
                grad.addColorStop(0.8, this.palette.peak);
                grad.addColorStop(1, activeColor);
            }

            ctx.save();
            ctx.shadowBlur = 5;
            ctx.shadowColor = activeColor;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.rect(x, y, w, -h);
            ctx.fill();
            ctx.restore();
        }
    }

    const fftSize = 2048;
    const microphone = new Microphone(fftSize); // initialization microphone
    let bars = [];

    // --- НАСТРОЙКИ ВИЗУАЛИЗАЦИИ ---
    const TARGET_BARS = 64; // Жестко фиксируем 64 бара
    const LOG_SCALE_POWER = 2.5; // Степень логарифма (чем больше, тем шире басы)

    // Массив для хранения истории пиковой громкости
    const peakHistory = [];
    const maxHistoryPoints = spectrumCanvas.width;
    let maxPeak = 0;
    let frameCounter = 0;
    const maxPeakUpdateInterval = 10;

    function createBars() {
        bars = [];
        const gap = 1;
        // Рассчитываем ширину так, чтобы влезло ровно 64 бара
        // (256 / 64) = 4 пикселя на слот. Минус 1 пиксель gap = 3 пикселя ширина бара.
        const calculatedBarWidth = (spectrumCanvas.width / TARGET_BARS) - gap;

        for (let i = 0; i < TARGET_BARS; i++) {
            const x = i * (calculatedBarWidth + gap);
            bars.push(new Bar(x, spectrumCanvas.height, calculatedBarWidth));
        }
    }

    createBars();

    function drawPeakGraph(peakVolume) {
        const multiplier = Number(document.getElementById("multiplier").value) || 1;
        const scaledPeak = peakVolume * multiplier;
        const scaledMax = maxPeak * multiplier;

        // Очищаем peakCanvas
        peakCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        peakCtx.fillRect(0, 0, peakCanvas.width, peakCanvas.height);

        // Вертикальная шкала
        peakCtx.fillStyle = 'white';
        peakCtx.font = '10px Arial';
        peakCtx.textAlign = 'right';
        peakCtx.textBaseline = 'middle';

        const scaleValues = [0, 64, 128, 192, 255];
        const graphHeight = peakCanvas.height - 20;
        const graphY = 10;

        scaleValues.forEach(value => {
            const y = graphY + graphHeight - (value / 255) * graphHeight;
            peakCtx.fillText(value.toFixed(0), 25, y);
            peakCtx.beginPath();
            peakCtx.moveTo(30, y);
            peakCtx.lineTo(35, y);
            peakCtx.strokeStyle = 'gray';
            peakCtx.stroke();
        });

        // Горизонтальная шкала
        peakCtx.textAlign = 'center';
        for (let x = 50; x < peakCanvas.width; x += 50) {
            peakCtx.fillText(`${x / 50}s`, x, peakCanvas.height - 5);
            peakCtx.beginPath();
            peakCtx.moveTo(x, graphY + graphHeight);
            peakCtx.lineTo(x, graphY + graphHeight + 5);
            peakCtx.stroke();
        }

        // График пиковой громкости
        peakCtx.beginPath();
        peakCtx.strokeStyle = 'red';
        peakCtx.lineWidth = 0.8;

        for (let i = 0; i < peakHistory.length; i++) {
            const x = i + 35;
            const scaledValue = peakHistory[i] * 255 * multiplier;
            const y = graphY + graphHeight - (scaledValue / 255) * graphHeight;
            if (i === 0) {
                peakCtx.moveTo(x, y);
            } else {
                peakCtx.lineTo(x, y);
            }
        }
        peakCtx.stroke();

        // Текущая и максимальная громкость
        peakCtx.fillStyle = 'yellow';
        peakCtx.textAlign = 'right';
        peakCtx.textBaseline = 'top';
        peakCtx.fillText(`Peak: ${(scaledPeak * 255).toFixed(0)}`, peakCanvas.width - 5, 2);
        peakCtx.fillText(`Max: ${(scaledMax * 255).toFixed(0)}`, peakCanvas.width - 5, 16);
    }

    function animate() {
        if (!microphone.initialized) return;

        // Очистка спектра
        spectrumCtx.clearRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);

        // Получаем данные
        const samples = microphone.getSamples();           // массив 0..255 (частотные амплитуды)
        const vol = microphone.getVolume();
        const peakVolume = Math.max(...vol);

        // Параметры логарифмического спектра
        const sampleRate = microphone.audioContext?.sampleRate || 44100;
        const fftBinCount = samples.length;                // обычно 1024 при fftSize=2048
        const minFreq = 30;
        const maxFreq = 16000;

        // Обновление и отрисовка баров спектра
        bars.forEach((bar, i) => {
            // Параметр от 0 до 1
            const t = i / (TARGET_BARS - 1);

            // Логарифмическая частота
            const freq = minFreq * Math.pow(maxFreq / minFreq, t);

            // Соответствующий бин FFT
            let bin = Math.round(freq * microphone.fftSize / sampleRate);
            bin = Math.max(0, Math.min(bin, fftBinCount - 1));

            // Берём максимум в небольшой окрестности (важно для лог. шкалы)
            let maxVal = samples[bin];
            const neighbors = Math.max(1, Math.floor(fftBinCount / TARGET_BARS / 5)); // ~1–4 бина в зависимости от размера

            for (let k = Math.max(0, bin - neighbors); k <= bin + neighbors && k < fftBinCount; k++) {
                if (samples[k] > maxVal) maxVal = samples[k];
            }

            // Нормализация в диапазон 0..1 (Bar.update ожидает значение ~0..1)
            const normalized = maxVal / 255;

            bar.update(normalized);
            bar.draw(spectrumCtx);
        });

        // График пиковой громкости
        peakHistory.push(peakVolume);
        if (peakHistory.length > maxHistoryPoints) {
            peakHistory.shift();
        }

        frameCounter++;
        if (frameCounter >= maxPeakUpdateInterval) {
            maxPeak = Math.max(...peakHistory);
            frameCounter = 0;
        }

        drawPeakGraph(peakVolume);

        // Внешние триггеры (VIBRO, SERIAL, WIFI)
        if (peakVolume > 0.05 && document.getElementById("mVibro")?.style.backgroundColor !== "red") {
            if (document.getElementById("gamepadcheckbox")?.checked === true) {
                gamepadVibro(peakVolume.toFixed(2), vol.toFixed(2), 200);
            }

            if (document.getElementById("serialportcheckbox")?.checked === true) {
                if (Number(document.getElementById('manualvolt')?.value) === 0) {
                    writeInPortChange((peakVolume * 255).toFixed(0));
                } 
                else {
                    writeInPortChange(document.getElementById('manualvolt').value);
                }
            }

            if (document.getElementById("wifi")?.checked === true) {
                if (Number(document.getElementById('manualvolt')?.value) === 0) {
                    const multiplier = Number(document.getElementById("multiplier")?.value) || 1;
                    let peakVolumeToSend = Math.round(peakVolume * 255 * multiplier);
                    if (peakVolumeToSend < 100) peakVolumeToSend = 100;

                    if (peakVolumeToSend < 15) {
                        sendRequestJson(peakVolumeToSend, peakVolumeToSend, 0);
                    } else {
                        sendRequestJson(peakVolumeToSend, peakVolumeToSend, peakVolumeToSend);
                    }
                    // sendRequest(peakVolumeToSend);
                } 
                else {
                    sendRequest(document.getElementById('manualvolt').value);
                }
            }
        }
    }

    let worker = new Worker("worker.js");
    worker.onmessage = animate;
}