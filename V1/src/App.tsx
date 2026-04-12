import { useState, useMemo } from 'react';
import { ChartParser } from './core/ChartParser';
import { Chart } from './types/Chart';
import { Score } from './types/Score';
import { ChartJSON } from './types/Chart';
import sampleChartJson from './assets/charts/01-basic-rock-beat.json';
import Play from './views/Play';
import Results from './views/Results';
import { AppScreen } from './types/Screens';


export default function App() {
  //const [screen, setScreen] = useState<AppScreen>('menu');
  const [screen, setScreen] = useState<AppScreen>('playing');
  const [lastScore, setLastScore] = useState<Score | null>(null);

  //Parseia o chart uma única vez
  const chart: Chart = useMemo(() => {
    const parser = new ChartParser();
    return parser.parse(sampleChartJson as unknown as ChartJSON);
  }, []);

  const handleGameEnd = (score: Score) => {
    setLastScore(score);
    setScreen('results');
  };

  const handleReplay = () => {
    setLastScore(null);
    setScreen('playing');
  };

  if (screen === 'playing') {
    return (
      <Play
        chart={chart}
        onGameEnd={handleGameEnd}
        onExit={() => setScreen('menu')}
      />
    );
  }

  if (screen === 'results' && lastScore) {
    return (
      <Results
        score={lastScore}
        chart={chart}
        onReplay={handleReplay}
        onExit={() => setScreen('menu')}
      />
    );
  }

  // ── Menu principal ───────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0D14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      color: '#fff',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>

        {/* Logo / título */}
        <div style={{ fontSize: 48, marginBottom: 8 }}>🥁</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>
          Rhythm Game
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 40, fontSize: 15 }}>
          Aprenda bateria tocando suas músicas favoritas
        </p>

        {/* Chart disponível */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 24,
          textAlign: 'left',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 12 }}>
            DISPONÍVEL AGORA
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{chart.metadata.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {chart.metadata.bpm} BPM · {chart.metadata.difficulty} · {chart.notes.length} notas
              </div>
            </div>
            <DifficultyBadge difficulty={chart.metadata.difficulty} />
          </div>
        </div>

        <button
          onClick={() => setScreen('playing')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #448AFF, #69F0AE)',
            border: 'none',
            borderRadius: 12,
            color: '#000',
            cursor: 'pointer',
            fontSize: 17,
            fontWeight: 700,
            padding: '16px 32px',
            marginBottom: 16,
          }}
        >
          ▶ Jogar
        </button>

        {/* Dica de controles */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
          Conecte uma bateria MIDI ou use o teclado como fallback.
          <br />
          <kbd style={kbdStyle}>A</kbd> Kick ·
          <kbd style={kbdStyle}>S</kbd> Snare ·
          <kbd style={kbdStyle}>D</kbd> Hi-hat ·
          <kbd style={kbdStyle}>ESC</kbd> Pausar
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     '#69F0AE',
  intermediate: '#FFD740',
  advanced:     '#FF9800',
  expert:       '#FF5252',
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const color = DIFFICULTY_COLORS[difficulty] ?? '#888';
  return (
    <span style={{
      background: `${color}22`,
      border: `1px solid ${color}55`,
      borderRadius: 6,
      color,
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 8px',
      textTransform: 'capitalize',
    }}>
      {difficulty}
    </span>
  );
}

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 4,
  padding: '1px 5px',
  margin: '0 2px',
  fontFamily: 'monospace',
  fontSize: 11,
};