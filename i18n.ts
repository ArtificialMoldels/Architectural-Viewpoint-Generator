import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type Language = 'en' | 'es';

const translations = {
  en: {
    // Header
    appTitle: 'Architectural Viewpoint Generator',
    // History Bar
    history: 'History',
    collapseHistory: 'Collapse history',
    expandHistory: 'Expand history',
    original: 'Original',
    originalUploadedImage: 'Original uploaded image',
    viewGeneratedImage: 'View generated image from prompt: ',
    noImagesGenerated: 'No images generated yet.',
    clearHistory: 'Clear History',
    // Main Content
    uploadTitle: '1. Upload Building Image',
    originalImageTitle: '2. Original Image',
    setSceneTitle: 'Set Scene',
    setSceneTitleNumbered: '3. Set Scene',
    viewResultsTitle: 'View Results',
    viewResultsTitleNumbered: '4. View Results',
    viewResultsTitleNumberedAlt: '3. View Results',
    // Image Uploader
    clickToUpload: 'Click to upload',
    dragAndDrop: 'or drag and drop',
    fileTypes: 'PNG, JPG, or WEBP',
    // Image Labeler
    editSpecificArea: 'Edit Specific Area',
    // Mask Area
    targetedChange: 'Targeted Change',
    clearMask: 'Clear Mask',
    maskInputPlaceholder: 'e.g., change this wall to horizontal wood planks...',
    maskInputLabel: 'Instructions for the selected area',
    // Scene Settings
    adjustSeason: 'Adjust Season',
    winter: 'Winter',
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    adjustTime: 'Adjust Time of Day',
    dawn: 'Dawn',
    daytime: 'Daytime',
    dusk: 'Dusk',
    night: 'Night',
    additionalDetails: 'Additional Details',
    additionalDetailsPlaceholder: 'e.g., add an aurora borealis, make the ground foggy...',
    additionalDetailsLabel: 'Additional details for the scene',
    // Generate Button
    generateNewView: 'Generate New View',
    // Results
    loaderText: 'Generating new perspective...',
    loaderSubtext: 'This may take a moment. The AI is working its magic!',
    errorTitle: 'An Error Occurred',
    generatedView: 'Generated View',
    useAsInput: 'Use as new input image',
    downloadImage: 'Download generated image',
    generationPrompt: 'Generation Prompt',
    copyPrompt: 'Copy prompt',
    closeImageView: 'Close image view',
    // Mask Editor
    closeMaskEditor: 'Close mask editor',
    brushSize: 'Brush Size:',
    undo: 'Undo (Ctrl+Z)',
    saveMask: 'Save Mask',
  },
  es: {
    // Header
    appTitle: 'Generador de Vistas Arquitectónicas',
    // History Bar
    history: 'Historial',
    collapseHistory: 'Contraer historial',
    expandHistory: 'Expandir historial',
    original: 'Original',
    originalUploadedImage: 'Imagen original subida',
    viewGeneratedImage: 'Ver imagen generada desde la instrucción: ',
    noImagesGenerated: 'Aún no se han generado imágenes.',
    clearHistory: 'Limpiar Historial',
    // Main Content
    uploadTitle: '1. Subir Imagen del Edificio',
    originalImageTitle: '2. Imagen Original',
    setSceneTitle: 'Configurar Escena',
    setSceneTitleNumbered: '3. Configurar Escena',
    viewResultsTitle: 'Ver Resultados',
    viewResultsTitleNumbered: '4. Ver Resultados',
    viewResultsTitleNumberedAlt: '3. Ver Resultados',
    // Image Uploader
    clickToUpload: 'Haz clic para subir',
    dragAndDrop: 'o arrastra y suelta',
    fileTypes: 'PNG, JPG, o WEBP',
    // Image Labeler
    editSpecificArea: 'Editar Área Específica',
    // Mask Area
    targetedChange: 'Cambio Específico',
    clearMask: 'Limpiar Máscara',
    maskInputPlaceholder: 'ej., cambiar este muro a tablones de madera horizontales...',
    maskInputLabel: 'Instrucciones para el área seleccionada',
    // Scene Settings
    adjustSeason: 'Ajustar Estación',
    winter: 'Invierno',
    spring: 'Primavera',
    summer: 'Verano',
    autumn: 'Otoño',
    adjustTime: 'Ajustar Hora del Día',
    dawn: 'Amanecer',
    daytime: 'Día',
    dusk: 'Atardecer',
    night: 'Noche',
    additionalDetails: 'Detalles Adicionales',
    additionalDetailsPlaceholder: 'ej., añadir una aurora boreal, hacer que el suelo tenga niebla...',
    additionalDetailsLabel: 'Detalles adicionales para la escena',
    // Generate Button
    generateNewView: 'Generar Nueva Vista',
    // Results
    loaderText: 'Generando nueva perspectiva...',
    loaderSubtext: 'Esto puede tomar un momento. ¡La IA está haciendo su magia!',
    errorTitle: 'Ocurrió un Error',
    generatedView: 'Vista Generada',
    useAsInput: 'Usar como nueva imagen de entrada',
    downloadImage: 'Descargar imagen generada',
    generationPrompt: 'Instrucción de Generación',
    copyPrompt: 'Copiar instrucción',
    closeImageView: 'Cerrar vista de imagen',
    // Mask Editor
    closeMaskEditor: 'Cerrar editor de máscara',
    brushSize: 'Tamaño del Pincel:',
    undo: 'Deshacer (Ctrl+Z)',
    saveMask: 'Guardar Máscara',
  }
};

type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: keyof Translations): string => {
    return translations[language][key] || translations.en[key];
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  // FIX: Replaced JSX with React.createElement to fix parsing errors in a .ts file. JSX is not supported in .ts files.
  return React.createElement(LanguageContext.Provider, { value }, children);
};

export const useTranslations = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }
  return context;
};
