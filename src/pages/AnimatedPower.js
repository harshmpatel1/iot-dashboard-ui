import React, { useEffect, useRef, useState } from 'react';

/* ─── tiny inline SVG icons ─────────────────────────────────────── */
const SunIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
    stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" fill="#fef3c7" stroke="#f59e0b"/>
    <line x1="12" y1="2"  x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
    <line x1="2"  y1="12" x2="5"  y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
  </svg>
);

const InverterIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
    stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#eff6ff" stroke="#3b82f6"/>
    <circle cx="12" cy="12" r="3" fill="#bfdbfe" stroke="#3b82f6"/>
    <line x1="12" y1="9" x2="12" y2="6"/>
    <line x1="12" y1="15" x2="12" y2="18"/>
    <line x1="9" y1="12" x2="6" y2="12"/>
    <line x1="15" y1="12" x2="18" y2="12"/>
  </svg>
);

const GridIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
    stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2"  x2="12" y2="10"/>
    <line x1="8"  y1="6"  x2="16" y2="6"/>
    <line x1="6"  y1="10" x2="18" y2="10"/>
    <path d="M6 10 L4 22" stroke="#10b981"/>
    <path d="M18 10 L20 22" stroke="#10b981"/>
    <line x1="4" y1="16" x2="20" y2="16"/>
    <line x1="3" y1="22" x2="21" y2="22"/>
  </svg>
);

/* ─── canvas-based animated flow lane ──────────────────────────── */
const FlowCanvas = ({ color, delay = 0, active = true }) => {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const startRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const W      = canvas.width;
    const H      = canvas.height;
    const cy     = H / 2;
    const TRAIL  = 48;   // total dot trail length px
    const SPEED  = 0.06; // fraction of W per second

    const draw = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000; // seconds

      ctx.clearRect(0, 0, W, H);

      /* track line */
      ctx.beginPath();
      ctx.strokeStyle = color + '28';
      ctx.lineWidth   = 4;
      ctx.lineCap     = 'round';
      ctx.moveTo(0, cy);
      ctx.lineTo(W, cy);
      ctx.stroke();

      if (active) {
        /* two offset particles for depth */
        [0, 0.5].forEach((offset) => {
          const raw   = ((elapsed * SPEED + offset) % 1);   // 0..1 along track
          const headX = raw * W;

          /* particle glow trail */
          for (let i = 0; i < TRAIL; i++) {
            const tx = headX - i * 1.1;
            if (tx < 0 || tx > W) continue;
            const alpha  = (1 - i / TRAIL) * (offset === 0 ? 0.9 : 0.45);
            const radius = (1 - i / TRAIL) * (offset === 0 ? 4 : 2.5);
            ctx.beginPath();
            ctx.arc(tx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
            ctx.fill();
          }

          /* bright leading dot */
          ctx.beginPath();
          ctx.arc(headX, cy, offset === 0 ? 4.5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [color, active]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={20}
      style={{ width: '100%', height: 20, display: 'block' }}
    />
  );
};

/* ─── node card ─────────────────────────────────────────────────── */
const Node = ({ icon: Icon, label, value, unit, sub, accentBg, accentBorder, accentText }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 6, width: 80, flexShrink: 0,
  }}>
    <div style={{
      width: 58, height: 58, borderRadius: 16,
      background: accentBg,
      border: `1.5px solid ${accentBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 2px 12px ${accentBorder}55`,
    }}>
      <Icon />
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
      {label}
    </span>
    {value != null && value !== 'N/A' ? (
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: accentText }}>
          {value}
        </span>
        <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 2 }}>{unit}</span>
      </div>
    ) : (
      <span style={{ fontSize: 11, color: '#d1d5db' }}>—</span>
    )}
    {sub && (
      <span style={{
        fontSize: 9.5, fontWeight: 600, color: accentText,
        background: accentBg, border: `1px solid ${accentBorder}`,
        borderRadius: 20, padding: '1px 7px', letterSpacing: '0.04em',
      }}>
        {sub}
      </span>
    )}
  </div>
);

/* ─── animated arrow label between nodes ───────────────────────── */
const FlowLane = ({ color, label, active }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 0, padding: '0 4px' }}>
    <span style={{
      fontSize: 9, fontWeight: 700, color,
      textTransform: 'uppercase', letterSpacing: '0.07em', opacity: active ? 1 : 0.35,
    }}>
      {label}
    </span>
    <FlowCanvas color={color} active={active} />
  </div>
);

/* ─── watts / efficiency mini-badge ────────────────────────────── */
const StatPill = ({ label, value, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    padding: '6px 14px', borderRadius: 10,
    background: color + '12', border: `1px solid ${color}30`,
  }}>
    <span style={{ fontSize: 9.5, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════ */
const AnimatedPowerFlow = ({ inputActivePower, outPutActivePower }) => {
  const inp = parseFloat(inputActivePower);
  const out = parseFloat(outPutActivePower);

  console.log('Rendering AnimatedPowerFlow with inputActivePower:', inputActivePower, 'outPutActivePower:', outPutActivePower);

  const inpActive  = !isNaN(inp) && inp > 0;
  const outActive  = !isNaN(out) && out > 0;
  const efficiency = inpActive && outActive ? Math.min(100, ((out / inp) * 100).toFixed(1)) : null;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 16,
      padding: '18px 16px 14px',
      marginBottom: 14,
      marginTop: 14,
    }}>

      {/* header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Power Flow
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: inpActive ? '#10b981' : '#e5e7eb', display: 'inline-block', boxShadow: inpActive ? '0 0 0 2px #d1fae5' : 'none' }}/>
            <span style={{ fontSize: 10.5, color: inpActive ? '#059669' : '#9ca3af', fontWeight: 600 }}>
              {inpActive ? 'Live' : 'Idle'}
            </span>
          </div>
          {efficiency && (
            <span style={{ fontSize: 10.5, fontWeight: 600, color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 20, padding: '1px 8px' }}>
              η {efficiency}%
            </span>
          )}
        </div>
      </div>

      {/* main flow row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Node
          icon={SunIcon}
          label="Solar"
          value={inpActive ? inp : null}
          unit="kW"
          sub={inpActive ? 'Generating' : null}
          accentBg="#fffbeb"
          accentBorder="#fde68a"
          accentText="#b45309"
        />

        <FlowLane color="#f59e0b" label="DC in" active={inpActive} />

        <Node
          icon={InverterIcon}
          label="Inverter"
          value={null}
          accentBg="#eff6ff"
          accentBorder="#bfdbfe"
          accentText="#1d4ed8"
          sub="DC → AC"
        />

        <FlowLane color="#10b981" label="AC out" active={outActive} />

        <Node
          icon={GridIcon}
          label="Grid"
          value={outActive ? out : null}
          unit="kW"
          sub={outActive ? 'Exporting' : null}
          accentBg="#ecfdf5"
          accentBorder="#a7f3d0"
          accentText="#047857"
        />

      </div>

      {/* bottom stat pills */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <StatPill
          label="Input"
          value={inpActive ? `${inp} kW` : '—'}
          color="#f59e0b"
        />
        <StatPill
          label="Output"
          value={outActive ? `${out} kW` : '—'}
          color="#10b981"
        />
        {efficiency && (
          <StatPill label="Efficiency" value={`${efficiency}%`} color="#8b5cf6" />
        )}
        {inpActive && outActive && (
          <StatPill
            label="Loss"
            value={`${Math.max(0, (inp - out)).toFixed(2)} kW`}
            color="#ef4444"
          />
        )}
      </div>

    </div>
  );
};

export default AnimatedPowerFlow;