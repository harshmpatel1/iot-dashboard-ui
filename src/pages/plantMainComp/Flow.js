
// import React from 'react';
import { MdOutlineSolarPower } from "react-icons/md";
import { LuUtilityPole } from "react-icons/lu";
import SolarGrid from "../SolarGrid";
import { units, ProductionStat } from '../PlantInfo';
import { useState } from "react";
import { useEffect, useRef } from "react";




export default function EnergyFlowDiagram({ showConsumption, data, isAnimating, actualdata }) {
  console.log("showConsumption:", showConsumption);
  console.log("Data aaya:", actualdata);
  // Use fixed coordinate system width and height
  const viewBoxWidth = 800;
  const viewBoxHeight = 400;
  // Function to convert an X-coordinate (0-800) into a percentage for Tailwind left/right
  const getXPercent = (x) => `${(x / viewBoxWidth) * 100}%`;
  // Function to convert a Y-coordinate (0-400) into a percentage for Tailwind top/bottom
  const getYPercent = (y) => `${(y / viewBoxHeight) * 100}%`;
  // Define key positions relative to the 800x400 viewBox
  const positions = {
    solar: { x: 100, y: 50 },
    grid: { x: 700, y: 50 },
    inverter: { x: 400, y: 200 },
    consumption: { x: 700, y: 350 },
  };
  return (
    // Outer Container
    <div className="flex items-center justify-end  h-96">
      {/* INNER CONTAINER MODIFICATION: 
        We change max-w-4xl to max-w-[800px] (or another fixed max-width like max-w-2xl) 
        to prevent the diagram from stretching indefinitely on very wide screens. 
        Since the coordinate system is 800px wide, this is a sensible limit.
      */}
      <div className="relative w-full h-full max-w-[700px]">
        {/* --- 1. Nodes (Using Percentages for Absolute Positioning) --- */}
        {/* Solar Panel */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: getXPercent(positions.solar.x),
            top: getYPercent(positions.solar.y),
            transform: 'translate(-50%, -50%)' // Center the element
          }}
        >
          <p className={` font-bold mt-2 transition-colors duration-500 ${isAnimating ? 'text-gray-400 opacity-70' : 'text-blue-600'}`}>
            {/* Added toFixed(2) here for consistency */}
            {data?.CurrentGeneration?.toFixed(2) || '0.00'} {units.CurrentGeneration}
          </p>
          <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <MdOutlineSolarPower
              className="w-10 h-10 text-white"
            />
          </div>
        </div>
        {/* Grid */}
        {
          !showConsumption && (
            <div
              className="absolute flex flex-col items-center"
              style={{
                left: getXPercent(positions.grid.x),
                top: getYPercent(positions.grid.y),
                transform: 'translate(-50%, -50%)'
              }}
            >
              <p className={` font-bold mt-2 transition-colors duration-500 ${isAnimating ? 'text-gray-400 opacity-70' : 'text-gray-500'}`}>
                {/* Added toFixed(2) here for consistency */}
                {actualdata?.ActivePower || '0.00'}
              </p>
              <div className="w-16 h-16 bg-gray-500 rounded-lg flex items-center justify-center shadow-lg">
                <LuUtilityPole className="w-10 h-10 text-white" />
              </div>
            </div>
          )
        }
        {/* Center Inverter */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: getXPercent(positions.inverter.x),
            top: getYPercent(positions.inverter.y),
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-12 h-16 bg-orange-500 rounded flex flex-col items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="text-xs text-white font-bold mt-1">INV</div>
          </div>
        </div>
        {/* Consumption */}
        {
          showConsumption && (
            <div
              className="absolute flex flex-col items-center"
              style={{
                left: getXPercent(positions.consumption.x),
                top: getYPercent(positions.consumption.y),
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="text-xs text-gray-500 mt-2">Consumption</div>
            </div>
          )
        }
        {/* --- 2. SVG Paths (Using viewBox and Relative Coordinates) --- */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} style={{ zIndex: 0 }}>
          <defs>
            {/* Gradients */}
            <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} /><stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} /></linearGradient>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} /><stop offset="100%" style={{ stopColor: '#6b7280', stopOpacity: 1 }} /></linearGradient>
            <linearGradient id="consumptionGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} /><stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} /></linearGradient>
          </defs>
          {/* Solar to Inverter Path */}
          <path
            d={`M ${positions.solar.x} ${positions.solar.y + 20} 
                L ${positions.solar.x} ${positions.inverter.y - 30} 
                Q ${positions.solar.x} ${positions.inverter.y - 10} ${positions.solar.x + 20} ${positions.inverter.y - 10} 
                L ${positions.inverter.x - 20} ${positions.inverter.y - 10}`}
            fill="none" stroke="url(#solarGradient)" strokeWidth="8" strokeLinecap="round"
          />
          {/* Inverter to Grid Path */}
          {!showConsumption && (
            <path
              d={`M ${positions.inverter.x + 20} ${positions.inverter.y - 10} 
                L ${positions.grid.x - 20} ${positions.inverter.y - 10} 
                Q ${positions.grid.x} ${positions.inverter.y - 10} ${positions.grid.x} ${positions.inverter.y - 30} 
                L ${positions.grid.x} ${positions.grid.y + 20}`}
              fill="none" stroke="url(#gridGradient)" strokeWidth="8" strokeLinecap="round"
            />
          )}
          {/* Inverter to Consumption Path */}
          {
            showConsumption && (
              <path
                d={`M ${positions.inverter.x + 20} ${positions.inverter.y + 10} 
                L ${positions.consumption.x - 20} ${positions.inverter.y + 10} 
                Q ${positions.consumption.x} ${positions.inverter.y + 10} ${positions.consumption.x} ${positions.inverter.y + 30} 
                L ${positions.consumption.x} ${positions.consumption.y - 20}`}
                fill="none" stroke="url(#consumptionGradient)" strokeWidth="8" strokeLinecap="round"
              />
            )
          }
          {/* --- 3. Animated Particles (Using ViewBox Coordinates) --- */}
          {/* Solar Particle */}
          <circle r="6" fill="#3b82f6">
            <animateMotion dur="3s" repeatCount="indefinite"
              path={`M ${positions.solar.x} ${positions.solar.y + 20} 
                    L ${positions.solar.x} ${positions.inverter.y - 30} 
                    Q ${positions.solar.x} ${positions.inverter.y - 10} ${positions.solar.x + 20} ${positions.inverter.y - 10} 
                    L ${positions.inverter.x - 20} ${positions.inverter.y - 10}`}
            />
          </circle>
          {/* Grid Particle */}
          {
            !showConsumption && (
              <circle r="6" fill="#6b7280">
                <animateMotion dur="3s" repeatCount="indefinite"
                  path={`M ${positions.inverter.x + 20} ${positions.inverter.y - 10} 
                        L ${positions.grid.x - 20} ${positions.inverter.y - 10} 
                        Q ${positions.grid.x} ${positions.inverter.y - 10} ${positions.grid.x} ${positions.inverter.y - 30} 
                        L ${positions.grid.x} ${positions.grid.y + 20}`}
                />
              </circle>
            )
          }
          {/* Consumption Particle */}
          {
            showConsumption && (
              <circle r="6" fill="#ef4444">
                <animateMotion dur="3s" repeatCount="indefinite"
                  path={`M ${positions.inverter.x + 20} ${positions.inverter.y + 10} 
                    L ${positions.consumption.x - 20} ${positions.inverter.y + 10} 
                    Q ${positions.consumption.x} ${positions.inverter.y + 10} ${positions.consumption.x} ${positions.inverter.y + 30} 
                    L ${positions.consumption.x} ${positions.consumption.y - 20}`}
                />
              </circle>
            )
          }
          {/* Connection dots on paths (positioned at the inverter connection points) */}
          <circle cx={positions.inverter.x - 20} cy={positions.inverter.y - 10} r="6" fill="#f97316" className="animate-pulse" />
          <circle cx={positions.inverter.x + 20} cy={positions.inverter.y - 10} r="6" fill="#f97316" className="animate-pulse" />
          {
            showConsumption && (
              <circle cx={positions.inverter.x + 20} cy={positions.inverter.y + 10} r="6" fill="#f97316" className="animate-pulse" />
            )
          }
        </svg>
      </div>
    </div>
  );
}
// Tab Content Components
export const ProductionTab = ({ data, plantData, actual, isAnimating }) => {
  // console.log("hululu",plantData?.InstalltionCapacity)
  // const percentage=50;
  return (
    // console.log("m hu tera data",data)
    <div className="flex flex-col h-[75%] justify-between ">
      {/* Solar Power Section */}
      <div className="flex lg:flex-row flex-col justify-center items-centre gap-6 p-6">

        <SolarGrid pera1={data?.CurrentGeneration} pera2={plantData?.InstalltionCapacity} />
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 lg:w-[60%]">
          <div className="flex justify-between items-start mb-4">
            <div  >
              <h3 className="text-2xl font-bold text-gray-800">Solar Power</h3>
              <p className={`text-2xl font-bold mt-2 transition-colors duration-500 ${isAnimating ? 'text-gray-400 opacity-70' : 'text-blue-600'}`}>
                {/* Added toFixed(2) here for consistency */}
                {data?.CurrentGeneration?.toFixed(2) || '0.00'} {units.CurrentGeneration}
              </p>
            </div >
            <div className="text-right">
              <h4 className="text-2xl font-bold text-gray-800">Capacity</h4>
              <p className={`text-2xl font-bold mt-2 transition-colors duration-500 ${isAnimating ? 'text-gray-400 opacity-70' : 'text-black'}`}>
                {plantData?.InstalltionCapacity || 'N/A'} kWp
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Production Stats */}
      <div className="grid grid-cols-2  gap-4 p-2">
        <ProductionStat
          label="Today's Generation"
          displayValue={data?.TodayGeneration}
          unit={actual?.TodayGeneration?.split(" ")[1] || ""}
          isAnimating={isAnimating} />
        <ProductionStat
          label="Monthly Generation"
          displayValue={data.MonthlyGeneration}
          unit={actual?.MonthlyGeneration?.split(" ")[1] || ""}
          isAnimating={isAnimating} />
      </div>
      <div className="grid grid-cols-2  gap-4 p-2">
        <ProductionStat
          label="Yearly Generation"
          displayValue={data.YearlyGeneration}
          unit={actual?.YearlyGeneration?.split(" ")[1] || ""}
          isAnimating={isAnimating} />
        <ProductionStat
          label="Lifetime Generation"
          displayValue={data.LifetimeGeneration}
          unit={actual?.LifetimeGeneration?.split(" ")[1] || ""}
          isAnimating={isAnimating} />

      </div>
    </div >
  );
}



