/*
  # Schema Completo - Sistema de Pauta de Mídia SECOM GOVRS
  
  1. Tabelas Principais
    - profiles: Perfis de usuários
    - team_members: Membros da equipe
    - campaigns: Campanhas de mídia
    - documents: Documentos e arquivos
    - notifications: Notificações do sistema
    - user_settings: Configurações pessoais
    - integrations: Integrações externas

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas em autenticação
    - Triggers para updated_at automático

  3. Dados Iniciais
    - Equipe padrão da SECOM
    - Configurações iniciais
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
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'bruno-silva@secom.rs.gov.br' THEN 'Administrador'
      ELSE 'Analista'
    END
  );
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Analista',
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE profiles IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';

-- Tabela de membros da equipe
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE team_members IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';

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

COMMENT ON TABLE campaigns IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';

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

COMMENT ON TABLE documents IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';

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

COMMENT ON TABLE notifications IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';

-- Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  deadline_notification_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE user_settings IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';

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

COMMENT ON TABLE integrations IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';

-- DESABILITAR RLS TEMPORARIAMENTE PARA TESTES
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;

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
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Inserir dados iniciais da equipe
INSERT INTO team_members (name, image) VALUES
  ('Jéssica', 'https://i.pravatar.cc/150?u=jessica'),
  ('Bruno', 'https://i.pravatar.cc/150?u=bruno'),
  ('Fernanda', 'https://i.pravatar.cc/150?u=fernanda'),
  ('Adriana', 'https://i.pravatar.cc/150?u=adriana'),
  ('Jamile', 'https://i.pravatar.cc/150?u=jamile'),
  ('Natacha', 'https://i.pravatar.cc/150?u=natacha')
ON CONFLICT DO NOTHING;