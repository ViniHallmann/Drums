import { useEffect, useRef, useState, useCallback } from 'react';
import { Chart } from '../types/Chart';
import { Score, HitResult } from '../types/Score';
import { GameLoop, GameRenderData, GameHUDState, HitFeedback, NoteRenderState } from '../core/GameLoop';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PlayProps {
  chart: Chart;
  onGameEnd: (score: Score) => void;
  onExit: () => void;
}

// ─── Constantes de rendering ──────────────────────────────────────────────────

const LOOK_AHEAD_S = 2.0;       // segundos visíveis no highway
const HIT_ZONE_RATIO = 0.82;    // posição Y da hit zone (% do canvas)
const TOP_MARGIN = 40;          // px do topo até onde as notas aparecem
const NOTE_WIDTH = 52;
const NOTE_HEIGHT = 18;
const NOTE_BORDER_RADIUS = 6;
const NUM_LANES = 9;

// Cores por drum piece
const DRUM_COLORS: Record<string, string> = {
  kick: '#FF5252',
  snare: '#448AFF',
  hihat: '#FFD740',
  'hihat-open': '#FFE082',
  'tom-high': '#69F0AE',
  'tom-mid': '#40C4FF',
  'tom-low': '#B388FF',
  crash: '#FFFFFF',
  ride: '#80D8FF',
  unknown: '#90A4AE',
};

const FEEDBACK_COLORS: Record<string, string> = {
  PERFECT: '#FFD740',
  GOOD: '#69F0AE',
  OK: '#FF9800',
  MISS: '#FF5252',
};

// ─── Função de rendering do canvas ───────────────────────────────────────────
// Fora do componente para evitar re-criações e closures stale

function renderCanvas(
  canvas: HTMLCanvasElement,
  data: GameRenderData,
  chart: Chart,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const hitZoneY = H * HIT_ZONE_RATIO;
  const highwayWidth = Math.min(W * 0.7, 600);
  const highwayLeft = (W - highwayWidth) / 2;
  const laneWidth = highwayWidth / NUM_LANES;
  const { currentTime, notes, hitFeedbacks } = data;

  // ── Fundo ───────────────────────────────────────────────────────────────
  ctx.fillStyle = '#0D0D14';
  ctx.fillRect(0, 0, W, H);

  // ── Highway: fundo gradiente ─────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, TOP_MARGIN, 0, H);
  grad.addColorStop(0, 'rgba(255,255,255,0.02)');
  grad.addColorStop(1, 'rgba(255,255,255,0.06)');
  ctx.fillStyle = grad;
  ctx.fillRect(highwayLeft, TOP_MARGIN, highwayWidth, H - TOP_MARGIN);

  // ── Linhas das lanes ─────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= NUM_LANES; i++) {
    const x = highwayLeft + i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, TOP_MARGIN);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  // ── Hit zone ─────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(highwayLeft, hitZoneY);
  ctx.lineTo(highwayLeft + highwayWidth, hitZoneY);
  ctx.stroke();

  // Glow na hit zone
  const hitZoneGlow = ctx.createLinearGradient(0, hitZoneY - 12, 0, hitZoneY + 12);
  hitZoneGlow.addColorStop(0, 'rgba(255,255,255,0)');
  hitZoneGlow.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  hitZoneGlow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hitZoneGlow;
  ctx.fillRect(highwayLeft, hitZoneY - 12, highwayWidth, 24);

  // ── Notas ────────────────────────────────────────────────────────────────
  for (const state of notes) {
    if (state.isHit) continue;

    const { note, isMissed } = state;
    const secondsUntilHit = note.timeInSeconds - currentTime;

    // Só renderiza notas dentro da janela de visibilidade
    if (secondsUntilHit > LOOK_AHEAD_S || secondsUntilHit < -0.3) continue;

    const laneIndex = Math.max(0, Math.min(note.lane - 1, NUM_LANES - 1));
    const x = highwayLeft + laneIndex * laneWidth + laneWidth / 2;
    const y = hitZoneY - (secondsUntilHit / LOOK_AHEAD_S) * (hitZoneY - TOP_MARGIN);

    const color = DRUM_COLORS[note.drumPiece] ?? DRUM_COLORS.unknown;
    const alpha = isMissed ? 0.25 : 1;

    drawNote(ctx, x, y, color, alpha);
  }

  // ── Hit feedback (Perfect / Good / Ok / Miss) ─────────────────────────────
  const now = Date.now();
  for (const feedback of hitFeedbacks) {
    const age = now - feedback.createdAt;
    const progress = age / 600; // 0 → 1 durante 600ms
    if (progress >= 1) continue;

    const laneIndex = Math.max(0, Math.min(feedback.lane - 1, NUM_LANES - 1));
    const x = highwayLeft + laneIndex * laneWidth + laneWidth / 2;
    const y = hitZoneY - 30 - progress * 40; // sobe enquanto desaparece
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = FEEDBACK_COLORS[feedback.type] ?? '#fff';
    ctx.fillText(feedback.type, x, y);
    ctx.restore();
  }
}

function drawNote(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  color: string,
  alpha: number,
): void {
  const x = cx - NOTE_WIDTH / 2;
  const y = cy - NOTE_HEIGHT / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Sombra / glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;

  // Corpo da nota
  ctx.fillStyle = color;
  roundRect(ctx, x, y, NOTE_WIDTH, NOTE_HEIGHT, NOTE_BORDER_RADIUS);
  ctx.fill();

  // Brilho interno
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, x + 2, y + 2, NOTE_WIDTH - 4, NOTE_HEIGHT / 2 - 2, NOTE_BORDER_RADIUS - 2);
  ctx.fill();

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Componente Play ──────────────────────────────────────────────────────────

