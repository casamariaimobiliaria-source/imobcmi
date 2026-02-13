import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MobileCardProps {
    title: string;
    subtitle?: string;
    description?: string;
    icon?: React.ReactNode;
    status?: React.ReactNode;
    tags?: React.ReactNode[];
    onClick?: () => void;
    actions?: React.ReactNode;
    checkbox?: React.ReactNode;
}

export const MobileCard: React.FC<MobileCardProps> = ({
    title,
    subtitle,
    description,
    icon,
    status,
    tags,
    onClick,
    actions,
    checkbox
}) => {
    return (
        <div
            onClick={onClick}
            className="premium-card !p-4 flex flex-col gap-4 active:scale-[0.98] transition-all relative overflow-hidden group border-white/5 bg-secondary/20"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {checkbox && <div onClick={(e) => e.stopPropagation()}>{checkbox}</div>}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-black italic border border-white/5">
                        {icon || title.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-foreground uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                            {title}
                        </h4>
                        {subtitle && <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{subtitle}</p>}
                    </div>
                </div>
                {status && <div className="shrink-0">{status}</div>}
            </div>

            {description && (
                <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3 py-1">
                    {description}
                </p>
            )}

            <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {tags}
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {actions}
                    {onClick && <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />}
                </div>
            </div>
        </div>
    );
};
