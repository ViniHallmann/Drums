// 'midi:connected' → { devices: Array<string> }
// 'midi:error' → { error: Error }
// 'midi:hit' → { 
//   midiNote: number,
//   velocity: number, 
//   timestamp: number,
//   instrument: string,  // ex: 'kick'
//   lane: number         // ex: 0
// }
// 'midi:disconnected' → { reason: string }
import Logger from '../utils/Logger.js';
export default class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event, listener) {
        if (!this.events[event]) return;
        const index = this.events[event].indexOf(listener);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(data));
    }

    once(event, listener) {
        const onceListener = (data) => {
            listener(data);
            this.off(event, onceListener);
        };
        this.on(event, onceListener);
    }

    clear() {
        this.events = {};
    }
    
}

    