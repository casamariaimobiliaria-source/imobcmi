import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'max-w-2xl'
}) => {
    // Prevent scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative glass-thick w-full ${maxWidth} shadow-[0_0_50px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] border border-white/20 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-500`}>
                {/* Header */}
                <div className="bg-white/5 dark:bg-white/[0.02] p-6 md:p-8 flex justify-between items-center border-b border-white/10 backdrop-blur-3xl relative overflow-hidden shimmer">
                    <div className="relative z-10">
                        <h2 className="text-foreground font-black uppercase tracking-widest italic text-xl drop-shadow-sm">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 text-muted-foreground hover:text-red-400 transition-all hover:rotate-90 bg-white/5 p-2.5 rounded-full border border-white/10 hover:border-red-500/30"
                    >
                        <X size={22} />
                    </button>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full -mr-16 -mt-16" />
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-transparent">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 md:p-8 bg-white/5 dark:bg-white/[0.02] border-t border-white/10 flex justify-end gap-3 backdrop-blur-3xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