export default function Play({ chart, onGameEnd, onExit }: PlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);

  const [hud, setHud] = useState<GameHUDState>({
    score: 0,
    combo: 0,
    accuracy: 0,
    progress: 0,
  });
  const [lastHitType, setLastHitType] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // ── Ajusta canvas ao tamanho da janela ───────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── Inicializa e inicia o GameLoop ───────────────────────────────────────
  useEffect(() => {
    const gameLoop = new GameLoop(chart, {
      onRender: (data: GameRenderData) => {
        const canvas = canvasRef.current;
        if (canvas) renderCanvas(canvas, data, chart);
      },
      onHUDUpdate: (hudState: GameHUDState) => {
        setHud(hudState);
      },
      onHit: (result: HitResult) => {
        setLastHitType(result.type);
        setTimeout(() => setLastHitType(null), 400);
      },
      onSongEnd: (score: Score) => {
        onGameEnd(score);
      },
    });

    gameLoopRef.current = gameLoop;

    gameLoop.initialize().then(() => {
      // Não inicia automaticamente — aguarda o usuário pressionar Play
    });

    return () => {
      gameLoop.stop();
    };
  }, [chart, onGameEnd]);

  // ── Tecla ESC para pausar ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') togglePause();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const togglePause = useCallback(() => {
    const gl = gameLoopRef.current;
    if (!gl || !isStarted) return;
    if (isPaused) {
      gl.resume();
      setIsPaused(false);
    } else {
      gl.pause();
      setIsPaused(true);
    }
  }, [isPaused, isStarted]);

  const handleStart = () => {
    gameLoopRef.current?.start();
    setIsStarted(true);
  };

  const handleRestart = () => {
    // Recarregar a página é a forma mais simples de reiniciar o GameLoop
    window.location.reload();
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0D0D14' }}>

      {/* Canvas do jogo */}
      <canvas
        ref={canvasRef}
        style={{ display: 'block', position: 'absolute', inset: 0 }}
      />

      {/* HUD — topo */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        {/* Botão voltar */}
        <button
          onClick={onExit}
          style={{ pointerEvents: 'all', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          ← Sair
        </button>

        {/* Título */}
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 600 }}>{chart.metadata.title}</div>
          <div>{chart.metadata.artist ?? 'Unknown Artist'} · {chart.metadata.bpm} BPM</div>
        </div>

        {/* Pause */}
        <button
          onClick={togglePause}
          style={{ pointerEvents: 'all', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>

      {/* HUD — score / combo / accuracy */}
      <div style={{
        position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 32, pointerEvents: 'none',
      }}>
        <HUDStat label="SCORE" value={hud.score.toLocaleString()} />
        <HUDStat label="COMBO" value={`${hud.combo}x`} highlight={hud.combo >= 10} />
        <HUDStat label="ACCURACY" value={`${hud.accuracy.toFixed(1)}%`} />
      </div>

      {/* Progress bar — rodapé */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 4,
        background: 'rgba(255,255,255,0.1)',
        pointerEvents: 'none',
      }}>
        <div style={{
          height: '100%',
          width: `${hud.progress * 100}%`,
          background: 'linear-gradient(to right, #448AFF, #69F0AE)',
          transition: 'width 0.1s linear',
        }} />
      </div>

      {/* Legenda do teclado (só quando não started) */}
      {!isStarted && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', pointerEvents: 'none',
        }}>
          Teclado: <kbd style={kbdStyle}>A</kbd> Kick · <kbd style={kbdStyle}>S</kbd> Snare · <kbd style={kbdStyle}>D</kbd> Hi-hat ·
          <kbd style={kbdStyle}>F</kbd> Hi-hat open · <kbd style={kbdStyle}>J</kbd> Tom↑ · <kbd style={kbdStyle}>K</kbd> Tom · <kbd style={kbdStyle}>L</kbd> Tom↓
        </div>
      )}

      {/* Tela de início */}
      {!isStarted && (
        <Overlay>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              {chart.metadata.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
              {chart.metadata.bpm} BPM · {chart.metadata.difficulty} · {Math.ceil(chart.metadata.duration)}s
            </div>
            <button onClick={handleStart} style={primaryBtnStyle}>
              ▶ Iniciar
            </button>
          </div>
        </Overlay>
      )}

      {/* Menu de pausa */}
      {isPaused && isStarted && (
        <Overlay>
          <div style={{ textAlign: 'center', minWidth: 220 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 24 }}>PAUSA</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={togglePause} style={primaryBtnStyle}>▶ Continuar</button>
              <button onClick={handleRestart} style={secondaryBtnStyle}>↺ Reiniciar</button>
              <button onClick={onExit} style={secondaryBtnStyle}>← Sair</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function HUDStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: highlight ? '#FFD740' : '#fff', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: '40px 48px',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Estilos inline compartilhados ───────────────────────────────────────────

const primaryBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #448AFF, #69F0AE)',
  border: 'none',
  borderRadius: 10,
  color: '#000',
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 700,
  padding: '12px 32px',
  width: '100%',
};

const secondaryBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 15,
  padding: '10px 32px',
  width: '100%',
};

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: 4,
  padding: '1px 6px',
  margin: '0 2px',
  fontFamily: 'monospace',
};