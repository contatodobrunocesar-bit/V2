import { Campaign, ResponsibleUser, User, Document, Integration } from './types';
import { MOCK_CAMPAIGNS, MOCK_RESPONSIBLES, MOCK_USERS, MOCK_DOCUMENTS } from './constants';
import { GoogleGenAI } from '@google/genai';

export { MOCK_RESPONSIBLES_MAP } from './constants';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface AppState {
    campaigns: Campaign[];
    teamMembers: ResponsibleUser[];
    users: User[];
    documents: Document[];
    integrations: Integration[];
    settings: { deadlineNotificationEnabled: boolean };
    lastUpdated: string; // ISO string to track updates
}

// A single key for the entire application state.
const LOCAL_STATE_KEY = 'VF_PAUTA_MIDIA_LOCAL_STATE';
const GEMINI_DB_KEY = 'VF_PAUTA_MIDIA_GLOBAL_DB_V2'; // Using a new key to avoid conflicts with old data structure
const LOGGED_IN_USER_EMAIL_KEY = 'LOGGED_IN_USER_EMAIL';

let ai: GoogleGenAI | null = null;
let localState: AppState | null = null;
let currentUserEmail: string | null = null;
let onSyncStatusChange: (status: SyncStatus) => void = () => {};


const getAi = () => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }
    return ai;
};

// --- Cloud (Gemini) Storage Functions ---

const loadStateFromGemini = async (): Promise<AppState | null> => {
    let rawResponseText = ''; // For improved debugging
    try {
        const genai = getAi();
        const response = await genai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Retrieve the JSON object for the key: ${GEMINI_DB_KEY}. If it doesn't exist, respond with the word NULL.`,
            config: { systemInstruction: "You are a JSON database. Respond ONLY with the requested JSON object or the word NULL.", temperature: 0 }
        });
        
        rawResponseText = response.text;
        let text = rawResponseText.trim();
        if (!text || text.toUpperCase() === 'NULL') return null;

        // More robust JSON extraction to handle markdown code blocks and other text.
        // It finds the first '{' and the last '}' to extract the JSON object.
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');

        if (startIndex > -1 && endIndex > startIndex) {
            text = text.substring(startIndex, endIndex + 1);
        }
        // If we can't find a JSON object, we let JSON.parse fail with the original text,
        // which will be caught and logged for debugging.
        
        return JSON.parse(text, (k, v) => (
            (k.includes('date') || k.includes('timestamp') || k.includes('periodo') || k.endsWith('_at') || k === 'lastUpdated') && typeof v === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(v)
        ) ? new Date(v) : v) as AppState;
    } catch (error) {
        console.error("Error loading state from Gemini:", error);
        // Log the raw response for better debugging in the future.
        console.error("Problematic raw response from Gemini:", rawResponseText); 
        throw new Error("Falha ao carregar dados da nuvem.");
    }
};

