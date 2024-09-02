const webSocket = new WebSocket('http://192.168.178.33:81');

// console.log(webSocket.readyState);

function sendRequest(volume){
    // console.log(webSocket.readyState);
    dataToSend = Math.round(volume) * document.getElementById("multiplier").value;
    if(dataToSend > 255) dataToSend = 255;
    if(webSocket.readyState == 1) webSocket.send(dataToSend)
        else console.log("WebSocket not connected");
}



document.querySelector('#sendrequest').addEventListener('click', e=>sendRequest(255));