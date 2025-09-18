import React, { useMemo } from 'react';
import { Campaign, Responsible, ResponsibleUser, Status } from '../types';
import { PlusIcon, PencilIcon } from '../components/Icons';

interface TeamsProps {
    allCampaigns: Campaign[];
    teamMembers: ResponsibleUser[];
    onEditProfile: (memberName: Responsible) => void;
}

const Teams: React.FC<TeamsProps> = ({ allCampaigns, teamMembers, onEditProfile }) => {
    const teamStats = useMemo(() => {
        return teamMembers.map(responsibleUser => {
            const memberCampaigns = allCampaigns.filter(c => c.atendimento_responsavel === responsibleUser.name);
            const activeCampaigns = memberCampaigns.filter(c => ![Status.Concluida, Status.Cancelada].includes(c.status_plano)).length;
            const campaignsWithReport = memberCampaigns.filter(c => c.relatorio_recebido);
            const onTimeReports = campaignsWithReport.filter(c => c.data_recebimento_relatorio! <= c.data_prevista_recebimento_relatorio).length;
            const punctuality = campaignsWithReport.length > 0 ? (onTimeReports / campaignsWithReport.length) * 100 : 100;

            return {
                ...responsibleUser,
                activeCampaigns,
                punctuality: punctuality.toFixed(0),
                totalCampaigns: memberCampaigns.length,
            };
        });
    }, [allCampaigns, teamMembers]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nossa Equipe</h1>
                <button
                    onClick={() => alert('Funcionalidade para adicionar membro em breve!')}
                    className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Membro
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamStats.map((member) => (
                    <div key={member.name} className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition-transform duration-300">
                        <div className="relative w-24 h-24 mx-auto mb-4 group">
                            <img 
                                src={member.image} 
                                alt={member.name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-primary/50"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                    onClick={() => onEditProfile(member.name as Responsible)} 
                                    className="p-2 bg-white/80 rounded-full text-primary hover:bg-white"
                                    aria-label={`Editar foto de ${member.name}`}
                                >
                                    <PencilIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{member.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Gerente de Contas</p>

                        <div className="flex justify-around text-center border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div>
                                <p className="text-2xl font-bold text-primary">{member.activeCampaigns}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Ativas</p>
                            </div>
                             <div>
                                <p className="text-2xl font-bold text-primary">{member.totalCampaigns}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">{member.punctuality}%</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pontualidade</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Teams;