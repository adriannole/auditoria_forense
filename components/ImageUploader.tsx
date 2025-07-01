import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageUpload(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full max-w-3xl mx-auto bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-2xl p-8 sm:p-12 text-center cursor-pointer hover:border-cyan-500 hover:bg-slate-800 transition-all duration-300 ease-in-out"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/tiff"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-slate-700 p-4 rounded-full">
            <UploadIcon className="w-10 h-10 text-cyan-400" />
        </div>
        <p className="text-xl font-semibold text-slate-200">
          Haz clic para subir o arrastra y suelta una imagen
        </p>
        <p className="text-slate-400">
          Formatos soportados: JPG, PNG, TIFF
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;