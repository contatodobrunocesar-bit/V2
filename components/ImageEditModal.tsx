import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import Modal from './Modal';
import { ZapIcon } from './Icons';

interface ImageEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onSave: (newImageUrl: string) => void;
    title: string;
}

const urlToBase64 = async (url: string): Promise<{ base64: string; mimeType: string }> => {
    // Check if the URL is already a data URL
    if (url.startsWith('data:')) {
        const parts = url.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        const base64 = parts[1];
        return { base64, mimeType };
    }
    
    // Use a proxy to avoid CORS issues if fetching from a different origin
    const proxiedUrl = `https://cors-anywhere.herokuapp.com/${url}`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ base64, mimeType });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const ImageEditModal: React.FC<ImageEditModalProps> = ({ isOpen, onClose, imageUrl, onSave, title }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt || !imageUrl) return;

        setIsLoading(true);
        setEditedImage(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const { base64, mimeType } = await urlToBase64(imageUrl);

            const imagePart = {
                inlineData: { data: base64, mimeType },
            };
            const textPart = { text: prompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            
            if (imagePartResponse?.inlineData) {
                const newImageBase64 = imagePartResponse.inlineData.data;
                const newImageMimeType = imagePartResponse.inlineData.mimeType;
                setEditedImage(`data:${newImageMimeType};base64,${newImageBase64}`);
            } else {
                throw new Error("A resposta da IA não continha uma imagem.");
            }

        } catch (e: any) {
            setError(e.message || "Ocorreu um erro ao gerar a imagem.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setPrompt('');
        setEditedImage(null);
        setError(null);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                        <h4 className="font-semibold mb-2">Original</h4>
                        <img src={imageUrl} alt="Original" className="rounded-lg shadow-md w-full object-contain h-64" />
                    </div>
                     <div className="text-center">
                        <h4 className="font-semibold mb-2">Editada</h4>
                        <div className="rounded-lg shadow-md w-full h-64 bg-gray-100 dark:bg-dark-accent flex items-center justify-center">
                           {isLoading ? (
                               <div className="text-center">
                                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                   <p className="mt-2 text-sm">Editando imagem...</p>
                               </div>
                           ) : editedImage ? (
                               <img src={editedImage} alt="Edited" className="w-full h-full object-contain rounded-lg" />
                           ) : (
                               <p className="text-gray-500 text-sm">A imagem editada aparecerá aqui.</p>
                           )}
                        </div>
                    </div>
                </div>

                {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}

                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Instrução de Edição
                    </label>
                    <textarea
                        id="prompt"
                        name="prompt"
                        rows={2}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-accent dark:border-gray-600 focus:ring-primary focus:border-primary"
                        placeholder="Ex: adicione um chapéu de festa na cabeça da pessoa"
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={handleClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                        Fechar
                    </button>
                    {editedImage && !isLoading && (
                         <button
                            type="button"
                            onClick={() => onSave(editedImage)}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"
                        >
                            Salvar Alteração
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <ZapIcon className="w-5 h-5"/>
                        {isLoading ? "Gerando..." : "Gerar"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ImageEditModal;