import React, { useMemo, useState } from 'react';
import { Campaign, Agency, Status, MediaPresence, RegiaoFuncional } from '../types';
import { TrendingUpIcon, DollarSignIcon, BriefcaseIcon, ClockIcon, FileTextIcon, MapPinIcon } from '../components/Icons';
import { STATUS_COLORS } from '../constants';

interface ReportsProps {
    allCampaigns: Campaign[];
    uniqueClients: string[];
}

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
        <div className="bg-primary/20 text-primary p-3 rounded-full">
            {icon}
        </div>
    </div>
);

const MultiSelectDropdown: React.FC<{
    options: string[];
    selected: string[];
    onToggle: (option: string) => void;
    label: string;
}> = ({ options, selected, onToggle, label }) => (
    <details className="relative print:hidden">
        <summary className="cursor-pointer p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600 w-full text-left">
            <span className="text-sm">{selected.length === 0 ? label : `${selected.length} selecionado(s)`}</span>
        </summary>
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-dark-card border dark:border-gray-600 rounded-md shadow-lg">
            {options.map(option => (
                <label key={option} className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-accent cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selected.includes(option)}
                        onChange={() => onToggle(option)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 truncate">{option}</span>
                </label>
            ))}
        </div>
    </details>
);


const MEDIA_COLORS: Record<MediaPresence, string> = {
    [MediaPresence.Televisao]: '#ef4444', 
    [MediaPresence.Radio]: '#f97316',
    [MediaPresence.Impresso]: '#eab308',
    [MediaPresence.OOH]: '#84cc16', 
    [MediaPresence.DOOH]: '#22c55e', 
    [MediaPresence.Revista]: '#10b981', 
    [MediaPresence.Cinema]: '#14b8a6', 
    [MediaPresence.Digital]: '#06b6d4', 
    [MediaPresence.Influenciadores]: '#3b82f6', 
    [MediaPresence.AcoesIntegradas]: '#8b5cf6',
    [MediaPresence.Eventos]: '#d946ef', 
};


