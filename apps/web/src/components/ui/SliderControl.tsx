import React, { useRef, useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface SliderControlProps {
    label: string;
    value: number | string;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    icon?: React.ElementType;
    colorClass?: string;
}

export const SliderControl = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = '',
    icon: Icon,
    colorClass = "bg-slate-900"
}: SliderControlProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);
    const numericValue = typeof value === 'string' ? parseFloat(value) || min : value;

    const percentage = Math.min(100, Math.max(0, ((numericValue - min) / (max - min)) * 100));

    const handleInteraction = (clientX: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = x / rect.width;

        let newValue = min + (percent * (max - min));

        // Snap to step
        if (step) {
            newValue = Math.round(newValue / step) * step;
        }

        // Clamp
        newValue = Math.max(min, Math.min(max, newValue));

        // Precision fix
        newValue = Math.round(newValue * 100) / 100;

        onChange(newValue);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e.clientX);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleInteraction(e.touches[0].clientX);
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) handleInteraction(e.clientX);
        };
        const onTouchMove = (e: TouchEvent) => {
            if (isDragging) handleInteraction(e.touches[0].clientX);
        };
        const onUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onUp);
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onUp);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [isDragging]);

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 bg-slate-50 rounded-full text-slate-700">
                            <Icon size={18} />
                        </div>
                    )}
                    <label className="font-semibold text-slate-700">{label}</label>
                </div>
                <div className="flex items-center bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        className="w-16 bg-transparent text-right font-bold text-slate-900 outline-none"
                    />
                    <span className="text-slate-500 text-sm ml-1 font-medium">{unit}</span>
                </div>
            </div>

            <div
                className="h-6 relative cursor-pointer touch-none" // Increased height for easier touch
                ref={trackRef}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                {/* Track Background */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-slate-100 rounded-full overflow-hidden">
                    {/* Track Fill */}
                    <div
                        className={clsx("h-full rounded-full transition-all duration-75 ease-out", colorClass)}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-slate-100 rounded-full shadow-md hover:scale-110 transition-transform flex items-center justify-center pointer-events-none"
                    style={{ left: `${percentage}%`, transform: `translate(-50%, -50%)` }}
                >
                    <div className={clsx("w-2 h-2 rounded-full", colorClass)} />
                </div>
            </div>

            <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium px-1">
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    );
};
