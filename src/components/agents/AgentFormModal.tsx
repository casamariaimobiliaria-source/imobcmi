import React from 'react';
import { Agent } from '../../types';
import { User, Phone, Mail, FileText, MapPin, Save, ShieldCheck } from 'lucide-react';
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
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingId ? 'Editar Perfil do Corretor' : 'Novo Corretor Parceiro'}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={onSubmit} className="space-y-8 pb-4">
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
                            value={formData.creci}
                            onChange={e => setFormData({ ...formData, creci: e.target.value })}
                            placeholder="Registo Profissional"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                        <MapPin size={14} className="text-primary" /> Endereço Residencial/Comercial
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            label="CEP"
                            value={formData.zipCode}
                            onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                            placeholder="00000-000"
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="Cidade"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Ex: Curitiba"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                    <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
                    <Button type="submit" icon={Save}>
                        {editingId ? 'Salvar Perfil' : 'Cadastrar Corretor'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
