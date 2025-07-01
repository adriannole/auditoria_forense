import React, { useState, useCallback } from 'react';
import { ExifData, GpsCoordinates, VulnerabilityReport } from './types';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import ResultsDisplay from './components/ResultsDisplay';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";


// Declare external library types for TypeScript
declare const EXIF: any;

type LoadingStep = 'exif' | 'ai' | null;

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [gps, setGps] = useState<GpsCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(null);
  const [error, setError] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<number>(1);
  const [vulnerabilityReport, setVulnerabilityReport] = useState<VulnerabilityReport | null>(null);

  const resetState = useCallback(() => {
    setImageFile(null);
    setExifData(null);
    setGps(null);
    setIsLoading(false);
    setError(null);
    setOrientation(1);
    setVulnerabilityReport(null);
    setLoadingStep(null);
    if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
    }
  }, [imageUrl]);

  const toDecimal = (gpsData: number[], ref: 'N' | 'S' | 'E' | 'W'): number => {
    if (!gpsData || gpsData.length !== 3) return 0;
    let decimal = gpsData[0] + gpsData[1] / 60 + gpsData[2] / 3600;
    if (ref === 'S' || ref === 'W') {
      decimal = -decimal;
    }
    return decimal;
  };

  const fileToGenerativePart = (file: File) => {
    return new Promise<{inlineData: {data: string, mimeType: string}}>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve({
                    inlineData: {
                        data: reader.result.split(',')[1],
                        mimeType: file.type,
                    }
                });
            } else {
                reject(new Error("No se pudo leer el archivo como URL de datos."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };


  const handleImageUpload = useCallback(async (file: File) => {
    resetState();
    if (!file.type.startsWith('image/')) {
        setError("Tipo de archivo no válido. Por favor, suba una imagen (JPEG, PNG, etc.).");
        return;
    }
    
    setIsLoading(true);
    setLoadingStep('exif');
    setImageFile(file);
    const newImageUrl = URL.createObjectURL(file);
    setImageUrl(newImageUrl);

    const exifPromise = new Promise<ExifData>((resolve, reject) => {
         setTimeout(() => { // Gives image time to render for EXIF library
            EXIF.getData(file, function(this: any) {
                const data: ExifData = EXIF.getAllTags(this);
                if (Object.keys(data).length === 0) {
                   // Don't reject, just resolve with empty object. AI analysis can still run.
                   resolve({});
                } else {
                    resolve(data);
                }
            });
         }, 100);
    });

    try {
        const data = await exifPromise;
        setExifData(data);
        if (data.Orientation) setOrientation(data.Orientation);
        if (data.GPSLatitude && data.GPSLongitude && data.GPSLatitudeRef && data.GPSLongitudeRef) {
            const lat = toDecimal(data.GPSLatitude, data.GPSLatitudeRef);
            const lon = toDecimal(data.GPSLongitude, data.GPSLongitudeRef);
            if (!isNaN(lat) && !isNaN(lon)) {
                setGps({ lat, lon });
            }
        }

        setLoadingStep('ai');
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const imagePart = await fileToGenerativePart(file);
        const prompt = `Analiza esta imagen en busca de vulnerabilidades forenses. Busca:
1. Signos de edición (clonación, empalme, remuestreo).
2. Inconsistencias en iluminación, sombras y reflejos.
3. Artefactos de compresión que puedan indicar que se ha vuelto a guardar.
4. Anomalías en los datos EXIF en comparación con el contenido visual.
5. Cualquier otro indicador de manipulación.

Proporciona un resumen conciso y una lista de posibles problemas encontrados. Responde ÚNICAMENTE con un objeto JSON en la siguiente estructura: { "summary": "Tu evaluación general.", "issues": [{ "type": "Tipo_de_hallazgo", "description": "Explicación detallada del hallazgo." }] }. Si no se encuentran problemas significativos, el array 'issues' debe estar vacío.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
            }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        const report = JSON.parse(jsonStr);
        setVulnerabilityReport(report);

    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido durante el análisis.";
        setError(`El análisis falló: ${errorMessage}`);
    } finally {
        setIsLoading(false);
        setLoadingStep(null);
    }
  }, [resetState]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans antialiased">
      <header className="py-6 px-4 sm:px-8 border-b border-slate-700/50">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
          Analizador Forense de Imágenes
        </h1>
        <p className="text-center text-slate-400 mt-1">
          Análisis impulsado por IA para descubrir la historia detrás de sus imágenes.
        </p>
      </header>

      <main className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative flex items-center" role="alert">
              <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!imageFile && <ImageUploader onImageUpload={handleImageUpload} />}
          
          {isLoading && <Loader step={loadingStep} />}

          {!isLoading && imageFile && imageUrl && exifData && (
            <ResultsDisplay
              imageUrl={imageUrl}
              exifData={exifData}
              gps={gps}
              onReset={resetState}
              orientation={orientation}
              vulnerabilityReport={vulnerabilityReport}
            />
          )}
        </div>
      </main>

      <footer className="text-center p-6 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Analizador Forense de Imágenes. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default App;