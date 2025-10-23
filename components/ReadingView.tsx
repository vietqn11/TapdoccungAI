import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder.ts';
import { useAudioPlayer } from '../hooks/useAudioPlayer.ts';
import { generateSpeech } from '../services/geminiService.ts';
import type { Passage } from '../types.ts';

interface ReadingViewProps {
  passage: Passage;
  onBack: () => void;
  onFinishRecording: (audio: { audioBase64: string, mimeType: string }) => void;
}

export function ReadingView({ passage, onBack, onFinishRecording }: ReadingViewProps) {
  const { isRecording, startRecording, stopRecording, error: recorderError, getAnalyserData } = useAudioRecorder();
  const { isPlaying: isSamplePlaying, playAudio: playSampleAudio, stopAudio: stopSampleAudio } = useAudioPlayer();
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const animateRecordingFeedback = useCallback(() => {
    if (!isRecording) return;

    const dataArray = getAnalyserData();
    
    if (dataArray) {
      // Animate button pulse
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const scale = 1 + (average / 255) * 0.1; // Scale from 1 to 1.1
      if (submitButtonRef.current) {
        submitButtonRef.current.style.transform = `scale(${scale})`;
      }

      // Animate waveform
      const canvas = canvasRef.current;
      if (canvas) {
          const canvasCtx = canvas.getContext('2d');
          if (canvasCtx) {
              const bufferLength = dataArray.length;
              const WIDTH = canvas.width;
              const HEIGHT = canvas.height;

              canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

              const barWidth = (WIDTH / bufferLength) * 1.5;
              let barHeight;
              let x = 0;

              for (let i = 0; i < bufferLength; i++) {
                  barHeight = dataArray[i] * (HEIGHT / 255);
                  canvasCtx.fillStyle = '#3B82F6'; // tailwind blue-500
                  canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
                  x += barWidth + 2; 
              }
          }
      }
    }
    animationFrameId.current = requestAnimationFrame(animateRecordingFeedback);
  }, [isRecording, getAnalyserData]);

  useEffect(() => {
    if (isRecording) {
      animationFrameId.current = requestAnimationFrame(animateRecordingFeedback);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (submitButtonRef.current) {
        submitButtonRef.current.style.transform = 'scale(1)';
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        context?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRecording, animateRecordingFeedback]);


  const handleListenSample = async () => {
    if (isGeneratingSpeech || isRecording) return;
    stopSampleAudio();
    setIsGeneratingSpeech(true);
    setTtsError(null);
    try {
        const audioBase64 = await generateSpeech(passage.content);
        await playSampleAudio(audioBase64);
    } catch (err) {
        setTtsError(err instanceof Error ? err.message : "Lỗi không xác định khi tạo giọng đọc mẫu.");
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
      console.error("Error finishing recording:", err);
    }
  };
  
  const isBusy = isGeneratingSpeech || isSamplePlaying;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-blue-800">{passage.title}</h1>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900 font-semibold transition-colors">
            <i className="fas fa-arrow-left mr-2"></i> Quay lại
          </button>
        </div>
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl text-xl leading-relaxed text-gray-800 mb-8 h-72 overflow-y-auto whitespace-pre-line border border-white">
          {passage.content}
        </div>
        
        {(recorderError || ttsError) && <p className="text-red-600 font-bold text-center mb-4">{recorderError || ttsError}</p>}
        
        <div className="flex flex-col items-center">
          {!isRecording ? (
             <div className="flex items-center justify-center space-x-6">
              <button
                onClick={handleListenSample}
                disabled={isBusy}
                className="flex items-center justify-center w-44 h-16 bg-blue-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-600 transition-all transform duration-300 hover:-translate-y-1 hover:shadow-xl disabled:bg-gray-400 disabled:shadow-md disabled:transform-none disabled:cursor-not-allowed"
              >
                {isGeneratingSpeech ? <i className="fas fa-spinner fa-spin"></i> : (isSamplePlaying ? <i className="fas fa-wave-square"></i> : <><i className="fas fa-volume-up mr-2"></i> Nghe mẫu</>)}
              </button>
              <button
                onClick={handleStart}
                disabled={isBusy}
                className="flex items-center justify-center w-52 h-16 bg-green-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-600 transition-all transform duration-300 hover:-translate-y-1 hover:shadow-xl disabled:bg-gray-400 disabled:shadow-md disabled:transform-none disabled:cursor-not-allowed"
              >
                <i className="fas fa-microphone mr-3"></i>
                Bắt đầu đọc
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
                <button
                ref={submitButtonRef}
                onClick={handleStop}
                className="flex items-center justify-center w-48 h-16 bg-red-500 text-white font-bold text-xl rounded-full shadow-lg hover:bg-red-600 transition-transform duration-100 ease-out"
                >
                <i className="fas fa-stop mr-3"></i>
                Nộp bài
                </button>
                <div className="w-full max-w-xs h-20 mt-4">
                    <canvas ref={canvasRef} width="300" height="80" className="w-full h-full"></canvas>
                </div>
            </div>
          )}
           <p className="text-gray-600 mt-6 h-6 text-center font-semibold text-lg">
            {isGeneratingSpeech && "AI đang chuẩn bị giọng đọc mẫu..."}
            {isSamplePlaying && "Đang phát bài đọc mẫu..."}
            {!isGeneratingSpeech && !isSamplePlaying && (isRecording ? "AI đang lắng nghe... Em đọc to và rõ ràng nhé!" : "Nhấn 'Nghe mẫu' hoặc 'Bắt đầu đọc'.")}
           </p>
        </div>
      </div>
    </div>
  );
}