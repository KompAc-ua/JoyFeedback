let initializationGamepad = 0;
let gp = null;
let multiplier = 1;

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
  
function gamepadVibro(weak, strong, durationValue) {
  weak = weak * multiplier;
  strong = strong * multiplier;
  if (weak > 1.0){
    weak = 1.0;
  }
  if (strong > 1.0){
    strong = 1.0;
  }
  // console.log("weak: ",weak, "strong: ",strong, "multiplier: ",multiplier);
    if(initializationGamepad === 1){
        const gamepad = navigator.getGamepads().find(gp => gp && gp.connected);
        if (!gamepad) {
          console.log("Gamepad not connected or not detected");
          return;
        }
        try{

        if(gamepad.vibrationActuator && gamepad.vibrationActuator.type === "dual-rumble") {
          // Chromium-based browsers (Chrome, Edge, Opera, Yandex)
          gamepad.vibrationActuator.playEffect("dual-rumble", 
          {
              startDelay: 0,
              duration: durationValue,
              weakMagnitude: weak,
              strongMagnitude: strong,
          })
        } else if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
          // Firefox
          gamepad.hapticActuators[0].pulse(0.5, 300);
          
        } else {
          alert("Not supported browser");
        }
      } catch (error) {console.error("Vibration error:", error);
        alert("Vibration error: " + error.message);
      }
      
        
        // console.log("vibro");
    } else console.log("Gamepad not connected");
      
};

const changeMultiplier = async (e)=>{
  const multiplierEl = document.querySelector('#multiplier');
  multiplier = multiplierEl.value;
  // console.log("Change multiplier: ",multiplier);
}

document.querySelector('#gamepadVibro').addEventListener('click', e => gamepadVibro(1.0, 1.0, 200));
document.querySelector('#multiplier').addEventListener('change', e=>{changeMultiplier(e)}); //Work with changes multiplier

// Poll for gamepad state to handle already-connected gamepads
// function checkGamepad() {
//   const gamepad = navigator.getGamepads().find(gp => gp && gp.connected);
//   initializationGamepad = gamepad ? 1 : 0;
//   console.log("Gamepad connected:", initializationGamepad);
// }

// checkGamepad();
// setInterval(checkGamepad, 1000); // Check every second