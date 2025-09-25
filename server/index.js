const WebSocket = require('ws');

// Crea una instancia del servidor de WebSockets en el puerto 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log('Servidor de WebSockets iniciado en el puerto 8080');

// Esta función envía el número actual de clientes a todos los clientes conectados
function broadcastClientCount() {
    // Convierte el conjunto de clientes a un array para usar el método 'forEach'
    const clients = Array.from(wss.clients);

    // Crea el mensaje con el número actual de clientes
    const message = JSON.stringify({
        type: 'live_visitors',
        count: clients.length,
    });

    // Envía el mensaje a cada cliente conectado
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Escucha las nuevas conexiones de clientes
wss.on('connection', ws => {
    console.log('Nuevo cliente conectado.');

    // Envía la cuenta de clientes actualizada a todos
    broadcastClientCount();

    // Escucha los mensajes de los clientes (opcional para este ejemplo)
    ws.on('message', message => {
        console.log(`Mensaje recibido: ${message}`);
    });

    // Maneja la desconexión de un cliente
    ws.on('close', () => {
        console.log('Cliente desconectado.');
        // Envía la cuenta de clientes actualizada a todos
        broadcastClientCount();
    });

    // Maneja los errores de conexión
    ws.on('error', error => {
        console.error('Error de WebSocket:', error);
    });
});