/**
 * SolarEnergyFlow
 *
 * Each node prop accepts:
 *   null    → node hidden, no line rendered
 *   "in"    → energy flows INTO the inverter
 *   "out"   → energy flows OUT of the inverter
 *
 * Example:
 *   <SolarEnergyFlow solar="in" grid={null} home="out" battery="out" />
 */

// ── SVG Icons ────────────────────────────────────────────────────────────────

function SunIcon({ size = 44, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function BatteryIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="16" height="10" rx="2" />
      <line x1="22" y1="11" x2="22" y2="13" strokeWidth="3" />
      <path d="M7 10.5v3M9.5 12H5" />
      <path d="M13 10.5l2 1.5-2 1.5" />
    </svg>
  );
}

function TowerIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 8v2l8 2 8-2V8z" />
      <line x1="12" y1="12" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="7" y1="5" x2="12" y2="12" />
      <line x1="17" y1="5" x2="12" y2="12" />
    </svg>
  );
}

function HomeIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function AnalyticsIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

// ── Animated Connector Line ────────────────────────────────────────────────

// function ConnectorLine({ from, to, vertical, flowIn, nodeSize }) {
//   const paused = true;
//   const animRef = useRef(null);
//   const dotRef = useRef(null);
//   const HALF = nodeSize / 2 + 2;

