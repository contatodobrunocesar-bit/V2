import React, { useRef, useState } from 'react';
import Modal from './Modal';
import { ZapIcon, UploadIcon } from './Icons';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../constants';

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
    const [error, setError] = useState<string>('');

    const handleCloseAndReset = () => {
        setError('');
        onClose();
    };

    const handleUploadClick = () => {
        setError('');
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(`O arquivo é muito grande. O tamanho máximo é de ${MAX_FILE_SIZE_MB}MB.`);
            event.target.value = ''; // Reset file input
            return;
        }

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
                        accept="image/png, image/jpeg, image/webp"
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
                 {error && (
                    <div className="mt-4 text-center text-red-500 text-sm font-semibold p-2 bg-red-100 dark:bg-red-900/50 rounded-md">
                        {error}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImageEditChoiceModal;