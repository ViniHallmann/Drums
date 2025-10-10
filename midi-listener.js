const outputElement = document.getElementById('output');

if (navigator.requestMIDIAccess) {
    console.log('Ótimo! Seu navegador suporta a Web MIDI API.');
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
    console.error('Que pena! Seu navegador não suporta a Web MIDI API.');
    outputElement.innerHTML = 'Seu navegador não suporta a Web MIDI API. Tente usar o Google Chrome ou Microsoft Edge.';
}

function onMIDISuccess(midiAccess) {
    outputElement.innerHTML = 'Acesso MIDI concedido! Conectado aos dispositivos.<br>';
    console.log(midiAccess);

    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = handleMIDIMessage;
        let logMessage = `Conectado à entrada: ${input.name} (ID: ${input.id})<br>`;
        outputElement.innerHTML += logMessage;
    }
}

function onMIDIFailure() {
    const errorMessage = 'Erro! Não foi possível acessar seus dispositivos MIDI.';
    console.error(errorMessage);
    outputElement.innerHTML = errorMessage;
}

function handleMIDIMessage(message) {
    const data = message.data; // O payload da mensagem MIDI
    const command = data[0];   // Comando (ex: 144 = Note On, 128 = Note Off)
    const note = data[1];      // Número da nota MIDI (0-127)
    const velocity = data[2];  // Força/Velocidade (0-127)

    // Mapeamento simples de algumas notas de bateria para nomes
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
    
    // O canal 10 (comando 153 para 'Note On') é o padrão para bateria
    // Vamos focar apenas em eventos 'Note On' (quando a nota é tocada)
    if ((command === 153 || command === 144) && velocity > 0) {
        const noteName = drumMap[note] || `Nota Desconhecida`;
        const logMessage = `<span class="note-on">Note On:</span> Peça: ${noteName} (#${note}), Força: ${velocity}`;
        
        // Adiciona a nova mensagem no topo do log
        outputElement.innerHTML = logMessage + '<br>' + outputElement.innerHTML;
        console.log(logMessage);
    }
}