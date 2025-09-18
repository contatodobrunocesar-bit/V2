import { Campaign, ResponsibleUser, User, Document, Integration, Notification, UserRole } from './types';
import { 
  authService, 
  profileService, 
  campaignService, 
  teamService, 
  documentService, 
  notificationService, 
  settingsService, 
  integrationService 
} from './lib/supabaseService';
import { supabase } from './lib/supabase';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

// Estado local para cache
let localState = {
  campaigns: [] as Campaign[],
  teamMembers: [] as ResponsibleUser[],
  documents: [] as Document[],
  notifications: [] as Notification[],
  settings: { deadlineNotificationEnabled: true },
  integrations: [] as Integration[]
};

let currentUser: User | null = null;
let currentUserId: string | null = null;
let onSyncStatusChange: (status: SyncStatus) => void = () => {};

// Inicialização - APENAS SUPABASE
export const initializeData = async (
  initialIntegrations: Integration[], 
  syncCallback: (status: SyncStatus) => void
): Promise<{ user: User | null; error: string | null }> => {
  onSyncStatusChange = syncCallback;
  onSyncStatusChange('syncing');

  try {
    console.log('🚀 Inicializando sistema com Supabase...');
    
    // Verificar se há usuário logado
    const user = await authService.getCurrentUser();
    
    if (user) {
      currentUserId = user.id;
      console.log('✅ Usuário encontrado:', user.email);
      
      // Carregar perfil do usuário
      const profile = await profileService.getProfile(user.id);
      if (profile) {
        currentUser = profile;
        console.log('✅ Perfil carregado:', profile.name);
        
        // Carregar dados do usuário
        await loadUserData(user.id, initialIntegrations);
        
        // Configurar subscriptions em tempo real
        setupRealtimeSubscriptions(user.id);
        
        onSyncStatusChange('synced');
        console.log('✅ Sistema inicializado com sucesso!');
        return { user: profile, error: null };
      }
    }
    
    currentUser = null;
    currentUserId = null;
    onSyncStatusChange('idle');
    console.log('ℹ️ Nenhum usuário logado');
    return { user: null, error: null };
    
  } catch (error: any) {
    onSyncStatusChange('error');
    console.error('❌ Erro ao inicializar:', error);
    return { user: null, error: error.message || 'Erro ao inicializar dados' };
  }
};

