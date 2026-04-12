import React, { useRef, useEffect, useImperativeHandle } from 'react';
import { DRUM_ORDER, DRUM_LABELS, DRUM_COLORS, FEEDBACK_COLORS, GAME_CONFIG } from '../../constants/game';
import { Chart } from '../../types/Chart';
import { GameRenderData } from '../../core/GameLoop';

export interface HighwayRef {
  renderFrame: (data: GameRenderData) => void;
}

interface HighwayProps {
  chart: Chart | null;
}

const NUM_LANES = Object.keys(DRUM_ORDER).length;
const NOTE_HEIGHT = GAME_CONFIG.LANE_HEIGHT - 10;

function drawNote(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  color: string,
  alpha: number,
): void {
  const x = cx - GAME_CONFIG.NOTE_WIDTH / 2;
  const y = cy - NOTE_HEIGHT / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.shadowColor = color;
  ctx.shadowBlur = 12;

  ctx.fillStyle = color;
  roundRect(ctx, x, y, GAME_CONFIG.NOTE_WIDTH, NOTE_HEIGHT, GAME_CONFIG.NOTE_BORDER_RADIUS);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, x + 2, y + 2, GAME_CONFIG.NOTE_WIDTH - 4, NOTE_HEIGHT / 2 - 2, GAME_CONFIG.NOTE_BORDER_RADIUS - 2);
  ctx.fill();

  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

export const Highway = React.forwardRef<HighwayRef, HighwayProps>(({ chart }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const drumEntries = Object.entries(DRUM_ORDER).sort((a, b) => a[1] - b[1]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth || 800;
    canvas.height = container.clientHeight || 600;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      }
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    renderFrame: (data: GameRenderData) => {
      const canvas = canvasRef.current;
      if (!canvas || !chart) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = Math.max(canvas.height, GAME_CONFIG.HIGHWAY_TOP_MARGIN + NUM_LANES * GAME_CONFIG.LANE_HEIGHT);
      const PIXELS_PER_SECOND = (W - GAME_CONFIG.HIT_LINE_OFFSET) / GAME_CONFIG.LOOK_AHEAD_S;

      const { currentTime, notes, hitFeedbacks, beatFraction, isDownbeat } = data;

      // Fundo
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);

      // Pista de Rolamento (Linhas horizontais)
      ctx.lineWidth = 1;
      for (let i = 0; i < NUM_LANES; i++) {
        const y = GAME_CONFIG.HIGHWAY_TOP_MARGIN + i * GAME_CONFIG.LANE_HEIGHT;
        
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, y, W, GAME_CONFIG.LANE_HEIGHT);

        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      const base_y = GAME_CONFIG.HIGHWAY_TOP_MARGIN + NUM_LANES * GAME_CONFIG.LANE_HEIGHT;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(0, base_y);
      ctx.lineTo(W, base_y);
      ctx.stroke();

      // Área da Janela de Hit
      const windowMs = 150; 
      const windowPx = (windowMs / 1000) * PIXELS_PER_SECOND;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(GAME_CONFIG.HIT_LINE_OFFSET - windowPx, GAME_CONFIG.HIGHWAY_TOP_MARGIN, windowPx * 2, NUM_LANES * GAME_CONFIG.LANE_HEIGHT);

      // Pulso Metronomo na HitLine
      const flashAlpha = Math.max(0, 1 - (beatFraction * 4));
      
      // Linha do Hit Detector
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2 + (flashAlpha * 2);
      ctx.beginPath();
      ctx.moveTo(GAME_CONFIG.HIT_LINE_OFFSET, GAME_CONFIG.HIGHWAY_TOP_MARGIN);
      ctx.lineTo(GAME_CONFIG.HIT_LINE_OFFSET, base_y);
      ctx.stroke();

      ctx.shadowColor = isDownbeat ? '#ffffff' : '#eab308';
      ctx.shadowBlur = 10 + (flashAlpha * 10);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Notas
      for (const state of notes) {
        if (state.isHit) continue;

        const { note, isMissed } = state;
        const secondsUntilHit = note.timeInSeconds - currentTime;

        if (secondsUntilHit > GAME_CONFIG.LOOK_AHEAD_S || secondsUntilHit < -0.3) continue;
        
        const drumName = note.drumPiece || 'unknown';
        const laneIndex = DRUM_ORDER[drumName] !== undefined ? DRUM_ORDER[drumName] : -1;
        
        if (laneIndex === -1) continue;

        const x = GAME_CONFIG.HIT_LINE_OFFSET + (secondsUntilHit * PIXELS_PER_SECOND);
        const y = GAME_CONFIG.HIGHWAY_TOP_MARGIN + laneIndex * GAME_CONFIG.LANE_HEIGHT + GAME_CONFIG.LANE_HEIGHT / 2;

        const color = DRUM_COLORS[drumName] ?? DRUM_COLORS.unknown;
        const alpha = isMissed ? 0.3 : 1; 

        drawNote(ctx, x, y, color, alpha);
      }

      // Feedbacks
      const now = Date.now();
      for (const feedback of hitFeedbacks) {
        const age = now - feedback.createdAt;
        const progress = age / 600; 
        if (progress >= 1) continue;
        
        const y = GAME_CONFIG.HIGHWAY_TOP_MARGIN + NUM_LANES * GAME_CONFIG.LANE_HEIGHT + 30 - progress * 20; 
        const alpha = 1 - progress;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = FEEDBACK_COLORS[feedback.type] ?? '#fff';
        ctx.fillText(feedback.type, GAME_CONFIG.HIT_LINE_OFFSET, y);
        ctx.restore();
      }
    }
  }));

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', backgroundColor: '#111111', overflow: 'hidden' }}>
      {/* Barra lateral fixa de Instrumentos */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '12rem', backgroundColor: '#1a1a1a', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', zIndex: 10, flexShrink: 0, paddingTop: `${GAME_CONFIG.HIGHWAY_TOP_MARGIN}px` }}>
        {drumEntries.map(([drumPiece, laneIndex]) => {
          const name = DRUM_LABELS[laneIndex];
          const color = DRUM_COLORS[drumPiece] || DRUM_COLORS.unknown;
          return (
            <div 
              key={drumPiece} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '1rem', paddingRight: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', borderBottomWidth: '1px', borderColor: '#222', height: `${GAME_CONFIG.LANE_HEIGHT}px` }}
            >
              <div 
                style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', marginRight: '0.75rem', backgroundColor: color }} 
              />
              {name}
            </div>
          );
        })}
      </div>

      {/* Área da Pista de Rolamento (Canvas ou DIVs) */}
      <div ref={containerRef} style={{ position: 'relative', flex: '1 1 0%', backgroundColor: '#0a0a0a' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
});