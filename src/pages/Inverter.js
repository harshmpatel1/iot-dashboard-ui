import {
  Zap, RefreshCcw, AlertCircle, CheckCircle2, Activity,
  Upload, Settings, Calendar, Sigma, Radio, Clock,
  Download, ChevronDown, Waves, Wind, BatteryCharging,
  Cpu, Hash, GitBranch, Server, PlugZap, Gauge,
  Shield, Info,
} from 'lucide-react';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ParamGraph from './ParamGraph';
import AnimatedPowerFlow from './AnimatedPower';
import { downloadInverterDataCSV } from '../api/mockApis';
import { url } from '../constants/serverInfo';
import { useAuth } from '../hooks/useAuth';
import { useParams } from 'react-router-dom';

let runStateMap = {0:'Unknown',1:'Unknown',2:'Unknown',3:'Unknown',4:'Unknown',5:'OTA',6:'Self Check',7:'Running',8:'Pause',9:'Fault'}

/* ═══════════════════════════════════════════════════════════════
   STATIC MAPS
   ═══════════════════════════════════════════════════════════════ */

   function getStatus(code) {
  const statusMap = {
    0: "No battery",
    1: "Fault",
    2: "Sleep",
    3: "Start",
    4: "Charging",
    5: "Discharge",
    6: "OFF",
    7: "Wake Up"
  };

  return statusMap[code] || "Unknown Status";
}


const STATUS_MAPS = {
  HYBRID: {
    0:'Initial Power On', 1:'Standby',  2:'Start',           3:'Grid Connected',
    4:'Off-grid',         5:'DG Mode',  6:'Grid → Off-grid',  7:'Off-grid → Grid',
    8:'Power Failure',    9:'Shutdown', 10:'Fault',           11:'Upgrading',
  },
  GTI_Abore_3phase: {
    0:'Initial Power On', 1:'Standby',  2:'Start',           3:'Grid Connected',
    4:'Off-grid',         5:'DG Mode',  6:'Grid → Off-grid',  7:'Off-grid → Grid',
    8:'Power Failure',    9:'Shutdown', 10:'Fault',           11:'Upgrading',
  },
  GTI_1_3:          { 0:'Stand By', 1:'Self Test', 2:'Normal', 3:'Alarm',          4:'Fault'          },
  ThinkPower_1_3:   { 0:'Stand By', 1:'Grid Connected',        2:'Off-grid Backup', 3:'Fault'         },
  GTI_Abore_1phase: { 0:'Wait',     1:'Running',   2:'Fault',  3:'Burn'                               },
  NonGTI:           { 0:'Normal',   1:'Fault',     2:'Charging', 3:'Discharging'                      },
  WATECH: {0:'Unknown',1:'Unknown',2:'Unknown',3:'Unknown',4:'Unknown',5:'OTA',6:'Self Check',7:'Running',8:'Pause',9:'Fault'}
 

};

const TYPE_MAPPER = {
  ThinkPower_1_3:'thinkpower', GTI_1_3:'deye',
  GTI_Abore_3phase:'afor3phase', GTI_Abore_1phase:'afor1phase',
  Afore_Hybrid:"afor3phasehybrid", SRNE_Hybrid: 'SRNE_Hybrid',
  WATECH:"WATECH"
};

/* Status badge — can't be pure Tailwind because the values are runtime strings */
const STATUS_STYLES = {
  'Grid Connected': 'bg-green-100 text-green-700',
  'Normal':         'bg-green-100 text-green-700',
  'Running':        'bg-green-100 text-green-700',
  'Charging':       'bg-blue-100  text-blue-700',
  'Discharging':    'bg-yellow-100 text-yellow-700',
  'Standby':        'bg-gray-100  text-gray-600',
  'Stand By':       'bg-gray-100  text-gray-600',
  'Fault':          'bg-red-100   text-red-700',
  'Burn':           'bg-red-100   text-red-700',
  _def:             'bg-gray-100  text-gray-700',
};
const STATUS_DOT = {
  'Grid Connected':'bg-green-500','Normal':'bg-green-500','Running':'bg-green-500',
  'Charging':'bg-blue-500','Discharging':'bg-yellow-500',
  'Standby':'bg-gray-400','Stand By':'bg-gray-400',
  'Fault':'bg-red-500','Burn':'bg-red-500',
  _def:'bg-gray-400',
};

/*
  Dynamic accent colours can NOT be expressed as static Tailwind classes
  (Tailwind purges classes it doesn't see in source).
  Strategy: use inline style ONLY for the per-card accent bar colour (#bar)
  and keep every layout / spacing / typography token as Tailwind.
*/