//   let lineX, lineY, lineW, lineH;
//   if (vertical) {
//     const top = Math.min(from.y, to.y) + HALF;
//     const bottom = Math.max(from.y, to.y) - HALF;
//     lineX = from.x - 1.5;
//     lineY = top;
//     lineW = 3;
//     lineH = Math.max(bottom - top, 0);
//   } else {
//     const left = Math.min(from.x, to.x) + HALF;
//     const right = Math.max(from.x, to.x) - HALF;
//     lineX = left;
//     lineY = from.y - 1.5;
//     lineW = Math.max(right - left, 0);
//     lineH = 3;
//   }

//   const DOT = 8;
//   const travel = (vertical ? lineH : lineW) - DOT;
//   const nodeIsBeforeCenter = vertical ? from.y < to.y : from.x < to.x;
//   const goForward = flowIn ? nodeIsBeforeCenter : !nodeIsBeforeCenter;

//   const dotColor = flowIn ? "#34d399" : "#fbbf24";
//   const trackColor = flowIn ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)";

//   const startVal = goForward ? 0 : travel;
//   const endVal = goForward ? travel : 0;

//   useEffect(() => {
//     if (!dotRef.current) return;

//     if (paused) return;

//     let start = null;
//     let raf;

//     const animate = (timestamp) => {
//       if (!start) start = timestamp;
//       const elapsed = timestamp - start;
//       const duration = 900;
//       const progress = (elapsed % duration) / duration;
//       const current = startVal + (endVal - startVal) * progress;

