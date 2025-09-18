import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { Campaign, ResponsibleUser, User, Document, Integration, Notification, UserRole } from '../types';

const supabase = getSupabaseClient();

// Conversores de tipos
const convertSupabaseCampaign = (row: any): Campaign => ({
  id: row.id,
  cliente: row.cliente,
  campanha: row.campanha,
  agencia: row.agencia,
  atendimento_responsavel: row.atendimento_responsavel,
  periodo_inicio: row.periodo_inicio ? new Date(row.periodo_inicio) : null,
  periodo_fim: row.periodo_fim ? new Date(row.periodo_fim) : null,
  data_entrada_pauta: row.data_entrada_pauta ? new Date(row.data_entrada_pauta) : null,
  data_prevista_retorno_agencia: row.data_prevista_retorno_agencia ? new Date(row.data_prevista_retorno_agencia) : null,
  data_recebimento_relatorio: row.data_recebimento_relatorio ? new Date(row.data_recebimento_relatorio) : null,
  data_prevista_recebimento_relatorio: row.data_prevista_recebimento_relatorio ? new Date(row.data_prevista_recebimento_relatorio) : null,
  prazo_analise_interna: row.prazo_analise_interna ? new Date(row.prazo_analise_interna) : null,
  data_feedback_agencia: row.data_feedback_agencia ? new Date(row.data_feedback_agencia) : null,
  status_plano: row.status_plano,
  proa: row.proa,
  briefing: row.briefing,
  orcamento: row.orcamento,
  comentarios: row.comentarios,
  relatorio_recebido: row.relatorio_recebido,
  exhibition_status: row.exhibition_status,
  observacoes_ajustes: row.observacoes_ajustes,
  comprovantes_sac_recebidos: row.comprovantes_sac_recebidos,
  plano_midia_arquivo_nome: row.plano_midia_arquivo_nome,
  relatorio_arquivo_nome: row.relatorio_arquivo_nome,
  presenca_em: row.presenca_em || [],
  orcamento_por_midia: row.orcamento_por_midia || {},
  regioes_funcionais: row.regioes_funcionais || [],
  history: row.history || [],
  created_at: new Date(row.created_at),
  updated_at: new Date(row.updated_at)
});

const convertCampaignToSupabase = (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>, userId: string) => ({
  user_id: userId,
  cliente: campaign.cliente,
  campanha: campaign.campanha,
  agencia: campaign.agencia,
  atendimento_responsavel: campaign.atendimento_responsavel,
  periodo_inicio: campaign.periodo_inicio?.toISOString(),
  periodo_fim: campaign.periodo_fim?.toISOString(),
  data_entrada_pauta: campaign.data_entrada_pauta?.toISOString(),
  data_prevista_retorno_agencia: campaign.data_prevista_retorno_agencia?.toISOString(),
  data_recebimento_relatorio: campaign.data_recebimento_relatorio?.toISOString(),
  data_prevista_recebimento_relatorio: campaign.data_prevista_recebimento_relatorio?.toISOString(),
  prazo_analise_interna: campaign.prazo_analise_interna?.toISOString(),
  data_feedback_agencia: campaign.data_feedback_agencia?.toISOString(),
  status_plano: campaign.status_plano,
  proa: campaign.proa,
  briefing: campaign.briefing,
  orcamento: campaign.orcamento,
  comentarios: campaign.comentarios,
  relatorio_recebido: campaign.relatorio_recebido,
  exhibition_status: campaign.exhibition_status,
  observacoes_ajustes: campaign.observacoes_ajustes,
  comprovantes_sac_recebidos: campaign.comprovantes_sac_recebidos,
  plano_midia_arquivo_nome: campaign.plano_midia_arquivo_nome,
  relatorio_arquivo_nome: campaign.relatorio_arquivo_nome,
  presenca_em: campaign.presenca_em || [],
  orcamento_por_midia: campaign.orcamento_por_midia || {},
  regioes_funcionais: campaign.regioes_funcionais || [],
  history: campaign.history || []
});

// Serviços de autenticação
export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Serviços de perfil
export const profileService = {
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      image: data.image || `https://i.pravatar.cc/150?u=${data.email}`
    };
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        role: updates.role,
        image: updates.image
      })
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  }
};

