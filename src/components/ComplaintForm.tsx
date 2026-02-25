import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Send, AlertTriangle, Sparkles, Mic, Square } from 'lucide-react';
import { LocationService, LocationData } from '../utils/locationUtils';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

interface ComplaintFormProps {
  onSubmit: (complaintData: any) => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({
  onSubmit
}) => {
  const { t, i18n } = useTranslation();

  const [transcribedText, setTranscribedText] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice Recognition states
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Classification Preview states
  const [isClassifying, setIsClassifying] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const previewTimerRef = useRef<number | null>(null);

  const locationService = new LocationService();

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    const langCode = i18n.language === 'tamil' || i18n.language === 'ta' ? 'ta-IN' :
      i18n.language === 'hindi' || i18n.language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.lang = langCode;

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscribedText(prev => prev ? prev + ' ' + transcript : transcript);
        } else {
          currentTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error !== 'no-speech') {
        setSpeechError('Microphone error: ' + event.error);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Auto-stopped due to silence or explicitly stopped
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [i18n.language]);

  const toggleListening = () => {
    setSpeechError('');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        // Recognition might already be started implicitly
        console.error(e);
      }
    }
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const locationData = await locationService.getCurrentLocation();
      setLocation(locationData);
    } catch (error) {
      console.error('Location error:', error);
      alert('Failed to get location. Please enable location access.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Preview Auto-classification logic
  const classifyText = async (text: string) => {
    if (!text.trim()) {
      setPreviewData(null);
      return;
    }

    setIsClassifying(true);
    try {
      const dbLang = i18n.language === 'tamil' || i18n.language === 'ta' ? 'ta' : i18n.language === 'hindi' || i18n.language === 'hi' ? 'hi' : 'en';
      const response = await api.post('/complaints/classify', { transcriptText: text, language: dbLang });
      setPreviewData(response.data);
    } catch (error) {
      console.error('Classification preview error:', error);
      setPreviewData(null);
    } finally {
      setIsClassifying(false);
    }
  };

  useEffect(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }
    previewTimerRef.current = setTimeout(() => {
      classifyText(transcribedText);
    }, 1000); // Debounce interval

    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, [transcribedText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transcribedText.trim()) {
      alert(t('recordVoiceOrText') || 'Please record a voice message or add text description.');
      return;
    }

    if (!location) {
      alert(t('addLocationAlert') || 'Please add location information.');
      return;
    }

    // Stop listening on submit
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setIsSubmitting(true);
    try {
      const dbLang = i18n.language === 'tamil' || i18n.language === 'ta' ? 'ta' : i18n.language === 'hindi' || i18n.language === 'hi' ? 'hi' : 'en';
      const response = await api.post('/complaints', {
        transcriptText: transcribedText,
        language: dbLang,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        }
      });

      // Pass the response to App to navigation to success
      onSubmit(response.data);
    } catch (err: any) {
      console.error('Submission error:', err);
      alert('Failed to submit complaint. ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Voice Recording Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Speak Your Complaint</h3>

        {!speechSupported ? (
          <div className="text-red-500 text-sm mb-4 flex items-center">
            <AlertTriangle size={16} className="mr-1" />
            Voice input is not supported in this browser. Please type below.
          </div>
        ) : (
          <>
            <div className={`relative mb-6 ${isListening ? 'animate-pulse' : ''}`}>
              <button
                type="button"
                onClick={toggleListening}
                disabled={isSubmitting}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:bg-gray-400 ${isListening
                  ? 'bg-red-500 shadow-lg shadow-red-200 hover:bg-red-600'
                  : 'bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700'
                  }`}
              >
                {isListening ? (
                  <Square size={28} className="text-white fill-current" />
                ) : (
                  <Mic size={32} className="text-white" />
                )}
              </button>

              {isListening && (
                <>
                  <div className="absolute -inset-4 rounded-full border-4 border-red-300 animate-ping pointer-events-none"></div>
                  <div className="absolute -inset-8 rounded-full border-2 border-red-200 animate-ping animation-delay-75 pointer-events-none"></div>
                </>
              )}
            </div>

            <div className="text-center text-sm font-medium mb-4">
              {isListening ? (
                <span className="text-red-600">Listening... (Click to stop)</span>
              ) : (
                <span className="text-gray-600">{t('clickMicToSpeak')}</span>
              )}
            </div>

            {speechError && (
              <div className="text-red-500 text-sm mb-4">
                {speechError}
              </div>
            )}
          </>
        )}
      </div>

      {/* Additional Text Input */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('additionalDetails') || 'Complaint Description'}
        </label>
        <textarea
          value={transcribedText}
          onChange={(e) => setTranscribedText(e.target.value)}
          placeholder={t('addDetails') || 'Speak into the microphone or type your complaint here...'}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-800 text-lg shadow-inner"
          rows={5}
          disabled={isSubmitting}
        />
      </div>

      {/* AI Preview Section */}
      {(previewData || isClassifying) && transcribedText.trim() && (
        <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
            <Sparkles size={20} className="mr-2 text-blue-600" />
            {t('aiPreview')}
            {isClassifying && (
              <div className="ml-3 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h3>

          {previewData && !isClassifying ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm flex flex-col justify-center">
                <div className="text-sm text-gray-500 mb-1">{t('detectedCategory')}</div>
                <div className="font-bold text-gray-800 text-lg">{previewData.category}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm flex flex-col justify-center">
                <div className="text-sm text-gray-500 mb-1">{t('priorityValidation')}</div>
                <div className={`font-bold text-lg ${previewData.priorityLabel === 'High' ? 'text-red-600' :
                  previewData.priorityLabel === 'Medium' ? 'text-orange-500' : 'text-green-600'
                  }`}>
                  {previewData.priorityLabel} <span className="text-xs font-normal text-gray-500 ml-1">(Score: {(previewData.priorityScore * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          ) : isClassifying ? (
            <div className="text-gray-500 italic text-sm py-2">{t('analyzingSemantics')}</div>
          ) : null}
        </div>
      )}

      {/* Location Section */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('location')} *
        </label>
        <div className="space-y-3">
          <button
            type="button"
            onClick={getLocation}
            disabled={locationLoading || isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors shadow"
          >
            <MapPin size={16} />
            <span>
              {locationLoading ? t('gettingLocation') : t('getCurrentLocation')}
            </span>
          </button>

          {location && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-700">
                <MapPin size={16} />
                <span className="font-medium">{t('locationAdded')}</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                {location.address || `${location.latitude}, ${location.longitude}`}
              </p>
              <p className="text-xs text-green-500 mt-1">
                {t('accuracy')}: {Math.round(location.accuracy)}m
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !location || !transcribedText.trim() || isClassifying}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors text-lg shadow-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('submittingComplaint')}</span>
            </div>
          ) : (
            <>
              <Send size={22} className="mr-1" />
              <span>{t('confirmSubmit')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ComplaintForm;