const webSocket = new WebSocket('http://192.168.178.33:81');

// console.log(webSocket.readyState);

function sendRequest(volume){
    // console.log(webSocket.readyState);
    dataToSend = Math.round(volume) * document.getElementById("multiplier").value;
    if(document.getElementById('manualvolt').value == 0) {
        if(dataToSend > 255) dataToSend = 255;
        if(dataToSend < 100) dataToSend = 100; // Минимальное значение для отправки
    } else dataToSend = document.getElementById('manualvolt').value;

    if(webSocket.readyState == 1) webSocket.send(dataToSend)
        else console.log("WebSocket not connected");
    document.getElementById('showTextVolume').innerText = "Volume to send: " + dataToSend;
}



document.querySelector('#sendrequest').addEventListener('click', e=>sendRequest(255));