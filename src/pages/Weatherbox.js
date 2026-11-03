import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { url } from "../constants/serverInfo";

// ----------------- Icons -----------------
const IconSunny = ({ className = "w-10 h-10" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <line x1="12" y1="2.5" x2="12" y2="4.5" />
            <line x1="12" y1="19.5" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="4.5" y2="12" />
            <line x1="19.5" y1="12" x2="21.5" y2="12" />
        </g>
    </svg>
);

const IconCloud = ({ className = "w-10 h-10" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <path
            d="M6 16a4 4 0 010-8 5 5 0 019.9 1.4A3.5 3.5 0 0119 14H6z"
            stroke="currentColor"
            strokeWidth="1.4"
        />
    </svg>
);

const IconRain = ({ className = "w-10 h-10" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <path
            d="M6 15a4 4 0 010-8 5 5 0 019.9 1.4A3.5 3.5 0 0119 13H6z"
            stroke="currentColor"
            strokeWidth="1.2"
        />
        <g stroke="currentColor" strokeWidth="1.4">
            <line x1="8" y1="18" x2="7.2" y2="20" />
            <line x1="12" y1="18" x2="11.2" y2="20" />
            <line x1="16" y1="18" x2="15.2" y2="20" />
        </g>
    </svg>
);

// const IconWind = () => (
//     <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none">
//         <path d="M3 12h11a3 3 0 100-6 3 3 0 010 6H6"
//             stroke="currentColor" strokeWidth="1.2" />
//     </svg>
// );

// const IconSunrise = () => (
//     <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none">
//         <path d="M12 4v4" stroke="currentColor" strokeWidth="1.2" />
//         <path d="M8 16a4 4 0 008 0" stroke="currentColor" strokeWidth="1.2" />
//     </svg>
// );

const IconSunrisePretty = ({ className = "w-5 h-5 text-yellow-300" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Rays */}
    <line x1="12" y1="3" x2="12" y2="5" />
    <line x1="5" y1="7" x2="6.4" y2="8.1" />
    <line x1="19" y1="7" x2="17.6" y2="8.1" />

    {/* Sun (half) */}
    <path d="M8 13a4 4 0 0 1 8 0" />

    {/* Horizon */}
    <line x1="4" y1="16" x2="20" y2="16" />

    {/* Little water/waves under horizon */}
    <path d="M6 18c.6.4 1.2.6 2 .6s1.4-.2 2-.6" />
    <path d="M14 18c.6.4 1.2.6 2 .6s1.4-.2 2-.6" />
  </svg>
);


const IconSunsetPretty = ({ className = "w-5 h-5 text-red-300" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Rays below */}
    <line x1="12" y1="19" x2="12" y2="21" />
    <line x1="5" y1="17" x2="6.4" y2="15.9" />
    <line x1="19" y1="17" x2="17.6" y2="15.9" />

    {/* Sun (half) */}
    <path d="M8 11a4 4 0 0 1 8 0" />

    {/* Horizon */}
    <line x1="4" y1="8" x2="20" y2="8" />

    {/* Little water/waves above horizon */}
    <path d="M6 6c.6-.4 1.2-.6 2-.6s1.4.2 2 .6" />
    <path d="M14 6c.6-.4 1.2-.6 2-.6s1.4.2 2 .6" />
  </svg>
);

const IconWindPretty = ({ className = "w-4 h-4 text-blue-400" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Top gust */}
    <path d="M3 8h9a3 3 0 1 0-3-3" />

    {/* Middle gust */}
    <path d="M3 12h13a2.5 2.5 0 1 0-2.5-2.5" />

    {/* Bottom gust */}
    <path d="M3 16h7a2 2 0 1 1-2 2" />
  </svg>
);


const IconRefresh = ({ onClick }) => (
    <svg className="w-4 h-4 inline-block ml-2 cursor-pointer" viewBox="0 0 24 24" fill="none" onClick={onClick}>
        <path d="M20 12a8 8 0 10-2.2 5.2L20 20" stroke="currentColor" strokeWidth="1.4" />
        <path d="M20 20v-4h-4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
);

// ----------------- Helpers -----------------
const formatTime = (unixTs, tzOffset) => {
    const date = new Date((unixTs + tzOffset) * 1000);
    return date.toUTCString().split(" ")[4].slice(0, 5);
};

const dayAbbrev = (unixTs, tzOffset = 0) => {
    const date = new Date((unixTs + tzOffset) * 1000);
    return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
};

const chooseIconFor = (main) => {
    if (!main) return <IconCloud />;
    const w = main.toLowerCase();
    if (w.includes("clear")) return <IconSunny />;
    if (w.includes("rain")) return <IconRain />;
    return <IconCloud />;
};

const buildSparklinePath = (numbers, forecast, tz, w = 240, h = 80, padding = 8) => {
    if (!numbers?.length) return { path: "", labels: [], minTemp: 0, maxTemp: 0 };

    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    const range = max - min || 1;
    const stepX = (w - padding * 2) / (numbers.length - 1);

    const points = numbers.map((v, i) => {
        const x = padding + i * stepX;
        const y = padding + (1 - (v - min) / range) * (h - padding * 2);
        return [x, y];
    });

    const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

    // Generate X-axis temperature labels (every 4th point for readability)
    const labels = [];
    for (let i = 0; i < numbers.length; i += Math.max(1, Math.floor(numbers.length / 6))) {
        labels.push({
            x: padding + i * stepX,
            temp: Math.round(numbers[i]),
            time: formatTime(forecast?.list?.[i]?.dt || 0, tz || 0)
        });
    }

    return { path, labels, minTemp: Math.round(min), maxTemp: Math.round(max) };
};

// ----------------- Main Component -----------------
export default function WeatherBox() {
    const [city, setCity] = useState(null);
    const { plantId } = useParams();
    // const padding = 16;   // a bit more padding

    const [current, setCurrent] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);

    const API_KEY = "4956fc27bfd6698a4dd72fca6b3aa26b";

    // ------------ 1) Fetch Address → extract City ------------
    const fetchPlantInfo = async () => {
        try {
            const res = await fetch(`${url}/weather/info?ID=${plantId}`);
            const json = await res.json();

            const fullAddr = json.result[0].Address;  // e.g. "V9QJ+Q84, Hodal, India"
            const parts = fullAddr.split(",");
            setCity(parts.at(-2)?.trim() || " ");
        } catch (err) {
            console.error("Address error:", err);
        }
    };

    // ------------ 2) Fetch weather for the extracted city ------------
    const fetchCityWeather = async (cityName) => {
        try {
            const w = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${cityName},IN&appid=${API_KEY}&units=metric`
            );
            const wJson = await w.json();
            // console.log("current weather: ",wJson)

            const f = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${wJson.coord.lat}&lon=${wJson.coord.lon}&appid=${API_KEY}&units=metric`
            );
            const fJson = await f.json();

            setCurrent(wJson);
            setForecast(fJson);
            setUpdatedAt(Date.now());
        } catch (err) {
            console.error("Weather error:", err);
        }
    };

    useEffect(() => { fetchPlantInfo(); }, []);
    useEffect(() => { if (city) fetchCityWeather(city); }, [city]);

    const refresh = () => current?.name && fetchCityWeather(current.name);

    const tz = current?.timezone || 0;
    const hourlyList = forecast?.list?.slice(0, 6) || [];
    const sparkTemps = forecast?.list?.slice(0, 12).map(i => i.main.temp) || [];

    // Sparkline data
    const padding = 16;
    const w = 240;
    const h = 80;
    const sparklineData = buildSparklinePath(sparkTemps, forecast, tz, w, h, padding);

    // Group by day
    const dailyGroups = (() => {
        if (!forecast?.list) return [];
        const map = {};
        forecast.list.forEach((it) => {
            const d = it.dt_txt.split(" ")[0];
            (map[d] ||= []).push(it);
        });
        return Object.keys(map).map((d) => ({ date: d, items: map[d] }));
    })();

    if (!current) return <div className="text-center p-6">Loading weather...</div>;

    return (
        <div className="w-full mx-auto bg-white rounded-xl shadow-lg text-slate-800 overflow-hidden">

            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
                <div>
                    <div className="text-sm font-semibold">
                        {dayAbbrev(current.dt, tz)}
                    </div>
                    <div className="text-xs text-slate-500">
                        Updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "--"}
                        <IconRefresh onClick={refresh} />
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm font-semibold">{current.name}</div>
                </div>
            </div>

            {/* Main */}
            <div className="p-5">
                <div className="flex justify-between">
                    {/* Temperature */}
                    <div>
                        <div className="text-5xl font-bold">
                            {Math.round(current.main.temp)}°C
                        </div>

                        <div className="text-sm text-slate-500 mt-1">
                            {Math.round(current.main.temp_min)}° /
                            {Math.round(current.main.temp_max)}°
                            <span className="ml-2 inline-flex items-center">
                                <IconWindPretty /> {current.wind.speed} m/s
                            </span>
                        </div>

                        <div className="mt-3 text-sm text-slate-600 flex gap-3">
                            <span className="flex justify-center items-center gap-2"><IconSunrisePretty /> {formatTime(current.sys.sunrise, tz)}</span>
                            <span className="flex justify-center items-center gap-2"><IconSunsetPretty /> {formatTime(current.sys.sunset, tz)}</span>
                        </div>
                    </div>

                    {/* Icon */}
                    <div className="text-yellow-500 flex flex-col items-center">
                        {chooseIconFor(current.weather[0].main)}
                        <div className="text-sm mt-2 capitalize text-slate-600">
                            {current.weather[0].description}
                        </div>
                    </div>
                </div>

                

                {/* Hourly */}
                <div className="mt-3 flex gap-3 overflow-x-auto justify-around items-center">
                    {hourlyList.map((h, i) => (
                        <div key={i} className=" bg-slate-50 rounded-lg p-2 text-center min-w-[60px]">
                            <div className="text-sm">{h.dt_txt.split(" ")[1].slice(0, 5)}</div>
                            <div className="text-orange-500 my-1">{Math.round(h.main.temp)}°</div>
                            {chooseIconFor(h.weather[0].main)}
                        </div>
                    ))}
                </div>

                {/* Daily */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                    {dailyGroups.slice(1, 5).map((g, i) => {
                        const mid = g.items[Math.floor(g.items.length / 2)];
                        const avg = Math.round(g.items.reduce((s, a) => s + a.main.temp, 0) / g.items.length);

                        return (
                            <div key={i} className="bg-slate-50 p-2 text-center rounded-lg text-xs">
                                <div className="font-semibold">
                                    {dayAbbrev(new Date(g.date).getTime() / 1000)}
                                </div>
                                {chooseIconFor(mid.weather[0].main)}
                                <div className="mt-1">{avg}°C</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-slate-100 px-4 py-3 text-xs text-slate-600 flex justify-between">
                <div>Data from OpenWeather</div>
                <div>Updated: {updatedAt ? new Date(updatedAt).toLocaleTimeString() : "--"}</div>
            </div>
        </div>
    );
}
