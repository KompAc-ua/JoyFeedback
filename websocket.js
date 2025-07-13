let webSocket = null;         // Переменная для хранения объекта WebSocket
let reconnectTimeout = null;  // Таймер для переподключения

// Функция для инициализации WebSocket соединения
function initWebSocket() {
    // Если есть старое соединение — закрываем его
    if (webSocket) {
        webSocket.close();
        webSocket = null;
    }

    // Проверяем, включён ли чекбокс WiFi, если нет — не подключаемся
    if (!document.getElementById("wifi").checked) return;

    // Создаём новое WebSocket соединение по адресу сервера
    webSocket = new WebSocket('wss://192.168.178.33/ws');

    // Обработчик успешного подключения
    webSocket.onopen = () => {
        document.getElementById('showTextVolume').innerText = "WebSocket connected";
    };

    // Обработчик закрытия соединения
    webSocket.onclose = () => {
        document.getElementById('showTextVolume').innerText = "WebSocket disconnected";

        // Если чекбокс WiFi всё ещё включён, запускаем попытку переподключения через 3 секунды
        if (document.getElementById("wifi").checked) {
            reconnectTimeout = setTimeout(() => {
                initWebSocket();
            }, 3000);
        }
    };

    // Обработчик ошибок WebSocket
    webSocket.onerror = () => {
        document.getElementById('showTextVolume').innerText = "WebSocket error";
    };
}

// Функция отправки данных по WebSocket
function sendRequest(volume) {
    // Проверяем, что WebSocket существует и WiFi включён
    if (!webSocket || !document.getElementById("wifi").checked) return;

    // Получаем множитель из поля ввода, если оно пустое или некорректное — используем 1
    const multiplier = Number(document.getElementById("multiplier").value) || 1;
    let dataToSend = Math.round(volume) * multiplier;

    // Если задано ручное значение напряжения (manualvolt) — используем его
    if (Number(document.getElementById('manualvolt').value) === 0) {
        // Ограничиваем значение в диапазоне [90, 255]
        if (dataToSend > 255) dataToSend = 255;
        if (dataToSend < 100) dataToSend = 100;
    } else {
        dataToSend = Number(document.getElementById('manualvolt').value);
    }

    // Отправляем данные, если WebSocket готов к отправке
    if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(dataToSend);
    } else {
        console.log("WebSocket not connected");
    }

    // Обновляем отображаемый статус с отправляемым значением
    document.getElementById('showTextVolume').innerText = "Volume to send: " + dataToSend;
}
function sendRequestJson(led, motor1, motor2) {
    if (!webSocket || !document.getElementById("wifi").checked) return;
    // Ограничиваем значения в диапазоне [0, 255]
    jsonDataToSend = {
        led: Math.max(0, Math.min(255, led)),
        motor1: Math.max(0, Math.min(255, motor1)),
        motor2: Math.max(0, Math.min(255, motor2))
    };
    if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify(jsonDataToSend));
        document.getElementById('showTextVolume').innerText = `Sent JSON: ${JSON.stringify(jsonDataToSend)}`;
    } else {
        console.log("WebSocket not connected");
        document.getElementById('showTextVolume').innerText = "WebSocket not connected";
    }
}

// Обработчик нажатия кнопки отправки — посылает максимальное значение (255)
document.querySelector('#sendrequest').addEventListener('click', () => sendRequest(255));

// Обработчик изменения состояния чекбокса WiFi
document.querySelector('#wifi').addEventListener('change', () => {
    // Если была запущена попытка переподключения — отменяем её
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }

    if (document.getElementById("wifi").checked) {
        // Если чекбокс включён — инициализируем WebSocket соединение
        initWebSocket();
    } else {
        // Если выключен — закрываем соединение и меняем статус
        if (webSocket) {
            webSocket.close();
            webSocket = null;
        }
        document.getElementById('showTextVolume').innerText = "WebSocket disconnected";
    }
});
