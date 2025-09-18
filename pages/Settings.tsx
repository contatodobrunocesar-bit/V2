import React, { useState, useCallback } from 'react';
import { User, ResponsibleUser, Integration, UserRole } from '../types';
import { UserIcon, UsersIcon, BellIcon, LinkIcon, PencilIcon, SaveIcon, XIcon, PlusIcon, KeyIcon, TrashIcon, CloudSyncIcon } from '../components/Icons';
import { SyncStatus } from '../dataService';

interface SettingsProps {
    currentUser: User;
    onUpdateCurrentUser: (updatedData: Partial<Omit<User, 'email'>>) => void;
    onEditCurrentUserImage: () => void;
    teamMembers: ResponsibleUser[];
    onEditTeamMemberImage: (memberName: string) => void;
    onEditTeamMemberName: (oldName: string, newName: string) => void;
    onAddTeamMember: (name: string) => void;
    users: User[];
    onAddUser: (newUser: Omit<User, 'image'>) => void;
    onUpdateUser: (updatedUser: Omit<User, 'image'>) => void;
    onDeleteUser: (email: string) => void;
    deadlineNotificationEnabled: boolean;
    onDeadlineNotificationToggle: () => void;
    integrations: Integration[];
    onToggleIntegration: (integrationName: string) => void;
    onSaveApiKey: (integrationName: string, apiKey: string) => void;
    syncStatus: SyncStatus;
}

const SettingsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-dark-card shadow-md rounded-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                {icon}
                {title}
            </h2>
        </div>
        <div className="p-4 space-y-4">
            {children}
        </div>
    </div>
);

