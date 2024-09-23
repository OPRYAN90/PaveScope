import React from 'react';
import { X } from 'lucide-react';

interface FullScreenImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const FullScreenImageModal: React.FC<FullScreenImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <X size={32} />
      </button>
      <img 
        src={imageUrl} 
        alt="Full screen image" 
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
};

export default FullScreenImageModal;