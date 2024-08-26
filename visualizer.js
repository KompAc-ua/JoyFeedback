function main(){
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

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

    function createBars(){
        for(let i = 0; i < (fftSize/2); i++){
            let color = 'hsl(' + i * 1 + ', 100%, 50%)';
            bars.push(new Bar(i * barWidth, canvas.height, canvas.width/fftSize, canvas.height, color))
        }
    }
    
    createBars();
    // console.log(bars);
    
   function animate(){
        if(microphone.initialized){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // console.log('animate');
            //generates audio samples from microphone
            //animate bars based on microphone data
            const samples = microphone.getSamples();
            const vol = microphone.getVolume();
            // console.log(vol);

            bars.forEach(function(bar, i){
                bar.update(samples[i]);
                bar.draw(ctx);
                // console.log(samples[i]);
            })
            if(vol > 0.05) {
                if (document.getElementById("gamepadcheckbox").checked == true) vibro(vol.toFixed(2), vol.toFixed(2), 200);
                
                if (document.getElementById("serialportcheckbox").checked == true) {
                    if(document.getElementById('manualvolt').value == 0) writeInPortChange(vol.toFixed(2)*255);
                        else writeInPortChange(document.getElementById('manualvolt').value); 
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
