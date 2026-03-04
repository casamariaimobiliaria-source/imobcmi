import React from 'react';
import { Client, Lead } from '../../types';
import { User as UserIcon, Mail, Phone, FileText, MapPin, Save, Heart } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: Partial<Client>;
    setFormData: (data: Partial<Client>) => void;
    onSubmit: (e: React.FormEvent) => void;
    editingId: string | null;
    togglePreference: (field: 'propertyType' | 'neighborhoods', value: string) => void;
    leads?: Lead[];
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
    isOpen,
    onClose,
    formData,
    setFormData,
    onSubmit,
    editingId,
    togglePreference,
    leads = [] as Lead[]
}) => {
    const formatCEP = (value: string) => {
        if (!value) return '';
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
    };

    const formatCurrency = (value: string | number | undefined) => {
        if (value === undefined || value === null || value === 0 || value === '') return '';
        const digitsStr = typeof value === 'number' ? (value * 100).toFixed(0) : String(value).replace(/\D/g, '');
        if (!digitsStr) return '';
        const amount = Number(digitsStr) / 100;
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const parseCurrency = (value: string) => {
        const digitsStr = value.replace(/\D/g, '');
        return digitsStr ? Number(digitsStr) / 100 : 0;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingId ? 'Editar Cliente' : 'Novo Cliente CMI'}
            maxWidth="max-w-3xl"
        >
            <form onSubmit={onSubmit} className="space-y-8 pb-4">
                {/* Basic Info */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                        <UserIcon size={14} className="text-primary" /> Identificação Pessoal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            {leads.length > 0 && !editingId && (
                                <div className="mb-6 bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-lg shadow-primary/5 animate-in slide-in-from-top-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2 italic">
                                        <UserIcon size={14} /> Importar Lead para Conversão
                                    </h4>
                                    <Input
                                        as="select"
                                        label="Selecionar Lead Existente"
                                        onChange={(e) => {
                                            const lead = leads.find(l => l.id === e.target.value);
                                            if (lead) {
                                                setFormData({
                                                    ...formData,
                                                    name: lead.nome || formData.name,
                                                    phone: lead.telefone || formData.phone,
                                                    email: lead.email || formData.email
                                                });
                                            }
                                        }}
                                    >
                                        <option value="">Nenhum - Criar cliente manualmente</option>
                                        {leads.filter(l => l.status !== 'fechado' && l.status !== 'perdido').map(l => (
                                            <option key={l.id} value={l.id}>{l.nome} {l.telefone ? `- ${l.telefone}` : ''}</option>
                                        ))}
                                    </Input>
                                </div>
                            )}
                            <Input
                                label="Nome Completo"
                                required
                                icon={<UserIcon size={18} />}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: João da Silva"
                            />
                        </div>
                        <Input
                            label="E-mail"
                            type="email"
                            icon={<Mail size={18} />}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="contato@exemplo.com"
                        />
                        <Input
                            label="Telefone"
                            icon={<Phone size={18} />}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(00) 0 0000-0000"
                        />
                        <Input
                            label="CPF / CNPJ"
                            icon={<FileText size={18} />}
                            className="font-mono"
                            value={formData.cpfCnpj}
                            onChange={e => setFormData({ ...formData, cpfCnpj: e.target.value })}
                            placeholder="000.000.000-00"
                        />
                        <div>
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1 italic">Status</label>
                            <div className="flex gap-4 h-[46px] items-center px-4 bg-secondary border border-border/40 rounded-xl">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio" name="status" value="active"
                                        checked={formData.status === 'active'}
                                        onChange={() => setFormData({ ...formData, status: 'active' })}
                                        className="appearance-none w-3.5 h-3.5 border-2 border-border rounded-full checked:bg-emerald-500 checked:border-emerald-500 transition-all"
                                    />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.status === 'active' ? 'text-emerald-500' : 'text-muted-foreground'}`}>Ativo</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio" name="status" value="inactive"
                                        checked={formData.status === 'inactive'}
                                        onChange={() => setFormData({ ...formData, status: 'inactive' })}
                                        className="appearance-none w-3.5 h-3.5 border-2 border-border rounded-full checked:bg-red-500 checked:border-red-500 transition-all"
                                    />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.status === 'inactive' ? 'text-red-500' : 'text-muted-foreground'}`}>Inativo</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                        <MapPin size={14} className="text-primary" /> Endereço e Dados Complementares
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Data de Nascimento"
                            type="date"
                            value={formData.birthDate}
                            onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                        />
                        <Input
                            label="CEP"
                            icon={<MapPin size={18} />}
                            value={formData.zipCode || ''}
                            onChange={e => setFormData({ ...formData, zipCode: formatCEP(e.target.value) })}
                            placeholder="00000-000"
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="Endereço"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Rua, Avenida, etc."
                            />
                        </div>
                        <Input
                            label="Número"
                            value={formData.number}
                            onChange={e => setFormData({ ...formData, number: e.target.value })}
                            placeholder="123"
                        />
                        <Input
                            label="Bairro"
                            value={formData.neighborhood}
                            onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                            placeholder="Centro, Jardim, etc."
                        />
                        <Input
                            label="Cidade"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            placeholder="São Paulo"
                        />
                        <Input
                            label="Estado"
                            value={formData.state}
                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                            placeholder="SP"
                            className="uppercase"
                        />
                        <div className="md:col-span-2">
                            <Input
                                as="textarea"
                                label="Observações"
                                icon={<FileText size={18} />}
                                value={formData.notes || ''}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Anotações adicionais sobre o cliente..."
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                        <Heart size={14} className="text-red-500" /> Preferências de Imóvel
                    </h3>
                    <div className="bg-secondary p-6 rounded-2xl border border-border/40 space-y-6">
                        <div>
                            <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3 italic">Tipos de Imóvel</label>
                            <div className="flex flex-wrap gap-2">
                                {['Apartamento', 'Casa', 'Sobrado', 'Terreno', 'Comercial'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => togglePreference('propertyType', type)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all border ${formData.preferences?.propertyType.includes(type)
                                            ? 'bg-primary/10 border-primary/30 text-primary'
                                            : 'bg-background border-border/40 text-muted-foreground hover:border-primary/50'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                label="Budget Mínimo"
                                value={formatCurrency(formData.preferences?.minBudget)}
                                onChange={e => setFormData({
                                    ...formData,
                                    preferences: { ...formData.preferences!, minBudget: parseCurrency(e.target.value) }
                                })}
                                placeholder="R$ 0,00"
                            />
                            <Input
                                type="text"
                                label="Budget Máximo"
                                value={formatCurrency(formData.preferences?.maxBudget)}
                                onChange={e => setFormData({
                                    ...formData,
                                    preferences: { ...formData.preferences!, maxBudget: parseCurrency(e.target.value) }
                                })}
                                placeholder="R$ 0,00"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                    <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
                    <Button type="submit" icon={Save}>
                        {editingId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
