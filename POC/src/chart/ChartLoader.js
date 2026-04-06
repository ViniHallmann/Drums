export default class ChartLoader {
    constructor(config) {
        this.config = config;
        this.chartsPath = 'assets/charts/';
        this.availableCharts = [
            '01-basic-rock-beat.json',
            'rock-groove-easy.json',
        ];
    }

    async loadChart(chartPath) {
        try {
            const response = await fetch(chartPath);
            if (!response.ok) {
                throw new Error(`Failed to load chart: ${response.statusText}`);
            }
            
            const chartData = await response.json();
            
            const processedChart = this.processChart(chartData);
            
            return processedChart;
        } catch (error) {
            console.error('Error loading chart:', error);
            throw error;
        }
    }

    processChart(chartData) {
        const bpm = chartData.metadata?.bpm || 120;
        const ticksPerBeat = 128;
        
        const processedNotes = chartData.notes.map(note => ({
            ...note,
            time: this.convertTicksToSeconds(note.time, bpm, ticksPerBeat)
        }));

        const lastNoteTime = processedNotes.length > 0 
            ? Math.max(...processedNotes.map(n => n.time))
            : 0;
        
        return {
            ...chartData,
            notes: processedNotes,
            metadata: {
                ...chartData.metadata,
                duration: lastNoteTime + 2
            }
        };
    }

    convertTicksToSeconds(ticks, bpm = 120, ticksPerBeat = 128) {
        const beatsPerSecond = bpm / 60;
        const ticksPerSecond = ticksPerBeat * beatsPerSecond;
        return ticks / ticksPerSecond;
    }

    getAvailableCharts() {
        return this.availableCharts.map(chart => ({
            filename: chart,
            path: this.chartsPath + chart,
            name: chart.replace('.json', '').replace(/-/g, ' ')
        }));
    }
}