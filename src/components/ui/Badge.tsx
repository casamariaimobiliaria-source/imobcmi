import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
    const variants = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
        info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        neutral: 'bg-white/5 text-slate-400 border-white/10'
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-solid ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
