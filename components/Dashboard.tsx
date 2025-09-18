
import React, { useState } from 'react';
import { Campaign, Status, Responsible, ResponsibleUser, Document } from '../types';
import StatusGroup from './StatusGroup';
import { STATUS_ORDER } from '../constants';

interface DashboardProps {
    campaigns: Campaign[];
    onEditCampaign: (campaign: Campaign) => void;
    responsibleUsersMap: Record<Responsible, ResponsibleUser>;
    onCampaignStatusChange: (campaignId: string, newStatus: Status) => void;
    documents: Document[];
}

const Dashboard: React.FC<DashboardProps> = ({ campaigns, onEditCampaign, responsibleUsersMap, onCampaignStatusChange, documents }) => {
    
    const [draggedCampaignId, setDraggedCampaignId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, campaignId: string) => {
        e.dataTransfer.setData('campaignId', campaignId);
        setDraggedCampaignId(campaignId);
    };

    const handleDragEnd = () => {
        setDraggedCampaignId(null);
    };

    const groupedCampaigns = campaigns.reduce((acc, campaign) => {
        const status = campaign.status_plano;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(campaign);
        return acc;
    }, {} as Record<Status, Campaign[]>);

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="inline-flex space-x-4 min-w-full">
                {STATUS_ORDER.map(status => (
                    <StatusGroup
                        key={status}
                        status={status}
                        campaigns={groupedCampaigns[status] || []}
                        onEditCampaign={onEditCampaign}
                        responsibleUsersMap={responsibleUsersMap}
                        onCampaignStatusChange={onCampaignStatusChange}
                        draggedCampaignId={draggedCampaignId}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        documents={documents}
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
