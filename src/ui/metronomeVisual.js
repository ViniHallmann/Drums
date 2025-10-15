export default class MetronomeVisual {
    constructor(metronome, config) {
        this.metronome = metronome;
        this.config = config;
        
        // Posição no topo da tela
        this.x = 50;
        this.y = 30;
        this.beatSpacing = 50;
        this.beatRadius = 15;
        
        // Cores
        this.inactiveColor = '#333333';
        this.activeColor = '#48bc22';      // Verde para beats normais
        this.downbeatColor = '#b53030';    // Vermelho para downbeat
    }
    
    render(renderer) {
        const currentBeat = this.metronome.getCurrentBeat();
        const beatFraction = this.metronome.getBeatFraction();
        const beatsPerBar = this.metronome.beatsPerBar;
        
        // Desenha cada beat do compasso
        for (let i = 0; i < beatsPerBar; i++) {
            const x = this.x + (i * this.beatSpacing);
            const y = this.y;
            
            let color, alpha, radius;
            
            if (i === currentBeat) {
                // Beat ativo - pulsa baseado no beatFraction
                const pulse = Math.max(0, 1 - (beatFraction * 4));
                color = i === 0 ? this.downbeatColor : this.activeColor;
                alpha = 0.5 + (pulse * 0.5);
                radius = this.beatRadius + (pulse * 5);
            } else {
                // Beat inativo
                color = this.inactiveColor;
                alpha = 0.3;
                radius = this.beatRadius;
            }
            
            renderer.drawCircle(x, y, radius, color, { alpha: alpha });
        }
        
        // Desenha texto do BPM
        renderer.drawText(
            `${this.metronome.getBPM()} BPM`,
            this.x + (beatsPerBar * this.beatSpacing) + 20,
            this.y,
            {
                font: '14px sans-serif',
                color: '#888888',
                align: 'left',
                baseline: 'middle'
            }
        );
    }
}