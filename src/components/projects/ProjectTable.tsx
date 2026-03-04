import React from 'react';
import { Edit2, Trash2, Building2 } from 'lucide-react';
import { Project } from '../../types';
import { useApp } from '../../context/AppProvider';
import { Badge } from '../ui/Badge';

interface ProjectTableProps {
    projects: Project[];
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onEdit, onDelete }) => {
    const { developers } = useApp();

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Incorporadora</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endereço</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {projects.map((project) => {
                        const dev = developers.find(d => d.id === project.developer_id);
                        return (
                            <tr key={project.id} className="hover:bg-muted/10 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Building2 size={16} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground uppercase tracking-wider text-sm">{project.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                    {dev ? dev.companyName : '-'}
                                </td>
                                <td className="p-4 text-sm text-muted-foreground uppercase tracking-wide">
                                    {project.address || '-'}
                                </td>
                                <td className="p-4">
                                    <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                                        {project.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(project)}
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(project.id)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {projects.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-muted-foreground uppercase tracking-wider text-sm">
                                Nenhum projeto encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
