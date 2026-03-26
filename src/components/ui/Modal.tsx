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
            {/* Backdrop Visual Component: darker and blurrier */}
            <div className="absolute inset-0 bg-[#0A1025]/85 backdrop-blur-[12px] animate-in fade-in duration-500 pointer-events-none" />

            {/* Clickable Overlay explicitly for closing */}
            <div
                className="absolute inset-0 z-0"
                onClick={onClose}
                aria-label="Close modal"
            />

            {/* Modal Content */}
            <div
                className={`relative z-10 w-full ${maxWidth} bg-[#0A1025]/95 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-3xl border border-[#00F5FF]/15 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-300`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient edge and violet orb */}
                <div className="bg-white/[0.02] p-6 md:p-8 flex justify-between items-center border-b border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00F5FF]/50 to-transparent opacity-80" />
                    <div className="relative z-10">
                        <h2 className="text-white font-black uppercase tracking-widest italic text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="relative z-10 text-muted-foreground hover:text-[#FF4D6D] transition-all hover:rotate-90 bg-white/[0.03] p-2.5 rounded-full border border-white/10 hover:border-[#FF4D6D]/30"
                    >
                        <X size={22} />
                    </button>
                    {/* Violet orb */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#7B2FFF]/15 blur-[40px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-transparent">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 md:p-8 bg-white/[0.02] border-t border-white/10 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