/* Per-card themes — only the dynamic hex values; everything else is Tailwind */
const CARD_CFG = {
  dcVoltage: { bar:'#3b82f6', hBg:'bg-blue-50',   hText:'text-blue-800',   hBd:'border-blue-200',  alt:'bg-blue-50/40'  },
  dcCurrent: { bar:'#10b981', hBg:'bg-emerald-50', hText:'text-emerald-800',hBd:'border-emerald-200',alt:'bg-emerald-50/40'},
  dcPower:   { bar:'#f97316', hBg:'bg-orange-50',  hText:'text-orange-800', hBd:'border-orange-200', alt:'bg-orange-50/40' },
  phaseA:    { bar:'#8b5cf6', hBg:'bg-violet-50',  hText:'text-violet-800', hBd:'border-violet-200', alt:'bg-violet-50/40' },
  phaseB:    { bar:'#ec4899', hBg:'bg-pink-50',    hText:'text-pink-800',   hBd:'border-pink-200',   alt:'bg-pink-50/40'   },
  phaseC:    { bar:'#06b6d4', hBg:'bg-cyan-50',    hText:'text-cyan-800',   hBd:'border-cyan-200',   alt:'bg-cyan-50/40'   },
  battery:   { bar:'#f59e0b', hBg:'bg-amber-50',   hText:'text-amber-800',  hBd:'border-amber-200',  alt:'bg-amber-50/40'  },
  battery2:  { bar:'#a855f7', hBg:'bg-purple-50',  hText:'text-purple-800', hBd:'border-purple-200', alt:'bg-purple-50/40' },
  pv:        { bar:'#ef4444', hBg:'bg-red-50',     hText:'text-red-800',    hBd:'border-red-200',    alt:'bg-red-50/40'    },
  acOutput:  { bar:'#14b8a6', hBg:'bg-teal-50',    hText:'text-teal-800',   hBd:'border-teal-200',   alt:'bg-teal-50/40'   },
  eps:       { bar:'#64748b', hBg:'bg-slate-50',   hText:'text-slate-700',  hBd:'border-slate-200',  alt:'bg-slate-50/40'  },
};

/* Section panel themes */
const SECTION_CFG = {
  dcInputs: {
    from:'from-slate-900', to:'to-blue-900',
    bodyBg:'bg-blue-50/60', bodyBd:'border-blue-200',
    badge:'bg-blue-500/20 border-blue-400/40 text-blue-300',
    ring:'ring-blue-500/20',
  },
  acGrid: {
    from:'from-slate-900', to:'to-violet-900',
    bodyBg:'bg-violet-50/60', bodyBd:'border-violet-200',
    badge:'bg-violet-500/20 border-violet-400/40 text-violet-300',
    ring:'ring-violet-500/20',
  },
  deviceDetails: {
    from:'from-slate-900', to:'to-amber-900',
    bodyBg:'bg-amber-50/60', bodyBd:'border-amber-200',
    badge:'bg-amber-500/20 border-amber-400/40 text-amber-300',
    ring:'ring-amber-500/20',
  },
  hybrid: {
    from:'from-slate-900', to:'to-emerald-900',
    bodyBg:'bg-emerald-50/60', bodyBd:'border-emerald-200',
    badge:'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
    ring:'ring-emerald-500/20',
  },
};

/* KPI card colour sets */
const KPI_CFG = {
  yellow: { wrap:'bg-amber-50  border-amber-200',  label:'text-amber-700',  val:'text-amber-900',  pill:'bg-amber-100'  },
  green:  { wrap:'bg-emerald-50 border-emerald-200',label:'text-emerald-700',val:'text-emerald-900',pill:'bg-emerald-100'},
  blue:   { wrap:'bg-blue-50   border-blue-200',   label:'text-blue-700',   val:'text-blue-900',   pill:'bg-blue-100'   },
  purple: { wrap:'bg-violet-50 border-violet-200', label:'text-violet-700', val:'text-violet-900', pill:'bg-violet-100' },
  teal:   { wrap:'bg-teal-50   border-teal-200',   label:'text-teal-700',   val:'text-teal-900',   pill:'bg-teal-100'   },
  rose:   { wrap:'bg-rose-50   border-rose-200',   label:'text-rose-700',   val:'text-rose-900',   pill:'bg-rose-100'   },
};

const COLLAPSE_AT = 5;

/* ═══════════════════════════════════════════════════════════════
   PURE HELPERS
═══════════════════════════════════════════════════════════════ */
const safeNum = v => (v == null || v === '' || isNaN(+v) ? null : +v);

