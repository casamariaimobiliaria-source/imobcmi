import React from 'react';
import { Developer } from '../../types';
import { Building2, FileText, User, Sparkles, MapPin } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface DeveloperFormProps {
    isOpen: boolean;
    onClose: () => void;
    formData: Partial<Developer>;
    setFormData: (data: Partial<Developer>) => void;
    onSubmit: (e: React.FormEvent) => void;
    editingId: string | null;
}

export const DeveloperForm: React.FC<DeveloperFormProps> = ({
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
            title={editingId ? 'Ajustar Incorporadora' : 'Nova Incorporadora'}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={onSubmit} className="space-y-8">
                {/* Business Section */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                        <Sparkles size={14} className="text-primary" /> Identificação Corporativa
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input
                                label="Razão Social"
                                required
                                icon={<Building2 size={18} />}
                                value={formData.companyName}
                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="Razão Social ou Nome Fantasia"
                            />
                        </div>

                        <Input
                            label="CNPJ"
                            icon={<FileText size={18} />}
                            className="font-mono"
                            value={formData.cnpj}
                            onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                            placeholder="00.000.000/0001-00"
                        />

                        <div>
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1 italic">Status de Parceria</label>
                            <div className="flex gap-6 h-[46px] items-center px-4 bg-secondary border border-border/40 rounded-xl">
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
                    </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                        <User size={14} className="text-primary" /> Contato Principal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nome do Contato"
                            required
                            icon={<User size={18} />}
                            value={formData.contactName}
                            onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                            placeholder="Ex: Ana Silva"
                        />
                        <Input
                            label="E-mail"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="ana@incorporadora.com.br"
                        />
                    </div>
                </div>

                {/* Location Section */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 italic">
                        <MapPin size={14} className="text-primary" /> Endereço Residencial/Comercial
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Cidade"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Ex: São Paulo"
                        />
                        <Input
                            label="Estado (UF)"
                            value={formData.state}
                            maxLength={2}
                            onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                            placeholder="SP"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                    <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
                    <Button type="submit">
                        {editingId ? 'Atualizar Dados' : 'Criar Registro'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
