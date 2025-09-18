import React, { useState, useEffect, useMemo } from 'react';
import { Campaign, Agency, Responsible, Status, ExhibitionStatus, MediaPresence, RegiaoFuncional, ResponsibleUser } from '../types';
import { ChevronDownIcon, ClockIcon, UserIcon, TrashIcon } from './Icons';


interface CampaignFormProps {
    campaign?: Campaign | null;
    onSubmit: (data: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => void;
    onCancel: () => void;
    onDelete?: (campaignId: string) => void;
    uniqueClients?: string[];
    uniqueCampaigns?: string[];
    teamMembers: ResponsibleUser[];
}

const formatCurrency = (value?: number | string): string => {
    if (value === null || value === undefined || value === '') return '';
    
    let numValue: number;
    if (typeof value === 'string') {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned === '') return '';
        numValue = parseFloat(cleaned) / 100;
    } else {
        numValue = value;
    }

    if (isNaN(numValue)) return '';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numValue);
};

const parseCurrency = (value: string): number | undefined => {
    if (!value) return undefined;
    const numberString = value
        .replace('R$', '')
        .trim()
        .replace(/\./g, '')
        .replace(',', '.');
    const parsed = parseFloat(numberString);
    return isNaN(parsed) ? undefined : parsed;
};

const addBusinessDays = (date: Date, days: number): Date => {
  const newDate = new Date(date.getTime());
  let addedDays = 0;
  while (addedDays < days) {
    newDate.setDate(newDate.getDate() + 1);
    const dayOfWeek = newDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
      addedDays++;
    }
  }
  return newDate;
};


