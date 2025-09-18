/*
  # Desabilitar RLS temporariamente para testes

  ATENÇÃO: Esta migração desabilita Row Level Security (RLS) em todas as tabelas.
  Isso deve ser usado APENAS para testes e desenvolvimento.
  Para produção, mantenha RLS habilitado para segurança dos dados.

  1. Desabilita RLS em todas as tabelas
  2. Remove políticas existentes
  3. Permite acesso total aos dados (CUIDADO!)
*/

-- Desabilitar RLS em todas as tabelas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can manage own team members" ON team_members;
DROP POLICY IF EXISTS "Users can read own team members" ON team_members;

DROP POLICY IF EXISTS "Users can manage own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can read own campaigns" ON campaigns;

DROP POLICY IF EXISTS "Users can manage own documents" ON documents;
DROP POLICY IF EXISTS "Users can read own documents" ON documents;

DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;

DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can read own settings" ON user_settings;

DROP POLICY IF EXISTS "Users can manage own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can read own integrations" ON integrations;

-- Comentário de aviso
COMMENT ON TABLE profiles IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';
COMMENT ON TABLE campaigns IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';
COMMENT ON TABLE team_members IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';
COMMENT ON TABLE documents IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';
COMMENT ON TABLE notifications IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';
COMMENT ON TABLE user_settings IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';
COMMENT ON TABLE integrations IS 'ATENÇÃO: RLS DESABILITADO - Apenas para testes!';