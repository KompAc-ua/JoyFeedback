let initializationGamepad = 0;
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
        gamepad.vibrationActuator.playEffect("dual-rumble", 
        {
            startDelay: 0,
            duration: 300,
            weakMagnitude: weak,
            strongMagnitude: strong,
        })
        console.log("vibro");
    } else console.log("Gamepad not connected");    
};

document.querySelector('#vibro').addEventListener('click', e => vibro(1.0, 1.0));