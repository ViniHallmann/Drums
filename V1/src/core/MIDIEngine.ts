export class MIDIEngine {
    private midiAccess: MIDIAccess | null = null;
    private inputDevice: MIDIInput | null = null;
    private onNoteCallback: ((note: number, velocity: number) => void) | null = null;

    async initialize(): Promise<void> {
        try {
        this.midiAccess = await navigator.requestMIDIAccess();
        console.log('MIDI Access granted');
        } catch (error) {
        throw new Error('Failed to get MIDI access: ' + error);
        }
    }

    getDevices(): MIDIInput[] {
        if (!this.midiAccess) return [];
        return Array.from(this.midiAccess.inputs.values());
    }

    selectDevice(deviceId: string): void {
        if (!this.midiAccess) return;
        
        const device = this.midiAccess.inputs.get(deviceId);
        if (!device) {
        throw new Error('Device not found');
        }

        // Remove listener anterior
        if (this.inputDevice) {
        this.inputDevice.onmidimessage = null;
        }

        this.inputDevice = device;
        this.inputDevice.onmidimessage = this.handleMIDIMessage.bind(this);
    }

    onNote(callback: (note: number, velocity: number) => void): void {
        this.onNoteCallback = callback;
    }

    private handleMIDIMessage(event: MIDIMessageEvent): void {
        const [status, note, velocity] = event.data;
        
        // Note On (144-159) com velocity > 0
        if (status >= 144 && status <= 159 && velocity > 0) {
        this.onNoteCallback?.(note, velocity);
        }
    }

    dispose(): void {
        if (this.inputDevice) {
        this.inputDevice.onmidimessage = null;
        }
    }
}