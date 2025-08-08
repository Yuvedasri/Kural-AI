import React, { useState, useEffect } from 'react';
import { MapPin, Camera, Send, AlertTriangle } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import { LocationService, LocationData } from '../utils/locationUtils';
import { COMPLAINT_CATEGORIES, PRIORITY_LEVELS } from '../utils/constants';

interface ComplaintFormProps {
  language: string;
  onSubmit: (complaintData: any) => void;
  isSubmitting?: boolean;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({
  language,
  onSubmit,
  isSubmitting = false
}) => {
  const [voiceRecording, setVoiceRecording] = useState<{blob: Blob, url: string} | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'normal' | 'low'>('normal');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const locationService = new LocationService();
  const categories = COMPLAINT_CATEGORIES[language as keyof typeof COMPLAINT_CATEGORIES] || COMPLAINT_CATEGORIES.english;
  const priorities = PRIORITY_LEVELS[language as keyof typeof PRIORITY_LEVELS] || PRIORITY_LEVELS.english;

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

  const handleVoiceRecording = (audioBlob: Blob, audioUrl: string) => {
    setVoiceRecording({ blob: audioBlob, url: audioUrl });
    // In a real app, you would send this to a speech-to-text service
    // For now, we'll use a placeholder text
    setTranscribedText('Voice recording captured. In a real implementation, this would be transcribed to text.');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 3)); // Max 3 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!voiceRecording && !transcribedText) {
      alert('Please record a voice message or add text description.');
      return;
    }

    if (!category) {
      alert('Please select a category for your complaint.');
      return;
    }

    if (!location) {
      alert('Please add location information.');
      return;
    }

    const complaintData = {
      voiceRecording: voiceRecording?.blob,
      transcribedText,
      category,
      priority,
      location,
      images,
      timestamp: new Date()
    };

    onSubmit(complaintData);
  };

  useEffect(() => {
    // Auto-get location when component mounts
    getLocation();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Voice Recording Section */}
      <div>
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecording}
          language={language}
          isDisabled={isSubmitting}
        />
      </div>

      {/* Transcribed Text Display */}
      {transcribedText && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Transcribed Text:</h4>
          <p className="text-blue-700">{transcribedText}</p>
        </div>
      )}

      {/* Additional Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Details (Optional)
        </label>
        <textarea
          value={transcribedText}
          onChange={(e) => setTranscribedText(e.target.value)}
          placeholder="Add any additional details about your complaint..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={isSubmitting}
        >
          <option value="">Select a category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Priority Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(priorities).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPriority(key as any)}
              disabled={isSubmitting}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                priority === key
                  ? key === 'urgent'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : key === 'normal'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {key === 'urgent' && <AlertTriangle size={16} className="mx-auto mb-1" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Location Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <div className="space-y-3">
          <button
            type="button"
            onClick={getLocation}
            disabled={locationLoading || isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <MapPin size={16} />
            <span>
              {locationLoading ? 'Getting Location...' : 'Get Current Location'}
            </span>
          </button>

          {location && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-700">
                <MapPin size={16} />
                <span className="font-medium">Location Added</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                {location.address || `${location.latitude}, ${location.longitude}`}
              </p>
              <p className="text-xs text-green-500 mt-1">
                Accuracy: {Math.round(location.accuracy)}m
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (Optional - Max 3)
        </label>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={images.length >= 3 || isSubmitting}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !location}
        className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors text-lg"
      >
        <Send size={20} />
        <span>
          {isSubmitting ? 'Submitting Complaint...' : 'Submit Complaint'}
        </span>
      </button>
    </form>
  );
};

export default ComplaintForm;