import React, { useState } from 'react';
import { Agent } from '../../types';
import { User, Phone, Mail, FileText, MapPin, Save, ShieldCheck, Briefcase, Calendar, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AgentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: Partial<Agent>;
    setFormData: (data: Partial<Agent>) => void;
    onSubmit: (e: React.FormEvent) => void;
    editingId: string | null;
}

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
    isOpen,
    onClose,
    formData,
    setFormData,
    onSubmit,
    editingId
}) => {
    const [activeTab, setActiveTab] = useState<'pessoal' | 'profissional'>('pessoal');

    const toggleSpecialty = (specialty: string) => {
        const current = formData.specialties || [];
        if (current.includes(specialty)) {
            setFormData({ ...formData, specialties: current.filter(s => s !== specialty) });
        } else {
            setFormData({ ...formData, specialties: [...current, specialty] });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingId ? 'Editar Perfil do Corretor' : 'Novo Corretor Parceiro'}
            maxWidth="max-w-3xl"
        >
            <form onSubmit={onSubmit} className="space-y-6 pb-4">

                {/* Tabs */}
                <div className="flex gap-2 border-b border-border/40 pb-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('pessoal')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'pessoal' ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-white/5'}`}
                    >
                        Dados Pessoais
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('profissional')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'profissional' ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-white/5'}`}
                    >
                        Perfil Profissional
                    </button>
                </div>

                {activeTab === 'pessoal' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        {/* Status Section */}
                        <div className="bg-secondary/30 border border-border/40 p-4 rounded-xl flex items-center justify-between">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Status de Atividade</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio" name="status" value="active"
                                        checked={formData.status === 'active'}
                                        onChange={() => setFormData({ ...formData, status: 'active' })}
                                        className="appearance-none w-3.5 h-3.5 border-2 border-border rounded-full checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                                    />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.status === 'active' ? 'text-emerald-500' : 'text-muted-foreground'}`}>Ativo</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio" name="status" value="inactive"
                                        checked={formData.status === 'inactive'}
                                        onChange={() => setFormData({ ...formData, status: 'inactive' })}
                                        className="appearance-none w-3.5 h-3.5 border-2 border-border rounded-full checked:bg-red-500 checked:border-red-500 transition-all cursor-pointer"
                                    />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.status === 'inactive' ? 'text-red-500' : 'text-muted-foreground'}`}>Inativo</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <User size={14} className="text-primary" /> Identificação Profissional
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input
                                        label="Nome Completo"
                                        required
                                        icon={<User size={18} />}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Nome Fantasia ou Completo"
                                    />
                                </div>
                                <Input
                                    label="E-mail Profissional"
                                    type="email"
                                    required
                                    icon={<Mail size={18} />}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="exemplo@cmipro.com.br"
                                />
                                <Input
                                    label="Telefone / WhatsApp"
                                    icon={<Phone size={18} />}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(00) 0 0000-0000"
                                />
                                <Input
                                    label="CPF"
                                    icon={<FileText size={18} />}
                                    className="font-mono"
                                    value={formData.cpf}
                                    onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                    placeholder="000.000.000-00"
                                />
                                <Input
                                    label="CRECI"
                                    icon={<ShieldCheck size={18} />}
                                    value={formData.creci || ''}
                                    onChange={e => setFormData({ ...formData, creci: e.target.value })}
                                    placeholder="Registro Profissional"
                                />
                                <Input
                                    label="Data de Nascimento"
                                    type="date"
                                    icon={<Calendar size={18} />}
                                    value={formData.birth_date || ''}
                                    onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <MapPin size={14} className="text-primary" /> Endereço Residencial/Comercial
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-3">
                                    <Input
                                        label="CEP"
                                        value={formData.zipCode || ''}
                                        onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div className="md:col-span-7">
                                    <Input
                                        label="Endereço"
                                        value={formData.address || ''}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Logradouro, Avenida, etc"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label="Nº"
                                        value={formData.number || ''}
                                        onChange={e => setFormData({ ...formData, number: e.target.value })}
                                        placeholder="123"
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <Input
                                        label="Bairro"
                                        value={formData.neighborhood || ''}
                                        onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                        placeholder="Centro"
                                    />
                                </div>
                                <div className="md:col-span-6">
                                    <Input
                                        label="Cidade"
                                        value={formData.city || ''}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Ex: Curitiba"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label="UF"
                                        value={formData.state || ''}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        placeholder="PR"
                                        maxLength={2}
                                        className="uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'profissional' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <Briefcase size={14} className="text-primary" /> Histórico e Vendas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="CNAI (Avaliador)"
                                    icon={<ShieldCheck size={18} />}
                                    value={formData.cnai || ''}
                                    onChange={e => setFormData({ ...formData, cnai: e.target.value })}
                                    placeholder="Ex: 12345"
                                />
                                <Input
                                    label="Tempo de Mercado (Anos)"
                                    type="number"
                                    icon={<Calendar size={18} />}
                                    value={formData.experience_years || ''}
                                    onChange={e => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                                    placeholder="Ex: 5"
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Imobiliárias Anteriores"
                                        icon={<Briefcase size={18} />}
                                        value={formData.previous_agencies || ''}
                                        onChange={e => setFormData({ ...formData, previous_agencies: e.target.value })}
                                        placeholder="Ex: Remax, Lopes, Coelho da Fonseca..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 italic">Especialidades de Atuação</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Alto Padrão', 'Lançamentos', 'MCMV', 'Locação', 'Comercial', 'Rural'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleSpecialty(type)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all border ${(formData.specialties || []).includes(type)
                                                ? 'bg-primary/10 border-primary/30 text-primary'
                                                : 'bg-background border-border/40 text-muted-foreground hover:border-primary/50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <LinkIcon size={14} className="text-primary" /> Marketing e Redes Sociais
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Instagram URL"
                                    icon={<LinkIcon size={18} />}
                                    value={formData.instagram_url || ''}
                                    onChange={e => setFormData({ ...formData, instagram_url: e.target.value })}
                                    placeholder="instagram.com/corretor"
                                />
                                <Input
                                    label="LinkedIn URL"
                                    icon={<LinkIcon size={18} />}
                                    value={formData.linkedin_url || ''}
                                    onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                                    placeholder="linkedin.com/in/corretor"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Controls */}
                <div className="flex justify-between items-center pt-6 border-t border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {activeTab === 'pessoal' ? (
                            <button type="button" onClick={() => setActiveTab('profissional')} className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"> Avançar para Perfil Profissional &rarr;</button>
                        ) : (
                            <button type="button" onClick={() => setActiveTab('pessoal')} className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"> &larr; Voltar para Pessoal</button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
                        <Button type="submit" icon={Save}>
                            {editingId ? 'Salvar Perfil' : 'Cadastrar Corretor'}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};
