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
                gamepadVibro(1.0, 1.0, 1000);  
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
        removeSliders(); // Remove sliders
    }
    
    console.log("Stop Vibro");
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
    const voltLabel = document.createElement("label");
    // voltLabel.textContent = "Manual Voltage: ";

    const intervalSlider = document.createElement("input");
    intervalSlider.type = "range";
    intervalSlider.min = "10";
    intervalSlider.max = "1000";
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

document.querySelector('#record').addEventListener('click', e=>getMicStream(e));
document.querySelector('#stop').addEventListener('click', e=>stopRec(e));
document.querySelector('#device').addEventListener('change', e=>{changeAudioInput(e)});
document.querySelector('#mVibro').addEventListener('click', e=>startmVibro(e));
document.querySelector('#stopmVibro').addEventListener('click', e=>stopmVibro(e));
document.querySelector('#manualvolt').addEventListener('change', e=>manualVolt(e));
