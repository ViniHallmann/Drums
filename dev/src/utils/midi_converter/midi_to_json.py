#!/usr/bin/env python3
"""
Conversor MIDI para JSON - Simples e direto
Converte arquivos MIDI de bateria para formato do jogo
"""
import json
import sys
from pathlib import Path
from mido import MidiFile, tempo2bpm


# Mapeamento de notas MIDI para lanes (extraído do Config.js)
MIDI_MAPPING = {
    36: {'name': 'kick', 'lane': 0},
    35: {'name': 'kick', 'lane': 0},  # alias
    
    38: {'name': 'snare', 'lane': 1},
    40: {'name': 'snare', 'lane': 1},  # alias
    
    42: {'name': 'hiHatClosed', 'lane': 2},
    41: {'name': 'hiHatClosed', 'lane': 2},  # alias
    
    46: {'name': 'hiHatOpen', 'lane': 3},
    
    49: {'name': 'crashCymbal', 'lane': 4},
    
    51: {'name': 'rideCymbal', 'lane': 5},
    
    48: {'name': 'highTom', 'lane': 6},
    
    45: {'name': 'midTom', 'lane': 7},
    
    43: {'name': 'floorTom', 'lane': 8},
    44: {'name': 'floorTom', 'lane': 8},  # alias
}

# Mapeamento de nota MIDI para nota principal (resolve aliases)
MAIN_NOTE = {
    35: 36,  # kick alias -> kick
    40: 38,  # snare alias -> snare
    41: 42,  # hihat alias -> hihat closed
    43: 41,  # floor tom alias -> floor tom
    44: 41,  # floor tom alias -> floor tom
}


def detect_drum_channel(midi):
    """
    Detecta qual canal tem notas de bateria
    Retorna o primeiro canal que tem notas mapeadas
    """
    channel_notes = {}
    
    for track in midi.tracks:
        for msg in track:
            if msg.type == 'note_on' and msg.velocity > 0:
                channel = msg.channel
                if channel not in channel_notes:
                    channel_notes[channel] = []
                channel_notes[channel].append(msg.note)
    
    # Procura canal com mais notas mapeadas
    best_channel = None
    best_match = 0
    
    for channel, notes in channel_notes.items():
        mapped = sum(1 for note in notes if note in MIDI_MAPPING)
        if mapped > best_match:
            best_match = mapped
            best_channel = channel
    
    return best_channel if best_channel is not None else 9  # padrão canal 10


def convert_midi_to_json(midi_path, output_path=None, force_channel=None):
    """
    Converte arquivo MIDI para JSON do jogo
    
    Args:
        midi_path: Caminho do arquivo .mid
        output_path: Caminho de saída (opcional)
        force_channel: Força uso de canal específico (0-15)
    
    Returns:
        Dicionário com os dados convertidos
    """
    midi_path = Path(midi_path)
    
    if not midi_path.exists():
        print(f"❌ Arquivo não encontrado: {midi_path}")
        return None
    
    print(f"\n📁 Lendo: {midi_path.name}")
    
    # Carrega arquivo MIDI
    midi = MidiFile(midi_path)
    
    # Detecta canal de bateria
    if force_channel is not None:
        drum_channel = force_channel
        print(f"   🎯 Usando canal forçado: {drum_channel + 1}")
    else:
        drum_channel = detect_drum_channel(midi)
        print(f"   🎯 Canal de bateria detectado: {drum_channel + 1}")
    
    # Extrai BPM
    bpm = 120  # padrão
    for track in midi.tracks:
        for msg in track:
            if msg.type == 'set_tempo':
                bpm = round(tempo2bpm(msg.tempo))
                break
        if bpm != 120:
            break
    
    # Extrai título
    title = None
    for track in midi.tracks:
        for msg in track:
            if msg.type == 'track_name' and msg.name.strip():
                title = msg.name
                break
        if title:
            break
    
    if not title:
        title = midi_path.stem
    
    # Extrai duração
    duration = round(midi.length, 2)
    
    print(f"   ♪ Título: {title}")
    print(f"   ♪ BPM: {bpm}")
    print(f"   ♪ Duração: {duration}s")
    
    # Extrai notas do canal de bateria
    notes = []
    unmapped_notes = set()
    total_notes = 0
    
    for track in midi.tracks:
        current_time = 0
        
        for msg in track:
            current_time += msg.time
            
            # Filtra note_on do canal de bateria com velocity > 0
            if msg.type == 'note_on' and msg.channel == drum_channel and msg.velocity > 0:
                total_notes += 1
                midi_note = msg.note
                
                # Verifica se a nota está mapeada
                if midi_note in MIDI_MAPPING:
                    # Resolve alias para nota principal
                    main_note = MAIN_NOTE.get(midi_note, midi_note)
                    
                    notes.append({
                        'time': round(current_time, 3),
                        'lane': MIDI_MAPPING[midi_note]['lane'],
                        'midiNote': main_note,
                        'velocity': msg.velocity
                    })
                else:
                    unmapped_notes.add(midi_note)
    
    # Ordena por tempo
    notes.sort(key=lambda x: x['time'])
    
    print(f"   ♪ Total de notas: {total_notes}")
    print(f"   ✓ Notas mapeadas: {len(notes)}")
    
    if unmapped_notes:
        print(f"   ⚠️  Notas ignoradas (não mapeadas): {sorted(unmapped_notes)}")
    
    # Monta JSON final
    chart_data = {
        "metadata": {
            "title": title,
            "artist": None,
            "bpm": bpm,
            "duration": duration,
            "difficulty": None
        },
        "audio": {
            "backingTrack": None
        },
        "notes": notes
    }
    
    # Salva arquivo
    if output_path is None:
        output_path = Path('assets/charts') / f"{midi_path.stem}.json"
    else:
        output_path = Path(output_path)
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(chart_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Salvo em: {output_path.absolute()}")
    print(f"📊 Resumo: {len(notes)} notas convertidas")
    
    return chart_data


def main():
    """Função principal CLI"""
    if len(sys.argv) < 2:
        print("Uso: python midi_to_json.py <arquivo.mid> [saida.json] [--channel N]")
        print("\nExemplos:")
        print("  python midi_to_json.py music.mid")
        print("  python midi_to_json.py music.mid custom_name.json")
        print("  python midi_to_json.py music.mid --channel 0")
        sys.exit(1)
    
    midi_path = sys.argv[1]
    output_path = None
    force_channel = None
    
    # Parse argumentos
    for i, arg in enumerate(sys.argv[2:], start=2):
        if arg == '--channel' and i + 1 < len(sys.argv):
            force_channel = int(sys.argv[i + 1])
        elif not arg.startswith('--') and output_path is None and arg != str(force_channel):
            output_path = arg
    
    try:
        convert_midi_to_json(midi_path, output_path, force_channel)
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()