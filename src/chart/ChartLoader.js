import Logger from '../utils/Logger.js';
import { ticksToSeconds, beatsToSeconds } from '../domain/timing';
import { validateChart, DEFAULT_TICKS_PER_BEAT } from '../domain/chart';

export default class ChartLoader {
    constructor(config) {
        this.config = config;
        this.chartsPath = 'assets/charts/';
        this.availableCharts = ['01-basic-rock-beat.json', 'rock-groove-easy.json'];
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
            Logger.error('Erro ao carregar chart:', error);
            throw error;
        }
    }

    processChart(chartData) {
        const issues = validateChart(chartData);
        for (const issue of issues) {
            Logger.warn(
                `Chart '${chartData.metadata?.title ?? '?'}' inconsistente [nota ${issue.index}]: ${issue.message}`,
            );
        }

        const bpm = chartData.metadata?.bpm || 120;
        const timeUnit = chartData.metadata?.timeUnit ?? 'ticks';
        const ticksPerBeat = chartData.metadata?.ticksPerBeat ?? DEFAULT_TICKS_PER_BEAT;

        const toSeconds = (time) => {
            if (timeUnit === 'seconds') return time;
            if (timeUnit === 'beats') return beatsToSeconds(time, bpm);
            return ticksToSeconds(time, bpm, ticksPerBeat);
        };

        const processedNotes = chartData.notes.map((note) => ({
            ...note,
            time: toSeconds(note.time),
        }));

        const lastNoteTime =
            processedNotes.length > 0 ? Math.max(...processedNotes.map((n) => n.time)) : 0;

        return {
            ...chartData,
            notes: processedNotes,
            metadata: {
                ...chartData.metadata,
                duration: lastNoteTime + 2,
            },
        };
    }

    getAvailableCharts() {
        return this.availableCharts.map((chart) => ({
            filename: chart,
            path: this.chartsPath + chart,
            name: chart.replace('.json', '').replace(/-/g, ' '),
        }));
    }
}
