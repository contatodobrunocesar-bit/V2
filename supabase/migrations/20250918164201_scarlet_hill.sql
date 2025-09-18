/*
  # Schema completo para Pauta de Mídia SECOM

  1. Tabelas principais
    - `profiles` - Perfis de usuários
    - `team_members` - Membros da equipe
    - `campaigns` - Campanhas publicitárias
    - `documents` - Documentos
    - `notifications` - Notificações
    - `user_settings` - Configurações
    - `integrations` - Integrações

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso por usuário
    - Triggers para updated_at

  3. Funções
    - Função para atualizar updated_at
    - Função para criar perfil automaticamente
*/

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'Analista'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    role text NOT NULL DEFAULT 'Analista',
    image text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabela de membros da equipe
CREATE TABLE IF NOT EXISTS team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    image text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabela de campanhas
CREATE TABLE IF NOT EXISTS campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cliente text NOT NULL,
    campanha text NOT NULL,
    agencia text NOT NULL DEFAULT 'HOC',
    atendimento_responsavel text NOT NULL,
    periodo_inicio timestamptz,
    periodo_fim timestamptz,
    data_entrada_pauta timestamptz,
    data_prevista_retorno_agencia timestamptz,
    data_recebimento_relatorio timestamptz,
    data_prevista_recebimento_relatorio timestamptz,
    prazo_analise_interna timestamptz,
    data_feedback_agencia timestamptz,
    status_plano text NOT NULL DEFAULT 'Planejamento',
    proa text,
    briefing text,
    orcamento numeric,
    comentarios text,
    relatorio_recebido boolean DEFAULT false,
    exhibition_status text DEFAULT 'aguardando início',
    observacoes_ajustes text,
    comprovantes_sac_recebidos boolean DEFAULT false,
    plano_midia_arquivo_nome text,
    relatorio_arquivo_nome text,
    presenca_em jsonb DEFAULT '[]',
    orcamento_por_midia jsonb DEFAULT '{}',
    regioes_funcionais jsonb DEFAULT '[]',
    history jsonb DEFAULT '[]',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL,
    campaign_name text,
    uploaded_at timestamptz DEFAULT now(),
    url text,
    created_at timestamptz DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
    campaign_name text,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    deadline_notification_enabled boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabela de integrações
CREATE TABLE IF NOT EXISTS integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    connected boolean DEFAULT false,
    requires_api_key boolean DEFAULT false,
    api_key text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, name)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para team_members
CREATE POLICY "Users can read own team members" ON team_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own team members" ON team_members
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Políticas para campaigns
CREATE POLICY "Users can read own campaigns" ON campaigns
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own campaigns" ON campaigns
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Políticas para documents
CREATE POLICY "Users can read own documents" ON documents
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own documents" ON documents
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Políticas para notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Políticas para user_settings
CREATE POLICY "Users can read own settings" ON user_settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Políticas para integrations
CREATE POLICY "Users can read own integrations" ON integrations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own integrations" ON integrations
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();