const ProfileSettingsCard: React.FC<Pick<SettingsProps, 'currentUser' | 'onUpdateCurrentUser' | 'onEditCurrentUserImage'>> = ({ currentUser, onUpdateCurrentUser, onEditCurrentUserImage }) => {
    const [name, setName] = useState(currentUser.name);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        onUpdateCurrentUser({ name });
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setName(currentUser.name);
        setIsEditing(false);
    };

    return (
        <SettingsCard title="Meu Perfil" icon={<UserIcon className="w-5 h-5" />}>
            <div className="flex items-center gap-4">
                <div className="relative group w-16 h-16 flex-shrink-0">
                    <img src={currentUser.image} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover" />
                    <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                        <button
                            onClick={onEditCurrentUserImage}
                            className="p-2 bg-black/70 rounded-full text-white hover:bg-black/80 transition-colors"
                            aria-label={`Editar sua foto de perfil`}
                        >
                            <PencilIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
                <div className="flex-grow">
                    {isEditing ? (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600"
                        />
                    ) : (
                        <>
                            <h3 className="text-lg font-bold">{currentUser.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                        </>
                    )}
                </div>
                {isEditing ? (
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><SaveIcon className="w-5 h-5" /></button>
                        <button onClick={handleCancel} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><XIcon className="w-5 h-5" /></button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-accent rounded-full">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </SettingsCard>
    );
};

const TeamManagementCard: React.FC<Pick<SettingsProps, 'teamMembers' | 'onEditTeamMemberImage' | 'onAddTeamMember'>> = ({ teamMembers, onEditTeamMemberImage, onAddTeamMember }) => {
const TeamManagementCard: React.FC<Pick<SettingsProps, 'teamMembers' | 'onEditTeamMemberImage' | 'onEditTeamMemberName' | 'onAddTeamMember'>> = ({ teamMembers, onEditTeamMemberImage, onEditTeamMemberName, onAddTeamMember }) => {
    const [newMemberName, setNewMemberName] = useState('');
    const [editingMemberName, setEditingMemberName] = useState<string | null>(null);
    const [editedName, setEditedName] = useState('');

    const handleAdd = () => {
        if (newMemberName.trim()) {
            onAddTeamMember(newMemberName.trim());
            setNewMemberName('');
        }
    };

    const handleStartEdit = (memberName: string) => {
        setEditingMemberName(memberName);
        setEditedName(memberName);
    };

    const handleSaveEdit = () => {
        if (editedName.trim() && editingMemberName) {
            onEditTeamMemberName(editingMemberName, editedName.trim());
            setEditingMemberName(null);
            setEditedName('');
        }
    };

    const handleCancelEdit = () => {
        setEditingMemberName(null);
        setEditedName('');
    };
    return (
        <SettingsCard title="Equipe de Atendimento" icon={<UsersIcon className="w-5 h-5" />}>
            <div className="max-h-60 overflow-y-auto pr-2">
                {teamMembers.map(member => (
                    <div key={member.name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        <div className="flex items-center gap-3">
                            <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                            {editingMemberName === member.name ? (
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="font-semibold bg-gray-50 dark:bg-dark-accent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                                    autoFocus
                                />
                            ) : (
                                <span className="font-semibold">{member.name}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {editingMemberName === member.name ? (
                                <>
                                    <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors">
                                        <SaveIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={handleCancelEdit} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleStartEdit(member.name)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-accent rounded-full transition-colors" title="Editar nome">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onEditTeamMemberImage(member.name)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-accent rounded-full transition-colors" title="Editar foto">
                                        <UserIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 pt-2">
                <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Nome do novo membro"
                    className="flex-grow w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600"
                />
                <button onClick={handleAdd} className="p-2 bg-primary text-white rounded-md hover:bg-red-700">
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
        </SettingsCard>
    );
};

const UserAccessCard: React.FC<{
    users: User[];
    currentUser: User;
    onAddUser: (newUser: Omit<User, 'image'>) => void;
    onUpdateUser: (updatedUser: Omit<User, 'image'>) => void;
    onDeleteUser: (email: string) => void;
}> = ({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
    
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.Analyst });

    const handleSaveNewUser = () => {
        if (newUser.name && newUser.email) {
            onAddUser(newUser);
            setIsAdding(false);
            setNewUser({ name: '', email: '', role: UserRole.Analyst });
        }
    };

    const handleRoleChange = (email: string, role: UserRole) => {
        const user = users.find(u => u.email === email);
        if (user) {
            onUpdateUser({ ...user, role });
        }
    };

    const handleDeleteUserClick = (user: User) => {
        if (window.confirm(`Tem certeza de que deseja excluir o usuário "${user.name}"? Esta ação não pode ser desfeita.`)) {
            onDeleteUser(user.email);
        }
    };
    
    if (currentUser.role !== UserRole.Admin) return null;

    return (
        <SettingsCard title="Acesso de Usuários" icon={<KeyIcon className="w-5 h-5" />}>
             <div className="max-h-60 overflow-y-auto pr-2">
                {users.map(user => (
                    <div key={user.email} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        <div className="flex items-center gap-3">
                            <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.email, e.target.value as UserRole)}
                                className="p-1 border text-xs rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600"
                                disabled={user.email === currentUser.email}
                            >
                                {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                            <button 
                                onClick={() => handleDeleteUserClick(user)}
                                disabled={user.email === currentUser.email} 
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {isAdding ? (
                 <div className="space-y-2 p-2 bg-gray-50 dark:bg-dark-accent/50 rounded-lg">
                     <input type="text" placeholder="Nome completo" value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded-md bg-white dark:bg-dark-accent dark:border-gray-600 text-sm"/>
                     <input type="email" placeholder="E-mail" value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))} className="w-full p-2 border rounded-md bg-white dark:bg-dark-accent dark:border-gray-600 text-sm"/>
                     <select value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value as UserRole}))} className="w-full p-2 border rounded-md bg-white dark:bg-dark-accent dark:border-gray-600 text-sm">
                         {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                     </select>
                     <div className="flex justify-end gap-2 pt-2">
                         <button onClick={() => setIsAdding(false)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                         <button onClick={handleSaveNewUser} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><SaveIcon className="w-5 h-5"/></button>
                     </div>
                 </div>
            ) : (
                <button onClick={() => setIsAdding(true)} className="w-full text-left flex items-center gap-2 p-2 bg-gray-100 dark:bg-dark-accent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-semibold">
                    <PlusIcon className="w-5 h-5"/>
                    Adicionar novo usuário
                </button>
            )}
        </SettingsCard>
    );
};

const NotificationSettingsCard: React.FC<Pick<SettingsProps, 'deadlineNotificationEnabled' | 'onDeadlineNotificationToggle'>> = ({ deadlineNotificationEnabled, onDeadlineNotificationToggle }) => {
    return (
        <SettingsCard title="Notificações" icon={<BellIcon className="w-5 h-5" />}>
            <div className="flex items-center justify-between">
                <label htmlFor="deadline-toggle" className="font-semibold cursor-pointer">
                    Alertas de prazo
                    <p className="text-xs font-normal text-gray-500 dark:text-gray-400">Receber notificações sobre prazos se aproximando.</p>
                </label>
                <button
                    id="deadline-toggle"
                    onClick={onDeadlineNotificationToggle}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${deadlineNotificationEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${deadlineNotificationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </SettingsCard>
    );
};

const IntegrationSettingsCard: React.FC<Pick<SettingsProps, 'integrations' | 'onToggleIntegration' | 'onSaveApiKey'>> = ({ integrations, onToggleIntegration, onSaveApiKey }) => {
    const [editingApiKey, setEditingApiKey] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState('');

    const handleEditKey = (integration: Integration) => {
        setEditingApiKey(integration.name);
        setApiKey(integration.apiKey || '');
    };

    const handleSaveKey = () => {
        if (editingApiKey) {
            onSaveApiKey(editingApiKey, apiKey);
            setEditingApiKey(null);
        }
    };

    return (
        <SettingsCard title="Integrações" icon={<LinkIcon className="w-5 h-5" />}>
            {integrations.map(integration => (
                <div key={integration.name}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">{integration.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{integration.description}</p>
                        </div>
                        <button
                            onClick={() => onToggleIntegration(integration.name)}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${integration.connected ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                            disabled={integration.requiresApiKey && !integration.apiKey && !integration.connected}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${integration.connected ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    {integration.requiresApiKey && (
                        <div className="mt-2">
                            {editingApiKey === integration.name ? (
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={e => setApiKey(e.target.value)}
                                        placeholder="Cole a chave de API aqui"
                                        className="flex-grow w-full p-1.5 text-xs border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600"
                                    />
                                    <button onClick={handleSaveKey} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><SaveIcon className="w-5 h-5" /></button>
                                    <button onClick={() => setEditingApiKey(null)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><XIcon className="w-5 h-5" /></button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-dark-accent/50 p-2 rounded-md">
                                    <p className="text-xs font-mono">{integration.apiKey ? '********************' : 'Chave de API não definida'}</p>
                                    <button onClick={() => handleEditKey(integration)} className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-accent rounded-full">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </SettingsCard>
    );
};

const DataManagementCard: React.FC<{ syncStatus: SyncStatus }> = ({ syncStatus }) => {
    
    const getStatusIndicator = () => {
        switch (syncStatus) {
            case 'syncing':
                return (
                    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Sincronizando...
                    </div>
                );
            case 'synced':
                return (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-semibold">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        Salvo na nuvem
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-semibold">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Erro de sincronização
                    </div>
                );
            default: // idle
                 return (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-semibold">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        Salvo localmente
                    </div>
                );
        }
    };

    return (
        <SettingsCard title="Gerenciamento de Dados" icon={<CloudSyncIcon className="w-5 h-5"/>}>
            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-dark-accent/50 rounded-lg">
                <span className="font-semibold text-sm">Status da Sincronização</span>
                {getStatusIndicator()}
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                Seus dados são salvos localmente e sincronizados com a Nuvem Gemini.
            </p>
        </SettingsCard>
    );
};


const Settings: React.FC<SettingsProps> = (props) => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <ProfileSettingsCard {...props} />
                    <UserAccessCard {...props} />
                </div>
                <div className="space-y-6">
                    <TeamManagementCard {...props} />
                    <NotificationSettingsCard {...props} />
                </div>
            </div>
        </div>
    );
};

export default Settings;