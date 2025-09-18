import React, { useState, useEffect } from 'react';
import { Agency, Responsible, Status, Filters, MediaPresence, RegiaoFuncional, ResponsibleUser } from '../types';
import { FilterIcon, XIcon } from './Icons';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    clearFilters: () => void;
    uniqueClients: string[];
    teamMembers: ResponsibleUser[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, filters, setFilters, clearFilters, uniqueClients, teamMembers }) => {
    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleLocalInputChange = <K extends keyof Filters>(
        key: K,
        value: Filters[K]
    ) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleLocalStatusChange = (status: Status) => {
        const currentStatuses = localFilters.status_plano;
        const newStatuses = currentStatuses.includes(status)
            ? currentStatuses.filter(s => s !== status)
            : [...currentStatuses, status];
        handleLocalInputChange('status_plano', newStatuses);
    };

    const handleLocalMediaPresenceChange = (media: MediaPresence) => {
        const currentMedia = localFilters.presenca_em || [];
        const newMedia = currentMedia.includes(media)
            ? currentMedia.filter(m => m !== media)
            : [...currentMedia, media];
        handleLocalInputChange('presenca_em', newMedia);
    };
    
    const handleLocalRegioesChange = (regiao: RegiaoFuncional) => {
        const currentRegioes = localFilters.regioes_funcionais || [];
        const newRegioes = currentRegioes.includes(regiao)
            ? currentRegioes.filter(r => r !== regiao)
            : [...currentRegioes, regiao];
        handleLocalInputChange('regioes_funcionais', newRegioes);
    };

    const handleApplyFilters = () => {
        setFilters(localFilters);
        onClose();
    };

    const handleClearFilters = () => {
        clearFilters();
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-dark-card shadow-xl z-40 transform transition-transform ease-in-out duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FilterIcon className="w-6 h-6" />
                        Filtros
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-accent">
                        <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-grow space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Órgão demandante</label>
                        <select value={localFilters.cliente} onChange={e => handleLocalInputChange('cliente', e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600">
                            <option value="">Todos</option>
                            {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agência</label>
                        <select value={localFilters.agencia} onChange={e => handleLocalInputChange('agencia', e.target.value as Agency)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600">
                            <option value="">Todas</option>
                            {/* FIX: Explicitly type 'a' as Agency to prevent it from being inferred as 'unknown'. */}
                            {Object.values(Agency).map((a: Agency) => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Atendimento</label>
                        <select value={localFilters.atendimento_responsavel} onChange={e => handleLocalInputChange('atendimento_responsavel', e.target.value as Responsible)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600">
                            <option value="">Todos</option>
                            {teamMembers.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início da exibição</label>
                         <input type="date" value={localFilters.periodo_inicio} onChange={e => handleLocalInputChange('periodo_inicio', e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600 dark:text-gray-300 dark:[color-scheme:dark]" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Término da exibição</label>
                         <input type="date" value={localFilters.periodo_fim} onChange={e => handleLocalInputChange('periodo_fim', e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600 dark:text-gray-300 dark:[color-scheme:dark]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Presença em:</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(MediaPresence).map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleLocalMediaPresenceChange(m)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        localFilters.presenca_em?.includes(m)
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 dark:bg-dark-accent text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Regiões Funcionais:</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(RegiaoFuncional).map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => handleLocalRegioesChange(r)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        localFilters.regioes_funcionais?.includes(r)
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 dark:bg-dark-accent text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(Status).map(s => (
                                <button key={s} onClick={() => handleLocalStatusChange(s)} className={`px-3 py-1 text-sm rounded-full transition-colors ${localFilters.status_plano.includes(s) ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-accent text-gray-700 dark:text-gray-300'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <button onClick={handleClearFilters} className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-md transition-colors">
                        <XIcon className="w-5 h-5"/>
                        Limpar
                    </button>
                     <button onClick={handleApplyFilters} className="flex items-center justify-center gap-2 bg-primary hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        <FilterIcon className="w-5 h-5"/>
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </>
    );
};

export default FilterPanel;