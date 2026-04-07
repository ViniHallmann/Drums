import { useEffect, useRef, useState, useCallback } from 'react';
import { Chart } from '../types/Chart';
import { Score, HitResult } from '../types/Score';
import { GameLoop, GameRenderData, GameHUDState } from '../core/GameLoop';
import { Highway, HighwayRef } from '../components/game/Highway';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PlayProps {
  chart: Chart;
  onGameEnd: (score: Score) => void;
  onExit: () => void;
}

// ─── Componente Play ──────────────────────────────────────────────────────────

export default function Play({ chart, onGameEnd, onExit }: PlayProps) {
  const gameLoopRef = useRef<GameLoop | null>(null);
  const highwayRef = useRef<HighwayRef>(null);

  const [hud, setHud] = useState<GameHUDState>({
    score: 0,
    combo: 0,
    accuracy: 0,
    progress: 0,
  });
  
  const [lastHitType, setLastHitType] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // ── Inicializa e inicia o GameLoop ───────────────────────────────────────
  useEffect(() => {
    const gameLoop = new GameLoop(chart, {
      onRender: (data: GameRenderData) => {
        // Renderiza diretamente via ref, evitando atualizações de estado 60x por segundo
        if (highwayRef.current) {
          highwayRef.current.renderFrame(data);
        }
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
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>

      {/* Componente que agora detém e orquestra inteiramente o Canvas de renderização das notas */}
      <div style={{ display: 'block', position: 'absolute', inset: 0, top: 40, bottom: 20 }}>
        <Highway ref={highwayRef} chart={chart} />
      </div>

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