const Reports: React.FC<ReportsProps> = ({ allCampaigns, uniqueClients }) => {
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
    const [selectedRegioes, setSelectedRegioes] = useState<RegiaoFuncional[]>([]);
    const [chartSelectedClients, setChartSelectedClients] = useState<string[]>([]);
    const [mediaAnalysisMetric, setMediaAnalysisMetric] = useState<'count' | 'budget'>('count');

    const uniqueCampaigns = useMemo(() => {
        const campaigns = allCampaigns.map(c => c.campanha);
        return [...new Set(campaigns)].sort();
    }, [allCampaigns]);

    const reportData = useMemo(() => {
        const filteredCampaigns = allCampaigns.filter(c => {
            const clientMatch = selectedClients.length > 0 ? c.cliente && selectedClients.includes(c.cliente) : true;
            const campaignMatch = selectedCampaigns.length > 0 ? selectedCampaigns.includes(c.campanha) : true;
            const regiaoMatch = selectedRegioes.length > 0 ? c.regioes_funcionais && c.regioes_funcionais.some(r => selectedRegioes.includes(r)) : true;
            return clientMatch && campaignMatch && regiaoMatch;
        });
        
        const chartCampaigns = chartSelectedClients.length > 0
            ? filteredCampaigns.filter(c => c.cliente && chartSelectedClients.includes(c.cliente))
            : filteredCampaigns;

        const totalOrcamento = filteredCampaigns.reduce((sum, c) => sum + (c.orcamento || 0), 0);
        
        const reportsWithDeadline = filteredCampaigns.filter(c => c.relatorio_recebido && c.data_recebimento_relatorio && c.data_prevista_recebimento_relatorio);
        const onTimeReports = reportsWithDeadline.filter(c => new Date(c.data_recebimento_relatorio!) <= new Date(c.data_prevista_recebimento_relatorio!)).length;
        const punctualityRate = reportsWithDeadline.length > 0 ? (onTimeReports / reportsWithDeadline.length) * 100 : 0;
        
        const campaignsWithDuration = filteredCampaigns.filter(c => c.periodo_fim && c.periodo_inicio);
        const totalDays = campaignsWithDuration.reduce((sum, c) => {
            const diffTime = new Date(c.periodo_fim!).getTime() - new Date(c.periodo_inicio!).getTime();
            return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }, 0);
        const averageDuration = campaignsWithDuration.length > 0 ? totalDays / campaignsWithDuration.length : 0;
        
        const budgetByAgency = filteredCampaigns.reduce((acc, c) => {
            if (!acc[c.agencia]) acc[c.agencia] = 0;
            acc[c.agencia] += c.orcamento || 0;
            return acc;
        }, {} as Record<Agency, number>);

        const statusDistribution = filteredCampaigns.reduce((acc, c) => {
            if (!acc[c.status_plano]) acc[c.status_plano] = 0;
            acc[c.status_plano]++;
            return acc;
        }, {} as Record<Status, number>);
        
        const projectsByMonth = filteredCampaigns.reduce((acc, c) => {
            if (!c.data_entrada_pauta) return acc;
            const pautaDate = new Date(c.data_entrada_pauta);
            const year = pautaDate.getFullYear();
            const month = pautaDate.getMonth();
            const key = `${year}-${String(month).padStart(2, '0')}`; // YYYY-MM for sorting

            if (!acc[key]) {
                acc[key] = {
                    label: pautaDate.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
                    count: 0
                };
            }
            acc[key].count++;
            return acc;
        }, {} as Record<string, { label: string, count: number }>);

        const sortedProjectsByMonth = Object.entries(projectsByMonth)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([, value]) => [value.label, value.count]);


        const mediaUsage = filteredCampaigns.flatMap(c => c.presenca_em || []).reduce((acc, media) => {
             if (!acc[media]) acc[media] = 0;
            acc[media]++;
            return acc;
        }, {} as Record<MediaPresence, number>);
        
         const budgetByMedia = filteredCampaigns.reduce((acc, campaign) => {
            if (campaign.orcamento_por_midia) {
                for (const media in campaign.orcamento_por_midia) {
                    const mediaKey = media as MediaPresence;
                    const budget = campaign.orcamento_por_midia[mediaKey] || 0;
                    if (!acc[mediaKey]) {
                        acc[mediaKey] = 0;
                    }
                    acc[mediaKey] += budget;
                }
            }
            return acc;
        }, {} as Record<MediaPresence, number>);
        
        const mediaByRegionForChart = chartCampaigns.reduce((acc, campaign) => {
            if (campaign.regioes_funcionais && campaign.presenca_em) {
                campaign.regioes_funcionais.forEach(regiao => {
                    if (!acc[regiao]) {
                        acc[regiao] = {};
                    }
                    campaign.presenca_em!.forEach(media => {
                        if (!acc[regiao][media]) {
                            acc[regiao][media] = { count: 0, budget: 0 };
                        }
                        acc[regiao][media].count++;
                        acc[regiao][media].budget += campaign.orcamento_por_midia?.[media] || 0;
                    });
                });
            }
            return acc;
        }, {} as Record<RegiaoFuncional, Partial<Record<MediaPresence, { count: number, budget: number }>>>);

        let maxCountForChart = 0;
        let maxBudgetForChart = 0;
        Object.values(mediaByRegionForChart).forEach(regionData => {
            Object.values(regionData).forEach(data => {
                 if (data.count > maxCountForChart) {
                    maxCountForChart = data.count;
                }
                if (data.budget > maxBudgetForChart) {
                    maxBudgetForChart = data.budget;
                }
            });
        });
        
        return { 
            totalCampaigns: filteredCampaigns.length,
            totalOrcamento, 
            punctualityRate,
            averageDuration,
            budgetByAgency: Object.entries(budgetByAgency).sort(([,a],[,b]) => b-a),
            statusDistribution: Object.entries(statusDistribution),
            projectsByMonth: sortedProjectsByMonth,
            mediaUsage: Object.entries(mediaUsage).sort(([,a],[,b]) => b-a),
            budgetByMedia: Object.entries(budgetByMedia).sort(([, a], [, b]) => b - a),
            mediaByRegionForChart,
            maxCountForChart: maxCountForChart > 0 ? maxCountForChart : 1,
            maxBudgetForChart: maxBudgetForChart > 0 ? maxBudgetForChart : 1,
        };
    }, [allCampaigns, selectedClients, selectedCampaigns, selectedRegioes, chartSelectedClients]);
    
    const handlePrint = () => {
        window.print();
    }
    
    const handleToggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, selected: string[], option: string) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        setter(newSelected);
    };

    return (
        <div id="report-page">
            <style>
                {`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .page-break {
                        page-break-before: always;
                    }
                    footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                    }
                }
                `}
            </style>
            <div className="print:hidden flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="min-w-[180px]">
                        <MultiSelectDropdown 
                            options={uniqueClients} 
                            selected={selectedClients} 
                            onToggle={(client) => handleToggle(setSelectedClients, selectedClients, client)}
                            label="Todos os órgãos"
                        />
                    </div>
                     <div className="min-w-[180px]">
                        <MultiSelectDropdown 
                            options={uniqueCampaigns} 
                            selected={selectedCampaigns} 
                            onToggle={(campaign) => handleToggle(setSelectedCampaigns, selectedCampaigns, campaign)}
                            label="Todas as campanhas"
                        />
                    </div>
                     <div className="min-w-[180px]">
                        <MultiSelectDropdown 
                            options={Object.values(RegiaoFuncional)} 
                            selected={selectedRegioes} 
                            onToggle={(regiao) => handleToggle(setSelectedRegioes, selectedRegioes, regiao)}
                            label="Todas as regiões"
                        />
                    </div>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
                        <FileTextIcon className="w-5 h-5" />
                        Exportar para PDF
                    </button>
                </div>
            </div>
            
            <div className="hidden print:block mb-6 text-center">
                 <h1 className="text-2xl font-bold">Relatório de pautas de mídia - SECOM GOVRS</h1>
                 <p className="text-sm text-gray-600">Período: Todos</p>
                 {selectedClients.length > 0 && <p className="text-sm text-gray-600">Órgão(s): {selectedClients.join(', ')}</p>}
                 {selectedCampaigns.length > 0 && <p className="text-sm text-gray-600">Campanha(s): {selectedCampaigns.join(', ')}</p>}
                 {selectedRegioes.length > 0 && <p className="text-sm text-gray-600">Região(ões): {selectedRegioes.join(', ')}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <KpiCard title="Total de projetos" value={`${reportData.totalCampaigns}`} icon={<BriefcaseIcon className="w-6 h-6"/>} />
                <KpiCard title="Orçamento total investido" value={reportData.totalOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={<DollarSignIcon className="w-6 h-6"/>} />
                <KpiCard title="Pontualidade (relatórios)" value={`${reportData.punctualityRate.toFixed(1)}%`} icon={<TrendingUpIcon className="w-6 h-6"/>} />
                <KpiCard title="Duração média/campanha" value={`${reportData.averageDuration.toFixed(0)} dias`} icon={<ClockIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">Orçamento por agência</h3>
                    <div className="space-y-4">
                        {reportData.budgetByAgency.map(([agency, budget]) => (
                             <div key={agency}>
                                <div className="flex justify-between mb-1 text-sm font-medium dark:text-white">
                                    <span>{agency}</span>
                                    <span>{budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                     <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(budget / (reportData.budgetByAgency[0]?.[1] || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">Distribuição por status</h3>
                    <ul className="space-y-3 text-sm">
                        {reportData.statusDistribution.map(([status, count]) => (
                             <li key={status} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status as Status]}`}></span>
                                    <span>{status}</span>
                                </div>
                                <span className="font-semibold bg-gray-100 dark:bg-dark-accent px-2 py-0.5 rounded-full">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-6 bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5"/>
                        Análise de mídia por região funcional
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="min-w-[200px]">
                        <MultiSelectDropdown 
                                options={uniqueClients} 
                                selected={chartSelectedClients} 
                                onToggle={(client) => handleToggle(setChartSelectedClients, chartSelectedClients, client)}
                                label="Filtrar por órgão"
                            />
                        </div>
                        <div className="print:hidden flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-0.5">
                            <button
                                onClick={() => setMediaAnalysisMetric('count')}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                                    mediaAnalysisMetric === 'count' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                Contagem
                            </button>
                            <button
                                onClick={() => setMediaAnalysisMetric('budget')}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                                    mediaAnalysisMetric === 'budget' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                Orçamento
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto p-2">
                    <div className="flex gap-8 min-w-max">
                        {(selectedRegioes.length > 0 ? selectedRegioes : Object.values(RegiaoFuncional)).map(regiao => {
                            const regionData = reportData.mediaByRegionForChart[regiao] || {};
                            return (
                                <div key={regiao} className="flex-shrink-0 w-64">
                                    <h4 className="font-semibold text-sm text-center mb-2 truncate" title={regiao}>{regiao.split('-')[0].trim()}</h4>
                                    <div className="relative h-64 bg-gray-50 dark:bg-dark-accent/50 rounded-lg p-2 flex justify-around items-end gap-1 border-b-2 border-gray-300 dark:border-gray-600">
                                        {Object.values(MediaPresence).map(media => {
                                            const data = regionData[media];
                                            const count = data?.count || 0;
                                            const budget = data?.budget || 0;
                                            
                                            const isBudgetView = mediaAnalysisMetric === 'budget';
                                            const value = isBudgetView ? budget : count;
                                            const maxValue = isBudgetView ? reportData.maxBudgetForChart : reportData.maxCountForChart;
                                            const height = (value / maxValue) * 100;
                                            
                                            const titleText = isBudgetView
                                                ? `${media}: ${budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                                                : `${media}: ${count} campanha(s)`;

                                            return (
                                                <div
                                                    key={media}
                                                    className="w-full h-full flex items-end justify-center group"
                                                >
                                                    <div
                                                        className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80 relative"
                                                        style={{ height: `${height}%`, backgroundColor: MEDIA_COLORS[media] }}
                                                        title={titleText}
                                                    >
                                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                            <div className="bg-white dark:bg-dark-card shadow-lg rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap border dark:border-gray-600">
                                                                {titleText}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                    {Object.entries(MEDIA_COLORS).map(([media, color]) => (
                        <div key={media} className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
                            <span>{media}</span>
                        </div>
                    ))}
                </div>
            </div>
            
             <div className="grid grid-cols-1 gap-6 mt-6 page-break">
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">Projetos criados por mês</h3>
                    <div className="h-72 w-full p-4 bg-gray-50 dark:bg-dark-accent/50 rounded-lg">
                        {reportData.projectsByMonth.length > 0 ? (
                            <div className="h-full w-full flex items-end gap-x-2 sm:gap-x-4">
                                {reportData.projectsByMonth.map(([month, count]) => {
                                    const maxCount = Math.max(1, ...reportData.projectsByMonth.map(([, c]) => c as number));
                                    // FIX: Cast `count` to number to allow arithmetic operation.
                                    const barHeight = ((count as number) / maxCount) * 100;
                                    return (
                                        <div key={month as string} className="flex-1 flex flex-col items-center justify-end h-full group text-center">
                                            <div 
                                                className="relative w-full bg-gradient-to-t from-primary to-red-400 rounded-t-lg transition-all duration-300 ease-in-out hover:from-primary hover:to-red-500"
                                                style={{ height: `${barHeight}%` }}
                                                title={`${count} projetos`}
                                            >
                                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {count}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate w-full">{month}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Nenhum dado para o período selecionado.
                            </div>
                        )}
                    </div>
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">Orçamento por tipo de mídia</h3>
                     <div className="space-y-4">
                        {reportData.budgetByMedia.map(([media, budget]) => (
                             <div key={media}>
                                <div className="flex justify-between mb-1 text-sm font-medium dark:text-white">
                                    <span>{media}</span>
                                    <span>{budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                     <div 
                                        className="h-2.5 rounded-full" 
                                        style={{ 
                                            width: `${(budget / (reportData.budgetByMedia[0]?.[1] || 1)) * 100}%`,
                                            backgroundColor: MEDIA_COLORS[media as MediaPresence]
                                        }}
                                     ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">Mídias mais utilizadas</h3>
                    <ul className="space-y-3 text-sm columns-2 sm:columns-3 md:columns-4">
                         {reportData.mediaUsage.map(([media, count]) => (
                             <li key={media as string} className="flex justify-between items-center break-inside-avoid-column mb-2 pr-2">
                                <span className="font-medium">{media}</span>
                                <span className="font-semibold bg-gray-100 dark:bg-dark-accent px-2 py-0.5 rounded-full">{count}</span>
                            </li>
                         ))}
                    </ul>
                </div>
            </div>
            
            <footer className="hidden print:block fixed bottom-0 left-0 w-full p-2 text-center bg-white border-t">
                <p className="text-xs text-gray-800 font-semibold">
                    Disclaimer: Informação de uso interno da SECOM RS. Qualquer dado não pode ser interpretado sem a consulta a todo o projeto.
                </p>
                <p className="text-xs text-gray-600 mt-1">
                    Download executado em: {new Date().toLocaleString('pt-BR')}
                </p>
            </footer>
        </div>
    );
};

export default Reports;