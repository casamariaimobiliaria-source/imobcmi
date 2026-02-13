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
    const inputStyles = `${baseStyles} p-4 ${icon ? 'pl-16' : ''} ${error ? 'border-destructive/50' : ''} ${className}`;

    return (
        <div className="w-full">
            {label && (
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-2 ml-1 italic">
                    {label}
                </label>
            )}

            <div className="relative group glow-border rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />

                {icon && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all group-focus-within:scale-110 pointer-events-none z-10">
                        {icon}
                    </div>
                )}

                {as === 'input' && (
                    <input
                        className={`${inputStyles} bg-white/5 dark:bg-black/20 focus:bg-white/10 dark:focus:bg-black/40`}
                        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                        style={{
                            colorScheme: isDark ? 'dark' : 'light',
                            paddingLeft: icon ? '4.5rem' : undefined
                        }}
                    />
                )}

                {as === 'select' && (
                    <select
                        className={`${inputStyles} bg-white/5 dark:bg-black/20 focus:bg-white/10 dark:focus:bg-black/40`}
                        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
                        style={{
                            colorScheme: isDark ? 'dark' : 'light',
                            paddingLeft: icon ? '4.5rem' : undefined
                        }}
                    >
                        {props.children}
                    </select>
                )}

                {as === 'textarea' && (
                    <textarea
                        className={`${inputStyles} bg-white/5 dark:bg-black/20 focus:bg-white/10 dark:focus:bg-black/40 min-h-[120px]`}
                        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        style={{
                            colorScheme: isDark ? 'dark' : 'light',
                            paddingLeft: icon ? '4.5rem' : undefined
                        }}
                    />
                )}
            </div>

            {error && <p className="mt-1.5 text-[10px] text-destructive font-bold uppercase tracking-widest italic animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
};
