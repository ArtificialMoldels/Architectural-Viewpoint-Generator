import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import ImageLabeler from './components/ImageLabeler';
import SeasonSlider from './components/SeasonSlider';
import TimeOfDaySlider from './components/TimeOfDaySlider';
import HistoryBar from './components/HistoryBar';
import MaskEditor from './components/MaskEditor';
import { MagicWandIcon } from './components/icons';
import { generateNewView } from './services/geminiService';
import type { GeneratedImagePart, Season, TimeOfDay, HistoryItem } from './types';
import { useTranslations } from './i18n';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageMimeType, setOriginalImageMimeType] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImagePart | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [season, setSeason] = useState<Season>('Summer');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('Daytime');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [isMaskEditorOpen, setIsMaskEditorOpen] = useState<boolean>(false);
  const [maskImage, setMaskImage] = useState<GeneratedImagePart | null>(null);
  const [maskPrompt, setMaskPrompt] = useState<string>('');
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { t } = useTranslations();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);


  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, WEBP).');
        return;
    }
    setError(null);
    setGeneratedImage(null);
    setGeneratedPrompt(null);
    setMaskImage(null);
    setMaskPrompt('');
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setOriginalImage(base64String);
      setOriginalImageMimeType(file.type);
      
      const originalHistoryItem: HistoryItem = {
          id: `original-${Date.now()}`,
          image: { base64: base64String, mimeType: file.type },
          prompt: 'Original Image',
          isOriginal: true,
      };
      // A new upload clears previous history and sets the new original image.
      setHistory([originalHistoryItem]);
    };
    reader.onerror = () => {
        setError("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSeasonChange = useCallback((newSeason: Season) => {
    setSeason(newSeason);
  }, []);
  
  const handleTimeOfDayChange = useCallback((newTime: TimeOfDay) => {
    setTimeOfDay(newTime);
  }, []);

  const handleSaveMask = useCallback((maskData: GeneratedImagePart) => {
    setMaskImage(maskData);
    setIsMaskEditorOpen(false);
  }, []);

  const handleGenerate = async () => {
    if (!originalImage || !originalImageMimeType) {
      setError("Please upload an image first.");
      return;
    }
    if (maskImage && !maskPrompt.trim()) {
      setError("Please provide instructions for the selected area.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedPrompt(null);

    const seasonPrompt = `The current season is ${season}.`;
    const timeOfDayPrompt = `The time of day is ${timeOfDay}.`;

    try {
      const result = await generateNewView(
        originalImage, 
        originalImageMimeType, 
        seasonPrompt, 
        timeOfDayPrompt,
        customPrompt,
        maskImage?.base64 || null,
        maskPrompt || null
      );
      if (result.image) {
        setGeneratedImage(result.image);
        setGeneratedPrompt(result.prompt);
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          image: result.image,
          prompt: result.prompt,
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      } else {
        setError(result.text || "Generation failed: No image was returned.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = `data:${generatedImage.mimeType};base64,${generatedImage.base64}`;
    const extension = generatedImage.mimeType.split('/')[1] || 'png';
    link.download = `generated-view.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setGeneratedImage(item.image);
    setGeneratedPrompt(item.prompt);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleClearHistory = useCallback(() => {
    const original = history.find(item => item.isOriginal);
    setHistory(original ? [original] : []);
  }, [history]);

  const handleUseAsInput = useCallback(() => {
    if (!generatedImage) return;
    setOriginalImage(generatedImage.base64);
    setOriginalImageMimeType(generatedImage.mimeType);
    setGeneratedImage(null);
    setGeneratedPrompt(null);
    setMaskImage(null);
    setMaskPrompt('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [generatedImage]);


  const isGenerateDisabled = !originalImage || isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header theme={theme} setTheme={setTheme} />
      {isMaskEditorOpen && originalImage && (
        <MaskEditor
          imageSrc={`data:${originalImageMimeType};base64,${originalImage}`}
          onClose={() => setIsMaskEditorOpen(false)}
          onSave={handleSaveMask}
        />
      )}
      <div className="flex-grow container mx-auto flex gap-4 p-4 overflow-hidden">
        <HistoryBar
          history={history}
          onSelect={handleSelectHistoryItem}
          onClear={handleClearHistory}
        />
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
          <div className="flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('uploadTitle')}</h2>
            </div>
            <ImageUploader onImageUpload={handleImageUpload} />

            {originalImage && (
              <>
                <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('originalImageTitle')}</h2>
                </div>
                <ImageLabeler 
                  imageSrc={`data:${originalImageMimeType};base64,${originalImage}`}
                  onEdit={() => setIsMaskEditorOpen(true)}
                />
              </>
            )}

            {maskImage && (
              <div className="p-4 border-t border-gray-300 dark:border-gray-700 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('targetedChange')}</h3>
                    <button onClick={() => setMaskImage(null)} className="text-sm text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300">{t('clearMask')}</button>
                  </div>
                  <div className="flex gap-4 mt-2 p-2 bg-white dark:bg-gray-900/50 rounded-lg">
                    <img src={`data:${maskImage.mimeType};base64,${maskImage.base64}`} alt="Edit Mask" className="w-24 h-24 object-contain rounded-md border border-gray-300 dark:border-gray-600"/>
                    <div className="flex-grow">
                        <textarea
                            value={maskPrompt}
                            onChange={(e) => setMaskPrompt(e.target.value)}
                            placeholder={t('maskInputPlaceholder')}
                            className="w-full h-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            aria-label={t('maskInputLabel')}
                        />
                    </div>
                  </div>
              </div>
            )}
            
            <div className={`p-4 border-t border-gray-300 dark:border-gray-700 ${maskImage ? 'opacity-30' : ''}`}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{originalImage ? t('setSceneTitleNumbered') : `2. ${t('setSceneTitle')}`}</h2>
            </div>
            <div className={maskImage ? 'opacity-30 pointer-events-none' : ''}>
                <SeasonSlider value={season} onChange={handleSeasonChange} disabled={!originalImage} />
                <TimeOfDaySlider value={timeOfDay} onChange={handleTimeOfDayChange} disabled={!originalImage} />
                <div className={`w-full p-4 ${!originalImage ? 'opacity-50' : ''}`}>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('additionalDetails')}</h3>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    disabled={!originalImage}
                    placeholder={t('additionalDetailsPlaceholder')}
                    className="w-full h-24 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    aria-label={t('additionalDetailsLabel')}
                  />
                </div>
            </div>


            <div className="p-6 mt-auto">
              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full flex items-center justify-center gap-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg shadow-cyan-500/20"
              >
                <MagicWandIcon className="w-6 h-6" />
                {t('generateNewView')}
              </button>
            </div>
          </div>

          <div className="flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700 min-h-[500px] lg:min-h-0">
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{originalImage ? t('viewResultsTitleNumbered') : t('viewResultsTitleNumberedAlt')}</h2>
            </div>
            <div className="flex-grow flex items-center justify-center p-4">
              {isLoading ? (
                <Loader />
              ) : error ? (
                <div className="text-center p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg">
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-300">{t('errorTitle')}</h3>
                  <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
                </div>
              ) : (
                <ResultDisplay
                  generatedImage={generatedImage}
                  generatedPrompt={generatedPrompt}
                  onDownload={generatedImage ? handleDownload : undefined}
                  onUseAsInput={generatedImage ? handleUseAsInput : undefined}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;