//       if (dotRef.current) {
//         if (vertical) {
//           dotRef.current.style.transform = `translateY(${current}px)`;
//         } else {
//           dotRef.current.style.transform = `translateX(${current}px)`;
//         }
//       }
//       raf = requestAnimationFrame(animate);
//     };

//     raf = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(raf);
//   }, [flowIn, vertical, startVal, endVal]);

//   return (
//     <div
//       style={{
//         position: "absolute",
//         left: lineX,
//         top: lineY,
//         width: lineW,
//         height: lineH,
//         backgroundColor: trackColor,
//         overflow: "hidden",
//         borderRadius: 2,
//       }}
//     >
//       <div
//         ref={dotRef}
//         style={{
//           position: "absolute",
//           width: DOT,
//           height: DOT,
//           borderRadius: DOT / 2,
//           backgroundColor: dotColor,
//           top: vertical ? 0 : (lineH - DOT) / 2,
//           left: vertical ? (lineW - DOT) / 2 : 0,
//           boxShadow: `0 0 8px 2px ${dotColor}`,
//         }}
//       />
//     </div>
//   );
// }

// function ConnectorLine({ from, to, vertical, flowIn, nodeSize, paused = false }) {
//   console.log('paused value:', paused)
//   const dotRef = useRef(null);
//   const HALF = nodeSize / 2 + 2;

//   // ✅ These were missing — add them back
//   let lineX, lineY, lineW, lineH;
//   if (vertical) {
//     const top = Math.min(from.y, to.y) + HALF;
//     const bottom = Math.max(from.y, to.y) - HALF;
//     lineX = from.x - 1.5;
//     lineY = top;
//     lineW = 3;
//     lineH = Math.max(bottom - top, 0);
//   } else {
//     const left = Math.min(from.x, to.x) + HALF;
//     const right = Math.max(from.x, to.x) - HALF;
//     lineX = left;
//     lineY = from.y - 1.5;
//     lineW = Math.max(right - left, 0);
//     lineH = 3;
//   }

//   const DOT = 8;
//   // ... rest stays the same
//   const travel = (vertical ? lineH : lineW) - DOT;
//   const nodeIsBeforeCenter = vertical ? from.y < to.y : from.x < to.x;
//   const goForward = flowIn ? nodeIsBeforeCenter : !nodeIsBeforeCenter;

//   const dotColor = flowIn ? "#34d399" : "#fbbf24";
//   const trackColor = flowIn ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)";

//   const startVal = goForward ? 0 : travel;
//   const endVal = goForward ? travel : 0;

