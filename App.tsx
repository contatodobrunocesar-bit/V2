import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Campaign, Filters, ResponsibleUser, Responsible, User, UserRole, Document, Status, HistoryEntry, DocumentType, Notification, Integration } from './types';
import * as dataService from './dataService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FilterPanel from './components/FilterPanel';
import Modal from './components/Modal';
import CampaignForm from './components/CampaignForm';
import { PlusIcon, FilterIcon, ZapIcon } from './components/Icons';
import Reports from './pages/Reports';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import ImageEditModal from './components/ImageEditModal';
import ImageEditChoiceModal from './components/ImageEditChoiceModal';
import Login from './pages/Login';
import Teams from './pages/Teams';

const formatValueForLog = (value: any): string => {
    if (value instanceof Date) {
        return value.toLocaleDateString('pt-BR');
    }
    if (typeof value === 'boolean') {
        return value ? 'Sim' : 'Não';
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return 'Vazio';
        return value.join(', ');
    }
    if (typeof value === 'number') {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    }
    if (!value) return 'Vazio';
    return String(value);
};

const generateChangeLog = (original: Campaign, updated: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>, currentUser: User): string[] => {
    const changes: string[] = [];
    const fieldLabels: Partial<Record<keyof Campaign, string>> = {
        cliente: 'Órgão demandante',
        campanha: 'Campanha',
        agencia: 'Agência',
        atendimento_responsavel: 'Atendimento',
        periodo_inicio: 'Início da exibição',
        periodo_fim: 'Término da exibição',
        data_entrada_pauta: 'Data do briefing',
        data_prevista_retorno_agencia: 'Retorno da agência',
        status_plano: 'Status',
        proa: 'PROA Nativo',
        orcamento: 'Orçamento',
        comentarios: 'Comentários',
        observacoes_ajustes: 'Observações/Ajustes',
        comprovantes_sac_recebidos: 'Comprovantes SAC recebidos',
        plano_midia_arquivo_nome: 'Arquivo do plano de mídia',
        relatorio_arquivo_nome: 'Arquivo do relatório',
        presenca_em: 'Presença em',
        orcamento_por_midia: 'Orçamento por mídia',
        exhibition_status: 'Status da exibição',
        regioes_funcionais: 'Regiões Funcionais',
    };

    for (const key in updated) {
        if (Object.prototype.hasOwnProperty.call(original, key) && key in fieldLabels) {
            const typedKey = key as keyof Campaign;
            const originalValue = original[typedKey];
            const updatedValue = updated[typedKey as keyof typeof updated];
            
            let normalizedOriginal, normalizedUpdated;
            
            const isDateKey = [
                'periodo_inicio', 'periodo_fim', 'data_entrada_pauta', 
                'data_prevista_retorno_agencia', 'data_recebimento_relatorio', 
                'data_prevista_recebimento_relatorio', 'prazo_analise_interna', 'data_feedback_agencia'
            ].includes(typedKey);

            if (isDateKey) {
                normalizedOriginal = originalValue ? new Date(originalValue as Date).toISOString().split('T')[0] : null;
                normalizedUpdated = updatedValue ? new Date(updatedValue as Date).toISOString().split('T')[0] : null;
            } else {
                 normalizedOriginal = JSON.stringify(originalValue);
                 normalizedUpdated = JSON.stringify(updatedValue);
            }


            if (normalizedOriginal !== normalizedUpdated) {
                const label = fieldLabels[typedKey] || typedKey;
                changes.push(
                    `'${label}' alterado de "${formatValueForLog(originalValue)}" para "${formatValueForLog(updatedValue)}".`
                );
            }
        }
    }

    return changes;
};

const DocumentUploadForm: React.FC<{
    campaigns: Campaign[];
    onSubmit: (file: File, campaignId: string) => void;
    onCancel: () => void;
}> = ({ campaigns, onSubmit, onCancel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [campaignId, setCampaignId] = useState<string>('none');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (file) {
            onSubmit(file, campaignId);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arquivo</label>
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    required 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Associar à campanha</label>
                <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600">
                    <option value="none">Documento geral (sem campanha específica)</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.cliente || 'Cliente não definido'} - {c.campanha}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                    Cancelar
                </button>
                <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50" disabled={!file}>
                    Salvar documento
                </button>
            </div>
        </form>
    );
};

