export default class ChartLoader {
    constructor(config) {
        this.config = config;
        this.chartsPath = 'assets/charts/';
        this.availableCharts = [
            '01-basic-rock-beat.json'
            // Adicione mais charts aqui conforme necessário
        ];
    }

    /**
     * Carrega um chart específico
     */
    async loadChart(chartPath) {
        try {
            const response = await fetch(chartPath);
            if (!response.ok) {
                throw new Error(`Failed to load chart: ${response.statusText}`);
            }
            
            const chartData = await response.json();
            
            // Converte os tempos das notas de ticks para segundos
            const processedChart = this.processChart(chartData);
            
            return processedChart;
        } catch (error) {
            console.error('Error loading chart:', error);
            throw error;
        }
    }

    /**
     * Processa o chart convertendo tempos e validando dados
     */
    processChart(chartData) {
        const bpm = chartData.metadata?.bpm || 120;
        const ticksPerBeat = 128; // Baseado no padrão do seu chart
        
        // Converte notas de ticks para segundos
        const processedNotes = chartData.notes.map(note => ({
            ...note,
            time: this.convertTicksToSeconds(note.time, bpm, ticksPerBeat)
        }));

        // Calcula duração baseada na última nota
        const lastNoteTime = processedNotes.length > 0 
            ? Math.max(...processedNotes.map(n => n.time))
            : 0;
        
        return {
            ...chartData,
            notes: processedNotes,
            metadata: {
                ...chartData.metadata,
                duration: lastNoteTime + 2 // +2 segundos de buffer
            }
        };
    }

    /**
     * Converte ticks MIDI para segundos
     */
    convertTicksToSeconds(ticks, bpm = 120, ticksPerBeat = 128) {
        const beatsPerSecond = bpm / 60;
        const ticksPerSecond = ticksPerBeat * beatsPerSecond;
        return ticks / ticksPerSecond;
    }

    /**
     * Lista charts disponíveis
     */
    getAvailableCharts() {
        return this.availableCharts.map(chart => ({
            filename: chart,
            path: this.chartsPath + chart,
            name: chart.replace('.json', '').replace(/-/g, ' ')
        }));
    }
}