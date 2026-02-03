import React from 'react';
import { useApp } from '../../context/AppProvider';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    as?: 'input' | 'select' | 'textarea';
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    as = 'input',
    icon,
    ...props
}) => {
    const { theme } = useApp();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Base styles
    const baseStyles = "w-full rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed";

    // Combine styles (padding logic is handled here)
    const inputStyles = `${baseStyles} p-3 ${icon ? 'pl-16' : ''} ${error ? 'border-destructive/50' : ''} ${className}`;

    return (
        <div className="w-full">
            {label && (
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1 italic">
                    {label}
                </label>
            )}

            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10">
                        {icon}
                    </div>
                )}

                {as === 'input' && (
                    <input
                        className={inputStyles}
                        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                        style={{
                            colorScheme: isDark ? 'dark' : 'light',
                            paddingLeft: icon ? '4rem' : undefined
                        }}
                    />
                )}

                {as === 'select' && (
                    <select
                        className={inputStyles}
                        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
                        style={{
                            colorScheme: isDark ? 'dark' : 'light',
                            paddingLeft: icon ? '4rem' : undefined
                        }}
                    >
                        {props.children}
                    </select>
                )}

                {as === 'textarea' && (
                    <textarea
                        className={inputStyles}
                        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        style={{
                            colorScheme: isDark ? 'dark' : 'light',
                            paddingLeft: icon ? '4rem' : undefined
                        }}
                    />
                )}
            </div>

            {error && <p className="mt-1 text-[10px] text-destructive font-bold uppercase tracking-wider italic">{error}</p>}
        </div>
    );
};
