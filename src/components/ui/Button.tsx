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
    // Base styles: uppercase track, bold font, subtle glass
    const baseStyles = "px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] italic font-black border backdrop-blur-md shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "premium-button shimmer",
        secondary: "bg-white/[0.04] border-white/10 text-[#00F5FF] hover:bg-[#00F5FF]/10 hover:border-[#00F5FF]/30 shadow-[0_4px_15px_rgba(0,0,0,0.2)]",
        danger: "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
        ghost: "bg-transparent border-transparent text-slate-500 hover:text-[#00F5FF] hover:bg-[#00F5FF]/5"
    };

    const selectedVariant = variants[variant] || variants.primary;

    return (
        <button
            className={`${variant === 'primary' ? '' : baseStyles} ${selectedVariant} ${loading ? 'opacity-70 cursor-wait' : ''} ${className}`}
            disabled={loading}
            {...props}
        >
            {Icon && <Icon size={14} className={loading ? 'animate-spin' : ''} />}
            {children}
        </button>
    );
};
