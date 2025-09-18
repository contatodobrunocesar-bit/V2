

import React, { useMemo } from 'react';
import { Campaign, Agency, Status } from '../types';
import { BriefcaseIcon, CheckCircleIcon } from './Icons';

interface GamificationWidgetsProps {
    campaigns: Campaign[];
}

const GamificationWidgets: React.FC<GamificationWidgetsProps> = ({ campaigns }) => {

    const stats = useMemo(() => {
        const agencyBudgetMap: Record<Agency, number> =
            // FIX: Explicitly type 'agency' as Agency to prevent it from being inferred as 'unknown'.
            Object.values(Agency).reduce((acc, agency: Agency) => ({ ...acc, [agency]: 0 }), {} as Record<Agency, number>);

        let completedThisMonth = 0;
        let totalThisMonth = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let analyzedOnTime = 0;
        let totalAnalyzed = 0;

        campaigns.forEach(c => {
            // Sum budget per agency for ranking
            agencyBudgetMap[c.agencia] += c.orcamento || 0;
            
            // Other stats calculations for the second widget
            if ([Status.Concluida, Status.AnaliseInterna, Status.Atrasada].includes(c.status_plano)) {
                if(c.data_recebimento_relatorio && c.data_prevista_recebimento_relatorio) {
                    totalAnalyzed++;
                    if (new Date(c.data_recebimento_relatorio) <= new Date(c.data_prevista_recebimento_relatorio)) {
                        analyzedOnTime++;
                    }
                }
            }
             if (c.periodo_fim && new Date(c.periodo_fim).getMonth() === currentMonth && new Date(c.periodo_fim).getFullYear() === currentYear) {
                totalThisMonth++;
                if(c.status_plano === Status.Concluida) {
                    completedThisMonth++;
                }
            }
        });

        const sortedAgencyRanking = Object.entries(agencyBudgetMap)
            .map(([name, budget]) => ({ name: name as Agency, budget }))
            .sort((a, b) => b.budget - a.budget);
        
        const monthlyProgress = totalThisMonth > 0 ? (completedThisMonth / totalThisMonth) * 100 : 0;

        return { sortedAgencyRanking, monthlyProgress, analyzedOnTime, totalAnalyzed };

    }, [campaigns]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Agency Ranking */}
            <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-4 col-span-1 lg:col-span-1">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BriefcaseIcon className="w-5 h-5 text-primary"/>Ranking de Agências (por Orçamento)</h3>
                <ul className="space-y-3">
                    {stats.sortedAgencyRanking.slice(0, 5).map((agency, i) => (
                        <li key={agency.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                               <span className="font-bold text-gray-400 w-5">{i + 1}.</span>
                               <span className="font-semibold">{agency.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="font-bold text-primary">
                                   {agency.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                               </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Monthly Progress */}
            <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-4 col-span-1 lg:col-span-2">
                 <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-primary"/>Progresso Mensal</h3>
                 <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Campanhas Concluídas</span>
                            <span className="text-sm font-bold text-primary">{stats.monthlyProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-dark-accent rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full" style={{ width: `${stats.monthlyProgress}%` }}></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center pt-2">
                       <div>
                           <p className="text-2xl font-bold">{stats.analyzedOnTime}</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">Analisadas no Prazo</p>
                       </div>
                       <div>
                           <p className="text-2xl font-bold">{stats.totalAnalyzed}</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">Total Analisadas</p>
                       </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default GamificationWidgets;