const formatDateForInput = (date?: Date | null): string => {
    if (!date) return '';
    try {
        return new Date(date).toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
}

const getInitialFormData = (campaign?: Campaign | null, teamMembers?: ResponsibleUser[]) => {
    const initialOrcamentoPorMidia: Record<string, string> = {};
    if (campaign?.orcamento_por_midia) {
        for (const mediaKey in campaign.orcamento_por_midia) {
            const media = mediaKey as MediaPresence;
            const value = campaign.orcamento_por_midia[media];
            if (value !== undefined) {
                initialOrcamentoPorMidia[media] = formatCurrency(value);
            }
        }
    }

    return {
        cliente: campaign?.cliente || '',
        campanha: campaign?.campanha || '',
        data_entrada_pauta: formatDateForInput(campaign?.data_entrada_pauta),
        proa: campaign?.proa || '',
        orcamento: formatCurrency(campaign?.orcamento) || '',
        agencia: campaign?.agencia || Agency.HOC,
        atendimento_responsavel: campaign?.atendimento_responsavel || (teamMembers && teamMembers.length > 0 ? teamMembers[0].name : ''),
        status_plano: campaign?.status_plano || Status.Planejamento,
        periodo_inicio: formatDateForInput(campaign?.periodo_inicio),
        periodo_fim: formatDateForInput(campaign?.periodo_fim),
        observacoes_ajustes: campaign?.observacoes_ajustes || '',
        exhibition_status: campaign?.exhibition_status || ExhibitionStatus.AguardandoInicio,
        comprovantes_sac_recebidos: campaign?.comprovantes_sac_recebidos || false,
        comentarios: campaign?.comentarios || '',
        plano_midia_arquivo_nome: campaign?.plano_midia_arquivo_nome || '',
        relatorio_arquivo_nome: campaign?.relatorio_arquivo_nome || '',
        presenca_em: campaign?.presenca_em || [],
        orcamento_por_midia: initialOrcamentoPorMidia,
        regioes_funcionais: campaign?.regioes_funcionais || [],
        data_prevista_retorno_agencia: formatDateForInput(campaign?.data_prevista_retorno_agencia),
    };
};


const CampaignForm: React.FC<CampaignFormProps> = ({ campaign, onSubmit, onCancel, onDelete, uniqueClients, uniqueCampaigns, teamMembers }) => {
    const [formData, setFormData] = useState(() => getInitialFormData(campaign, teamMembers));
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    useEffect(() => {
        setFormData(getInitialFormData(campaign, teamMembers));
    }, [campaign, teamMembers]);

    const feedbackDate = useMemo(() => {
        if (formData.data_prevista_retorno_agencia) {
            const retornoDate = new Date(`${formData.data_prevista_retorno_agencia}T00:00:00`);
            if (isNaN(retornoDate.getTime())) return '';
            const feedback = addBusinessDays(retornoDate, 3);
            return formatDateForInput(feedback);
        }
        return '';
    }, [formData.data_prevista_retorno_agencia]);

    const previstoRecebimentoRelatorio = useMemo(() => {
        if (formData.periodo_fim) {
            const terminoDate = new Date(`${formData.periodo_fim}T00:00:00`);
            if (isNaN(terminoDate.getTime())) return '';
            const relatorio = addBusinessDays(terminoDate, 10);
            return formatDateForInput(relatorio);
        }
        return '';
    }, [formData.periodo_fim]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'file') {
            const file = (e.target as HTMLInputElement).files?.[0];
            setFormData(prev => ({ ...prev, [name]: file ? file.name : '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formattedValue = formatCurrency(rawValue);
        setFormData(prev => ({ ...prev, orcamento: formattedValue }));
    };

    const handleMediaPresenceChange = (media: MediaPresence) => {
        setFormData(prev => {
            const currentSelection = prev.presenca_em || [];
            const newSelection = currentSelection.includes(media)
                ? currentSelection.filter(item => item !== media)
                : [...currentSelection, media];
            
            const newOrcamentos = { ...prev.orcamento_por_midia };
            if (!newSelection.includes(media)) {
                delete newOrcamentos[media];
            }

            return { ...prev, presenca_em: newSelection, orcamento_por_midia: newOrcamentos };
        });
    };

    const handleMediaBudgetChange = (media: MediaPresence, rawValue: string) => {
        const formattedValue = formatCurrency(rawValue);
        setFormData(prev => ({
            ...prev,
            orcamento_por_midia: {
                ...prev.orcamento_por_midia,
                [media]: formattedValue,
            },
        }));
    };

    const handleRegiaoFuncionalChange = (regiao: RegiaoFuncional) => {
        setFormData(prev => {
            const currentSelection = prev.regioes_funcionais || [];
            const newSelection = currentSelection.includes(regiao)
                ? currentSelection.filter(item => item !== regiao)
                : [...currentSelection, regiao];
            return { ...prev, regioes_funcionais: newSelection };
        });
    };
    
    const parseDateString = (dateString: string): Date | null => {
        if (!dateString) return null;
        const date = new Date(`${dateString}T00:00:00`);
        return isNaN(date.getTime()) ? null : date;
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const retornoAgenciaDate = parseDateString(formData.data_prevista_retorno_agencia);
        const terminoDate = parseDateString(formData.periodo_fim);

        const feedbackAgenciaDate = retornoAgenciaDate ? addBusinessDays(retornoAgenciaDate, 3) : null;
        const previstoRecebimentoRelatorioDate = terminoDate ? addBusinessDays(terminoDate, 10) : null;
        
        let prazoAnaliseInternaDate: Date | null = null;
        if(previstoRecebimentoRelatorioDate) {
            prazoAnaliseInternaDate = new Date(previstoRecebimentoRelatorioDate.getTime());
            prazoAnaliseInternaDate = addBusinessDays(prazoAnaliseInternaDate, 3);
        }

        const parsedOrcamentoPorMidia: Partial<Record<MediaPresence, number>> = {};
        if (formData.orcamento_por_midia) {
            for (const mediaKey in formData.orcamento_por_midia) {
                const media = mediaKey as MediaPresence;
                const value = formData.orcamento_por_midia[media];
                const parsedValue = parseCurrency(value);
                if (parsedValue !== undefined) {
                    parsedOrcamentoPorMidia[media] = parsedValue;
                }
            }
        }

        const campaignDataPayload = {
            ...formData,
            periodo_inicio: parseDateString(formData.periodo_inicio),
            periodo_fim: terminoDate,
            data_entrada_pauta: parseDateString(formData.data_entrada_pauta),
            data_prevista_retorno_agencia: retornoAgenciaDate,
            data_prevista_recebimento_relatorio: previstoRecebimentoRelatorioDate,
            prazo_analise_interna: prazoAnaliseInternaDate,
            data_feedback_agencia: feedbackAgenciaDate,
            orcamento: parseCurrency(formData.orcamento),
            orcamento_por_midia: parsedOrcamentoPorMidia,
        };
        
        if (campaign) { 
            onSubmit({
                ...campaignDataPayload,
                data_recebimento_relatorio: campaign.data_recebimento_relatorio,
                relatorio_recebido: campaign.relatorio_recebido,
            });
        } else { 
            onSubmit({
                ...campaignDataPayload,
                data_recebimento_relatorio: null,
                relatorio_recebido: false,
            });
        }
    };

    const handleDelete = () => {
        if (campaign && onDelete) {
            if (window.confirm(`Tem certeza que deseja excluir o projeto "${campaign.campanha}"? Esta ação não pode ser desfeita.`)) {
                onDelete(campaign.id);
            }
        }
    };

    const renderFileInput = (name: string, label: string, currentFileName?: string) => (
         <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <div className="flex items-center">
                <label className="cursor-pointer bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-l-md">
                    Escolher
                    <input type="file" name={name} onChange={handleChange} className="hidden" />
                </label>
                <span className="flex-1 p-2 border border-l-0 rounded-r-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600 text-sm truncate">
                    {currentFileName || "Nenhum arquivo selecionado"}
                </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">É possível adicionar até 4 arquivos. O mais recente será exibido.</p>
        </div>
    );
    
    const exhibitionStatusColors = {
        [ExhibitionStatus.AguardandoInicio]: 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 font-semibold',
        [ExhibitionStatus.EmExibicao]: 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 font-semibold',
    };
    
    const exhibitionSelectClasses = `w-full md:w-1/2 p-2 border rounded-md transition-colors ${exhibitionStatusColors[formData.exhibition_status] || 'bg-gray-50 dark:bg-dark-accent dark:border-gray-600'}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Bloco 1: Informações Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="cliente-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Órgão demandante</label>
                    <input type="text" id="cliente-input" list="client-list" name="cliente" value={formData.cliente} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600"/>
                    <datalist id="client-list">
                        {uniqueClients?.map(c => <option key={c} value={c} />)}
                    </datalist>
                </div>
                <div>
                    <label htmlFor="campanha-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campanha</label>
                    <input type="text" id="campanha-input" list="campaign-list" name="campanha" value={formData.campanha} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600"/>
                    <datalist id="campaign-list">
                        {uniqueCampaigns?.map(c => <option key={c} value={c} />)}
                    </datalist>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data do briefing</label><input type="date" name="data_entrada_pauta" value={formData.data_entrada_pauta} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PROA Nativo</label><input type="text" name="proa" value={formData.proa} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600" /></div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orçamento total</label>
                    <input 
                        type="text" 
                        name="orcamento" 
                        value={formData.orcamento} 
                        onChange={handleBudgetChange} 
                        placeholder="R$ 0,00" 
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600" 
                    />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agência</label><select name="agencia" value={formData.agencia} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600">
                    {/* FIX: Explicitly type 'val' as Agency to prevent it from being inferred as 'unknown'. */}
                    {Object.values(Agency).map((val: Agency) => (<option key={val} value={val}>{val}</option>))}
                    </select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Atendimento</label><select name="atendimento_responsavel" value={formData.atendimento_responsavel} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600">{teamMembers.map(val => (<option key={val.name} value={val.name}>{val.name}</option>))}</select></div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Regiões Funcionais</label>
                <div className="flex flex-wrap gap-2">
                    {Object.values(RegiaoFuncional).map(regiao => (
                        <button
                            key={regiao}
                            type="button"
                            onClick={() => handleRegiaoFuncionalChange(regiao)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                                formData.regioes_funcionais.includes(regiao)
                                    ? 'bg-primary text-white font-semibold'
                                    : 'bg-gray-200 dark:bg-dark-accent hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {regiao}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bloco 2: Plano de Mídia */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Plano de Mídia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retorno agência</label><input type="date" name="data_prevista_retorno_agencia" value={formData.data_prevista_retorno_agencia} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600" /></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de feedback para agência</label>
                        <div className="w-full p-2 border rounded-md bg-primary/10 dark:bg-primary/20 border-primary/50 text-primary font-bold">
                           {feedbackDate ? new Date(`${feedbackDate}T00:00:00`).toLocaleDateString('pt-BR') : '...'}
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mt-4">
                     {renderFileInput('plano_midia_arquivo_nome', 'Upload do arquivo recebido', formData.plano_midia_arquivo_nome)}
                     <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select name="status_plano" value={formData.status_plano} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600">{Object.values(Status).map(val => (<option key={val} value={val}>{val}</option>))}</select></div>
                </div>
            </div>

            {/* Bloco 3: Exibição */}
             <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Exibição</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início da exibição</label><input type="date" name="periodo_inicio" value={formData.periodo_inicio} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600" /></div>
                     <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Término da exibição</label><input type="date" name="periodo_fim" value={formData.periodo_fim} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600" /></div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Presença em e orçamentos</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.values(MediaPresence).map(media => {
                            const isSelected = formData.presenca_em.includes(media);
                            return (
                                <div key={media}>
                                    <button
                                        type="button"
                                        onClick={() => handleMediaPresenceChange(media)}
                                        className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                                            isSelected
                                                ? 'bg-primary text-white font-semibold'
                                                : 'bg-gray-200 dark:bg-dark-accent hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {media}
                                    </button>
                                    {isSelected && (
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                name={`orcamento_${media}`}
                                                value={formData.orcamento_por_midia?.[media] || ''}
                                                onChange={(e) => handleMediaBudgetChange(media, e.target.value)}
                                                placeholder="R$ 0,00"
                                                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600 text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status da exibição</label>
                    <select name="exhibition_status" value={formData.exhibition_status} onChange={handleChange} className={exhibitionSelectClasses}>
                        {Object.values(ExhibitionStatus).map(val => (<option key={val} value={val}>{val}</option>))}
                    </select>
                </div>
                 <div className="mt-4"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações de ajustes em encaixe e outros pontos</label><textarea name="observacoes_ajustes" rows={2} value={formData.observacoes_ajustes} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600" placeholder="Adicione observações aqui..."/></div>
            </div>

            {/* Bloco 4: Relatório e checking */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Relatório e Checking</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recebimento relatório</label>
                        <input type="text" readOnly value={previstoRecebimentoRelatorio ? new Date(`${previstoRecebimentoRelatorio}T00:00:00`).toLocaleDateString('pt-BR') : '...'} className="w-full p-2 border rounded-md bg-gray-200 dark:bg-gray-700 cursor-not-allowed dark:border-gray-600"/>
                    </div>
                     {renderFileInput('relatorio_arquivo_nome', 'Upload do plano de mídia final', formData.relatorio_arquivo_nome)}
                    <div className="md:col-span-2 flex items-center pt-4">
                         <input type="checkbox" id="comprovantes_sac_recebidos" name="comprovantes_sac_recebidos" checked={formData.comprovantes_sac_recebidos} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                         <label htmlFor="comprovantes_sac_recebidos" className="ml-2 block text-sm font-semibold text-green-800 dark:text-green-200">Comprovantes visuais já recebidos pelo SAC</label>
                    </div>
                 </div>
            </div>

            {/* Bloco 5: Comentários */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentários</label>
                <textarea id="comentarios" name="comentarios" rows={3} value={formData.comentarios} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600" placeholder="Adicione observações relevantes aqui..."/>
            </div>

            {/* Bloco 6: Histórico de Alterações */}
            {campaign && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button
                        type="button"
                        onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                        className="w-full flex justify-between items-center text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-accent"
                        aria-expanded={isHistoryVisible}
                    >
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Histórico de Alterações</h3>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform text-gray-500 ${isHistoryVisible ? 'rotate-180' : ''}`} />
                    </button>
                    {isHistoryVisible && (
                        <div className="mt-2 space-y-3 max-h-48 overflow-y-auto pr-2">
                            {campaign.history && campaign.history.length > 0 ? (
                                campaign.history.slice().reverse().map((entry, index) => (
                                    <div key={index} className="p-3 bg-gray-50 dark:bg-dark-accent rounded-lg border dark:border-gray-600">
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <UserIcon className="w-4 h-4" />
                                                <span className="font-semibold">{entry.user}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <ClockIcon className="w-4 h-4" />
                                                <span>{new Date(entry.timestamp).toLocaleString('pt-BR')}</span>
                                            </div>
                                        </div>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 pl-2">
                                            {entry.changes.map((change, i) => (
                                                <li key={i}><div dangerouslySetInnerHTML={{ __html: change.replace(/"(.*?)"/g, '<strong class="text-primary/80">"$1"</strong>') }} /></li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 px-2">Nenhuma alteração registrada.</p>
                            )}
                        </div>
                    )}
                </div>
            )}


            {/* Ações */}
            <div className="flex justify-end gap-4 pt-2">
                {campaign && onDelete && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="flex items-center gap-2 text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                        style={{ marginRight: 'auto' }}
                        aria-label="Excluir projeto"
                    >
                        <TrashIcon className="w-5 h-5"/>
                        Excluir
                    </button>
                )}
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                    Cancelar
                </button>
                <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
                    Salvar Projeto
                </button>
            </div>
        </form>
    );
};

export default CampaignForm;