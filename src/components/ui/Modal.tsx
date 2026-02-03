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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-[#09090b] w-full ${maxWidth} shadow-2xl rounded-[2rem] border border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300`}>
                {/* Header */}
                <div className="bg-[#0f1115]/80 p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md">
                    <h2 className="text-white font-black uppercase tracking-tighter italic text-lg">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-red-400 transition-colors bg-white/5 p-2 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 bg-[#0f1115]/80 border-t border-white/5 flex justify-end gap-3 backdrop-blur-md">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
