import React from 'react';
import { LeadSource } from '../../types';
import { Input } from '../ui/Input';
import { LayoutGrid } from 'lucide-react';

interface LeadSourceFormProps {
    formData: Partial<LeadSource>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<LeadSource>>>;
}

export const LeadSourceForm: React.FC<LeadSourceFormProps> = ({ formData, setFormData }) => {
    return (
        <div className="space-y-6">
            <Input
                label="Nome da Mídia / Origem"
                icon={<LayoutGrid size={16} />}
                required
                placeholder="Ex: Google Ads, Instagram, Indicação..."
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
                as="select"
                label="Status"
                required
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
            </Input>
        </div>
    );
};