const dcPow = (ex, v, c) => {
  if (ex != null) return ex;
  const vv = safeNum(v), cc = safeNum(c);
  return vv != null && cc != null ? ((vv * cc) / 1000).toFixed(2) : null;
};

const deriveRunStatus = (data, isGTI,Type) => {
  if (isGTI ||Type =="HYBRID") {
    const m = STATUS_MAPS[data.phase || Type];
    return m && data.RUNSTATE != null ? (m[data.RUNSTATE] ?? '—') : '—';
  }
  return STATUS_MAPS.NonGTI[data.WRKMOD] ?? String(data.WRKMOD ?? '—');
};

const deriveInputPow = (data, type, isGTI,Type) => {
  if (!isGTI) return { value: data.PPOW ?? '0', unit: 'kW' };
  if (type === 'GTI_1_3' || type === 'ThinkPower_1_3') return { value: data.INATPW, unit: 'kW' };
  if (type === 'GTI_Abore_3phase'||type =="HYBRID" || type == "WATECH") {
    const v = safeNum(data.INATPW);
    return { value: v != null ? (v / 1000).toFixed(2) : null, unit: 'kW' };
  }
  if (type === 'GTI_Abore_1phase') {
    const v1 = safeNum(data.DCVOLT1), c1 = safeNum(data.DCCURR1);
    const v2 = safeNum(data.DCVOLT2), c3 = safeNum(data.DCCURR3);
    return {
      value: v1 != null && c1 != null && v2 != null && c3 != null
        ? (((v1 * c1) + (c3 * v2)) / 1000).toFixed(2) : null,
      unit: 'kW',
    };
  }
  return { value: null, unit: 'kW' };
};

const deriveOutputPow = (data, type, isGTI,Type) => {
  if (!isGTI) return { value: data.TDYPOWERCUT ?? '0', unit: 'W' };
  if (type === 'GTI_1_3' || type === 'ThinkPower_1_3') return { value: data.OTATPW, unit: 'kW' };
  if (type === 'GTI_Abore_3phase'||type =="HYBRID" || type == "WATECH") {
    const v = safeNum(data.TTATPW);
    return { value: v != null ? (v / 1000).toFixed(2) : null, unit: 'kW' };
  }
  if (type === 'GTI_Abore_1phase') return { value: data.TTGRDPW, unit: 'kW' };
  if (type === 'GTI_Abore_1phase') return { value: data.TTGRDPW, unit: 'kW' };
  if( Type == "HYBRID"){
   return { value: ((data.TTATPW)/1000).toFixed(2), unit: 'kW' };
  }
  return { value: null, unit: 'kW' };
};

