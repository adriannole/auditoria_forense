import React from 'react';
import { ExifData } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { GpsIcon } from './icons/GpsIcon';
import { InfoIcon } from './icons/InfoIcon';

interface MetadataTableProps {
  data: ExifData;
}

const MetadataRow: React.FC<{ icon: React.ReactNode; label: string; value?: string | number | null }> = ({ icon, label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <li className="flex items-center space-x-3 py-3 px-4 rounded-md transition-colors hover:bg-slate-700/50">
            <div className="flex-shrink-0 text-cyan-400">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-300 truncate">{label}</p>
            </div>
            <div className="text-sm text-slate-400 text-right">{String(value)}</div>
        </li>
    );
};

const MetadataTable: React.FC<MetadataTableProps> = ({ data }) => {
  const hasData = Object.keys(data).length > 0;

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 h-full">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Metadatos Extraídos</h2>
      {hasData ? (
        <ul className="divide-y divide-slate-700">
            <MetadataRow 
                icon={<CameraIcon className="w-5 h-5"/>} 
                label="Dispositivo" 
                value={data.Make && data.Model ? `${data.Make} ${data.Model}` : data.Make || data.Model}
            />
            <MetadataRow 
                icon={<CalendarIcon className="w-5 h-5"/>} 
                label="Fecha y Hora de Captura" 
                value={data.DateTimeOriginal || data.DateTimeDigitized}
            />
            <MetadataRow 
                icon={<InfoIcon className="w-5 h-5"/>} 
                label="Resolución" 
                value={data.PixelXDimension && data.PixelYDimension ? `${data.PixelXDimension} x ${data.PixelYDimension}` : null}
            />
            <MetadataRow 
                icon={<InfoIcon className="w-5 h-5"/>} 
                label="ISO" 
                value={data.ISOSpeedRatings}
            />
            <MetadataRow 
                icon={<InfoIcon className="w-5 h-5"/>} 
                label="Apertura" 
                value={data.FNumber ? `f/${data.FNumber}`: null}
            />
            <MetadataRow 
                icon={<InfoIcon className="w-5 h-5"/>} 
                label="Velocidad de Obturación" 
                value={data.ExposureTime ? `1/${Math.round(1 / data.ExposureTime)}s`: null}
            />
            <MetadataRow 
                icon={<InfoIcon className="w-5 h-5"/>} 
                label="Distancia Focal" 
                value={data.FocalLength ? `${data.FocalLength}mm` : null}
            />
            <MetadataRow 
                icon={<GpsIcon className="w-5 h-5"/>} 
                label="Latitud" 
                value={data.GPSLatitude ? data.GPSLatitude.join(', ') : null}
            />
            <MetadataRow 
                icon={<GpsIcon className="w-5 h-5"/>} 
                label="Longitud" 
                value={data.GPSLongitude ? data.GPSLongitude.join(', ') : null}
            />
            <MetadataRow 
                icon={<InfoIcon className="w-5 h-5"/>} 
                label="Software" 
                value={data.Software}
            />
        </ul>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400">
            <p>No se encontraron metadatos EXIF en esta imagen.</p>
        </div>
      )}
    </div>
  );
};

export default MetadataTable;