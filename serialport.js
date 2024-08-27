var port, textEncoder, writableStreamClosed, writer, historyIndex = -1;
const lineHistory = [];
    async function connectSerial() {
        try {
            // Prompt user to select any serial port.
            port = await navigator.serial.requestPort();
            await port.open({ baudRate: document.getElementById("baudrate").value });
            let settings = {};

            settings.dataTerminalReady = false;
            settings.requestToSend = false;
            if (Object.keys(settings).length > 0) await port.setSignals(settings);
  
            
            textEncoder = new TextEncoderStream();
            writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
            writer = textEncoder.writable.getWriter();
            await listenToPort();
        } catch (e){
            alert("Serial Connection Failed" + e);
        }
        console.log("connectSerial function");
    }

    async function writeInPortChange(volume) {
        // dataToSend = document.getElementById("OffOn").value;
        dataToSend = Math.round(volume) * document.getElementById("multiplier").value;
        if(dataToSend >= 255) dataToSend = 255;
        dataToSend = dataToSend + "\n";
        await writer.write(dataToSend);
    }

    async function listenToPort() {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        // Listen to data coming from the serial device.
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                // Allow the serial port to be closed later.
                console.log('[readLoop] DONE', done);
                reader.releaseLock();
                break;
            }
            // value is a string.
            appendToTerminal(value);
        }
    }

    async function appendToTerminal(newStuff) {
        console.log(newStuff);
        
    }

document.querySelector('#SelectPort').addEventListener('click', e=>connectSerial(e));
document.querySelector('#OffOn').addEventListener('change', e=>{writeInPortChange(document.getElementById("OffOn").value)});