const saveStateToGemini = async (stateToSave: AppState): Promise<void> => {
    try {
        const genai = getAi();
        const stateJson = JSON.stringify(stateToSave);
        
        await genai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Store this JSON object for the key ${GEMINI_DB_KEY}, overwriting any previous version: ${stateJson}`,
            config: { systemInstruction: "You are a JSON database. Store the provided JSON and respond ONLY with 'OK'.", temperature: 0 }
        });
    } catch (error) {
        console.error("Failed to save state to Gemini:", error);
        throw new Error("Falha ao salvar dados na nuvem.");
    }
};


// --- Local Storage and State Management ---

const loadStateFromLocalStorage = (): AppState | null => {
    const localData = localStorage.getItem(LOCAL_STATE_KEY);
    if (localData) {
        return JSON.parse(localData, (k, v) => (
            (k.includes('date') || k.includes('timestamp') || k.includes('periodo') || k.endsWith('_at') || k === 'lastUpdated') && typeof v === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(v)
        ) ? new Date(v) : v) as AppState;
    }
    return null;
};

const saveStateToLocalStorage = (stateToSave: AppState) => {
    localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(stateToSave));
};

const getState = (): AppState => {
    if (!localState) {
        throw new Error("State has not been initialized. Call initializeData first.");
    }
    return localState;
};

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSyncWithCloud = () => {
    onSyncStatusChange('syncing');
    if (saveTimeout) clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(async () => {
        try {
            await saveStateToGemini(getState());
            onSyncStatusChange('synced');
        } catch (error) {
            console.error("Debounced sync failed:", error);
            onSyncStatusChange('error');
        }
    }, 1000); // 1 second debounce
};

const updateState = (updates: Partial<AppState>) => {
    const currentState = getState();
    localState = { 
        ...currentState, 
        ...updates,
        lastUpdated: new Date().toISOString() 
    };
    saveStateToLocalStorage(localState);
    debouncedSyncWithCloud();
};


// --- Initialization and Synchronization ---

export const initializeData = async (initialIntegrations: Integration[], syncCallback: (status: SyncStatus) => void): Promise<{ user: User | null; error: string | null; }> => {
    onSyncStatusChange = syncCallback;
    onSyncStatusChange('syncing');

    try {
        const localData = loadStateFromLocalStorage();
        const cloudData = await loadStateFromGemini();

        const defaultState: AppState = {
            campaigns: MOCK_CAMPAIGNS,
            teamMembers: MOCK_RESPONSIBLES,
            users: MOCK_USERS,
            documents: MOCK_DOCUMENTS,
            integrations: initialIntegrations,
            settings: { deadlineNotificationEnabled: true },
            lastUpdated: new Date(0).toISOString(),
        };

        if (!localData && !cloudData) {
            console.log("First time use. Initializing fresh state locally and in cloud.");
            localState = defaultState;
            localState.lastUpdated = new Date().toISOString();
            saveStateToLocalStorage(localState);
            await saveStateToGemini(localState);
        } else if (cloudData && (!localData || new Date(cloudData.lastUpdated) > new Date(localData.lastUpdated))) {
            console.log("Cloud data is newer. Hydrating local state from cloud.");
            localState = { ...defaultState, ...cloudData };
            saveStateToLocalStorage(localState);
        } else {
             console.log("Local data is available and up-to-date.");
             localState = localData!;
        }

        const loggedInUserEmail = localStorage.getItem(LOGGED_IN_USER_EMAIL_KEY);
        if (loggedInUserEmail) {
            const user = localState.users.find(u => u.email === loggedInUserEmail);
            if (user) {
                currentUserEmail = loggedInUserEmail;
                onSyncStatusChange('synced');
                return { user, error: null };
            }
        }
        
        currentUserEmail = null;
        localStorage.removeItem(LOGGED_IN_USER_EMAIL_KEY);
        onSyncStatusChange('synced');
        return { user: null, error: null };

    } catch (error: any) {
        onSyncStatusChange('error');
        // If cloud fails but local data exists, we can still proceed.
        if (localState) {
            console.warn("Could not sync with cloud, but proceeding with local data.");
            return { user: getCurrentUser(), error: null };
        }
        return { user: null, error: error.message || "Ocorreu um erro crítico." };
    }
};

// --- Public Data Accessors and Mutators ---

export const getCampaigns = (): Campaign[] => localState ? localState.campaigns : [];
export const getTeamMembers = (): ResponsibleUser[] => localState ? localState.teamMembers : [];
export const getUsers = (): User[] => localState ? localState.users : [];
export const getDocuments = (): Document[] => localState ? localState.documents : [];
export const getSettings = () => localState ? localState.settings : { deadlineNotificationEnabled: true };
export const getIntegrations = (): Integration[] => localState ? localState.integrations : [];
export const getCurrentUser = (): User | null => {
    if (!localState || !currentUserEmail) return null;
    return localState.users.find(u => u.email === currentUserEmail) || null;
}

export const login = (email: string): User | null => {
    const s = getState();
    const user = s.users.find(u => u.email === email);
    if (user) {
        currentUserEmail = email;
        localStorage.setItem(LOGGED_IN_USER_EMAIL_KEY, email);
        return user;
    }
    return null;
};

export const logout = () => {
    currentUserEmail = null;
    localStorage.removeItem(LOGGED_IN_USER_EMAIL_KEY);
};

export const addCampaign = (campaign: Campaign) => {
    updateState({ campaigns: [campaign, ...getState().campaigns] });
};

export const updateCampaign = (updatedCampaign: Campaign) => {
    const campaigns = getState().campaigns;
    const index = campaigns.findIndex(c => c.id === updatedCampaign.id);
    if (index !== -1) {
        const newCampaigns = [...campaigns];
        newCampaigns[index] = updatedCampaign;
        updateState({ campaigns: newCampaigns });
    }
};

export const deleteCampaign = (campaignId: string) => {
    updateState({ campaigns: getState().campaigns.filter(c => c.id !== campaignId) });
};

export const setTeamMembers = (members: ResponsibleUser[]) => {
    updateState({ teamMembers: members });
};

export const addTeamMember = (member: ResponsibleUser) => {
    updateState({ teamMembers: [...getState().teamMembers, member] });
};

export const addUser = (user: User) => {
    const currentUsers = getState().users;
    if (currentUsers.some(u => u.email === user.email)) return;
    updateState({ users: [...currentUsers, user] });
};

export const updateUser = (updatedUser: Omit<User, 'image'>) => {
    const users = [...getState().users];
    const index = users.findIndex(u => u.email === updatedUser.email);
    if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser };
        updateState({ users });
    }
};

export const deleteUser = (email: string) => {
    updateState({ users: getState().users.filter(u => u.email !== email) });
};

export const updateCurrentUser = (updatedData: Partial<Omit<User, 'email' | 'role'>>): User | null => {
    const user = getCurrentUser();
    if (!user) return null;
    const users = getState().users.map(u => u.email === user.email ? { ...u, ...updatedData } : u);
    updateState({ users });
    return getCurrentUser();
}

export const setDocuments = (documents: Document[]) => {
    updateState({ documents });
};

export const addDocument = (doc: Document) => {
    updateState({ documents: [doc, ...getState().documents] });
};

export const saveSettings = (settings: { deadlineNotificationEnabled: boolean }) => {
    updateState({ settings });
};

export const setIntegrations = (integrations: Integration[]) => {
    updateState({ integrations });
};