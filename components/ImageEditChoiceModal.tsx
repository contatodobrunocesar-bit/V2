import React, { useRef, useState } from 'react';
import Modal from './Modal';
import { ZapIcon, UploadIcon } from './Icons';

interface ImageEditChoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onEditWithAI: () => void;
    onSave: (newImageUrl: string) => void;
}

const ImageEditChoiceModal: React.FC<ImageEditChoiceModalProps> = ({
    isOpen,
    onClose,
    title,
    onEditWithAI,
    onSave,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCloseAndReset = () => {
        onClose();
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            onSave(base64String);
            handleCloseAndReset();
        };
        reader.readAsDataURL(file);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseAndReset} title={title}>
            <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="*/*"
                        style={{ display: 'none' }}
                    />
                    <button
                        onClick={onEditWithAI}
                        className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-gray-100 dark:bg-dark-accent rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ZapIcon className="w-8 h-8 text-primary" />
                        <span className="font-semibold">Editar com IA</span>
                    </button>
                    <button
                        onClick={handleUploadClick}
                        className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-gray-100 dark:bg-dark-accent rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <UploadIcon className="w-8 h-8 text-primary" />
                        <span className="font-semibold">Fazer Upload</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ImageEditChoiceModal;