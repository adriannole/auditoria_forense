import React from 'react';

type LoadingStep = 'exif' | 'ai' | null;

interface LoaderProps {
    step: LoadingStep;
}

const getLoadingMessage = (step: LoadingStep) => {
    switch(step) {
        case 'exif':
            return {
                title: 'Extrayendo Metadatos...',
                subtitle: 'Leyendo datos EXIF del archivo de imagen.'
            };
        case 'ai':
            return {
                title: 'Analizando Vulnerabilidades...',
                subtitle: 'Usando IA para buscar signos de manipulación. Por favor, espere.'
            };
        default:
             return {
                title: 'Procesando Imagen...',
                subtitle: 'Preparando todo. Esto no tardará mucho.'
            };
    }
}

const Loader: React.FC<LoaderProps> = ({ step }) => {
  const { title, subtitle } = getLoadingMessage(step);
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-12 bg-slate-800/50 rounded-2xl">
      <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-teal-400 h-2.5 rounded-full w-full animate-pulse"></div>
      </div>
      <p className="text-lg font-medium text-cyan-300 animate-pulse">{title}</p>
      <p className="text-slate-400 text-sm">{subtitle}</p>
    </div>
  );
};

export default Loader;