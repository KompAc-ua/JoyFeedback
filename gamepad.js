let initializationGamepad = 0;
let gp = null;
window.addEventListener("gamepadconnected", (event) => {
    initializationGamepad = 1;
    console.log("A gamepad connected:");
    console.log(event.gamepad);
    });
  window.addEventListener("gamepaddisconnected", (event) => {
    initializationGamepad = 0;
    console.log("A gamepad disconnected:");
    console.log(event.gamepad);
  });
  
function vibro(weak, strong) {
    if(initializationGamepad === 1){
        let gamepad = navigator.getGamepads()[0];
        if(checkBrowser === 1){
          gamepad.vibrationActuator.playEffect("dual-rumble", 
          {
              startDelay: 0,
              duration: 200,
              weakMagnitude: weak,
              strongMagnitude: strong,
          })
        } else if (checkBrowser === 2) {
          
          gamepad.hapticActuators[0].pulse(0.5, 300);
          // gamepad.vibrationActuator.playEffect("vibro",
          // {
          //   startDelay: 0,
          //     duration: 300,
          //     weakMagnitude: weak,
          //     strongMagnitude: strong,
          // });
          
        } else {
          alert("Not supported browser");
        }
        
        // console.log("vibro");
    } else console.log("Gamepad not connected");    
};

document.querySelector('#vibro').addEventListener('click', e => vibro(1.0, 1.0));