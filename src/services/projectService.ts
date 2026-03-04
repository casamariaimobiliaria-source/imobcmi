import { supabase } from '../supabaseClient';
import { Project } from '../types';

export const projectService = {
    getProjects: async (organizationId?: string): Promise<Project[]> => {
        let query = supabase.from('projects').select('*').order('name', { ascending: true });

        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }

        return data.map(item => ({
            ...item,
            organizationId: item.organization_id // normalize case
        })) as Project[];
    },

    addProject: async (project: Project): Promise<Project> => {
        const { id, organizationId, ...rest } = project;
        // ensure db fields
        const insertData: any = {
            ...rest,
            organization_id: organizationId
        };

        if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            insertData.id = id;
        }

        // Clean empty strings to null to avoid UUID cast errors
        Object.keys(insertData).forEach(key => {
            if (insertData[key] === '') {
                insertData[key] = null;
            }
        });

        const { data, error } = await supabase
            .from('projects')
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error('Error adding project:', error);
            throw error;
        }
        return { ...data, organizationId: data.organization_id } as Project;
    },

    updateProject: async (id: string, project: Partial<Project>): Promise<void> => {
        const { organizationId, ...rest } = project;
        const updateData: any = { ...rest };
        if (organizationId) updateData.organization_id = organizationId;

        // Clean empty strings to null to avoid UUID cast errors
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === '') {
                updateData[key] = null;
            }
        });

        const { error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    },

    deleteProject: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }
};