//   useEffect(() => {
//     if (!dotRef.current || paused) return; // ← paused check here

//     let start = null;
//     let raf;

//     const animate = (timestamp) => {
//       if (!start) start = timestamp;
//       const elapsed = timestamp - start;
//       const duration = 900;
//       const progress = (elapsed % duration) / duration;
//       const current = startVal + (endVal - startVal) * progress;

//       if (dotRef.current) {
//         if (vertical) {
//           dotRef.current.style.transform = `translateY(${current}px)`;
//         } else {
//           dotRef.current.style.transform = `translateX(${current}px)`;
//         }
//       }
//       raf = requestAnimationFrame(animate);
//     };

//     raf = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(raf);
//   }, [flowIn, vertical, startVal, endVal, paused]); // ← paused in deps

//   return (
//     <div style={{ position: "absolute", left: lineX, top: lineY, width: lineW, height: lineH, backgroundColor: trackColor, overflow: "hidden", borderRadius: 2 }}>
//       <div
//         ref={dotRef}
//         style={{
//           position: "absolute",
//           width: DOT,
//           height: DOT,
//           borderRadius: DOT / 2,
//           backgroundColor: dotColor,
//           opacity: paused ? 0 : 1,       // ← hides dot when paused
//           top: vertical ? 0 : (lineH - DOT) / 2,
//           left: vertical ? (lineW - DOT) / 2 : 0,
//           boxShadow: `0 0 8px 2px ${dotColor}`,
//         }}
//       />
//     </div>
//   );
// }

// function ConnectorLine({ from, to, vertical, flowIn, nodeSize, paused = false }) {
//   const dotRef = useRef(null);
//   const HALF = nodeSize / 2 + 2;

//   let lineX, lineY, lineW, lineH;
//   if (vertical) {
//     const top = Math.min(from.y, to.y) + HALF;
//     const bottom = Math.max(from.y, to.y) - HALF;
//     lineX = from.x - 1.5;
//     lineY = top;
//     lineW = 3;
//     lineH = Math.max(bottom - top, 0);
//   } else {
//     const left = Math.min(from.x, to.x) + HALF;
//     const right = Math.max(from.x, to.x) - HALF;
//     lineX = left;
//     lineY = from.y - 1.5;
//     lineW = Math.max(right - left, 0);
//     lineH = 3;
//   }

//   const DOT = 8;
//   const travel = (vertical ? lineH : lineW) - DOT;
//   const nodeIsBeforeCenter = vertical ? from.y < to.y : from.x < to.x;
//   const goForward = flowIn ? nodeIsBeforeCenter : !nodeIsBeforeCenter;

//   const dotColor = flowIn ? "#34d399" : "#fbbf24";
//   const trackColor = flowIn ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)";

//   const startVal = goForward ? 0 : travel;
//   const endVal = goForward ? travel : 0;

//   useEffect(() => {
//     if (!dotRef.current) return;

//     // When paused: hide dot and reset position
//     if (paused) {
//       dotRef.current.style.opacity = "0";
//       dotRef.current.style.transform = vertical
//         ? `translateY(${startVal}px)`
//         : `translateX(${startVal}px)`;
//       return;
//     }

//     // When running: show dot and animate
//     dotRef.current.style.opacity = "1";

//     let start = null;
//     let raf;

//     const animate = (timestamp) => {
//       if (!start) start = timestamp;
//       const elapsed = timestamp - start;
//       const duration = 900;
//       const progress = (elapsed % duration) / duration;
//       const current = startVal + (endVal - startVal) * progress;

//       if (dotRef.current) {
//         if (vertical) {
//           dotRef.current.style.transform = `translateY(${current}px)`;
//         } else {
//           dotRef.current.style.transform = `translateX(${current}px)`;
//         }
//       }
//       raf = requestAnimationFrame(animate);
//     };

//     raf = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(raf); // ← cancels on unmount or re-run
//   }, [flowIn, vertical, startVal, endVal, paused]);

