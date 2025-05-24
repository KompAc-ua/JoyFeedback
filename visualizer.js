function main(){
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    // Canvas для графика пиковой громкости
    const peakCanvas = document.getElementById('peakCanvas');
    const peakCtx = peakCanvas.getContext('2d');
    peakCanvas.width = 256;
    peakCanvas.height = 128;

    class Bar {
        constructor(x, y, width, height, color){
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
    
        }
        update(micInput){
            // this.height = micInput * 140;
            const sound = micInput * 200;
            if(sound > this.height/5){
                this.height = sound;
            } else{
                this.height -= this.height * 0.03;
            }
        }
        draw(context){
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, -this.height);

    
        }
    }
const fftSize = 128;
    const microphone = new Microphone(fftSize); //initialization microphone
    // console.log(microphone);
    let bars = [];
    let barWidth = canvas.width/(fftSize/2);

    // Массив для хранения истории пиковой громкости
    const peakHistory = [];
    const maxHistoryPoints = canvas.width; // Количество точек на графике
    const graphHeight = 30; // Высота области графика
    const graphY = canvas.height - graphHeight; // Положение графика
    let maxPeak = 0; // Максимальный пик за последние несколько кадров
    let frameCounter = 0; // Счётчик кадров для обновления maxPeak
    const maxPeakUpdateInterval = 10; // Обновлять maxPeak каждые 10 кадров

    function createBars(){
        for(let i = 0; i < (fftSize/2); i++){
            let color = 'hsl(' + i * 1 + ', 100%, 50%)';
            bars.push(new Bar(i * barWidth, canvas.height, canvas.width/fftSize, canvas.height, color))
        }
    }
    
    createBars();
    // console.log(bars);

    function drawPeakGraph(peakVolume) {
        // Очищаем весь peakCanvas
        peakCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        peakCtx.fillRect(0, 0, peakCanvas.width, peakCanvas.height);

        // Рисуем вертикальную шкалу (слева)
        peakCtx.fillStyle = 'white';
        peakCtx.font = '10px Arial';
        peakCtx.textAlign = 'right';
        peakCtx.textBaseline = 'middle';
        const scaleValues = [0, 0.25, 0.5, 0.75, 1.0]; // Значения для шкалы
        const graphHeight = peakCanvas.height - 20; // Высота графика (оставляем место для текста)
        const graphY = 10; // Отступ сверху для текста

        scaleValues.forEach(value => {
            const y = graphY + graphHeight - value * graphHeight; // Позиция по Y
            peakCtx.fillText(value.toFixed(2), 25, y); // Метка слева
            peakCtx.beginPath();
            peakCtx.moveTo(30, y);
            peakCtx.lineTo(35, y); // Линия шкалы
            peakCtx.strokeStyle = 'gray';
            peakCtx.stroke();
        });

        // Рисуем горизонтальную шкалу (снизу, опционально)
        peakCtx.textAlign = 'center';
        for (let x = 50; x < peakCanvas.width; x += 50) {
            peakCtx.fillText(`${x / 50}s`, x, peakCanvas.height - 5); // Временные метки (примерно в секундах)
            peakCtx.beginPath();
            peakCtx.moveTo(x, graphY + graphHeight);
            peakCtx.lineTo(x, graphY + graphHeight + 5);
            peakCtx.stroke();
        }

        // Рисуем линию графика
        peakCtx.beginPath();
        peakCtx.strokeStyle = 'cyan';
        peakCtx.lineWidth = 2;

        for (let i = 0; i < peakHistory.length; i++) {
            const x = i + 35; // Сдвиг вправо для шкалы
            const y = graphY + graphHeight - peakHistory[i] * graphHeight;
            if (i === 0) {
                peakCtx.moveTo(x, y);
            } else {
                peakCtx.lineTo(x, y);
            }
        }
        peakCtx.stroke();

        // Отображаем текущую и максимальную громкость
        peakCtx.fillStyle = 'yellow';
        peakCtx.textAlign = 'right';
        peakCtx.textBaseline = 'top';
        const currentPeakText = `Peak: ${peakVolume.toFixed(2)}`;
        const maxPeakText = `Max: ${maxPeak.toFixed(2)}`;
        peakCtx.fillText(currentPeakText, peakCanvas.width - 5, 2);
        peakCtx.fillText(maxPeakText, peakCanvas.width - 5, 16);
    }
    
   function animate(){
        if(microphone.initialized){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // console.log('animate');
            //generates audio samples from microphone
            //animate bars based on microphone data
            const samples = microphone.getSamples();
            const vol = microphone.getVolume(); // Средняя громкость
            // Находим максимальную громкость (пиковую)
            const peakVolume = Math.max(...samples); // Максимальное значение из samples
            // console.log(vol);

            // Обновляем историю пиковой громкости
            peakHistory.push(peakVolume);
            if (peakHistory.length > maxHistoryPoints) {
                peakHistory.shift();
            }

            // Обновляем максимальный пик
            frameCounter++;
            if (frameCounter >= maxPeakUpdateInterval) {
                maxPeak = Math.max(...peakHistory); // Обновляем максимальный пик
                frameCounter = 0; // Сбрасываем счётчик
            }

            bars.forEach(function(bar, i){
                bar.update(samples[i]);
                bar.draw(ctx);
                // console.log(samples[i]);
            });

            // Рисуем график пиковой громкости
            drawPeakGraph(peakVolume);

            if(peakVolume > 0.05) {
                // console.log(`Peak Volume: ${peakVolume.toFixed(2)}, Average Volume: ${vol.toFixed(2)}`);
                if (document.getElementById("gamepadcheckbox").checked == true) vibro(peakVolume.toFixed(2), vol.toFixed(2), 200);
                
                if (document.getElementById("serialportcheckbox").checked == true) {
                    if(document.getElementById('manualvolt').value == 0) writeInPortChange(peakVolume.toFixed(2)*255);
                        else writeInPortChange(document.getElementById('manualvolt').value); 
                }
                if(document.getElementById("wifi").checked == true){
                    if(document.getElementById('manualvolt').value == 0) sendRequest(peakVolume.toFixed(2)*255);
                    else sendRequest(document.getElementById('manualvolt').value);
                    // console.log("Volume: ", vol.toFixed(2)*255);
                } 
            }
            
        }
        
        // requestAnimationFrame(animate);
    }
    // animate();
    // setInterval(animate, 15);
    let worker = new Worker("worker.js"); //worker for update in background
    worker.onmessage = animate;
}
