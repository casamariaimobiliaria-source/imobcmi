
import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Project } from '../types';
import { generateId } from '../utils';
import { Plus, Search, Pencil, Trash2, X, Building2, MapPin, AlignLeft, Save } from 'lucide-react';

export const Projects = () => {
    const { projects, developers, addProject, updateProject, deleteProject } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState: Partial<Project> = {
        name: '', developerId: '', address: '', notes: '', status: 'active'
    };
    const [formData, setFormData] = useState<Partial<Project>>(initialFormState);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenModal = (project?: Project) => {
        if (project) {
            setFormData(project);
            setEditingId(project.id);
        } else {
            setFormData(initialFormState);
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.developerId) return;

        if (editingId) {
            updateProject(editingId, formData);
        } else {
            addProject({ ...formData, id: generateId() } as Project);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este empreendimento?')) {
            deleteProject(id);
        }
    };

    const getDeveloperName = (devId: string) => {
        const dev = developers.find(d => d.id === devId);
        return dev ? dev.companyName : 'Desconhecida';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Empreendimentos</h1>
                    <p className="text-slate-500">Gestão de projetos e obras.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
                >
                    <Plus size={20} />
                    Novo Empreendimento
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou endereço..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-14rem)] flex flex-col">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-auto flex-1">
                    <table className="w-full text-left text-sm min-w-[800px]">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4">Nome / Status</th>
                                <th className="px-6 py-4">Incorporadora</th>
                                <th className="px-6 py-4">Endereço</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProjects.map(project => (
                                <tr key={project.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Building2 size={16} />
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-800 block">{project.name}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {project.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{getDeveloperName(project.developerId)}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {project.address || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(project)}
                                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProjects.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum empreendimento encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden overflow-y-auto">
                    {filteredProjects.map(project => (
                        <div key={project.id} className="p-4 border-b border-slate-100 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{project.name}</h3>
                                        <p className="text-xs text-slate-500">{getDeveloperName(project.developerId)}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {project.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>

                            <div className="text-sm text-slate-600 space-y-1 mb-4 pl-[52px]">
                                <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {project.address || '-'}</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                                <button onClick={() => handleOpenModal(project)} className="flex items-center gap-1 text-slate-500 text-sm">
                                    <Pencil size={16} /> Editar
                                </button>
                                <div className="w-px h-4 bg-slate-200"></div>
                                <button onClick={() => handleDelete(project.id)} className="flex items-center gap-1 text-slate-500 text-sm hover:text-red-500">
                                    <Trash2 size={16} /> Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredProjects.length === 0 && (
                        <div className="p-8 text-center text-slate-400">Nenhum empreendimento encontrado.</div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingId ? 'Editar Empreendimento' : 'Novo Empreendimento'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Empreendimento</label>
                                <input
                                    required
                                    className="w-full p-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Residencial Flores"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Incorporadora</label>
                                <select
                                    required
                                    className="w-full p-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none"
                                    value={formData.developerId}
                                    onChange={e => setFormData({ ...formData, developerId: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {developers.map(dev => (
                                        <option key={dev.id} value={dev.id}>{dev.companyName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        className="w-full pl-10 p-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none"
                                        value={formData.address || ''}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Endereço completo"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <textarea
                                        className="w-full pl-10 p-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none h-24 resize-none"
                                        value={formData.notes || ''}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Detalhes adicionais..."
                                    ></textarea>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <div className="flex gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio" name="status" value="active"
                                            checked={formData.status === 'active'}
                                            onChange={() => setFormData({ ...formData, status: 'active' })}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Ativo</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio" name="status" value="inactive"
                                            checked={formData.status === 'inactive'}
                                            onChange={() => setFormData({ ...formData, status: 'inactive' })}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Inativo</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                                >
                                    <Save size={18} /> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
