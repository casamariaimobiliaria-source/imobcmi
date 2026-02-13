import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    icon?: LucideIcon;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    icon: Icon,
    loading,
    className = '',
    ...props
}) => {
    const baseStyles = "px-4 py-2 rounded-xl transition-all duration-500 flex items-center justify-center gap-2 uppercase tracking-tighter text-[10px] italic font-black border backdrop-blur-md";

    const variants = {
        primary: "premium-button shimmer",
        secondary: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20",
        danger: "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
        ghost: "bg-transparent border-transparent text-slate-500 hover:text-cyan-400 hover:bg-white/5"
    };

    const selectedVariant = variants[variant] || variants.primary;

    return (
        <button
            className={`${variant === 'primary' ? '' : baseStyles} ${selectedVariant} ${loading ? 'opacity-70 cursor-wait' : ''} ${className} active:scale-95 transition-transform`}
            disabled={loading}
            {...props}
        >
            {Icon && <Icon size={14} className={loading ? 'animate-spin' : ''} />}
            {children}
        </button>
    );
};