// Serviços de campanhas
export const campaignService = {
  async getCampaigns(userId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(convertSupabaseCampaign);
  },

  async createCampaign(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>, userId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(convertCampaignToSupabase(campaign, userId))
      .select()
      .single();

    if (error) throw error;
    return convertSupabaseCampaign(data);
  },

  async updateCampaign(campaignId: string, campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>, userId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(convertCampaignToSupabase(campaign, userId))
      .eq('id', campaignId)
      .select()
      .single();

    if (error) throw error;
    return convertSupabaseCampaign(data);
  },

  async deleteCampaign(campaignId: string, userId: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)

    if (error) throw error;
  },

  subscribeToCampaigns(userId: string, callback: (campaigns: Campaign[]) => void) {
    return supabase
      .channel('campaigns')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'campaigns',
          filter: `user_id=eq.${userId}`
        }, 
        async () => {
          const campaigns = await this.getCampaigns(userId);
          callback(campaigns);
        }
      )
      .subscribe();
  }
};

// Serviços de membros da equipe
export const teamService = {
  async getTeamMembers(userId: string): Promise<ResponsibleUser[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name');

    if (error || !data) return [];
    return data.map(row => ({
      name: row.name,
      image: row.image || `https://i.pravatar.cc/150?u=${row.name.toLowerCase()}`
    }));
  },

  async addTeamMember(member: ResponsibleUser, userId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        user_id: userId,
        name: member.name,
        image: member.image
      })
      .select()
      .single();

    if (error) throw error;
    return {
      name: data.name,
      image: data.image || `https://i.pravatar.cc/150?u=${data.name.toLowerCase()}`
    };
  },

  async updateTeamMember(memberName: string, updates: Partial<ResponsibleUser>, userId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: updates.name,
        image: updates.image
      })
      .eq('name', memberName)
      .select()
      .single();

    if (error) throw error;
    return {
      name: data.name,
      image: data.image || `https://i.pravatar.cc/150?u=${data.name.toLowerCase()}`
    };
  }
};

// Serviços de documentos
export const documentService = {
  async getDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type as any,
      campaignId: row.campaign_id || '',
      campaignName: row.campaign_name || '',
      uploadedAt: row.uploaded_at,
      url: row.url
    }));
  },

  async addDocument(document: Omit<Document, 'id'>, userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        campaign_id: document.campaignId,
        name: document.name,
        type: document.type,
        campaign_name: document.campaignName,
        url: document.url
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      type: data.type as any,
      campaignId: data.campaign_id || '',
      campaignName: data.campaign_name || '',
      uploadedAt: data.uploaded_at,
      url: data.url
    };
  }
};

// Serviços de notificações
export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => ({
      id: row.id,
      campaignId: row.campaign_id || '',
      campaignName: row.campaign_name || '',
      message: row.message,
      timestamp: new Date(row.created_at),
      read: row.read
    }));
  },

  async markAsRead(notificationIds: string[], userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', notificationIds)

    if (error) throw error;
  }
};

// Serviços de configurações
export const settingsService = {
  async getSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      // Criar configurações padrão se não existirem
      const { data: newData, error: insertError } = await supabase
        .from('user_settings')
        .insert({ user_id: userId, deadline_notification_enabled: true })
        .select()
        .single();

      if (insertError) return { deadlineNotificationEnabled: true };
      return { deadlineNotificationEnabled: newData.deadline_notification_enabled };
    }

    return { deadlineNotificationEnabled: data.deadline_notification_enabled };
  },

  async updateSettings(userId: string, settings: { deadlineNotificationEnabled: boolean }) {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        deadline_notification_enabled: settings.deadlineNotificationEnabled
      });

    if (error) throw error;
  }
};

// Serviços de integrações
export const integrationService = {
  async getIntegrations(userId: string): Promise<Integration[]> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')

    if (error || !data) return [];
    return data.map(row => ({
      name: row.name,
      description: row.description || '',
      connected: row.connected,
      requiresApiKey: row.requires_api_key,
      apiKey: row.api_key
    }));
  },

  async upsertIntegration(integration: Integration, userId: string) {
    const { error } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        name: integration.name,
        description: integration.description,
        connected: integration.connected,
        requires_api_key: integration.requiresApiKey,
        api_key: integration.apiKey
      });

    if (error) throw error;
  }
};