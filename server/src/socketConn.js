const BOAT1_ID = 'ABC';
const BOAT2_ID = 'DEF';
const HOMEBASE_ID = 'HOMEBASE';
const VALID_ID_LIST = [ HOMEBASE_ID, BOAT1_ID, BOAT2_ID ];

const ActiveConnections = [];

class SocketConnectionManager {
    constructor(socket) {
        this.id = null;
        this.mySocket = socket;
        this.mySocket.on('close', (code, reason) => {
            const i = ActiveConnections.indexOf(this);
            ActiveConnections.splice(i, 1);
            showDebugInformationAboutActiveConnections();
        });
        this.mySocket.on('message', this.handleMessage.bind(this));
        this.autokillIfNoId = setTimeout(() => {
            if (!this.id) {
                // client has failed to identify itself within 2 sec
                this.sendUnidentifiedClientAndShutdown();
            }
        }, 2000);
    }

    get Id() {
        return this.id;
    }

    handleMessage(message) {
        if (!this.id) this.handleFirstMessage(message);
        else this.handleOtherMessage(message);
    }

    handleFirstMessage(message) {
        const parts = /iam (\w+)/.exec(message);
        if (!parts || !VALID_ID_LIST.includes(parts[1])) {
            this.sendUnidentifiedClientAndShutdown();
            return;
        }

        clearTimeout(this.autokillIfNoId);
        this.id = parts[1];
        ActiveConnections.push(this);
        showDebugInformationAboutActiveConnections();
    }

    handleOtherMessage(message) {
        console.log(`[${this.id}] ${message}`);
        this.mySocket.send('ACK');
    }

    sendUnidentifiedClientAndShutdown() {
        if (!this.mySocket) return;
        this.mySocket.send('Unidentified client. Terminating.');
        this.mySocket.close();
    }
}

function setupNewSocketConnection(socket) {
    new SocketConnectionManager(socket);
}

function showDebugInformationAboutActiveConnections() {
    const currentlyConnectedIds = ActiveConnections.map(c => c.Id);
    console.log(`DEBUG >>> Connections modified: ${currentlyConnectedIds}`)
}

module.exports = {
    SocketConnectionManager,
    setupNewSocketConnection
}
