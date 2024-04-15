var socket = io();
socket.on('random value', (data) => {
    document.getElementById('randomValueDisplay').textContent = `Random value: ${data.data}`;
});
