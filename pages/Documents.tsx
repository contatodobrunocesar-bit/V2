import React from 'react';
import { Document, DocumentType } from '../types';
import { PlusIcon, FilePdfIcon, FileWordIcon, FileImageIcon, DownloadIcon, TrashIcon, FileTextIcon, EditIcon } from '../components/Icons';

const getFileIcon = (type: string) => {
    switch(type) {
        case DocumentType.PDF: return <FilePdfIcon className="w-6 h-6 text-red-500" />;
        case DocumentType.Word: return <FileWordIcon className="w-6 h-6 text-blue-500" />;
        case DocumentType.Image: return <FileImageIcon className="w-6 h-6 text-green-500" />;
        default: return <FileTextIcon className="w-6 h-6 text-gray-500" />;
    }
}

interface DocumentsProps {
    documents: Document[];
    onEditImage: (docId: number) => void;
    onUploadClick: () => void;
}

const Documents: React.FC<DocumentsProps> = ({ documents, onEditImage, onUploadClick }) => {

    const handleEditClick = (doc: Document) => {
        onEditImage(doc.id);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Repositório de Documentos</h1>
                 <button
                    onClick={onUploadClick}
                    className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5" />
                    Upload de Arquivo
                </button>
            </div>
            
            <div className="bg-white dark:bg-dark-card shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-accent dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome do Arquivo</th>
                                <th scope="col" className="px-6 py-3">Campanha Associada</th>
                                <th scope="col" className="px-6 py-3">Data de Upload</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map(doc => (
                                <tr key={doc.id} className="bg-white dark:bg-dark-card border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-accent/50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(doc.type)}
                                            <span>{doc.name}</span>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">
                                        <span className={doc.campaignName === 'Documento Geral' ? 'text-gray-500 italic' : ''}>
                                            {doc.campaignName || 'Documento Geral'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {doc.type === DocumentType.Image && (
                                                <button onClick={() => handleEditClick(doc)} className="text-primary hover:underline" title="Editar com IA">
                                                    <EditIcon className="w-5 h-5"/>
                                                </button>
                                            )}
                                            <button onClick={() => alert(`Baixando ${doc.name}...`)} className="text-gray-500 hover:text-primary" title="Download"><DownloadIcon className="w-5 h-5"/></button>
                                            <button onClick={() => alert(`Excluindo ${doc.name}...`)} className="text-gray-500 hover:text-red-500" title="Excluir"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Documents;