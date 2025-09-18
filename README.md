<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UKnsvdyDGaSoJLjLe-Q6aMTSItcF1Glg

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. **IMPORTANTE**: Configure o Supabase para dados compartilhados:
   - Acesse [supabase.com](https://supabase.com) e crie um projeto
   - Copie a URL e chave anônima do seu projeto
   - Configure as variáveis em [.env.local](.env.local):
     ```
     VITE_SUPABASE_URL=https://seu-projeto.supabase.co
     VITE_SUPABASE_ANON_KEY=sua-chave-anonima
     GEMINI_API_KEY=your_api_key_here
     ```
   - Execute a migração SQL no painel do Supabase (arquivo: `supabase/migrations/create_complete_schema.sql`)
3. Run the app:
   `npm run dev`

## ⚠️ Configuração do Supabase (OBRIGATÓRIA para dados compartilhados)

**Sem Supabase**: A aplicação funciona em modo offline (dados locais apenas)
**Com Supabase**: Dados compartilhados entre todos os usuários

### Passo a Passo:
1. Create a project at [Supabase](https://supabase.com)
2. Vá em Settings > API para encontrar sua URL e chave
3. Adicione no arquivo `.env.local`:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   ```
4. **CRÍTICO**: Execute o SQL em `supabase/migrations/create_complete_schema.sql` no SQL Editor do Supabase
5. Reinicie a aplicação: `npm run dev`

### 🔐 Sistema de Login:
- **Administrador**: `bruno-silva@secom.rs.gov.br` (senha: `Gov@2025+`)
- **Analistas**: Qualquer e-mail `@secom.rs.gov.br` (senha: `Gov@2025+`)
- **Restrição**: Apenas domínio `@secom.rs.gov.br` permitido

### 📊 Status dos Dados:
- ❌ **Sem Supabase**: Dados locais, não compartilhados
- ✅ **Com Supabase**: Dados compartilhados, persistentes, sincronizados