/* ═══════════════════════════════════════════════════════════════
   ATOM: STATUS BADGE
═══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const cls  = STATUS_STYLES[status]  ?? STATUS_STYLES._def;
  const dot  = STATUS_DOT[status]     ?? STATUS_DOT._def;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {status || '—'}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ATOM: ACTION BUTTON (for the dark header bar)
═══════════════════════════════════════════════════════════════ */
const ActionBtn = ({ icon: Icon, label, onClick, disabled, href, target }) => {
  const inner = (
    <button
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`
        flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-slate-200
        bg-white/10 border border-white/20 rounded-lg whitespace-nowrap
        transition-colors duration-100
        hover:bg-white/20 hover:border-white/30
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
    >
      <Icon size={13} />
      {label}
    </button>
  );
  return href
    ? <a href={href} target={target} rel="noopener noreferrer" className="no-underline">{inner}</a>
    : inner;
};

/* ═══════════════════════════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════════════════════════ */
const KpiCard = ({ icon: Icon, label, value, unit, accent }) => {
  const c = KPI_CFG[accent] ?? KPI_CFG.blue;
  return (
    <div className={`flex flex-col gap-1.5 p-3 rounded-xl border ${c.wrap}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${c.label}`}>{label}</span>
        <div className={`flex items-center justify-center w-6 h-6 rounded-md ${c.pill}`}>
          <Icon size={13} className={c.label} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold leading-none ${c.val}`}>{value ?? '—'}</span>
        {unit && <span className="text-[11px] text-slate-400 font-medium">{unit}</span>}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DATA SECTION DROPDOWN
   Every renderDataSection() call is replaced by this component.
   • Coloured top-border (3 px) identifies the card type visually.
   • Animated max-height collapse.
   • "Show N more fields" row when rows > COLLAPSE_AT.
═══════════════════════════════════════════════════════════════ */
const DataSection = ({ title, rows, theme = 'dcVoltage', icon: Icon, defaultOpen = true }) => {
  const [open,    setOpen]    = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);
  const t = CARD_CFG[theme] ?? CARD_CFG.dcVoltage;

  const hasMore = rows.length > COLLAPSE_AT;
  const visible = hasMore && !showAll ? rows.slice(0, COLLAPSE_AT) : rows;

  return (
    <div className={`flex flex-col bg-white border ${t.hBd} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200`}
         style={{ borderTopWidth: 3, borderTopColor: t.bar }}>

      {/* ── toggle header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left cursor-pointer transition-colors ${t.hBg} ${open ? `border-b ${t.hBd}` : ''}`}
      >
        {Icon && (
          <span className="flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0"
                style={{ background: t.bar + '22' }}>
            <Icon size={11} style={{ color: t.bar }} />
          </span>
        )}
        <span className={`flex-1 text-[10.5px] font-bold uppercase tracking-wider ${t.hText}`}>
          {title}
        </span>
        <span className={`text-[10px] font-medium mr-1 opacity-60 ${t.hText}`}>
          {rows.length} fields
        </span>
        <ChevronDown
          size={13}
          className="flex-shrink-0 transition-transform duration-200"
          style={{ color: t.bar, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* ── animated body ── */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? 800 : 0 }}
      >
        {visible.map(({ key, value, unit }, i) => {
          const display = value != null && value !== ''
            ? `${value}${unit ? ` ${unit}` : ''}` : null;
          return (
            <div
              key={i}
              className={`flex justify-between items-center px-3 min-h-[32px] py-1.5
                ${i % 2 === 1 ? t.alt : ''}
                ${i < visible.length - 1 ? `border-b ${t.hBd} border-opacity-40` : ''}
              `}
            >
              <span className="text-[11.5px] text-slate-500 font-medium flex-shrink-0 mr-2 whitespace-nowrap">
                {key}
              </span>
              <span className={`text-xs font-bold text-right ${display ? t.hText : 'text-slate-300'}`}>
                {display ?? 'N/A'}
              </span>
            </div>
          );
        })}

        {/* show-more toggle row */}
        {hasMore && (
          <button
            onClick={() => setShowAll(s => !s)}
            className={`w-full flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold cursor-pointer border-t ${t.hBd} ${t.hBg} ${t.hText} hover:brightness-95 transition-all`}
          >
            <ChevronDown
              size={11}
              className="transition-transform duration-200"
              style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
            {showAll
              ? 'Show less'
              : `${rows.length - COLLAPSE_AT} more field${rows.length - COLLAPSE_AT > 1 ? 's' : ''}`
            }
          </button>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION PANEL
   Groups multiple DataSection cards under one collapsible bar.
═══════════════════════════════════════════════════════════════ */
const SectionPanel = ({ title, sectionKey, icon: Icon, badge, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const s = SECTION_CFG[sectionKey] ?? SECTION_CFG.dcInputs;

  return (
    <div className={`border ${s.bodyBd} rounded-2xl overflow-hidden mb-3 shadow-sm transition-shadow duration-200 ${open ? `ring-2 ${s.ring}` : ''}`}>

      {/* dark gradient header */}
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none `}
      >
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${s.badge} flex-shrink-0`}>
            <Icon size={15} className={s.badge.split(' ').find(c => c.startsWith('text-'))} />
          </div>
          <span className="text-sm font-bold  tracking-tight">{title}</span>
          {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge} uppercase tracking-wider`}>
              {badge}
            </span>
          )}
        </div>
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 transition-transform duration-250 ${open ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown size={14} className={s.badge.split(' ').find(c => c.startsWith('text-'))} />
        </div>
      </div>

      {/* expandable body */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? 2400 : 0 }}
      >
        <div className={`p-3 ${s.bodyBg} border-t ${s.bodyBd}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   INVERTER HEADER — global collapsible dark bar
═══════════════════════════════════════════════════════════════ */
const InverterHeader = ({
  data, isGTI, softVer, macId, runStatus, fault,Type,
  inputPow, outputPow, onRefresh, onDownload, isDownloading, ROLE,
}) => {
  const [open, setOpen] = useState(false);
  const fmtDate = s => s ? s.replace('T', ' ') : 'N/A';

  const details = [
    { label: 'MAC / Serial', value: data.MAC || data.SRNO || macId, Icon: Hash },
    { label: 'Device ID',    value: data.id ?? '—',                  Icon: Cpu },
    // { label: 'Model',   value: data.phase ||data.INNM ||"_",               Icon: GitBranch },
    { label: 'Firmware',     value: softVer??'_',                  Icon: Server },
    { label: 'Last Updated', value: fmtDate(data.server_datetime||data.SERVER_DATETIME),   Icon: Clock },
    { label: 'Grid Freq',    value: (data.GRIDFREQ || data.GRDFQA || data.ACOUTFREQ) ? `${data.GRIDFREQ || data.GRDFQA || data.ACOUTFREQ} Hz` : '—', Icon: Radio },
    { label: 'Runtime',      value: data.TOTWRKTM ? `${(+data.TOTWRKTM / 60).toFixed(0)} hrs` : '—', Icon: Clock },
{
  label: 'Solar Powers',
  value: data.INATPW
    ? (data.phase === 'WATECH' || data.phase === "GTI_Abore_3phase")
      ? `${(data.INATPW / 1000).toFixed(2)} KW`
      : data.PHASE === 'Afore_Hybrid'
        ? `${(data.INATPW / 1000).toFixed(2)} KW`
        : `${data.INATPW} KW`
    : '—',
  Icon: Zap
},
    { label: 'Grid Power', value: outputPow.value ? `${outputPow.value} ${outputPow.unit}` : '—', Icon: Activity },
    { label: 'Fault',        value: fault?.Description || 'No active faults', Icon: Shield },
  ];

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden mb-3.5 shadow-md">
      {/* collapsed trigger bar */}
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer select-none bg-gradient-to-r from-slate-900 to-slate-800"
      >
        {/* left: identity */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0
            ${isGTI
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
            }`}>
            {Type}
          </span>
          <span className="text-sm font-bold text-slate-100 truncate">{data.MAC || data.SRNO || macId}</span>
          <StatusBadge status={runStatus} />
          {/* {fault?.Description && (
            <span className="inline-flex items-center gap-1 text-[11px] text-red-300 font-medium">
              <AlertCircle size={12} /> {fault?.Description}
            </span>
          )} */}
        </div>

        {/* right: actions + chevron */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
          <div className="flex gap-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
            <ActionBtn icon={isDownloading ? RefreshCcw : Download} label="Export"   onClick={onDownload} disabled={isDownloading} />
            {isGTI && (
              <ActionBtn
                icon={Settings} label="Configure"
                href={`http://eastmanone.com:5000/?macId=${macId}&inverterSerialNo=${macId}&Type=${TYPE_MAPPER[data.phase ||data.PHASE]}&Version=${softVer}&Role=${ROLE}`}
                target="_blank"
              />
            )}
            <ActionBtn icon={Upload}     label="Upload"  onClick={() => {}} />
            <ActionBtn icon={RefreshCcw} label="Refresh" onClick={onRefresh} />
          </div>
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 transition-transform duration-250 flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
            <ChevronDown size={14} className="text-slate-400" />
          </div>macId
        </div>
      </div>

      {/* expanded detail grid */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? 500 : 0 }}
      >
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0.5">
          {details.map(({ label, value, Icon }, i) => (
            <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${i % 2 === 0 ? '' : 'bg-black/[0.02]'}`}>
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-200 flex-shrink-0 mt-0.5">
                <Icon size={13} className="text-slate-500" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                <span className="text-[12.5px] font-semibold text-slate-900 truncate">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const Inverter = ({ inverterData, version, mac, onRefresh,Type }) => {

  console.log("inverterData",inverterData)
  const [isDownloading, setIsDownloading] = useState(false);
  const [fault,   setFault]   = useState(null);
  const [softVer, setSoftVer] = useState(version);
  const [macId,   setMacId]   = useState(mac);
  const [data,    setData]    = useState({});
  const [isGTI,   setIsGTI]   = useState(true);
  const [type,    setType]    = useState(null);

  const { user } = useAuth();
  const ROLE     = user?.role === 'admin' ? 'admin' : user.role == "engineer" ? 'engineer' : 'merchant';

  const runStatus = useMemo(() => deriveRunStatus(data, isGTI,Type),          [data, isGTI]);
  const inputPow  = useMemo(() => deriveInputPow(data, type, isGTI,Type),     [data, type, isGTI]);
  const outputPow = useMemo(() => deriveOutputPow(data, type, isGTI ,Type),    [data, type, isGTI]);

  useEffect(() => {
    const ctrl = new AbortController();
    if (!inverterData?.length) return () => ctrl.abort();

    const d = inverterData[0];
    console.log('Inverter data received:', d);
    setData(d);

    const hasGTI    = d.INATPW !== undefined || d.OTATPW !== undefined;
    const hasNonGTI = d.PVOLT  !== undefined || d.PCURR  !== undefined;
    const gti       = hasGTI && !hasNonGTI;

    setIsGTI(gti);
    if (d.phase || d.PHASE)  setType(d.phase || d.PHASE || null);
    if (version)  setSoftVer(version);
    setMacId(d.MAC || mac || d.SRNO || macId);

    (async () => {
      try {
        const res  = await fetch(`${url}/fault/desc?id=${d.FAULT}&phase=${d.phase}`, { signal: ctrl.signal });

        if (!res.ok) return;
        const json = await res.json();
        setFault(json?.data?.[0] ?? null);

      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      }
    })();

    return () => ctrl.abort();
  }, [inverterData, version, mac]);

  const handleDownload = useCallback(async () => {
    console.log('Initiating download for', macId, Type);
    if (!macId || !Type) return alert('No MAC ID , Type available');
    setIsDownloading(true);
    try   { await downloadInverterDataCSV(macId, Type); }
    catch { alert('Download failed. Please try again.'); }
    finally { setIsDownloading(false); }
  }, [macId, Type]);

  /* AC grid row builder */
  const acRows = phase => {
    const is3p = type === 'GTI_Abore_3phase';
    const m = {
      A: { volt: data.GRIDVOLTA, curr: data.GRIDCURRA, pow: (((data.GRIDVOLTA * data.GRIDCURRA)/1000).toFixed(2)), freq: is3p ? data.GRDFQA  : data.GRIDFREQ },
      B: { volt: data.GRIDVOLTB, curr: data.GRIDCURRB, pow: (((data.GRIDVOLTB * data.GRIDCURRB)/1000).toFixed(2)),                   freq: is3p ? data.GRDFQB  : null          },
      C: { volt: is3p ? (safeNum(data.GRIDVOLTC) != null ? Number(data.GRIDVOLTC).toFixed(2) : null) : data.GRIDVOLTC,
           curr: data.GRIDCURRC, pow: (((data.GRIDVOLTC * data.GRIDCURRC)/1000).toFixed(2)), freq: is3p ? data.GRDFQC : null },
    }[phase];
    return [
      { key: 'Voltage',   value: m.volt, unit: 'V'  },
      { key: 'Current',   value: m.curr, unit: 'A'  },
      { key: 'Power',     value: m.pow,  unit: 'KW'  },
      ...(m.freq != null ? [{ key: 'Frequency', value: m.freq, unit: 'Hz' }] : []),
    ];
  };

  /* Loading guard */
  if (!macId) return (
    <div className="flex items-center justify-center h-24 gap-3">
      <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-sm text-slate-400">Loading inverter…</span>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="px-0.5 font-sans">

      {/* 1 ─ GLOBAL COLLAPSIBLE HEADER */}
      <InverterHeader
      Type={Type}
        data={data} isGTI={isGTI} softVer={softVer} macId={macId}
        runStatus={runStatus} fault={fault} inputPow={inputPow} outputPow={outputPow}
        onRefresh={onRefresh} onDownload={handleDownload}
        isDownloading={isDownloading} ROLE={ROLE}
      />

      {/* 2 ─ PRIMARY KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
        <KpiCard icon={Calendar} label="Today's Gen"  value={isGTI ? (data.TODYGEN ?? '0') : (data.TOTENGR ?? '0')} unit="kWh"           accent="yellow" />
        <KpiCard icon={Sigma}    label="Total Gen"    value={isGTI ? (data.CUMGEN  ?? '0') : (data.CUMENGR ?? '0')} unit="kWh"           accent="green"  />
        <KpiCard icon={Zap}      label="Solar Power"  value={data.phase === 'WATECH' ? (data.INATPW ? `${Number(data.INATPW / 1000).toFixed(2)}` : '0') : (data.PHASE == 'Afore_Hybrid' || data.phase === 'GTI_Abore_3phase') ? (data.INATPW ? `${Number(data.INATPW / 1000).toFixed(2)}` : '0') : (data.INATPW ?? '0')} unit={inputPow.unit}  accent="blue"   />
        <KpiCard icon={Activity} label="Grid Power" value={outputPow.value ?? '0'}                                unit={outputPow.unit} accent="purple" />
      </div>

      {/* 3 ─ SECONDARY KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
        <KpiCard icon={Radio} label="Grid Freq" value={data.GRIDFREQ || data.GRDFQA || data.ACOUTFREQ || '0'} unit="Hz"  accent="teal" />
        <KpiCard icon={Clock} label="Runtime"   value={data.TOTWRKTM ? (+data.TOTWRKTM / 60).toFixed(0) : '—'} unit={data.TOTWRKTM ? 'hrs' : ''} accent="rose" />
        <KpiCard icon={Info}  label="Run Status" value={data.RUNSTATE ? runStatus || '—' : '—'} unit=""   accent="blue"   />
        <KpiCard
          icon={fault?.Description ? AlertCircle : CheckCircle2}
          label="Fault"
          value={fault?.Description || "NO FAULT"}
          unit=""
          accent={fault?.Description ? "Green" : 'rose'}
        />
      </div>

      {/* 4a ─ GTI: DC INPUTS */}
      {isGTI && (
        <SectionPanel title="DC Inputs" sectionKey="dcInputs" icon={Zap} badge="MPPT" defaultOpen>
          <DataSection title="DC Voltage" theme="dcVoltage" icon={Zap} defaultOpen
            rows={[
              { key: 'Voltage 1', value: data.DCVOLT1, unit: 'V' },
              { key: 'Voltage 2', value: data.DCVOLT2, unit: 'V' },
              { key: 'Voltage 3', value: data.DCVOLT3, unit: 'V' },
              { key: 'Voltage 4', value: data.DCVOLT4, unit: 'V' },
            ]}
          />
          <DataSection title="DC Current" theme="dcCurrent" icon={Waves} defaultOpen
            rows={[
              { key: 'current 1', value: data.DCCURR1, unit: 'A' },
              { key: 'current 2', value: data.DCCURR2, unit: 'A' },
              { key: 'current 3', value: data.DCCURR3, unit: 'A' },
              { key: 'current 4', value: data.DCCURR4, unit: 'A' },
            ]}
          />
          <DataSection title="DC Power" theme="dcPower" icon={Activity} defaultOpen
            rows={[
              { key: 'power 1', value: dcPow(data.phase == 'WATECH' ? (Number(data.DCP1) / 1000).toFixed(2) : data.DCP1, data.DCVOLT1, data.DCCURR1), unit: 'kW' },
              { key: 'power 2', value: dcPow(data.phase == 'WATECH' ? (Number(data.DCP2) / 1000).toFixed(2) : data.DCP2, data.DCVOLT2, data.DCCURR2), unit: 'kW' },
              { key: 'power 3', value: dcPow(data.DCP3, data.DCVOLT3, data.DCCURR3), unit: 'kW' },
              { key: 'power 4', value: dcPow(data.DCP4, data.DCVOLT4, data.DCCURR4), unit: 'kW' },
            ]}
          />
        </SectionPanel>
      )}

      {/* 4b ─ GTI: AC GRID OUTPUT */}
      {isGTI && (
        <SectionPanel title="AC Grid Output" sectionKey="acGrid" icon={PlugZap} badge="3-Phase" defaultOpen>
          <DataSection title="Phase A" theme="phaseA" icon={Wind} defaultOpen rows={acRows('A')} />
          <DataSection title="Phase B" theme="phaseB" icon={Wind} defaultOpen rows={acRows('B')} />
          <DataSection title="Phase C" theme="phaseC" icon={Wind} defaultOpen rows={acRows('C')} />
        </SectionPanel>
      )}

      {/* 4c ─ NON-GTI: DEVICE DETAILS */}
      {!isGTI && (
        <SectionPanel title="Device Details" sectionKey="deviceDetails" icon={BatteryCharging} defaultOpen>
          <DataSection title="Battery Info" theme="battery" icon={BatteryCharging} defaultOpen
            rows={[
              { key: 'Voltage',  value: data.BVOLT,  unit: 'V'  },
              { key: 'Current',  value: data.BCURR,  unit: 'A'  },
              { key: 'Type',     value: data.BATTYP             },
              { key: 'Backup %', value: data.BatteryBackup_Charging?.toFixed(2), unit: '%' },
            ]}
          />
          <DataSection title="PV Info" theme="pv" icon={Zap} defaultOpen
            rows={[
              { key: 'PV Voltage', value: data.PVOLT, unit: 'V'  },
              { key: 'PV Current', value: data.PCURR, unit: 'A'  },
              { key: 'PV Power',   value: data.PPOW,  unit: 'kW' },
            ]}
          />
          <DataSection title="Inverter Output" theme="acOutput" icon={Activity} defaultOpen
            rows={[
              { key: 'AC Voltage',   value: data.ACOUTVOLT, unit: 'V'  },
              { key: 'AC Frequency', value: data.ACOUTFREQ, unit: 'Hz' },
              { key: 'Load %',       value: data.LOADPER,   unit: '%'  },
            ]}
          />
          <DataSection title="Grid Input" theme="acOutput" icon={Activity} defaultOpen
            rows={[
              { key: 'Grid Voltage',   value: data.ACINVOLT, unit: 'V'  },
              { key: 'Grid Frequency', value: data.ACINFREQ, unit: 'Hz' },
              { key: 'Grid Status',       value:runStatus  },
            ]}
          />
        </SectionPanel>
      )}

      {/* 4d ─ AFORE HYBRID / EPS */}
      {data?.PHASE === 'Afore_Hybrid' && (<>
        <SectionPanel title="Battery" sectionKey="hybrid" icon={BatteryCharging} badge="Afore" defaultOpen>
          <DataSection title="Battery 1" theme="battery" icon={BatteryCharging} defaultOpen
            rows={[
              { key: 'Status',  value: getStatus(data.BATSTUS)},
              { key: 'SOC',     value: data.BATSOC,  unit: '%' },
              { key: 'Voltage', value: data.BATVOLT,unit:'V' },
              { key: 'Power',   value: data.BATTTPW, unit: 'W' },
              { key: 'Current', value: data.BATCUR, unit: 'A' },
            ]}
          />
          <DataSection title="Battery 2" theme="battery2" icon={BatteryCharging} defaultOpen
            rows={[
              { key: 'Status',  value: data.BATCNTCMD },
              { key: 'SOC',     value: data.BHLTSOC,  unit: '%' },
              { key: 'Voltage', value: data.BBATV,unit:'V'            },
              { key: 'Current', value: data.BBATC, unit: 'A' },
            ]}
          />
          <DataSection title="Load" theme="battery1" icon={BatteryCharging} defaultOpen
            rows={[
              { key: 'Current Consumption',  value: data.TTLDATPW,unit: 'W' },
              { key: 'Daily Consumption',     value: data.DYCUM,  unit: 'kWh' },
              { key: 'Monthly Consumption', value: data.TTCUM,unit:'kWh'            },
              
            ]}
          />
          
        </SectionPanel>

        <SectionPanel title="EPS Information" sectionKey="hybrid" icon={Gauge} badge="Afore" defaultOpen> 
          <DataSection title="EPS Voltage/Current" theme="eps" icon={Gauge} defaultOpen
            rows={[
              { key: 'R Phase Voltage',      value: data.EPSRV, unit: 'V' },
              { key: 'S Phase Voltage',      value: data.EPSSV, unit: 'V' },
              { key: 'T Phase Voltage',      value: data.EPSTV, unit: 'V' },
              { key: 'R Phase Current',      value: data.EPSRC, unit: 'A' },
              { key: 'S Phase Current',      value: data.EPSSC, unit: 'A' },
              { key: 'T Phase Current',      value: data.EPSTC, unit: 'A' },
              
            ]}
          />
          <DataSection title="EPS Power" theme="eps" icon={Gauge} defaultOpen
            rows={[
             
              { key: 'Frequency',            value: data.EPSFRQ, unit: 'Hz' },
              { key: 'R Active Power',       value: data.EPSRATPW, unit: 'W' },
              { key: 'S Active Power',       value: data.EPSSATPW, unit: 'W' },
              { key: 'T Active Power',       value: data.EPSTATPW, unit: 'W' },
              { key: 'Total Active Power',   value: data.EPSTTATPW, unit: 'W' },
              { key: 'Total Reactive Power', value: data.EPSTTATPW, unit: 'Var' },
              { key: 'Total Apparent Power', value: data.EPSTTAPPW, unit: 'VA' },
              
            ]}
          />
          <DataSection title="EPS Information" theme="eps" icon={Gauge} defaultOpen
            rows={[
              { key: 'Day Charging',         value: data.EPSDYCG, unit: 'V' },
              { key: 'Total Charging',       value: data.EPSTTCG, unit: 'V' },
              { key: 'Day Discharging',      value: data.EPSDYDSCG, unit: 'V' },
              { key: 'Total Discharging',    value: data.EPSTTDSCG, unit: 'V' },
            ]}
          />
        </SectionPanel>
        </>
      )}

      {/* 5 ─ POWER FLOW + GRAPH */}
      {/* <AnimatedPowerFlow
        inputActivePower={inputPow.value  ?? 'N/A'}
        outPutActivePower={outputPow.value ?? 'N/A'}
      /> */}
      <ParamGraph mac={macId} isGTI={isGTI} Type={Type}/>
    </div>
  );
};

export default Inverter;