//constructor(eventBus, drumMap)
//- midiAccess (referência da Web MIDI API)
// - connectedInputs (array de dispositivos conectados)
// - isConnected (boolean)
// - eventBus (referência ao EventBus para emitir eventos)
// - drumMap (recebido do Config, mapeia MIDI note → lane)

export default class MIDIManager {
    constructor(eventBus, drumMap) {
        this.midiAccess = null;
        this.isConnected = false;
        this.eventBus = eventBus;
        this.drumMap = drumMap;
    }

    async init() {
        try {
            this.midiAccess = await navigator.requestMIDIAccess();

            this.isConnected = true;
            this.eventBus.emit('midi:connected');
            this.onMIDISuccess();
            return true;
        } catch (error) {
            this.isConnected = false;
            this.eventBus.emit('midi:connection_failed');
        }
    }

    getStatus() {
        return {connected: this.isConnected, device: this.midiAccess};
    }

    onMIDISuccess() {
        console.log('Acesso MIDI concedido! Conectado aos dispositivos.<br>');

        for (var input of this.midiAccess.inputs.values()) {
            input.onmidimessage = this.onMIDIMessage.bind(this);
            console.log(`Conectado à entrada: ${input.name} (ID: ${input.id})<br>`);
        }
    }

    onMIDIMessage(message) {
        const data      = message.data; 
        const command   = data[0];
        const note      = data[1];
        const velocity  = data[2];

        if ((command === 153 || command === 144) && velocity > 0) {
            const drum = this.drumMap[note];
            if (drum) {
                this.eventBus.emit('midi:hit', {
                    drum: drum,
                    note: note,
                    name: drum.name,
                    velocity: velocity,
                    timestamp: message.timeStamp,
                    lane: drum.lane
                });
            } else {
                console.warn(`MIDI Note ${note} not mapped to any drum.`);
            }
        }

    }

    onMIDIDisconnected() {
        this.isConnected = false;
        this.eventBus.emit('midi:disconnected');
    }
}




