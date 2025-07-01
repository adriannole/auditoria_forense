import React from 'react';
import { GpsOffIcon } from './icons/GpsOffIcon';

const NoGpsData: React.FC = () => {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[12rem] text-center">
      <GpsOffIcon className="w-12 h-12 text-slate-500 mb-4" />
      <h3 className="text-lg font-bold text-slate-300">Sin Datos de Ubicación</h3>
      <p className="text-slate-400 max-w-sm">
        No se encontraron coordenadas GPS en los metadatos de esta imagen. El mapa de ubicación no se puede mostrar.
      </p>
    </div>
  );
};

export default NoGpsData;