//   return (
//     <div style={{
//       position: "absolute",
//       left: lineX,
//       top: lineY,
//       width: lineW,
//       height: lineH,
//       backgroundColor: trackColor,
//       overflow: "hidden",
//       borderRadius: 2,
//     }}>
//       <div
//         ref={dotRef}
//         style={{
//           position: "absolute",
//           width: DOT,
//           height: DOT,
//           borderRadius: DOT / 2,
//           backgroundColor: dotColor,
//           opacity: 0,  // ← start hidden, useEffect controls it
//           top: vertical ? 0 : (lineH - DOT) / 2,
//           left: vertical ? (lineW - DOT) / 2 : 0,
//           boxShadow: `0 0 8px 2px ${dotColor}`,
//         }}
//       />
//     </div>
//   );
// }

function ConnectorLine({ from, to, vertical, flowIn, nodeSize, paused = false }) {
  const dotRef = useRef(null);
  const rafRef = useRef(null);
  const HALF = nodeSize / 2 + 2;
  //   console.log(
  //   "key debug →",
  //   "vertical:", vertical,
  //   "lineW:", lineW, "lineH:", lineH,
  //   "travel:", travel,
  //   "paused:", paused
  // );

  let lineX, lineY, lineW, lineH;
  if (vertical) {
    const top = Math.min(from.y, to.y) + HALF;
    const bottom = Math.max(from.y, to.y) - HALF;
    lineX = from.x - 1.5;
    lineY = top;
    lineW = 3;
    lineH = Math.max(bottom - top, 0);
  } else {
    const left = Math.min(from.x, to.x) + HALF;
    const right = Math.max(from.x, to.x) - HALF;
    lineX = left;
    lineY = from.y - 1.5;
    lineW = Math.max(right - left, 0);
    lineH = 3;
  }

  const DOT = 8;
  const travel = (vertical ? lineH : lineW) - DOT;
  const nodeIsBeforeCenter = vertical ? from.y < to.y : from.x < to.x;
  const goForward = flowIn ? nodeIsBeforeCenter : !nodeIsBeforeCenter;
  const startVal = goForward ? 0 : travel;
  const endVal = goForward ? travel : 0;

  const dotColor = flowIn ? "#34d399" : "#fbbf24";
  const trackColor = flowIn ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)";

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    // Always cancel any previous animation first
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (paused) {
      dot.style.opacity = "0";
      dot.style.transform = vertical
        ? `translateY(${startVal}px)`
        : `translateX(${startVal}px)`;
      return;
    }

    dot.style.opacity = "1";
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % 900) / 900;
      const current = startVal + (endVal - startVal) * progress;

      dot.style.transform = vertical
        ? `translateY(${current}px)`
        : `translateX(${current}px)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [paused, flowIn, vertical, startVal, endVal]);

  return (
    <div style={{
      position: "absolute",
      left: lineX,
      top: lineY,
      width: lineW,
      height: lineH,
      backgroundColor: trackColor,
      overflow: "hidden",
      borderRadius: 2,
    }}>
      <div
        ref={dotRef}
        style={{
          position: "absolute",
          width: DOT,
          height: DOT,
          borderRadius: DOT / 2,
          backgroundColor: dotColor,
          opacity: paused ? 0 : 1,
          top: vertical ? 0 : (lineH - DOT) / 2,
          left: vertical ? (lineW - DOT) / 2 : 0,
          boxShadow: `0 0 8px 2px ${dotColor}`,
        }}
      />
    </div>
  );
}

// ── Inverter Node ─────────────────────────────────────────────────────────

function InverterNode({ cx, cy, size }) {
  const pulseRef = useRef(null);
  const rotateRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    let raf;
    let start = null;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      // Pulse ring — breathes in/out
      if (pulseRef.current) {
        const scale = 1 + 0.12 * Math.sin((elapsed / 2200) * Math.PI * 2);
        const opacity = 0.3 + 0.25 * Math.sin((elapsed / 2200) * Math.PI * 2);
        pulseRef.current.style.transform = `scale(${scale})`;
        pulseRef.current.style.opacity = opacity;
      }

      // Rotating dashed arc
      if (rotateRef.current) {
        const deg = (elapsed / 4000) * 360;
        rotateRef.current.style.transform = `rotate(${deg}deg)`;
      }

      // Glow pulse
      if (glowRef.current) {
        const intensity = 0.4 + 0.3 * Math.sin((elapsed / 1800) * Math.PI * 2);
        glowRef.current.style.boxShadow = `
          0 0 ${12 + 10 * intensity}px ${4 + 4 * intensity}px rgba(16,185,129,${intensity * 0.6}),
          inset 0 0 ${8 + 6 * intensity}px rgba(16,185,129,${intensity * 0.15})
        `;
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const outerSize = size + 28;
  const midSize = size + 14;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - outerSize / 2,
        top: cy - outerSize / 2,
        width: outerSize,
        height: outerSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      {/* Outermost breathing ring */}
      <div
        ref={pulseRef}
        style={{
          position: "absolute",
          width: outerSize,
          height: outerSize,
          borderRadius: "50%",
          border: "1px solid rgba(16,185,129,0.35)",
          transformOrigin: "center",
        }}
      />

      {/* Rotating dashed arc */}
      <div
        ref={rotateRef}
        style={{
          position: "absolute",
          width: midSize,
          height: midSize,
          borderRadius: "50%",
          border: "1.5px dashed rgba(52,211,153,0.4)",
          borderTopColor: "rgba(52,211,153,0.9)",
          borderRightColor: "rgba(52,211,153,0.15)",
          transformOrigin: "center",
        }}
      />

      {/* Static mid ring */}
      <div
        style={{
          position: "absolute",
          width: midSize - 4,
          height: midSize - 4,
          borderRadius: "50%",
          border: "1px solid rgba(16,185,129,0.1)",
        }}
      />

      {/* Main circle with gradient + animated glow */}
      <div
        ref={glowRef}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #0d6e50 0%, #053d2a 55%, #021f15 100%)",
          border: "1.5px solid #10b981",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 20px 6px rgba(16,185,129,0.45), inset 0 0 10px rgba(16,185,129,0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Inner shimmer streak */}
        <div
          style={{
            position: "absolute",
            top: "12%",
            left: "18%",
            width: "35%",
            height: "22%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(167,243,208,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <AnalyticsIcon size={22} color="#6ee7b7" />

        <span
          style={{
            color: "#a7f3d0",
            fontSize: 7,
            marginTop: 3,
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          INV
        </span>
      </div>
    </div>
  );
}

// ── Node View ─────────────────────────────────────────────────────────────

const LABEL_STYLE = {
  color: "#64748b",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase",
};

function NodeView({ label, labelPos, icon, x, y, nodeSize, labelGap, colors, value1, value2 }) {
  const IconMap = { sun: SunIcon, battery: BatteryIcon, tower: TowerIcon, home: HomeIcon };
  const Icon = IconMap[icon];

  const circleTop = labelPos === "top" ? labelGap : 0;
  const totalH = nodeSize + labelGap;
  const containerTop = y - nodeSize / 2 - (labelPos === "top" ? labelGap : 0);

  return (
    <div
      style={{
        position: "absolute",
        left: x - nodeSize / 2,
        top: containerTop,
        width: nodeSize,
        height: totalH,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 5,
      }}
    >
      {labelPos === "top" && (
        <><span style={{ ...LABEL_STYLE }}>{label}</span>
          <span style={{ ...LABEL_STYLE }}>{value1}</span>
          <span style={{ ...LABEL_STYLE }}>{value2}</span></>
      )}

      {/* Glow ring */}
      <div
        style={{
          position: "absolute",
          top: circleTop - 5,
          left: -5,
          width: nodeSize + 10,
          height: nodeSize + 10,
          borderRadius: "50%",
        }}
      />

      {/* Circle */}
      <div
        style={{
          width: nodeSize,
          height: nodeSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: `drop-shadow(0 0 6px ${colors.border})`,
        }}
      >
        {Icon && <Icon size={52} color={colors.icon} />}
      </div>

      {labelPos === "bottom" && (
        <><span style={{ ...LABEL_STYLE, marginTop: 6 }}>{label}</span>
          <span style={{ ...LABEL_STYLE }}>{value1}</span>
          <span style={{ ...LABEL_STYLE }}>{value2}</span></>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export function SolarEnergyFlow({
  solar = "in",
  grid = "in",
  home = "out",
  battery = "out",
  data,
  data2
}) {
  const CARD_SIZE = Math.min(window.innerWidth * 0.82, 500); // increase 320 → 500, 600, etc.
  const NODE_SIZE = 80;
  const LABEL_GAP = 10;
  const CX = CARD_SIZE / 2;
  const CY = CARD_SIZE / 2;
  const REACH = CARD_SIZE * 0.35;
  console.log("datataa", data)
  // console.log("datataa2",data2)/


  const nodes = [
    { key: "solar", flow: solar, icon: "sun", label: "Solar", value1: data.HybridType == "SRNE" ? data.ActivePower : data.CurrentGeneration, labelPos: "top", x: CX, y: CY - REACH ,paused: (Number(String(data.HybridType === "SRNE" ? data.ActivePower : data.CurrentGeneration).replace(/[^\d.-]/g, ''))) <= 0},
    { key: "battery", flow: battery, icon: "battery", label: "Battery", value1: data.BatteryPower, value2: `SOC ${data.BatterySOC}`, labelPos: "bottom", x: CX, y: CY + REACH ,paused: (Number(String(data.BatteryPower).replace(/[^\d.-]/g, ''))) === 0},
    { key: "grid", flow: grid, icon: "tower", value1: (data.GridPower || data.ActivePower)?.replace("-", ""), label: "Grid", labelPos: "bottom", x: CX - REACH, y: CY ,paused:(Number(String((data.GridPower || data.ActivePower)?.replace("-", "")).replace(/[^\d.-]/g, ''))) === 0 },
    { key: "home", flow: home, icon: "home", value1: data.HomeConsumption, label: "Home", labelPos: "bottom", x: CX + REACH, y: CY ,paused: (Number(String(data.HomeConsumption).replace(/[^\d.-]/g, ''))) === 0},
  ];

//   console.log("paused value:",(Number(String(data.HybridType === "SRNE" ? data.ActivePower : data.CurrentGeneration).replace(/[^\d.-]/g, ''))) > 0)
// console.log("data",data,"data.HybridType",data.HybridType,"data.ActivePower",data.ActivePower,"data.CurrentGeneration",data.CurrentGeneration)
  const isVertical = (n) => n.key === "solar" || n.key === "battery";

  const nodeColor = (flow) => {
    if (flow === "in") return { border: "#34d399", bg: "#052e16", icon: "#6ee7b7", glow: "rgba(52,211,153,0.12)" };
    if (flow === "out") return { border: "#f59e0b", bg: "#1c1004", icon: "#fbbf24", glow: "rgba(251,191,36,0.12)" };
    return { border: "#10b981", bg: "#0f2d22", icon: "#34d399", glow: "rgba(16,185,129,0.1)" };
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: CARD_SIZE,
          height: CARD_SIZE,
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Connector Lines */}
        {nodes.map((n) =>
          n.flow ? (
            <ConnectorLine
              key={n.key}
              from={{ x: n.x, y: n.y }}
              to={{ x: CX, y: CY }}
              vertical={isVertical(n)}
              flowIn={n.flow === "in"}
              nodeSize={NODE_SIZE}
              paused={n.paused}   // ← was hardcoded true, now per-node
            />
          ) : null
        )}

        {/* Center Inverter */}
        <InverterNode cx={CX} cy={CY} size={NODE_SIZE} />

        {/* Peripheral Nodes */}
        {nodes.map((n) =>
          n.flow !== null ? (
            <NodeView
              key={n.key}
              label={n.label}
              labelPos={n.labelPos}
              icon={n.icon}
              x={n.x}
              y={n.y}
              value1={n.value1}
              value2={n?.value2}
              nodeSize={NODE_SIZE}
              labelGap={LABEL_GAP}
              colors={nodeColor(n.flow)}
            />
          ) : null
        )}
      </div>
    </div>
  );
}