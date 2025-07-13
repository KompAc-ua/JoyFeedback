// worker2.js
let intervalId = null;
let intervalTime = 1000; // Default interval (1000ms = 1 second)

// Start set hutInterval immediately with default interval
intervalId = setInterval(() => {
    self.postMessage("tick"); // Trigger the main script's onmessage
}, intervalTime);

self.onmessage = (e) => {
    if (e.data.command === "setInterval") {
        // Update interval time
        intervalTime = e.data.value;
        if (intervalId) {
            clearInterval(intervalId); // Clear existing interval
        }
        intervalId = setInterval(() => {
            self.postMessage("tick"); // Trigger the main script's onmessage
        }, intervalTime);
    }
};