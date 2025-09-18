# 🚀 Sistema de Pauta de Mídia SECOM GOVRS

Sistema completo para gerenciamento de campanhas de mídia com dados compartilhados na nuvem.

## ⚡ Configuração Obrigatória do Supabase

**🚨 ATENÇÃO: O sistema REQUER Supabase configurado para funcionar!**

### 1️⃣ Criar Projeto Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto (gratuito)
- Aguarde a criação completa

### 2️⃣ Configurar Variáveis
No arquivo `.env.local`, substitua pelas suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
GEMINI_API_KEY=your_api_key_here
```

**Como encontrar suas credenciais:**
- No painel do Supabase: Settings → API
- Copie "Project URL" e "anon public"

### 3️⃣ Executar Migração SQL
1. No painel do Supabase: SQL Editor
2. Copie TODO o conteúdo de `supabase/migrations/create_complete_schema.sql`
3. Cole e execute o script
4. Verifique se todas as tabelas foram criadas

### 4️⃣ Iniciar Sistema
```bash
npm install
npm run dev
```

## 🔐 Sistema de Login

**Administrador:**
- Email: `bruno-silva@secom.rs.gov.br`
- Senha: `Gov@2025+`

**Analistas:**
- Qualquer email `@secom.rs.gov.br`
- Senha: `Gov@2025+`

**Restrições:**
- ✅ Apenas domínio `@secom.rs.gov.br`
- ✅ Contas criadas automaticamente no primeiro login
- ✅ Dados compartilhados entre todos os usuários

## 🌟 Funcionalidades

### 📊 **Dashboard**
- Kanban de campanhas por status
- Drag & drop para alterar status
- Filtros avançados
- Indicadores de prazo

### 📈 **Relatórios**
- Análise por agência, mídia e região
- Gráficos interativos
- Exportação para PDF
- KPIs de desempenho

### 📄 **Documentos**
- Upload com/sem vinculação a campanhas
- Edição de imagens com IA (Gemini)
- Organização por tipo
- Download e gerenciamento

### 👥 **Equipes**
- Gerenciamento de membros
- Estatísticas individuais
- Edição de perfis

### ⚙️ **Configurações**
- Perfil pessoal
- Controle de usuários (admin)
- Notificações de prazo

## 🔄 Dados na Nuvem

✅ **Todos os dados são salvos no Supabase:**
- Campanhas e projetos
- Documentos e arquivos
- Configurações pessoais
- Histórico de alterações

✅ **Acesso universal:**
- Qualquer navegador
- Qualquer dispositivo
- Dados sempre sincronizados
- Backup automático

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Tempo Real**: Supabase Realtime
- **IA**: Google Gemini (edição de imagens)

## 📞 Suporte

Se encontrar problemas:
1. Verifique se o Supabase está configurado corretamente
2. Confirme se as migrações SQL foram executadas
3. Verifique o console do navegador para erros
4. Reinicie a aplicação após mudanças

**Sistema 100% na nuvem - Seus dados estão seguros! ☁️**