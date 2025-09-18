
import React, { useState } from 'react';
import { Campaign, ResponsibleUser, Responsible, Agency, Document, DocumentType } from '../types';
import { CalendarIcon, ClockIcon, ShareIcon, CheckCircleIcon, FilePdfIcon, FileWordIcon, FileImageIcon, FileTextIcon } from './Icons';
import { AGENCY_COLORS } from '../constants';

interface CampaignCardProps {
    campaign: Campaign;
    onEdit: (campaign: Campaign) => void;
    responsibleUsersMap: Record<Responsible, ResponsibleUser>;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, campaignId: string) => void;
    onDragEnd: () => void;
    isDragging: boolean;
    documents: Document[];
}

const getBusinessDays = (endDate: Date): number => {
    const today = new Date();
    today.setHours(0,0,0,0);
    let count = 0;
    const curDate = new Date(today.getTime());
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

const getFileIcon = (type: DocumentType) => {
    switch(type) {
        case DocumentType.PDF: return <FilePdfIcon className="w-4 h-4 text-red-500 flex-shrink-0" />;
        case DocumentType.Word: return <FileWordIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />;
        case DocumentType.Image: return <FileImageIcon className="w-4 h-4 text-green-500 flex-shrink-0" />;
        default: return <FileTextIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />;
    }
}


const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onEdit, responsibleUsersMap, onDragStart, onDragEnd, isDragging, documents }) => {
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const deadline = campaign.status_plano === 'Aguardando Relatório' 
        ? campaign.data_prevista_recebimento_relatorio 
        : campaign.prazo_analise_interna;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const deadlineDate = deadline ? new Date(deadline) : null;
    if(deadlineDate) deadlineDate.setHours(0,0,0,0);

    const diffDays = deadlineDate ? Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    let deadlineStatus: { color: string, label: string } | null = null;
    if (diffDays !== null && deadlineDate) {
        if (diffDays <= 0) {
            deadlineStatus = {
                color: 'bg-red-500',
                label: 'Vencido',
            };
        } else if (diffDays <= 7) {
            deadlineStatus = {
                color: 'bg-yellow-500',
                label: 'Próximo',
            };
        } else {
             deadlineStatus = {
                color: 'bg-green-500',
                label: 'No prazo',
            };
        }
    }


    const businessDaysLeft = deadlineDate ? getBusinessDays(deadlineDate) : null;
    const responsibleUser = responsibleUsersMap[campaign.atendimento_responsavel];
    const agencyColorClass = AGENCY_COLORS[campaign.agencia];

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}${window.location.pathname}?campaignId=${campaign.id}`;
        navigator.clipboard.writeText(url).then(() => {
            setIsLinkCopied(true);
            setTimeout(() => setIsLinkCopied(false), 2000);
        });
    };

    const relatedDocuments = React.useMemo(() => {
        return documents.filter(doc => doc.campaignId === campaign.id);
    }, [documents, campaign.id]);

    return (
        <div 
            draggable="true"
            onDragStart={(e) => onDragStart(e, campaign.id)}
            onDragEnd={onDragEnd}
            onClick={() => onEdit(campaign)}
            className={`bg-white dark:bg-dark-card rounded-lg shadow-sm p-4 border-l-4 hover:shadow-lg transition-all duration-300 cursor-pointer ${agencyColorClass} ${isDragging ? 'opacity-50 ring-2 ring-primary' : ''}`}
        >
            <h4 className="font-bold text-md text-gray-900 dark:text-white truncate">{campaign.campanha || 'Campanha sem nome'}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{campaign.cliente || 'Cliente não definido'}</p>

            <div className="flex justify-between items-center mb-3 text-xs">
                <span className="font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                    {campaign.agencia}
                </span>
                 <div className="flex items-center gap-2">
                     <button
                        onClick={handleShareClick}
                        className={`p-1 rounded-full transition-colors ${
                            isLinkCopied
                                ? 'bg-green-100 dark:bg-green-900/50'
                                : 'hover:bg-gray-100 dark:hover:bg-dark-accent'
                        }`}
                        title="Copiar link"
                        aria-label="Copiar link da campanha"
                    >
                        {isLinkCopied ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                            <ShareIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                    </button>
                    {responsibleUser && (
                        <img src={responsibleUser.image} alt={responsibleUser.name} className="w-6 h-6 rounded-full object-cover" />
                    )}
                    <span className="font-semibold text-gray-600 dark:text-gray-300">{campaign.atendimento_responsavel}</span>
                </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-3">
                <CalendarIcon className="w-4 h-4" />
                <span>
                    {campaign.periodo_inicio ? new Date(campaign.periodo_inicio).toLocaleDateString() : 'N/A'} - {campaign.periodo_fim ? new Date(campaign.periodo_fim).toLocaleDateString() : 'N/A'}
                </span>
            </div>
            
            {(deadlineStatus && diffDays !== null && businessDaysLeft !== null) && (
                <div className="flex justify-between items-center text-xs">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-opacity-20`}>
                        <div className={`w-2 h-2 rounded-full ${deadlineStatus.color}`}></div>
                        <span className={`font-semibold ${deadlineStatus.color === 'bg-red-500' ? 'text-red-800 dark:text-red-200' : deadlineStatus.color === 'bg-yellow-500' ? 'text-yellow-800 dark:text-yellow-200' : 'text-green-800 dark:text-green-200'}`}>{deadlineStatus.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-medium">
                        <ClockIcon className="w-4 h-4"/>
                        <span>
                            {diffDays < 0 ? `${Math.abs(diffDays)}d atr.` : `${businessDaysLeft} dias úteis`}
                        </span>
                    </div>
                </div>
            )}
            {relatedDocuments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                    <h5 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Arquivos Relacionados:</h5>
                    <ul className="space-y-1.5">
                        {relatedDocuments.slice(0, 2).map(doc => (
                            <li key={doc.id} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-300">
                                {getFileIcon(doc.type)}
                                <span className="truncate" title={doc.name}>{doc.name}</span>
                            </li>
                        ))}
                        {relatedDocuments.length > 2 && (
                             <li className="text-xs text-gray-400 dark:text-gray-500 pl-6">
                                + {relatedDocuments.length - 2} outro(s)
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CampaignCard;
