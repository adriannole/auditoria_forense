import React, { useRef } from 'react';
import { ExifData, GpsCoordinates, VulnerabilityReport } from '../types';
import MapView from './MapView';
import MetadataTable from './MetadataTable';
import { DownloadIcon } from './icons/DownloadIcon';
import VulnerabilityAnalysis from './VulnerabilityAnalysis';
import NoGpsData from './NoGpsData';

// Declare external library types for TypeScript
declare const jspdf: any;
declare const html2canvas: any;

interface ResultsDisplayProps {
  imageUrl: string;
  exifData: ExifData;
  gps: GpsCoordinates | null;
  onReset: () => void;
  orientation: number;
  vulnerabilityReport: VulnerabilityReport | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ imageUrl, exifData, gps, onReset, orientation, vulnerabilityReport }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const getOrientationClass = (orientation: number) => {
    switch (orientation) {
      case 3: return 'rotate-180';
      case 6: return 'rotate-90';
      case 8: return 'rotate-[-90deg]';
      default: return 'rotate-0';
    }
  }

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0f172a', // bg-slate-900
        scale: 2, // Higher scale for better quality
        useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    const { jsPDF } = jspdf;
    // A4 size in points: 595.28 x 841.89
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let imgWidth = pdfWidth - 40; // with margin
    let imgHeight = imgWidth / ratio;

    if (imgHeight > pdfHeight - 40) {
        imgHeight = pdfHeight - 40;
        imgWidth = imgHeight * ratio;
    }

    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save('informe-forense-imagen.pdf');
    setIsExporting(false);
  };

  return (
    <div className="animate-fade-in">
        <div id="report-container" className="bg-slate-900">
          <div ref={reportRef} className="p-4 sm:p-6">
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-slate-800/50 p-4 rounded-lg flex items-center justify-center">
                    <img 
                        src={imageUrl} 
                        alt="Analizada" 
                        className={`max-h-[400px] w-auto object-contain rounded-md shadow-lg ${getOrientationClass(orientation)}`} 
                    />
                </div>
                <div className="lg:col-span-3">
                    <MetadataTable data={exifData} />
                </div>
                <div className="lg:col-span-5">
                  {gps ? <MapView coordinates={gps} /> : <NoGpsData />}
                </div>
                <div className="lg:col-span-5">
                  <VulnerabilityAnalysis report={vulnerabilityReport} />
                </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 transition-colors duration-300 disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
                <DownloadIcon className="w-5 h-5" />
                {isExporting ? 'Exportando...' : 'Exportar Informe como PDF'}
            </button>
            <button
                onClick={onReset}
                className="w-full sm:w-auto px-6 py-3 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-colors duration-300"
            >
                Analizar Otra Imagen
            </button>
        </div>
    </div>
  );
};

export default ResultsDisplay;