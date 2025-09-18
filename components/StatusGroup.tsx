
import React, { useState } from 'react';
import { Campaign, Status, Responsible, ResponsibleUser, Document } from '../types';
import { STATUS_COLORS } from '../constants';
import CampaignCard from './CampaignCard';

interface StatusGroupProps {
    status: Status;
    campaigns: Campaign[];
    onEditCampaign: (campaign: Campaign) => void;
    responsibleUsersMap: Record<Responsible, ResponsibleUser>;
    onCampaignStatusChange: (campaignId: string, newStatus: Status) => void;
    draggedCampaignId: string | null;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, campaignId: string) => void;
    onDragEnd: () => void;
    documents: Document[];
}

const StatusGroup: React.FC<StatusGroupProps> = ({ 
    status, 
    campaigns, 
    onEditCampaign, 
    responsibleUsersMap, 
    onCampaignStatusChange,
    draggedCampaignId,
    onDragStart,
    onDragEnd,
    documents
}) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const campaignId = e.dataTransfer.getData('campaignId');
        if (campaignId && draggedCampaignId && campaignId === draggedCampaignId) {
             onCampaignStatusChange(campaignId, status);
        }
        setIsDragOver(false);
    };


    return (
        <div 
            className={`flex-shrink-0 w-80 bg-gray-100 dark:bg-dark-accent rounded-xl p-3 transition-colors duration-200 ${isDragOver ? 'bg-primary/10' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`}></span>
                    <h3 className="font-bold text-gray-800 dark:text-white">{status}</h3>
                </div>
                <span className="text-sm font-semibold bg-gray-200 dark:bg-dark-bg text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                    {campaigns.length}
                </span>
            </div>
            <div className="space-y-3 h-[60vh] overflow-y-auto pr-1">
                {campaigns.map(campaign => (
                    <CampaignCard 
                        key={campaign.id} 
                        campaign={campaign} 
                        onEdit={onEditCampaign} 
                        responsibleUsersMap={responsibleUsersMap}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        isDragging={draggedCampaignId === campaign.id}
                        documents={documents}
                    />
                ))}
            </div>
        </div>
    );
};

export default StatusGroup;
