import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={twMerge(
                        clsx(
                            "w-full px-4 py-2 border rounded-lg outline-none transition-all",
                            "focus:ring-2 focus:ring-green-500 focus:border-transparent",
                            error ? "border-red-500 focus:ring-red-200" : "border-slate-300",
                            className
                        )
                    )}
                    {...props}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={twMerge(
                        clsx(
                            "w-full px-4 py-2 border rounded-lg outline-none transition-all bg-white",
                            "focus:ring-2 focus:ring-green-500 focus:border-transparent",
                            error ? "border-red-500 focus:ring-red-200" : "border-slate-300",
                            className
                        )
                    )}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        );
    }
);
Select.displayName = 'Select';