// Carregar dados do usuário
const loadUserData = async (userId: string, initialIntegrations: Integration[]) => {
  try {
    console.log('📥 Carregando dados do usuário...');
    
    const [campaigns, teamMembers, documents, notifications, settings, integrations] = await Promise.all([
      campaignService.getCampaigns(userId),
      teamService.getTeamMembers(userId),
      documentService.getDocuments(userId),
      notificationService.getNotifications(userId),
      settingsService.getSettings(userId),
      integrationService.getIntegrations(userId)
    ]);

    // Se não há membros da equipe no Supabase, usar os padrão
    const finalTeamMembers = teamMembers.length > 0 ? teamMembers : [
      { name: 'Jéssica', image: 'https://i.pravatar.cc/150?u=jessica' },
      { name: 'Bruno', image: 'https://i.pravatar.cc/150?u=bruno' },
      { name: 'Fernanda', image: 'https://i.pravatar.cc/150?u=fernanda' },
      { name: 'Adriana', image: 'https://i.pravatar.cc/150?u=adriana' },
      { name: 'Jamile', image: 'https://i.pravatar.cc/150?u=jamile' },
      { name: 'Natacha', image: 'https://i.pravatar.cc/150?u=natacha' },
    ];

    localState = {
      campaigns,
      teamMembers: finalTeamMembers,
      documents,
      notifications,
      settings,
      integrations: integrations.length > 0 ? integrations : initialIntegrations
    };

    console.log('✅ Dados carregados:', {
      campaigns: campaigns.length,
      teamMembers: finalTeamMembers.length,
      documents: documents.length
    });

    // Se não há integrações, criar as padrão
    if (integrations.length === 0) {
      for (const integration of initialIntegrations) {
        await integrationService.upsertIntegration(integration, userId);
      }
      localState.integrations = initialIntegrations;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar dados do usuário:', error);
    throw error;
  }
};

// Configurar subscriptions em tempo real
const setupRealtimeSubscriptions = (userId: string) => {
  console.log('🔄 Configurando subscriptions em tempo real...');
  
  // Subscription para campanhas
  campaignService.subscribeToCampaigns(userId, (campaigns) => {
    console.log('🔄 Campanhas atualizadas em tempo real');
    localState.campaigns = campaigns;
  });
};

// Autenticação
export const login = async (email: string, password?: string): Promise<User | null> => {
  try {
    console.log('🔐 Tentando login para:', email);
    
    // Validar domínio do e-mail
    if (!email.endsWith('@secom.rs.gov.br')) {
      throw new Error('Acesso restrito a funcionários da SECOM RS. Use seu e-mail institucional @secom.rs.gov.br');
    }

    // Usar senha padrão se não fornecida
    const loginPassword = password || 'Gov@2025+';
    
    onSyncStatusChange('syncing');
    
    let authResult;
    
    // Tentar login primeiro
    authResult = await authService.signIn(email, loginPassword);
    
    // Se falhar e for a senha padrão, tentar criar conta
    if (authResult.error && loginPassword === 'Gov@2025+') {
      console.log('🆕 Criando nova conta para:', email);
      const name = email.split('@')[0].replace(/[.-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      authResult = await authService.signUp(email, loginPassword, name);
      if (authResult.error) {
        throw new Error('Erro ao fazer login ou criar conta: ' + authResult.error.message);
      }
    }

    if (authResult.error) {
      throw new Error(authResult.error.message);
    }

    if (authResult.data.user) {
      currentUserId = authResult.data.user.id;
      const profile = await profileService.getProfile(authResult.data.user.id);
      
      if (profile) {
        currentUser = profile;
        await loadUserData(authResult.data.user.id, localState.integrations);
        setupRealtimeSubscriptions(authResult.data.user.id);
        onSyncStatusChange('synced');
        console.log('✅ Login realizado com sucesso!');
        return profile;
      }
    }

    onSyncStatusChange('error');
    return null;
  } catch (error: any) {
    onSyncStatusChange('error');
    console.error('❌ Erro no login:', error.message);
    throw error;
  }
};

export const logout = async () => {
  console.log('🚪 Fazendo logout...');
  await authService.signOut();
  currentUser = null;
  currentUserId = null;
  localState = {
    campaigns: [],
    teamMembers: [],
    documents: [],
    notifications: [],
    settings: { deadlineNotificationEnabled: true },
    integrations: []
  };
  onSyncStatusChange('idle');
  console.log('✅ Logout realizado');
};

// Getters
export const getCampaigns = (): Campaign[] => localState.campaigns;
export const getTeamMembers = (): ResponsibleUser[] => localState.teamMembers;
export const getUsers = (): User[] => currentUser ? [currentUser] : [];
export const getDocuments = (): Document[] => localState.documents;
export const getSettings = () => localState.settings;
export const getIntegrations = (): Integration[] => localState.integrations;
export const getCurrentUser = (): User | null => currentUser;

// Campanhas
export const addCampaign = async (campaign: Campaign) => {
  if (!currentUserId) throw new Error('Usuário não autenticado');
  
  try {
    onSyncStatusChange('syncing');
    console.log('➕ Adicionando campanha:', campaign.campanha);
    const newCampaign = await campaignService.createCampaign(campaign, currentUserId);
    localState.campaigns = [newCampaign, ...localState.campaigns];
    onSyncStatusChange('synced');
    console.log('✅ Campanha adicionada com sucesso');
  } catch (error) {
    onSyncStatusChange('error');
    console.error('❌ Erro ao adicionar campanha:', error);
    throw error;
  }
};

export const updateCampaign = async (updatedCampaign: Campaign) => {
  if (!currentUserId) throw new Error('Usuário não autenticado');
  
  try {
    onSyncStatusChange('syncing');
    console.log('✏️ Atualizando campanha:', updatedCampaign.campanha);
    const updated = await campaignService.updateCampaign(updatedCampaign.id, updatedCampaign, currentUserId);
    localState.campaigns = localState.campaigns.map(c => c.id === updated.id ? updated : c);
    onSyncStatusChange('synced');
    console.log('✅ Campanha atualizada com sucesso');
  } catch (error) {
    onSyncStatusChange('error');
    console.error('❌ Erro ao atualizar campanha:', error);
    throw error;
  }
};

export const deleteCampaign = async (campaignId: string) => {
  if (!currentUserId) throw new Error('Usuário não autenticado');
  
  try {
    onSyncStatusChange('syncing');
    console.log('🗑️ Deletando campanha:', campaignId);
    await campaignService.deleteCampaign(campaignId, currentUserId);
    localState.campaigns = localState.campaigns.filter(c => c.id !== campaignId);
    onSyncStatusChange('synced');
    console.log('✅ Campanha deletada com sucesso');
  } catch (error) {
    onSyncStatusChange('error');
    console.error('❌ Erro ao deletar campanha:', error);
    throw error;
  }
};

// Membros da equipe
export const setTeamMembers = async (members: ResponsibleUser[]) => {
  if (!currentUserId) return;
  
  try {
    console.log('👥 Atualizando membros da equipe');
    // Aqui você pode implementar a lógica para salvar no Supabase se necessário
    localState.teamMembers = members;
  } catch (error) {
    console.error('❌ Erro ao atualizar membros da equipe:', error);
  }
};

export const addTeamMember = async (member: ResponsibleUser) => {
  if (!currentUserId) throw new Error('Usuário não autenticado');
  
  try {
    console.log('➕ Adicionando membro da equipe:', member.name);
    const newMember = await teamService.addTeamMember(member, currentUserId);
    localState.teamMembers = [...localState.teamMembers, newMember];
    console.log('✅ Membro adicionado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao adicionar membro da equipe:', error);
    throw error;
  }
};

// Usuários (compatibilidade)
export const addUser = (user: User) => {
  console.log('ℹ️ addUser não implementado - usuários gerenciados pelo Supabase Auth');
};

export const updateUser = (updatedUser: Omit<User, 'image'>) => {
  console.log('ℹ️ updateUser não implementado - usuários gerenciados pelo Supabase Auth');
};

export const deleteUser = (email: string) => {
  console.log('ℹ️ deleteUser não implementado - usuários gerenciados pelo Supabase Auth');
};

export const updateCurrentUser = async (updatedData: Partial<Omit<User, 'email' | 'role'>>): Promise<User | null> => {
  if (!currentUserId || !currentUser) throw new Error('Usuário não autenticado');
  
  try {
    console.log('✏️ Atualizando perfil do usuário');
    await profileService.updateProfile(currentUserId, { ...currentUser, ...updatedData });
    currentUser = { ...currentUser, ...updatedData };
    console.log('✅ Perfil atualizado com sucesso');
    return currentUser;
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário atual:', error);
    throw error;
  }
};

// Documentos
export const setDocuments = async (documents: Document[]) => {
  if (!currentUserId) return;
  
  try {
    console.log('📄 Atualizando documentos');
    localState.documents = documents;
  } catch (error) {
    console.error('❌ Erro ao atualizar documentos:', error);
  }
};

export const addDocument = async (doc: Document) => {
  if (!currentUserId) throw new Error('Usuário não autenticado');
  
  try {
    console.log('➕ Adicionando documento:', doc.name);
    const newDoc = await documentService.addDocument(doc, currentUserId);
    localState.documents = [newDoc, ...localState.documents];
    console.log('✅ Documento adicionado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao adicionar documento:', error);
    throw error;
  }
};

// Configurações
export const saveSettings = async (settings: { deadlineNotificationEnabled: boolean }) => {
  if (!currentUserId) throw new Error('Usuário não autenticado');
  
  try {
    console.log('⚙️ Salvando configurações');
    await settingsService.updateSettings(currentUserId, settings);
    localState.settings = settings;
    console.log('✅ Configurações salvas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error);
    throw error;
  }
};

// Integrações
export const setIntegrations = async (integrations: Integration[]) => {
  if (!currentUserId) throw new Error('Usuário não autenticado');
  
  try {
    console.log('🔗 Salvando integrações');
    for (const integration of integrations) {
      await integrationService.upsertIntegration(integration, currentUserId);
    }
    localState.integrations = integrations;
    console.log('✅ Integrações salvas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar integrações:', error);
    throw error;
  }
};

// Mock para compatibilidade
export const MOCK_RESPONSIBLES_MAP = {} as any;