import Logger from '../utils/Logger.js';
import { drumByMidiNote } from '../domain/instruments';

export default class MIDIManager {
    constructor(eventBus) {
        this.midiAccess = null;
        this.isConnected = false;
        this.eventBus = eventBus;
    }

    async init() {
        try {
            //this.midiAccess = await MIDIManager._getMIDIAccess();
            this.isConnected = true;
            this.eventBus.emit('midi:connected');
            //this.onMIDISuccess();
            return true;
        } catch (error) {
            this.isConnected = false;
            Logger.error('Falha ao inicializar MIDI', error);
            this.eventBus.emit('midi:connection_failed');
        }
    }

    static _getMIDIAccess() {
        return navigator
            .requestMIDIAccess()
            .then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
    }

    getStatus() {
        return { connected: this.isConnected, device: this.midiAccess };
    }

    onMIDISuccess() {
        //Logger.info('MIDI ready!');

        for (const input of this.midiAccess.inputs.values()) {
            input.onmidimessage = this.onMIDIMessage.bind(this);
            Logger.info(`Conectado à entrada MIDI: ${input.name} (ID: ${input.id})`);
        }
    }

    onMIDIMessage(message) {
        const data = message.data;
        const command = data[0];
        const note = data[1];
        const velocity = data[2];

        if ((command === 153 || command === 144) && velocity > 0) {
            const drum = drumByMidiNote.get(note);
            if (drum) {
                this.eventBus.emit('midi:hit', {
                    drum: drum,
                    note: note,
                    name: drum.name,
                    velocity: velocity,
                    timestamp: message.timeStamp,
                    lane: drum.lane,
                });
            } //else {

            //Logger.warn(`Note not mapped: ${note}`);
            //}
        }
    }

    onMIDIDisconnected() {
        this.isConnected = false;
        this.eventBus.emit('midi:disconnected');
    }
}
