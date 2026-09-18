let stream = null;
let constraints = {
    audio: true,
    video: false,
};
let audioSource;
let analyser;
let dataArray;
let bufferLength;
let timer;
let worker2;
const gamepadCheckbox = document.querySelector("#gamepadcheckbox");
const serialPortCheckbox = document.querySelector("#serialportcheckbox");

const getMicStream = async()=>{
    try{
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(stream);
        console.log(stream.getTracks());
    }catch(err){
        //user denied access to constraints
        console.log("User denied access to constraints");
        console.log(err);
    }
    const audioCtx = new AudioContext();
    console.log(audioCtx);
    audioSource = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    audioSource.connect(analyser);
    // analyser.connect(audioCtx.destination); //Прослушивать с данного устройства
    
    
    
    // console.log(dataArray);


    console.log(audioSource);
    
    // let bufferSize = 2048;
    // const recorder = audioCtx.createScriptProcessor(bufferSize, 1, 1);
    // recorder.onaudioprocess = function(e){

    // }
    document.getElementById('record').setAttribute("disabled", true);
    
};
const stopRec = ()=>{
    const tracks = stream.getTracks();
    tracks.forEach(track=>{
        track.stop();
        console.log(stream);
    })
    // audioSource.disconnect();
    console.log(audioSource);
    document.getElementById('record').removeAttribute("disabled");
}

const audioInputEl = document.querySelector('#device');
const getDevices = async ()=>{
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(devices);
        devices.forEach(d=>{
            const option = document.createElement('option'); //create the option tag
            option.value = d.deviceId
            option.text = d.label
            //add the option tag we just created to the right select
            if(d.kind === "audioinput"){
                // audioInputEl.removeChild(option);
                audioInputEl.appendChild(option);
            }
        })
    }
    catch(err){
        console.log(err);
    }
}

getDevices();



const changeAudioInput = async (e)=>{
    // stopRec();
    const deviceId = e.target.value;
    constraints = {
        audio: {deviceId: {exact: deviceId}},
        video: false,
    }
    // try {
    //     stream = await navigator.mediaDevices.getUserMedia(newConstraits);
    //     console.log(stream);
    //     const tracks = stream.getAudioTracks();
    //     console.log(tracks);
    // }catch(err){
    //     console.log(err);
    // }
}

function startmVibro() {

    if (!worker2) {
        worker2 = new Worker("worker2.js");
        document.getElementById("mVibro").style.backgroundColor = "red"; // Set button to red
        createSliders(); // Create sliders dynamically
    } //worker for update in background

    if (document.getElementById("gamepadcheckbox").checked == true) {console.log("Start GamePad Vibro");}
    if (document.getElementById("serialportcheckbox").checked == true) {console.log("Start SerialPort Vibro");}
    if (document.getElementById("wifi").checked == true) {console.log("Start WiFi Vibro");}
    
    worker2.onmessage = () => {
            if (document.getElementById("gamepadcheckbox").checked == true){
                let motor1 = document.getElementById("manualvolt").value/255;
                let motor2 = document.getElementById("manualvolt2").value/255;
                gamepadVibro(motor1.toFixed(2), motor2.toFixed(2), 100);
            }
            if (document.getElementById("serialportcheckbox").checked == true) {
            
                if(document.getElementById('manualvolt').value == 0) writeInPortChange(255);
                else writeInPortChange(document.getElementById('manualvolt').value);
            }
            if (document.getElementById("wifi").checked == true && document.getElementById("mVibro").style.backgroundColor != "red") {
            
                if(document.getElementById('manualvolt').value == 0) sendRequest(255);
                else sendRequest(document.getElementById('manualvolt').value);
            } else{
                let led = (Number(document.getElementById("manualvolt").value) + Number(document.getElementById("manualvolt2").value))/2;
                let motor1 = document.getElementById("manualvolt").value;
                let motor2 = document.getElementById("manualvolt2").value;
                sendRequestJson(led, motor1, motor2);
            }
        
        }
        
        
    // console.log("Start Vibro");
    
}

function stopmVibro (){
    // clearTimeout(timer);
    if(worker2){
        worker2.terminate();
        worker2 = null; // Reset the worker variable
        document.getElementById("mVibro").style.backgroundColor = ""; // Reset button color
        document.getElementById("manualvolt").value = 0;
        manualVolt();
        removeSliders(); // Remove sliders
    }
    
    // console.log("Stop Vibro");
}
function manualVolt(){
    document.getElementById('showmanualvolt').innerText = document.getElementById('manualvolt').value;
}

