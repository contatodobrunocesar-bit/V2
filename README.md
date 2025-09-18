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
2. Set up environment variables in [.env.local](.env.local):
   - `GEMINI_API_KEY` - Your Gemini API key (optional, for AI image editing)
   - `VITE_SUPABASE_URL` - Your Supabase project URL (optional, for data persistence)
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (optional, for data persistence)
3. Run the app:
   `npm run dev`

## Supabase Setup (Optional)

For data persistence and user authentication:

1. Create a project at [Supabase](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Add these to your `.env.local` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run the provided SQL migration to set up the database schema

**Note:** The app works in offline mode without Supabase configuration.