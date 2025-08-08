import React from 'react';
import { Globe } from 'lucide-react';
import { LANGUAGES } from '../utils/constants';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  isOpen,
  onToggle
}) => {
  const handleLanguageSelect = (language: string) => {
    onLanguageChange(language);
    onToggle();
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
        aria-label="Select language"
      >
        <Globe size={20} className="text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          {LANGUAGES[currentLanguage]?.nativeName}
        </span>
        <span className="text-lg">{LANGUAGES[currentLanguage]?.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] z-50">
          {Object.values(LANGUAGES).map((lang: any) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center space-x-3 ${
                currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div>
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-sm text-gray-500">{lang.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;