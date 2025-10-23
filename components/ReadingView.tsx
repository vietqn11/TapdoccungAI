import React, { useState } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { generateSpeech } from '../services/geminiService';
import type { Passage } from '../types';

interface ReadingViewProps {
  passage: Passage;
  onBack: () => void;
  onFinishRecording: (audio: { audioBase64: string, mimeType: string }) => void;
}

export function ReadingView({ passage, onBack, onFinishRecording }: ReadingViewProps) {
  const { isRecording, startRecording, stopRecording, error: recorderError } = useAudioRecorder();
  const { isPlaying: isSamplePlaying, playAudio: playSampleAudio, stopAudio: stopSampleAudio } = useAudioPlayer();
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const handleListenSample = async () => {
    if (isGeneratingSpeech || isRecording) return;
    
    stopSampleAudio();

    setIsGeneratingSpeech(true);
    setTtsError(null);

    try {
        const audioBase64 = await generateSpeech(passage.content);
        await playSampleAudio(audioBase64);
    } catch (err) {
        setTtsError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo giọng đọc mẫu.');
    } finally {
        setIsGeneratingSpeech(false);
    }
  };

  const handleStart = async () => {
    stopSampleAudio();
    await startRecording();
  };

  const handleStop = async () => {
    try {
      const audio = await stopRecording();
      onFinishRecording(audio);
    } catch (err) {
      console.error('Error finishing recording:', err);
    }
  };
  
  const isBusy = isGeneratingSpeech || isSamplePlaying;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">{passage.title}</h1>
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800">
            <i className="fas fa-arrow-left mr-2"></i> Quay lại
          </button>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg text-lg leading-relaxed text-gray-800 mb-8 h-64 overflow-y-auto whitespace-pre-line">
          {passage.content}
        </div>
        
        {(recorderError || ttsError) && <p className="text-red-500 text-center mb-4">{recorderError || ttsError}</p>}
        
        <div className="flex flex-col items-center">
          {!isRecording ? (
             <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleListenSample}
                disabled={isBusy}
                className="flex items-center justify-center w-40 h-16 bg-blue-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-600 transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGeneratingSpeech ? <i className="fas fa-spinner fa-spin"></i> : (isSamplePlaying ? <i className="fas fa-wave-square animate-pulse"></i> : <><i className="fas fa-volume-up mr-2"></i> Nghe mẫu</>)}
              </button>
              <button
                onClick={handleStart}
                disabled={isBusy}
                className="flex items-center justify-center w-48 h-16 bg-green-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-600 transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <i className="fas fa-microphone mr-3"></i>
                Bắt đầu đọc
              </button>
            </div>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center justify-center w-48 h-16 bg-red-500 text-white font-bold text-xl rounded-full shadow-lg hover:bg-red-600 transition transform hover:scale-105 animate-pulse"
            >
              <i className="fas fa-stop mr-3"></i>
              Nộp bài
            </button>
          )}
           <p className="text-gray-500 mt-4 h-5 text-center">
            {isGeneratingSpeech && 'AI đang chuẩn bị giọng đọc mẫu...'}
            {isSamplePlaying && 'Đang phát bài đọc mẫu...'}
            {!isGeneratingSpeech && !isSamplePlaying && (isRecording ? 'AI đang lắng nghe... Hãy đọc to và rõ ràng nhé!' : "Nhấn 'Nghe mẫu' hoặc 'Bắt đầu đọc'.")}
           </p>
        </div>
      </div>
    </div>
  );
}
