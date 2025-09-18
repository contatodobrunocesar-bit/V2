/*
  # Schema Completo para Pauta de Mídia SECOM

  1. Tabelas Principais
    - `profiles` - Perfis de usuários
    - `team_members` - Membros da equipe
    - `campaigns` - Campanhas de mídia
    - `documents` - Documentos relacionados
    - `notifications` - Notificações do sistema
    - `user_settings` - Configurações do usuário
    - `integrations` - Integrações externas

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas em autenticação
    - Triggers para updated_at automático

  3. Funcionalidades
    - Histórico de alterações em campanhas
    - Notificações automáticas de prazos
    - Configurações personalizáveis por usuário
*/

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, image)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.email = 'bruno-silva@secom.rs.gov.br' THEN 'Administrador'
            ELSE 'Analista'
        END,
        'https://i.pravatar.cc/150?u=' || NEW.email
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Tabela de perfis de usuários
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

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver todos os perfis"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Políticas RLS para team_members (compartilhado entre todos)
CREATE POLICY "Todos podem ver membros da equipe"
    ON team_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Todos podem gerenciar membros da equipe"
    ON team_members FOR ALL
    TO authenticated
    USING (true);

-- Políticas RLS para campaigns (compartilhado entre todos)
CREATE POLICY "Todos podem ver campanhas"
    ON campaigns FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Todos podem criar campanhas"
    ON campaigns FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Todos podem atualizar campanhas"
    ON campaigns FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Todos podem deletar campanhas"
    ON campaigns FOR DELETE
    TO authenticated
    USING (true);

-- Políticas RLS para documents (compartilhado entre todos)
CREATE POLICY "Todos podem ver documentos"
    ON documents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Todos podem gerenciar documentos"
    ON documents FOR ALL
    TO authenticated
    USING (true);

-- Políticas RLS para notifications (por usuário)
CREATE POLICY "Usuários podem ver próprias notificações"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar próprias notificações"
    ON notifications FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Políticas RLS para user_settings (por usuário)
CREATE POLICY "Usuários podem ver próprias configurações"
    ON user_settings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar próprias configurações"
    ON user_settings FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Políticas RLS para integrations (por usuário)
CREATE POLICY "Usuários podem ver próprias integrações"
    ON integrations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar próprias integrações"
    ON integrations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

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

-- Inserir membros da equipe padrão
INSERT INTO team_members (name, image) VALUES
    ('Jéssica', 'https://i.pravatar.cc/150?u=jessica'),
    ('Bruno', 'https://i.pravatar.cc/150?u=bruno'),
    ('Fernanda', 'https://i.pravatar.cc/150?u=fernanda'),
    ('Adriana', 'https://i.pravatar.cc/150?u=adriana'),
    ('Jamile', 'https://i.pravatar.cc/150?u=jamile'),
    ('Natacha', 'https://i.pravatar.cc/150?u=natacha')
ON CONFLICT DO NOTHING;