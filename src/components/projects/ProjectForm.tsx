import React from 'react';
import { Project } from '../../types';
import { useApp } from '../../context/AppProvider';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    formData: Partial<Project>;
    setFormData: (data: Partial<Project>) => void;
    onSubmit: (e: React.FormEvent) => void;
    editingId: string | null;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
    isOpen,
    onClose,
    formData,
    setFormData,
    onSubmit,
    editingId
}) => {
    const { developers } = useApp();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingId ? 'Editar Projeto' : 'Novo Projeto'}
            size="md"
        >
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-4">
                    <Input
                        label="Nome do Projeto *"
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Residencial Parque das Flores"
                        className="uppercase"
                    />

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Incorporadora Parceira
                        </label>
                        <select
                            value={formData.developer_id || ''}
                            onChange={(e) => setFormData({ ...formData, developer_id: e.target.value })}
                            className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase tracking-wide"
                        >
                            <option value="">Selecione uma incorporadora</option>
                            {developers.map(dev => (
                                <option key={dev.id} value={dev.id}>{dev.companyName}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Endereço"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Ex: Rua das Rosas, 123"
                        className="uppercase"
                    />

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Status
                        </label>
                        <select
                            value={formData.status || 'active'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                            className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase tracking-wide"
                        >
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Observações
                        </label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] uppercase"
                            placeholder="Notas adicionais sobre o projeto..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit">
                        {editingId ? 'Salvar Alterações' : 'Cadastrar Projeto'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