// Function to create sliders and their display spans dynamically
function createSliders() {
    // Container where sliders will be appended (e.g., a div with id="controls")
    const container = document.getElementById("controls") || document.body; // Fallback to body if no container

    // Create interval slider and span
    const intervalContainer = document.createElement("div");
    intervalContainer.className = "slider-row";
    // const intervalLabel = document.createElement("label");
    // intervalLabel.setAttribute("for", "interval");
    // intervalLabel.textContent = "Vibration Interval (ms): ";

    const volt2Slider = document.createElement("input");
    volt2Slider.type = "range";
    volt2Slider.min = "0";
    volt2Slider.max = "255";
    volt2Slider.step = "1";
    volt2Slider.value = "0";
    volt2Slider.id = "manualvolt2";
    volt2Slider.title = "Manual Volume 2";

    const voltSpan = document.createElement("span");
    voltSpan.id = "showmanualvolt2";
    voltSpan.textContent = volt2Slider.value;

    // Create manualvoltright slider and span
    const voltContainer = document.createElement("div");
    voltContainer.className = "slider-row";
    const voltLabel = document.createElement("label");
    // voltLabel.textContent = "Manual Voltage: ";

    const intervalSlider = document.createElement("input");
    intervalSlider.type = "range";
    intervalSlider.min = "10";
    intervalSlider.max = "10000";
    intervalSlider.step = "10";
    intervalSlider.value = "1000";
    intervalSlider.id = "interval";
    intervalSlider.title = "Vibration Interval (ms)";

    const intervalSpan = document.createElement("span");
    intervalSpan.id = "showinterval";
    intervalSpan.textContent = intervalSlider.value;

    

    // Append elements to container
    // intervalContainer.appendChild(intervalLabel);
        
    // voltContainer.appendChild(voltLabel);
    voltContainer.appendChild(volt2Slider);
    voltContainer.appendChild(voltSpan);
    intervalContainer.appendChild(intervalSlider);
    intervalContainer.appendChild(intervalSpan);
    container.appendChild(voltContainer);
    container.appendChild(intervalContainer);

    // Event listeners to update span values when sliders change
    volt2Slider.addEventListener("input", () => {
        voltSpan.textContent = volt2Slider.value;
    });

    intervalSlider.addEventListener("input", () => {
        intervalSpan.textContent = intervalSlider.value;
        // Update worker2 interval if worker is active
        if (worker2) {
            const interval = parseInt(intervalSlider.value) || 1000;
            worker2.postMessage({ command: "setInterval", value: interval });
        }
    });

    
}

// Function to remove sliders and their associated elements
function removeSliders() {
    const container = document.getElementById("controls");
    if (container) {
        // Alternatively, clear the entire container:
        container.innerHTML = '';
    }
}

// Глобальный Map для хранения данных о каждом вынесенном canvas
const activePipWindows = new Map();

/**
 * Универсальная функция переключения PiP для любого canvas
 * @param {HTMLCanvasElement} canvasElement 
 */
async function toggleCanvasPip(canvasElement) {
  // 1. Проверка поддержки API
  if (!('documentPictureInPicture' in window)) {
    alert('Ваш браузер не поддерживает Document Picture-in-Picture API');
    return;
  }

  // 2. Если для ЭТОГО canvas окно УЖЕ открыто — закрываем его
  if (activePipWindows.has(canvasElement)) {
    const { pipWindow } = activePipWindows.get(canvasElement);
    pipWindow.close();
    return;
  }

  try {
    // Сохраняем место canvas в DOM, чтобы вернуть его ровно туда, откуда взяли
    const parent = canvasElement.parentNode;
    const nextSibling = canvasElement.nextSibling;

    // 3. Запрашиваем окно
    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: canvasElement.width || canvasElement.clientWidth,
      height: canvasElement.height || canvasElement.clientHeight,
    });

    // 4. Скопировать стили текущей страницы в PiP-окно
    [...document.styleSheets].forEach((styleSheet) => {
      try {
        const cssRules = [...styleSheet.cssRules].map(r => r.cssText).join('');
        const style = document.createElement('style');
        style.textContent = cssRules;
        pipWindow.document.head.appendChild(style);
      } catch (e) {
        // Пропускаем внешние/CORS стили
      }
    });

    // 5. Убираем внешние поля у документа в PiP-окне
    pipWindow.document.body.style.margin = '0';
    pipWindow.document.body.style.padding = '0';
    pipWindow.document.body.style.overflow = 'hidden';

    // 6. Запоминаем текущие inline-стили canvas и растягиваем его в новое окно
    const originalStyle = canvasElement.getAttribute('style') || '';
    canvasElement.style.width = '100%';
    canvasElement.style.height = '100%';
    canvasElement.style.display = 'block';

    // Сохраняем запись о состоянии в Map
    activePipWindows.set(canvasElement, { pipWindow, parent, nextSibling, originalStyle });

    // 7. Переносим canvas в PiP-окно
    pipWindow.document.body.appendChild(canvasElement);

    // 8. Возврат canvas на исходное место при закрытии окна
    pipWindow.addEventListener('pagehide', () => {
      // Восстанавливаем оригинальные стили canvas
      if (originalStyle) {
        canvasElement.setAttribute('style', originalStyle);
      } else {
        canvasElement.removeAttribute('style');
      }

      // Возвращаем в точную позицию DOM (учитывая соседние элементы)
      if (nextSibling && parent.contains(nextSibling)) {
        parent.insertBefore(canvasElement, nextSibling);
      } else {
        parent.appendChild(canvasElement);
      }

      // Удаляем из реестра активных окон
      activePipWindows.delete(canvasElement);
    });

  } catch (err) {
    console.error('Не удалось открыть Picture-in-Picture:', err);
  }
}

document.querySelector('#record').addEventListener('click', e=>getMicStream(e));
document.querySelector('#stop').addEventListener('click', e=>stopRec(e));
document.querySelector('#device').addEventListener('change', e=>{changeAudioInput(e)});
document.querySelector('#mVibro').addEventListener('click', e=>startmVibro(e));
document.querySelector('#stopmVibro').addEventListener('click', e=>stopmVibro(e));
document.querySelector('#manualvolt').addEventListener('input', e=>manualVolt(e));
document.getElementById('peakCanvas').addEventListener('dblclick', (e)=>toggleCanvasPip(e.currentTarget));
document.getElementById('soundSpectrum').addEventListener('dblclick', (e)=>toggleCanvasPip(e.currentTarget));