// if (navigator.requestMIDIAccess) {
//     console.log('Ótimo! Seu navegador suporta a Web MIDI API.');
//     navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
// } else {
//     console.error('Que pena! Seu navegador não suporta a Web MIDI API.');
//     outputElement.innerHTML = 'Seu navegador não suporta a Web MIDI API. Tente usar o Google Chrome ou Microsoft Edge.';
// }

function getMIDIAccess() {
    return navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

getMIDIAccess();

function onMIDISuccess(midiAccess) {
    console.log('Acesso MIDI concedido! Conectado aos dispositivos.<br>');

    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = handleMIDIMessage;
        console.log(`Conectado à entrada: ${input.name} (ID: ${input.id})<br>`);

    }
}

function onMIDIFailure() {
    console.error('Erro! Não foi possível acessar seus dispositivos MIDI.');
}

function handleMIDIMessage(message) {
    const data = message.data; 
    const command = data[0];   
    const note = data[1];      
    const velocity = data[2];

    const drumMap = {
        36: 'Bumbo (Kick)',
        38: 'Caixa (Snare)',
        42: 'Chimbal Fechado (Hi-Hat)',
        46: 'Chimbal Aberto (Open Hi-Hat)',
        49: 'Prato Ataque (Crash)',
        51: 'Prato Condução (Ride)',
        48: 'Tom 1 (High Tom)',
        45: 'Tom 2 (Mid Tom)',
        41: 'Tom 3 (Floor Tom)',
    };
    
    if ((command === 153 || command === 144) && velocity > 0) {
        const noteName = drumMap[note] || `Nota Desconhecida`;
        const logMessage = `<span class="note-on">Note On:</span> Peça: ${noteName} (#${note}), Força: ${velocity}`;
        console.log(logMessage);
    }
}