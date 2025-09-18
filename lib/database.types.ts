export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: string;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          cliente: string;
          campanha: string;
          agencia: string;
          atendimento_responsavel: string;
          periodo_inicio: string | null;
          periodo_fim: string | null;
          data_entrada_pauta: string | null;
          data_prevista_retorno_agencia: string | null;
          data_recebimento_relatorio: string | null;
          data_prevista_recebimento_relatorio: string | null;
          prazo_analise_interna: string | null;
          data_feedback_agencia: string | null;
          status_plano: string;
          proa: string | null;
          briefing: string | null;
          orcamento: number | null;
          comentarios: string | null;
          relatorio_recebido: boolean;
          exhibition_status: string;
          observacoes_ajustes: string | null;
          comprovantes_sac_recebidos: boolean;
          plano_midia_arquivo_nome: string | null;
          relatorio_arquivo_nome: string | null;
          presenca_em: any;
          orcamento_por_midia: any;
          regioes_funcionais: any;
          history: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cliente: string;
          campanha: string;
          agencia?: string;
          atendimento_responsavel: string;
          periodo_inicio?: string | null;
          periodo_fim?: string | null;
          data_entrada_pauta?: string | null;
          data_prevista_retorno_agencia?: string | null;
          data_recebimento_relatorio?: string | null;
          data_prevista_recebimento_relatorio?: string | null;
          prazo_analise_interna?: string | null;
          data_feedback_agencia?: string | null;
          status_plano?: string;
          proa?: string | null;
          briefing?: string | null;
          orcamento?: number | null;
          comentarios?: string | null;
          relatorio_recebido?: boolean;
          exhibition_status?: string;
          observacoes_ajustes?: string | null;
          comprovantes_sac_recebidos?: boolean;
          plano_midia_arquivo_nome?: string | null;
          relatorio_arquivo_nome?: string | null;
          presenca_em?: any;
          orcamento_por_midia?: any;
          regioes_funcionais?: any;
          history?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cliente?: string;
          campanha?: string;
          agencia?: string;
          atendimento_responsavel?: string;
          periodo_inicio?: string | null;
          periodo_fim?: string | null;
          data_entrada_pauta?: string | null;
          data_prevista_retorno_agencia?: string | null;
          data_recebimento_relatorio?: string | null;
          data_prevista_recebimento_relatorio?: string | null;
          prazo_analise_interna?: string | null;
          data_feedback_agencia?: string | null;
          status_plano?: string;
          proa?: string | null;
          briefing?: string | null;
          orcamento?: number | null;
          comentarios?: string | null;
          relatorio_recebido?: boolean;
          exhibition_status?: string;
          observacoes_ajustes?: string | null;
          comprovantes_sac_recebidos?: boolean;
          plano_midia_arquivo_nome?: string | null;
          relatorio_arquivo_nome?: string | null;
          presenca_em?: any;
          orcamento_por_midia?: any;
          regioes_funcionais?: any;
          history?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: number;
          user_id: string;
          campaign_id: string | null;
          name: string;
          type: string;
          campaign_name: string | null;
          uploaded_at: string;
          url: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          campaign_id?: string | null;
          name: string;
          type: string;
          campaign_name?: string | null;
          uploaded_at?: string;
          url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          campaign_id?: string | null;
          name?: string;
          type?: string;
          campaign_name?: string | null;
          uploaded_at?: string;
          url?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          campaign_id: string | null;
          campaign_name: string | null;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          campaign_id?: string | null;
          campaign_name?: string | null;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          campaign_id?: string | null;
          campaign_name?: string | null;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          deadline_notification_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deadline_notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          deadline_notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          connected: boolean;
          requires_api_key: boolean;
          api_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          connected?: boolean;
          requires_api_key?: boolean;
          api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          connected?: boolean;
          requires_api_key?: boolean;
          api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}