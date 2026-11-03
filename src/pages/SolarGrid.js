import React, { useEffect, useState } from "react";

const SolarGrid = ({ pera1 = 0, pera2 = 1 }) => {
    const [percentage, setPercentage] = useState(0);
    const [animatedCells, setAnimatedCells] = useState(0);

    const rows = 6;
    const cols = 10;
    const totalCells = rows * cols;

    // Calculate percentage safely
    useEffect(() => {
        const value = pera2 !== 0 ? ((pera1 / pera2) * 100).toFixed(0) : 0;
        setPercentage(Number(value));
    }, [pera1, pera2]);

    // Animate filling of solar cells
    useEffect(() => {
        const visibleCells = Math.round((percentage / 100) * totalCells);
        setAnimatedCells(0);

        let i = 0;
        const interval = setInterval(() => {
            i++;
            setAnimatedCells(i);
            if (i >= visibleCells) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);
    }, [percentage]);

    return (
        <div className="flex flex-col items-center justify-center">
            {/* Tilted Solar Grid Box */}
            <div
                className="p-2 bg-white rounded-xl shadow-xl"
                style={{
                    transform: "skewX(-10deg) rotateX(20deg)",
                    border: "1px solid black",
                }}
            >
                <div
                    className="grid gap-1"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        width: "200px",
                    }}
                >
                    {[...Array(totalCells)].map((_, index) => {
                        const isActive = index < animatedCells;

                        return (
                            <div
                                key={index}
                                className={`w-4 h-4 rounded-sm transition-all duration-300
                                    ${isActive
                                        ? "bg-blue-500 scale-110 shadow-lg shadow-blue-500/60"
                                        : "bg-gray-300"}
                                `}
                            ></div>
                        );
                    })}
                </div>
            </div>

            {/* Percentage Label */}
            <h2 className="m-2">
                <span className="text-blue-500 text-2xl font-bold">{percentage}%</span> Generation
            </h2>
        </div>
    );
};

export default SolarGrid;
