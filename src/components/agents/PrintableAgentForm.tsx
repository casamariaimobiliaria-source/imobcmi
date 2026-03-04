import React from 'react';
import { User, MapPin, Briefcase, Link as LinkIcon } from 'lucide-react';
import { useApp } from '../../context/AppProvider';

export const PrintableAgentForm = () => {
    const { settings } = useApp();

    return (
        <div className="hidden print:flex w-[210mm] min-h-[297mm] bg-white text-black p-0 mx-auto text-sm font-sans flex-col relative" style={{ color: '#000' }}>
            <style>
                {`
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                        background: white !important;
                    }
                    .print-container {
                        padding: 10mm 15mm !important;
                        display: flex !important;
                        flex-direction: column !important;
                        min-height: 297mm !important;
                    }
                }
                `}
            </style>

            <div className="print-container flex-1 flex flex-col p-8">
                {/* Header */}
                <div className="relative border-b-2 border-black pb-4 mb-6 flex flex-col items-center justify-center min-h-[80px]">
                    <div className="absolute left-0 top-0 w-32 h-20 flex items-center justify-start overflow-hidden">
                        {settings?.logo_url ? (
                            <img src={settings.logo_url} alt="Logo" className="max-w-full max-h-full object-contain object-left" />
                        ) : (
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black uppercase tracking-tighter">
                                    {settings?.system_name.split(' ')[0]} <span className="font-light">{settings?.system_name.split(' ').slice(1).join(' ')}</span>
                                </h1>
                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{settings?.company_name}</p>
                            </div>
                        )}
                    </div>
                    <div className="text-center pt-2">
                        <h2 className="text-2xl font-black uppercase tracking-[0.3em]">Ficha de Cadastro</h2>
                        <p className="text-xs font-black text-gray-600 uppercase tracking-[0.4em] mt-1">Corretor Parceiro</p>
                    </div>
                </div>

                <div className="space-y-7">
                    {/* 1. Dados Pessoais */}
                    <section>
                        <h3 className="font-black uppercase tracking-[0.2em] border-b border-gray-300 pb-2 mb-4 flex items-center gap-2 text-xs italic">
                            <User size={14} /> 1. Dados Pessoais & Identificação
                        </h3>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                            <div className="col-span-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nome Completo</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CPF</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data de Nascimento</p>
                                <div className="flex gap-4">
                                    <span className="border-b border-black w-12 text-center h-8"></span> /
                                    <span className="border-b border-black w-12 text-center h-8"></span> /
                                    <span className="border-b border-black flex-1 h-8"></span>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Telefone / WhatsApp</p>
                                <div className="flex gap-2">
                                    <span className="border-b border-black w-14 text-center h-8">(   )</span>
                                    <span className="border-b border-black flex-1 h-8"></span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">E-mail Profissional</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Endereço */}
                    <section>
                        <h3 className="font-black uppercase tracking-[0.2em] border-b border-gray-300 pb-2 mb-4 flex items-center gap-2 text-xs italic">
                            <MapPin size={14} /> 2. Endereço Residencial/Comercial
                        </h3>
                        <div className="grid grid-cols-12 gap-y-6 gap-x-6">
                            <div className="col-span-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CEP</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>
                            <div className="col-span-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Endereço (Rua, Avenida)</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>

                            <div className="col-span-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Número</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>
                            <div className="col-span-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bairro</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>
                            <div className="col-span-5">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cidade</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>
                            <div className="col-span-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">UF</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>
                        </div>
                    </section>

                    {/* 3. Perfil Profissional */}
                    <section>
                        <h3 className="font-black uppercase tracking-[0.2em] border-b border-gray-300 pb-2 mb-4 flex items-center gap-2 text-xs italic">
                            <Briefcase size={14} /> 3. Perfil Profissional
                        </h3>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CRECI</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CNAI (Avaliador)</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>

                            <div className="col-span-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Imobiliárias anteriores / Experiência</p>
                                <div className="border-b border-black h-8 w-full mt-2"></div>
                            </div>

                            <div className="col-span-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Especialidades (Marque com X)</p>
                                <div className="grid grid-cols-3 gap-y-4">
                                    {['Alto Padrão', 'Lançamentos', 'MCMV', 'Locação', 'Comercial', 'Rural'].map(spec => (
                                        <label key={spec} className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-black rounded-sm"></div>
                                            <span className="text-sm font-bold uppercase tracking-tight">{spec}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. Marketing */}
                    <section>
                        <h3 className="font-black uppercase tracking-[0.2em] border-b border-gray-300 pb-2 mb-4 flex items-center gap-2 text-xs italic">
                            <LinkIcon size={14} /> 4. Redes Sociais
                        </h3>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Instagram (@)</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">LinkedIn</p>
                                <div className="border-b border-black h-8 w-full"></div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer / Assinatura */}
                <div className="mt-auto pt-8 text-center pb-4">
                    <div className="grid grid-cols-2 gap-16 mb-8">
                        <div className="text-center">
                            <div className="border-b-2 border-black w-full mb-3"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Local e Data</p>
                        </div>
                        <div className="text-center">
                            <div className="border-b-2 border-black w-full mb-3"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Assinatura do Corretor</p>
                        </div>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] italic">
                        Ficha oficial de registro - {settings?.system_name || 'ImobCMI'}
                    </p>
                </div>
            </div>
        </div>
    );
};
