export default class MetronomeVisual {
    constructor(metronome, config) {
        this.metronome = metronome;
        this.config = config;
        
        this.beatSpacing = config.metronome.beatSpacing 
        this.beatRadius  = config.metronome.beatRadius 

        this.inactiveColor    = config.metronome.inactiveColor 
        this.inactiveBorder   = config.metronome.inactiveBorder 
        this.activeColor      = config.metronome.activeColor 
        this.downbeatColor    = config.metronome.downbeatColor 
        this.textColor        = config.metronome.textColor 
        this.activeTextColor  = config.metronome.activeTextColor 
    }
    
    render(renderer) {
        const currentBeat  = this.metronome.getCurrentBeat();
        const beatFraction = this.metronome.getBeatFraction();
        const beatsPerBar  = this.metronome.beatsPerBar;
        
        const centerX = 75;
        const totalWidth = (beatsPerBar - 1) * this.beatSpacing;
        const startX = centerX - (totalWidth / 2);
        const y = 25;
        
        for (let i = 0; i < beatsPerBar; i++) {
            const x = startX + (i * this.beatSpacing);
            
            let color, alpha, radius;
            
            if (i === currentBeat) {
                const pulse = Math.max(0, 1 - (beatFraction * 4));
                color = i === 0 ? this.downbeatColor : this.activeColor;
                alpha = 0.5 + (pulse * 0.5);
                radius = this.beatRadius + (pulse * 5);
            } else {
                color = this.inactiveColor;
                alpha = 0.3;
                radius = this.beatRadius;
            }
            
            renderer.drawCircle(x, y, radius, color, { alpha: alpha });
            
            renderer.drawText( String(i + 1), x, y, {
                    font: 'bold 13px sans-serif',
                    color: i === currentBeat ? this.activeTextColor : this.textColor,
                    align: 'center',
                    baseline: 'middle'
                }
            );
        }
        
        renderer.drawText( `${this.metronome.getBPM()} BPM`, startX + totalWidth + 70, y, {
                font: '13px monospace',
                color: '#6a6a6a',
                align: 'left',
                baseline: 'middle'
            }
        );
    }
}
