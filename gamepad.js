let initializationGamepad = 0;
let gp = null;
let gamepadStatusTimeout = null;
let gamepadStatusTransitionTimeout = null;

const gamepadStatus = document.querySelector("#gamepadStatus");

function clearGamepadStatusTimers() {
  if (gamepadStatusTimeout) {
    clearTimeout(gamepadStatusTimeout);
    gamepadStatusTimeout = null;
  }
  if (gamepadStatusTransitionTimeout) {
    clearTimeout(gamepadStatusTransitionTimeout);
    gamepadStatusTransitionTimeout = null;
  }
}

function showGamepadStatus(message, hideAfterDelay = false, nextMessage = null) {
  if (!gamepadStatus) {
    return;
  }

  clearGamepadStatusTimers();

  gamepadStatus.textContent = message;
  gamepadStatus.classList.add("visible");

  if (hideAfterDelay) {
    gamepadStatusTimeout = setTimeout(() => {
      gamepadStatus.classList.remove("visible");
      gamepadStatusTimeout = null;

      if (nextMessage) {
        gamepadStatusTransitionTimeout = setTimeout(() => {
          gamepadStatus.textContent = nextMessage;
          gamepadStatus.classList.add("visible");
          gamepadStatusTransitionTimeout = null;
        }, 500);
      }
    }, 2000);
  }
}

window.addEventListener("gamepadconnected", (event) => {
    initializationGamepad = 1;
    showGamepadStatus("Gamepad connected", true, event.gamepad.id);
    console.log("A gamepad connected:");
    console.log(event.gamepad);
    });
  window.addEventListener("gamepaddisconnected", (event) => {
    initializationGamepad = 0;
    showGamepadStatus("Gamepad disconnected", true);
    console.log("A gamepad disconnected:");
    console.log(event.gamepad);
  });
  
function gamepadVibro(weak, strong, durationValue) {
  if (weak > 1.0){
    weak = 1.0;
  }
  if (strong > 1.0){
    strong = 1.0;
  }
  // console.log("weak: ",weak, "strong: ",strong);
    if(initializationGamepad === 1){
        const gamepad = navigator.getGamepads().find(gp => gp && gp.connected);
        if (!gamepad) {
          showGamepadStatus("Gamepad is not connected", true);
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
    } else {
      showGamepadStatus("Gamepad is not connected", true);
      console.log("Gamepad not connected");
    }
};

document.querySelector('#gamepadVibro').addEventListener('click', e => gamepadVibro(1.0, 1.0, 200));