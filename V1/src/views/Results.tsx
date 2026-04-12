import { Score } from '../types/Score';
import { Chart } from '../types/Chart';

interface ResultsProps {
  score: Score;
  chart: Chart;
  onReplay: () => void;
  onExit: () => void;
}

export default function Results({ score, chart, onReplay, onExit }: ResultsProps) {
  const perfectCount = score.hits.filter((h) => h.type === 'PERFECT').length;
  const goodCount    = score.hits.filter((h) => h.type === 'GOOD').length;
  const earlyCount   = score.hits.filter((h) => h.type === 'EARLY').length;
  const lateCount    = score.hits.filter((h) => h.type === 'LATE').length;
  const missCount    = score.hits.filter((h) => h.type === 'MISS').length;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0D14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      color: '#fff',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {chart.metadata.difficulty} · {chart.metadata.bpm} BPM
          </div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{chart.metadata.title}</div>
          {chart.metadata.artist && (
            <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{chart.metadata.artist}</div>
          )}
        </div>

        {/* Score + Stars */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '28px 24px',
          textAlign: 'center',
          marginBottom: 16,
        }}>
          <StarRating stars={score.stars} />
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1, marginTop: 8 }}>
            {score.totalScore.toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>PONTUAÇÃO</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20 }}>
            <StatPill label="Accuracy" value={`${score.accuracy.toFixed(1)}%`} color="#69F0AE" />
            <StatPill label="Max Combo" value={`${score.maxCombo}x`} color="#FFD740" />
          </div>
        </div>

        {/* Breakdown de hits */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 14 }}>
            BREAKDOWN
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            <HitBreakdown label="PERFECT" count={perfectCount} color="#FFD740" />
            <HitBreakdown label="GOOD"    count={goodCount}    color="#69F0AE" />
            <HitBreakdown label="EARLY"   count={earlyCount}   color="#FF9800" />
            <HitBreakdown label="LATE"    count={lateCount}    color="#FF9800" />
            <HitBreakdown label="MISS"    count={missCount}    color="#FF5252" />
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onExit} style={secondaryBtnStyle}>← Menu</button>
          <button onClick={onReplay} style={primaryBtnStyle}>↺ Tentar Novamente</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StarRating({ stars }: { stars: number }) {
  return (
    <div style={{ fontSize: 32, letterSpacing: 4 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ opacity: i < stars ? 1 : 0.2 }}>⭐</span>
      ))}
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function HitBreakdown({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{
      textAlign: 'center',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 10,
      padding: '12px 4px',
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{count}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const primaryBtnStyle: React.CSSProperties = {
  flex: 2,
  background: 'linear-gradient(135deg, #448AFF, #69F0AE)',
  border: 'none',
  borderRadius: 10,
  color: '#000',
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 700,
  padding: '14px 20px',
};

const secondaryBtnStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 15,
  padding: '14px 20px',
};