const AppInitializationError: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-bg text-center p-6">
        <div className="bg-white dark:bg-dark-card p-8 rounded-lg shadow-lg max-w-md">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Erro ao Carregar</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
            >
                Recarregar Página
            </button>
        </div>
    </div>
);


const App: React.FC = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<dataService.SyncStatus>('idle');
    const [skipLogin] = useState(true); // Para testes - pular login
    
    const initialIntegrations = useMemo(() => [
        { name: 'Slack', description: 'Receba notificações de status no Slack.', connected: true, requiresApiKey: false },
        { name: 'Google Calendar', description: 'Sincronize prazos com sua agenda.', connected: false, requiresApiKey: false },
        { name: 'Google Sheets', description: 'Exporte dados de relatórios para planilhas.', connected: false, requiresApiKey: true, apiKey: '' },
        { name: 'Salesforce', description: 'Sincronize dados de clientes e campanhas.', connected: false, requiresApiKey: true, apiKey: '' },
        { name: 'Jira', description: 'Crie e acompanhe tarefas no Jira.', connected: false, requiresApiKey: true, apiKey: '' },
    ], []);
    
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [teamMembers, setTeamMembers] = useState<ResponsibleUser[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [deadlineNotificationEnabled, setDeadlineNotificationEnabled] = useState(true);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    
    const syncStateFromService = useCallback(() => {
        setCampaigns(dataService.getCampaigns());
        setTeamMembers(dataService.getTeamMembers());
        setUsers(dataService.getUsers());
        setCurrentUser(dataService.getCurrentUser());
        setDocuments(dataService.getDocuments());
        setIntegrations(dataService.getIntegrations());
        setDeadlineNotificationEnabled(dataService.getSettings().deadlineNotificationEnabled);
    }, []);
    
    useEffect(() => {
        const initializeApp = async () => {
            // Para testes - fazer login automático
            // if (skipLogin) {
            //     const { user: userFromSession, error } = await dataService.initializeData(initialIntegrations, setSyncStatus);
                
            //     if (error) {
            //         setLoadingError(error);
            //         setIsLoading(false);
            //         return;
            //     }

            //     // Forçar login com usuário mock
            //     const mockUser = await dataService.login('bruno-silva@secom.rs.gov.br');
            //     if (mockUser) {
            //         syncStateFromService();
            //         setIsAuthenticated(true);
            //     }
            //     setIsLoading(false);
            //     return;
            // }

            const { user: userFromSession, error } = await dataService.initializeData(initialIntegrations, setSyncStatus);
            
            if (error) {
                setLoadingError(error);
                setIsLoading(false);
                return;
            }

            syncStateFromService();
            if (userFromSession) {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };
        initializeApp();
    }, [initialIntegrations, syncStateFromService, skipLogin]);


    const [filters, setFilters] = useState<Filters>({
        agencia: '',
        atendimento_responsavel: '',
        periodo_inicio: '',
        periodo_fim: '',
        status_plano: [],
        cliente: '',
        presenca_em: [],
        regioes_funcionais: [],
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>(undefined);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [activeView, setActiveView] = useState('Dashboard');
    
    const [isDocUploadModalOpen, setIsDocUploadModalOpen] = useState(false);
    const [aiEditingImageConfig, setAiEditingImageConfig] = useState<{ imageUrl: string; onSave: (newImageUrl: string) => void; title: string } | null>(null);
    const [uploadChoiceConfig, setUploadChoiceConfig] = useState<{ onSave: (newImageUrl: string) => void; currentImageUrl: string; title: string } | null>(null);

    const uniqueClients = useMemo(() => {
        const clients = campaigns.map(c => c.cliente);
        return [...new Set(clients)].sort();
    }, [campaigns]);

    const uniqueCampaigns = useMemo(() => {
        const campaignNames = campaigns.map(c => c.campanha);
        return [...new Set(campaignNames)].sort();
    }, [campaigns]);


    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const handleEditCampaign = useCallback((campaign: Campaign) => {
        setEditingCampaign(campaign);
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        if (campaigns.length > 0) {
            const urlParams = new URLSearchParams(window.location.search);
            const campaignId = urlParams.get('campaignId');
            if (campaignId) {
                const campaignToOpen = campaigns.find(c => c.id === campaignId);
                if (campaignToOpen) {
                    handleEditCampaign(campaignToOpen);
                    // Clean up the URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        }
    }, [campaigns, handleEditCampaign]);

    useEffect(() => {
        if (!deadlineNotificationEnabled) return;

        const checkDeadlines = () => {
            const newNotifications: Notification[] = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Zerar horas para comparação exata de data
            
            campaigns.forEach(c => {
                 const deadlines = [
                    { date: c.data_prevista_retorno_agencia, message: `Prazo de retorno para a agência da campanha ${c.campanha} está próximo.` },
                    { date: c.data_prevista_recebimento_relatorio, message: `Prazo de recebimento do relatório da campanha ${c.campanha} está próximo.` },
                ];

                deadlines.forEach(d => {
                    if (d.date) {
                        const deadlineDate = new Date(d.date);
                        deadlineDate.setHours(0, 0, 0, 0); // Zerar horas para comparação exata
                        
                        // Só mostrar notificação se for exatamente o dia do prazo
                        if (deadlineDate.getTime() === today.getTime()) {
                            const notifId = `${c.id}-${d.date.toISOString().split('T')[0]}`;
                            // Prevent duplicate notifications
                            if (!notifications.some(n => n.id === notifId)) {
                                 newNotifications.push({
                                    id: notifId,
                                    campaignId: c.id,
                                    campaignName: c.campanha,
                                    message: `HOJE é o prazo de ${d.message.includes('retorno') ? 'retorno para a agência' : 'recebimento do relatório'} da campanha ${c.campanha}.`,
                                    timestamp: new Date(),
                                    read: false
                                });
                            }
                        }
                    }
                })
            });
            if (newNotifications.length > 0) {
                setNotifications(prev => [...newNotifications, ...prev]);
            }
        };

        const intervalId = setInterval(checkDeadlines, 1000 * 60 * 60 * 6); // Check every 6 hours
        checkDeadlines(); // Check immediately on load

        return () => clearInterval(intervalId);
    }, [campaigns, notifications, deadlineNotificationEnabled]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(c => {
            const { agencia, atendimento_responsavel, periodo_inicio, periodo_fim, status_plano, cliente, presenca_em, regioes_funcionais } = filters;
            return (
                (agencia === '' || c.agencia === agencia) &&
                (atendimento_responsavel === '' || c.atendimento_responsavel === atendimento_responsavel) &&
                (cliente === '' || c.cliente === cliente) &&
                (periodo_inicio === '' || (c.periodo_inicio && new Date(c.periodo_inicio) >= new Date(periodo_inicio))) &&
                (periodo_fim === '' || (c.periodo_fim && new Date(c.periodo_fim) <= new Date(periodo_fim))) &&
                (status_plano.length === 0 || status_plano.includes(c.status_plano)) &&
                (presenca_em.length === 0 || (c.presenca_em && c.presenca_em.some(p => presenca_em.includes(p)))) &&
                (regioes_funcionais.length === 0 || (c.regioes_funcionais && c.regioes_funcionais.some(r => regioes_funcionais.includes(r))))
            );
        });
    }, [campaigns, filters]);

    const handleSaveCampaign = (campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => {
        if (!currentUser) {
            alert("Erro: usuário não autenticado.");
            return;
        }

        if (editingCampaign) {
            const changes = generateChangeLog(editingCampaign, campaignData, currentUser);
            const historyEntry: HistoryEntry = {
                user: currentUser.name,
                timestamp: new Date(),
                changes: changes.length > 0 ? changes : ['Nenhuma alteração de campo detectada, apenas salvamento.'],
            };
            
            const updatedCampaign: Campaign = {
                ...editingCampaign,
                ...campaignData,
                updated_at: new Date(),
                history: [...(editingCampaign.history || []), historyEntry],
            };
            dataService.updateCampaign(updatedCampaign);
        } else {
            const newCampaign: Campaign = {
                id: `uuid-${Date.now()}-${Math.random()}`,
                ...campaignData,
                created_at: new Date(),
                updated_at: new Date(),
                history: [{ user: currentUser.name, timestamp: new Date(), changes: ['Projeto criado.'] }]
            };
            dataService.addCampaign(newCampaign);
        }
        setCampaigns(dataService.getCampaigns());
        setIsModalOpen(false);
        setEditingCampaign(undefined);
    };
    
    const handleDeleteCampaign = (campaignId: string) => {
        dataService.deleteCampaign(campaignId);
        setCampaigns(dataService.getCampaigns());
        setIsModalOpen(false);
        setEditingCampaign(undefined);
    };

    const handleNewCampaign = () => {
        setEditingCampaign(undefined);
        setIsModalOpen(true);
    };

    const handleClearFilters = () => {
        setFilters({
            agencia: '',
            atendimento_responsavel: '',
            periodo_inicio: '',
            periodo_fim: '',
            status_plano: [],
            cliente: '',
            presenca_em: [],
            regioes_funcionais: [],
        });
        setIsFilterPanelOpen(false);
    };
    
    const handleCampaignStatusChange = (campaignId: string, newStatus: Status) => {
        const campaignToUpdate = campaigns.find(c => c.id === campaignId);
        if (campaignToUpdate && currentUser) {
            const originalStatus = campaignToUpdate.status_plano;
            const updatedCampaign: Campaign = {
                ...campaignToUpdate,
                status_plano: newStatus,
                updated_at: new Date(),
                history: [
                    ...(campaignToUpdate.history || []),
                    {
                        user: currentUser.name,
                        timestamp: new Date(),
                        changes: [`Status alterado de "${originalStatus}" para "${newStatus}" via arrastar e soltar.`],
                    },
                ],
            };
            dataService.updateCampaign(updatedCampaign);
            setCampaigns(dataService.getCampaigns());
        }
    };
    
    const handleLogin = (user: User) => {
        const loggedInUser = dataService.login(user.email);
        if (loggedInUser) {
            syncStateFromService();
            setIsAuthenticated(true);
        }
    };

    const handleLogout = () => {
        dataService.logout();
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const handleUpdateCurrentUser = (updatedData: Partial<Omit<User, 'email' | 'role'>>) => {
        dataService.updateCurrentUser(updatedData).then(updatedUser => {
            if (updatedUser) {
                setCurrentUser(updatedUser);
                setUsers(dataService.getUsers());
            }
        });
    };

    const handleEditCurrentUserImage = () => {
        if (currentUser) {
            setUploadChoiceConfig({
                title: `Alterar sua foto de perfil`,
                currentImageUrl: currentUser.image,
                onSave: (newImageUrl: string) => {
                    handleUpdateCurrentUser({ image: newImageUrl });
                    setUploadChoiceConfig(null);
                }
            });
        }
    };

    const handleDocUpload = (file: File, campaignId: string) => {
        const campaign = campaignId !== 'none' ? campaigns.find(c => c.id === campaignId) : null;

        const reader = new FileReader();
        reader.onloadend = () => {
            const newDocument: Document = {
                id: Date.now(),
                name: file.name,
                type: file.name.endsWith('.pdf') ? DocumentType.PDF : (file.name.endsWith('.docx') ? DocumentType.Word : DocumentType.Image),
                campaignId: campaign ? campaign.id : '',
                campaignName: campaign ? campaign.campanha : 'Documento Geral',
                uploadedAt: new Date().toISOString(),
                url: reader.result as string,
            };
            dataService.addDocument(newDocument);
            setDocuments(dataService.getDocuments());
            setIsDocUploadModalOpen(false);
        };
        reader.readAsDataURL(file);
    };
    
    const handleEditTeamMemberImage = (memberName: string) => {
        const member = teamMembers.find(m => m.name === memberName);
        if (member) {
            setUploadChoiceConfig({
                title: `Alterar foto de ${memberName}`,
                currentImageUrl: member.image,
                onSave: (newImageUrl) => {
                    const updatedMembers = teamMembers.map(m =>
                        m.name === memberName ? { ...m, image: newImageUrl } : m
                    );
                    dataService.setTeamMembers(updatedMembers);
                    setTeamMembers(updatedMembers);
                    setUploadChoiceConfig(null);
                }
            });
        }
    };
    
    const handleAddTeamMember = (name: string) => {
        const newMember: ResponsibleUser = {
            name: name as Responsible,
            image: `https://i.pravatar.cc/150?u=${name.toLowerCase()}`
        };
        dataService.addTeamMember(newMember);
        setTeamMembers(dataService.getTeamMembers());
    };
    
    const handleAddUser = (newUser: Omit<User, 'image'>) => {
        const user: User = {
            ...newUser,
            image: `https://i.pravatar.cc/150?u=${newUser.email}`
        };
        dataService.addUser(user);
        setUsers(dataService.getUsers());
    };

    const handleUpdateUser = (updatedUser: Omit<User, 'image'>) => {
        dataService.updateUser(updatedUser);
        setUsers(dataService.getUsers());
    };
    
    const handleDeleteUser = (email: string) => {
        dataService.deleteUser(email);
        setUsers(dataService.getUsers());
    };

    const handleOpenAiImageEditor = (docId: number) => {
        const doc = documents.find(d => d.id === docId);
        if(doc && doc.url && doc.type === DocumentType.Image) {
            setAiEditingImageConfig({
                imageUrl: doc.url,
                title: `Editar ${doc.name} com IA`,
                onSave: (newImageUrl) => {
                    const updatedDocs = documents.map(d => 
                        d.id === docId ? { ...d, url: newImageUrl, name: `edit_${d.name}` } : d
                    );
                    dataService.setDocuments(updatedDocs);
                    setDocuments(updatedDocs);
                    setAiEditingImageConfig(null);
                }
            });
        }
    };
    
    const handleDeadlineNotificationToggle = () => {
        const newValue = !deadlineNotificationEnabled;
        setDeadlineNotificationEnabled(newValue);
        dataService.saveSettings({ deadlineNotificationEnabled: newValue });
    };
    
    const handleToggleIntegration = (name: string) => {
        const updated = integrations.map(i => i.name === name ? {...i, connected: !i.connected} : i);
        dataService.setIntegrations(updated);
        setIntegrations(updated);
    };

    const handleSaveApiKey = (name: string, apiKey: string) => {
        const updated = integrations.map(i => i.name === name ? {...i, apiKey} : i);
        dataService.setIntegrations(updated);
        setIntegrations(updated);
    };


    const unreadNotificationCount = notifications.filter(n => !n.read).length;

    const handleMarkNotificationsAsRead = () => {
        setTimeout(() => {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }, 1000); 
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-bg">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    if (loadingError) {
        return <AppInitializationError message={loadingError} />;
    }

    if (!isAuthenticated || !currentUser) {
        return <Login onLogin={handleLogin} users={users} />;
    }

    const renderActiveView = () => {
        switch(activeView) {
            case 'Relatórios':
                return <Reports allCampaigns={campaigns} uniqueClients={uniqueClients} />;
            case 'Documentos':
                return <Documents documents={documents} onEditImage={handleOpenAiImageEditor} onUploadClick={() => setIsDocUploadModalOpen(true)} />;
            case 'Equipes':
                return <Teams allCampaigns={campaigns} teamMembers={teamMembers} onEditProfile={(memberName: Responsible) => handleEditTeamMemberImage(memberName as string)} />;
            case 'Configurações':
                return (
                    <Settings 
                        currentUser={currentUser}
                        onUpdateCurrentUser={handleUpdateCurrentUser}
                        onEditCurrentUserImage={handleEditCurrentUserImage}
                        teamMembers={teamMembers}
                        onEditTeamMemberImage={handleEditTeamMemberImage}
                        onAddTeamMember={handleAddTeamMember}
                        users={users}
                        onAddUser={handleAddUser}
                        onUpdateUser={handleUpdateUser}
                        onDeleteUser={handleDeleteUser}
                        deadlineNotificationEnabled={deadlineNotificationEnabled}
                        onDeadlineNotificationToggle={handleDeadlineNotificationToggle}
                        integrations={integrations}
                        onToggleIntegration={handleToggleIntegration}
                        onSaveApiKey={handleSaveApiKey}
                        syncStatus={syncStatus}
                    />
                );
            case 'Dashboard':
            default:
                return (
                    <Dashboard 
                        campaigns={filteredCampaigns} 
                        onEditCampaign={handleEditCampaign} 
                        responsibleUsersMap={dataService.MOCK_RESPONSIBLES_MAP}
                        onCampaignStatusChange={handleCampaignStatusChange}
                        documents={documents}
                    />
                );
        }
    };
    

    return (
        <div className={`theme-${theme} min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200`}>
            <Header 
                theme={theme} 
                toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                user={currentUser}
                onEditProfile={() => setActiveView('Configurações')}
                onLogout={handleLogout}
                activeItem={activeView}
                onNavigate={setActiveView}
                notifications={notifications}
                unreadNotificationCount={unreadNotificationCount}
                onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
            />
            <main className="p-6">
                {renderActiveView()}
            </main>

            <FilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                filters={filters}
                setFilters={setFilters}
                clearFilters={handleClearFilters}
                uniqueClients={uniqueClients}
                teamMembers={teamMembers}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCampaign ? "Editar Projeto" : "Criar Novo Projeto"}>
                <CampaignForm 
                    campaign={editingCampaign} 
                    onSubmit={handleSaveCampaign} 
                    onCancel={() => { setIsModalOpen(false); setEditingCampaign(undefined); }} 
                    onDelete={handleDeleteCampaign}
                    uniqueClients={uniqueClients}
                    uniqueCampaigns={uniqueCampaigns}
                    teamMembers={teamMembers}
                />
            </Modal>
            
            <Modal isOpen={isDocUploadModalOpen} onClose={() => setIsDocUploadModalOpen(false)} title="Upload de Documento">
                <DocumentUploadForm campaigns={campaigns} onSubmit={handleDocUpload} onCancel={() => setIsDocUploadModalOpen(false)} />
            </Modal>
            
            {aiEditingImageConfig && (
                <ImageEditModal 
                    isOpen={!!aiEditingImageConfig}
                    onClose={() => setAiEditingImageConfig(null)}
                    imageUrl={aiEditingImageConfig.imageUrl}
                    onSave={aiEditingImageConfig.onSave}
                    title={aiEditingImageConfig.title}
                />
            )}
            
            {uploadChoiceConfig && (
                <ImageEditChoiceModal
                    isOpen={!!uploadChoiceConfig}
                    onClose={() => setUploadChoiceConfig(null)}
                    title={uploadChoiceConfig.title}
                    onSave={uploadChoiceConfig.onSave}
                    onEditWithAI={() => {
                        if (uploadChoiceConfig) {
                             setAiEditingImageConfig({
                                imageUrl: uploadChoiceConfig.currentImageUrl,
                                onSave: uploadChoiceConfig.onSave,
                                title: uploadChoiceConfig.title
                            });
                        }
                        setUploadChoiceConfig(null);
                    }}
                />
            )}

            {/* Floating Action Buttons */}
            {activeView === 'Dashboard' && (
                <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-20">
                     <button
                        onClick={() => setIsFilterPanelOpen(true)}
                        className="bg-white dark:bg-dark-card p-4 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-dark-accent transition-transform transform hover:scale-110"
                        aria-label="Abrir filtros"
                        title="Filtros"
                    >
                        <FilterIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                        onClick={handleNewCampaign}
                        className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-transform transform hover:scale-110"
                        aria-label="Criar novo projeto"
                        title="Novo Projeto"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;