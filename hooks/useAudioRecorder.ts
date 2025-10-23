
import { useState, useRef, useCallback } from 'react';

type AudioRecorderHook = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ audioBase64: string, mimeType: string }>;
  error: string | null;
};

export function useAudioRecorder(): AudioRecorderHook {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorder.onstart = () => {
          setIsRecording(true);
          audioChunksRef.current = [];
        };

        mediaRecorder.start();

      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Không thể truy cập micro. Vui lòng cấp quyền sử dụng micro trong trình duyệt.");
      }
    } else {
      setError("Trình duyệt không hỗ trợ ghi âm.");
    }
  }, []);

  const stopRecording = useCallback((): Promise<{ audioBase64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({ audioBase64: base64String, mimeType });
          };
          reader.onerror = (error) => {
              reject(error);
          };
          setIsRecording(false);
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.stop();
      } else {
        reject(new Error("Không có quá trình ghi âm nào đang diễn ra."));
      }
    });
  }, [isRecording]);

  return { isRecording, startRecording, stopRecording, error };
}