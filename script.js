// navigator.mediaDevices.enumerateDevices() //Show availeble devices
// .then (devices => {
//     devices.forEach(device=>{
//         console.log(device.kind.toUpperCase(), device.label/* , device.deviceId */);
//     })
// })

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
    // timer = setTimeout(
    //     startmVibro, 200);
    //     console.log("Timer");
    //     vibro(1.0, 1.0);

    worker2 = new Worker("worker2.js"); //worker for update in background
    worker2.onmessage = () => {
        vibro(1.0, 1.0, 1000);
    };
    console.log("Start Vibro");
    
}

function stopmVibro (){
    // clearTimeout(timer);
    worker2.terminate();
    console.log("Stop Vibro");
}


document.querySelector('#record').addEventListener('click', e=>getMicStream(e));
document.querySelector('#stop').addEventListener('click', e=>stopRec(e));
document.querySelector('#device').addEventListener('change', e=>{changeAudioInput(e)});
document.querySelector('#mVibro').addEventListener('click', e=>startmVibro(e));
document.querySelector('#StopmVibro').addEventListener('click', e=>stopmVibro(e));