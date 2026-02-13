import { supabase } from '../supabaseClient';
import { Lead } from '../types';

export interface AIInsight {
    temperatura: string;
    insights: string[];
    whatsapp_suggestion: string;
}

class AIService {
    async getLeadInsights(lead: Lead): Promise<AIInsight> {
        const { data, error } = await supabase.functions.invoke('ai-sales-assistant', {
            body: { lead }
        });

        if (error) {
            console.error('Erro detalhado ao chamar IA:', error);
            throw new Error(`Falha ao obter insights da IA: ${error.message}`);
        }

        if (data && data.error) {
            console.error('IA retornou erro no corpo:', data.error);
            throw new Error(`IA: ${data.error}`);
        }

        return data as AIInsight;
    }

    async getFinancialAnalysis(financialSummary: any): Promise<any> {
        const { data, error } = await supabase.functions.invoke('ai-financial-analyst', {
            body: { financialSummary }
        });

        if (error) {
            console.error('Erro ao chamar IA Financeira:', error);
            throw new Error(`Falha no Diagnóstico Financeiro: ${error.message}`);
        }

        if (data && data.error) {
            throw new Error(`IA Financeira: ${data.error}`);
        }

        return data;
    }

    async getPipelineAnalysis(leads: Lead[]): Promise<any> {
        const { data, error } = await supabase.functions.invoke('ai-pipeline-analyst', {
            body: { leads }
        });

        if (error) {
            console.error('Erro ao chamar IA de Pipeline:', error);
            throw new Error(`Falha na Análise de Pipeline: ${error.message}`);
        }

        return data;
    }

    async getStrategicBriefing(context: any): Promise<string> {
        const { data, error } = await supabase.functions.invoke('ai-strategic-briefing', {
            body: { context }
        });

        if (error) {
            console.error('Erro ao chamar IA Briefing:', error);
            return "Não foi possível gerar o briefing estratégico no momento.";
        }

        return data.briefing || data;
    }
}

export const aiService = new AIService();
