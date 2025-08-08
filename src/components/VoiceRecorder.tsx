import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { VoiceRecorder as VoiceRecorderClass } from '../utils/voiceUtils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void;
  isDisabled?: boolean;
  language: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  isDisabled = false,
  language
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const voiceRecorderRef = useRef<VoiceRecorderClass | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    voiceRecorderRef.current = new VoiceRecorderClass();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      if (voiceRecorderRef.current) {
        await voiceRecorderRef.current.startRecording();
        setIsRecording(true);
        setRecordingTime(0);
        startTimer();
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      if (voiceRecorderRef.current && isRecording) {
        const blob = await voiceRecorderRef.current.stopRecording();
        const url = URL.createObjectURL(blob);
        
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        stopTimer();
        
        onRecordingComplete(blob, url);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert('Failed to stop recording.');
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Voice Recording
        </h3>
        <p className="text-sm text-gray-600">
          Record your complaint clearly
        </p>
      </div>

      {/* Recording Animation */}
      <div className="flex justify-center mb-6">
        <div className={`relative ${isRecording ? 'animate-pulse' : ''}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 shadow-lg shadow-red-200' 
              : audioUrl 
                ? 'bg-green-500 shadow-lg shadow-green-200'
                : 'bg-blue-500 shadow-lg shadow-blue-200'
          }`}>
            {isRecording ? (
              <div className="w-8 h-8 bg-white rounded"></div>
            ) : (
              <Mic size={32} className="text-white" />
            )}
          </div>
          
          {isRecording && (
            <>
              <div className="absolute -inset-4 rounded-full border-4 border-red-300 animate-ping"></div>
              <div className="absolute -inset-8 rounded-full border-2 border-red-200 animate-ping animation-delay-75"></div>
            </>
          )}
        </div>
      </div>

      {/* Recording Timer */}
      {(isRecording || recordingTime > 0) && (
        <div className="text-center mb-4">
          <div className="text-2xl font-mono font-bold text-gray-800">
            {formatTime(recordingTime)}
          </div>
          {isRecording && (
            <div className="text-sm text-red-600 mt-1">Recording...</div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            disabled={isDisabled}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <Mic size={20} />
            <span>Start Recording</span>
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <Square size={20} />
            <span>Stop Recording</span>
          </button>
        )}

        {audioUrl && !isRecording && (
          <>
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              className="flex items-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={resetRecording}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw size={20} />
              <span>Re-record</span>
            </button>
          </>
        )}
      </div>

      {/* Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
};

export default VoiceRecorder;