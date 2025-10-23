import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type, Modality } from "@google/genai";

// =================================================================================
// BUNDLED FILE: types.ts
// =================================================================================
interface Passage {
  id: number;
  title: string;
  content: string;
}

interface EvaluationResult {
  docDayDu: boolean;
  tongDiem: number;
  doLuuLoat: number;
  phatAm: number;
  doChinhXac: number;
  nhanXetChung: string;
  tuPhatAmSai: {
    tu: string;
    phatAmSai: string;
    suaLai: string;
  }[];
  diemTichCuc: string[];
}

interface StudentInfo {
  name: string;
  class: string;
}

type Page = 'welcome' | 'passage-list' | 'reading' | 'evaluation';

type SheetSaveStatus = 'idle' | 'saving' | 'success' | 'error';


// =================================================================================
// BUNDLED FILE: constants.ts
// =================================================================================
const READING_PASSAGES: Passage[] = [
    // --- TẬP MỘT ---
    {
        id: 1,
        title: "Bài 1: Tôi là học sinh lớp 2",
        content: `Ngày khai trường đã đến. Sáng sớm, mẹ mới gọi một câu mà tôi đã vùng dậy, khác hẳn mọi ngày. Loáng một cái, tôi đã chuẩn bị xong mọi thứ. Bố ngạc nhiên nhìn tôi, còn mẹ cười tủm tỉm. Tôi rối rít: “Con muốn đến sớm nhất lớp.”.
Tôi háo hức tưởng tượng ra cảnh mình đến đầu tiên, cất tiếng chào thật to những bạn đến sau. Nhưng vừa đến cổng trường, tôi đã thấy mấy bạn cùng lớp đang ríu rít nói cười ở trong sân. Thì ra, không chỉ mình tôi muốn đến sớm nhất. Tôi chào mẹ, chạy ào vào cùng các bạn.`
    },
    {
        id: 2,
        title: "Bài 2: Ngày hôm qua đâu rồi?",
        content: `Em cầm tờ lịch cũ:
– Ngày hôm qua đâu rồi?
Ra ngoài sân hỏi bố
Xoa đầu em, bố cười.

– Ngày hôm qua ở lại
Trên cành hoa trong vườn
Nụ hồng lớn lên mãi
Đợi đến ngày toả hương.

– Ngày hôm qua ở lại
Trong hạt lúa mẹ trồng
Cánh đồng chờ gặt hái
Chín vàng màu ước mong.

– Ngày hôm qua ở lại
Trong vở hồng của con
Con học hành chăm chỉ
Là ngày qua vẫn còn.`
    },
    {
        id: 3,
        title: "Bài 3: Niềm vui của Bi và Bống",
        content: `Khi cơn mưa vừa dứt, hai anh em Bi và Bống chợt thấy cầu vồng.
– Cầu vồng kia! Em nhìn xem. Đẹp quá!
Bi chỉ lên bầu trời và nói tiếp:
– Anh nghe nói dưới chân cầu vồng có bảy hũ vàng đấy.
Bống hưởng ứng:
– Lát nữa, mình sẽ đi lấy về nhé! Có vàng rồi, em sẽ mua nhiều búp bê và quần áo đẹp.
– Còn anh sẽ mua một con ngựa hồng và một cái ô tô.
Bỗng nhiên, cầu vồng biến mất. Bi cười:
– Em ơi! Anh đùa đấy! Ở đó không có vàng đâu.
Bống vui vẻ:
– Thế ạ? Nếu vậy, em sẽ lấy bút màu để vẽ tặng anh ngựa hồng và ô tô.
– Còn anh sẽ vẽ tặng em nhiều búp bê và quần áo đủ các màu sắc.
Không có bảy hũ vàng dưới chân cầu vồng, hai anh em vẫn cười vui vẻ.`
    },
    {
        id: 4,
        title: "Bài 4: Làm việc thật là vui",
        content: `Quanh ta, mọi vật, mọi người đều làm việc.
Cái đồng hồ tích tắc, tích tắc, báo phút, báo giờ. Con gà trống gáy vang ò ó o, báo cho mọi người biết trời sắp sáng, mau mau thức dậy. Con tu hú kêu tu hú, tu hú. Thế là sắp đến mùa vải chín. Chim bắt sâu, bảo vệ mùa màng. Cành đào nở hoa cho sắc xuân thêm rực rỡ, ngày xuân thêm tưng bừng. Chim cú mèo chập tối đúng trong hốc cây rúc cú cú cũng làm việc có ích cho đồng ruộng.
Như mọi vật, mọi người, bé cũng làm việc. Bé làm bài. Bé đi học. Học xong, bé quét nhà, nhặt rau, chơi với em đỡ mẹ. Bé luôn luôn bận rộn, mà lúc nào cũng vui.`
    },
    {
        id: 5,
        title: "Bài 5: Em có xinh không?",
        content: `Voi em thích mặc đẹp và thích được khen xinh. Ở nhà, voi em luôn hỏi anh: “Em có xinh không?”. Voi anh bao giờ cũng khen: “Em xinh lắm!”.
Một hôm, gặp hươu, voi em hỏi:
– Em có xinh không?
Hươu ngắm voi rồi lắc đầu:
– Chưa xinh lắm vì em không có đôi sừng giống anh.
Nghe vậy, voi nhặt vài cành cây khô, gài lên đầu rồi đi tiếp.
Gặp dê, voi hỏi:
– Em có xinh không?
– Không, vì cậu không có bộ râu giống tôi.
Voi liền nhổ một khóm cỏ dại bên đường, gắn vào cằm rồi về nhà.
Về nhà với đôi sừng và bộ râu giả, voi em hớn hở hỏi anh:
– Em có xinh hơn không?
Voi anh nói:
– Trời ơi, sao em lại thêm sừng và râu thế này? Xấu lắm!
Voi em ngắm mình trong gương và thấy xấu thật. Sau khi bỏ sừng và râu đi, voi em thấy mình xinh đẹp hẳn lên. Giờ đây, voi em hiểu rằng mình chỉ xinh đẹp khi đúng là voi.`
    },
];


// =================================================================================
// BUNDLED FILE: hooks/useAudioPlayer.ts
// =================================================================================
// --- Audio Helper Functions ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  const numChannels = 1;
  
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
// --- End Audio Helper Functions ---

type AudioPlayerHook = {
  isPlaying: boolean;
  playAudio: (base64Audio: string) => Promise<void>;
  stopAudio: () => void;
};

function useAudioPlayer(): AudioPlayerHook {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore error if already stopped
      }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);
  
  const playAudio = useCallback(async (base64Audio: string) => {
    stopAudio(); 

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    const audioContext = audioContextRef.current;
    
    try {
      setIsPlaying(true);
      const decodedBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(decodedBytes, audioContext);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      };
      source.start(0);
      audioSourceRef.current = source;
    } catch (error) {
        console.error("Failed to play audio:", error);
        setIsPlaying(false);
        throw new Error("Không thể phát âm thanh.");
    }
  }, [stopAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  return { isPlaying, playAudio, stopAudio };
}


// =================================================================================
// BUNDLED FILE: hooks/useAudioRecorder.ts
// =================================================================================
type AudioRecorderHook = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ audioBase64: string, mimeType: string }>;
  error: string | null;
  getAnalyserData: () => Uint8Array | null;
};

function useAudioRecorder(): AudioRecorderHook {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // For visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // --- Setup for recording ---
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorder.onstart = () => {
          setIsRecording(true);
          audioChunksRef.current = [];
        };

        // --- Setup for visualization ---
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        sourceNodeRef.current = source;
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        source.connect(analyser);

        // Start recording
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
          
          // Stop mic stream
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

          // Cleanup visualization resources
          sourceNodeRef.current?.disconnect();
          analyserRef.current = null;
          sourceNodeRef.current = null;
          if (audioContextRef.current?.state !== 'closed') {
            audioContextRef.current?.close();
          }
          audioContextRef.current = null;
          dataArrayRef.current = null;
        };
        mediaRecorderRef.current.stop();
      } else {
        reject(new Error("Không có quá trình ghi âm nào đang diễn ra."));
      }
    });
  }, [isRecording]);

  const getAnalyserData = useCallback(() => {
      if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          return dataArrayRef.current;
      }
      return null;
  }, []);

  return { isRecording, startRecording, stopRecording, error, getAnalyserData };
}

// =================================================================================
// BUNDLED FILE: services/geminiService.ts
// =================================================================================
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
    type: Type.OBJECT,
    properties: {
        docDayDu: { type: Type.BOOLEAN, description: "Học sinh có đọc hết hoặc gần hết bài không? (true nếu đọc trên 80% bài, false nếu ngược lại)" },
        tongDiem: { type: Type.NUMBER, description: "Tổng điểm đánh giá trên thang 100" },
        doLuuLoat: { type: Type.NUMBER, description: "Điểm lưu loát trên thang 100" },
        phatAm: { type: Type.NUMBER, description: "Điểm phát âm trên thang 100" },
        doChinhXac: { type: Type.NUMBER, description: "Điểm chính xác (đọc đúng chữ) trên thang 100" },
        nhanXetChung: { type: Type.STRING, description: "Nhận xét chung ngắn gọn về bài đọc của học sinh" },
        tuPhatAmSai: {
            type: Type.ARRAY,
            description: "Danh sách các từ học sinh phát âm sai. Ghi lại từ học sinh đọc sai dựa trên âm thanh nghe được.",
            items: {
                type: Type.OBJECT,
                properties: {
                    tu: { type: Type.STRING, description: "Từ gốc trong văn bản" },
                    phatAmSai: { type: Type.STRING, description: "Từ mà học sinh đã phát âm sai (dựa trên audio)" },
                    suaLai: { type: Type.STRING, description: "Cách phát âm đúng" },
                },
                required: ["tu", "phatAmSai", "suaLai"],
            },
        },
        diemTichCuc: {
            type: Type.ARRAY,
            description: "Danh sách những điểm tích cực, lời khen dành cho học sinh",
            items: { type: Type.STRING },
        },
    },
    required: ["docDayDu", "tongDiem", "doLuuLoat", "phatAm", "doChinhXac", "nhanXetChung", "tuPhatAmSai", "diemTichCuc"],
};


async function evaluateReading(passageText: string, audioBase64: string, mimeType: string): Promise<EvaluationResult> {
    try {
        const prompt = `Bạn là một giám khảo chấm thi đọc Tiếng Việt cho học sinh lớp 2, yêu cầu sự chính xác và nghiêm khắc.
        Nhiệm vụ của bạn là đánh giá khả năng đọc của một học sinh dựa trên đoạn văn gốc và file ghi âm.
        
        QUY TẮC BẮT BUỘC:
        1.  **Kiểm tra độ đầy đủ:** Đầu tiên, xác định học sinh có đọc hết bài không. Nếu học sinh chỉ đọc dưới 80% bài, hãy đặt "docDayDu" thành false, cho tất cả các điểm thành 0, và đặt "nhanXetChung" là "Em chưa đọc hết bài. Vui lòng đọc lại toàn bộ bài để được chấm điểm nhé.". Trong trường hợp này, không cần nhận xét gì thêm và trả về các mảng rỗng.
        2.  **Chấm điểm nghiêm ngặt (nếu đọc đủ bài):** Nếu "docDayDu" là true, hãy chấm điểm theo thang điểm 100 với các tiêu chí sau:
            - **Độ chính xác (tối đa 40 điểm):** Đây là phần quan trọng nhất. Mỗi lỗi đọc sai từ, thiếu từ, hoặc thừa từ so với văn bản gốc, trừ 2 điểm.
            - **Phát âm (tối đa 30 điểm):** Đánh giá sự tròn vành, rõ chữ. Trừ điểm nặng cho các lỗi phát âm phổ biến (l/n, s/x, tr/ch, r/d/gi, dấu hỏi/ngã). Mỗi lỗi trừ 1-2 điểm tùy mức độ.
            - **Độ lưu loát (tối đa 30 điểm):** Đánh giá tốc độ đọc phù hợp (khoảng 50-70 từ/phút), và việc ngắt nghỉ đúng ở dấu câu. Mỗi lần đọc vấp, ngập ngừng, lặp lại từ, trừ 1 điểm.
        3.  **Nhận xét:** Đưa ra nhận xét cụ thể. Với mỗi từ sai, hãy xác định chính xác học sinh đã đọc sai thành gì và điền vào trường "phatAmSai". Ví dụ, nếu từ gốc là "nói" và học sinh đọc là "lói", thì "tu" là "nói", "phatAmSai" là "lói", và "suaLai" là "nói".
        
        Đoạn văn gốc: "${passageText}"
        
        Hãy phân tích file ghi âm và trả về kết quả dưới dạng JSON theo schema đã cung cấp.`;

        const audioPart = {
            inlineData: {
                data: audioBase64,
                mimeType: mimeType,
            },
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, audioPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as EvaluationResult;
        return result;

    } catch (error) {
        console.error("Error evaluating reading:", error);
        throw new Error("Không thể phân tích bài đọc. Vui lòng thử lại.");
    }
}

async function generateSpeech(text: string): Promise<string> {
    try {
        const instructedText = `Đọc: ${text}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: instructedText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        const base64Audio = audioPart?.inlineData?.data;

        if (!base64Audio) {
            console.error("TTS API did not return audio data. Response:", JSON.stringify(response, null, 2));
            throw new Error("Không nhận được dữ liệu âm thanh từ API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Không thể tạo giọng đọc mẫu. Vui lòng thử lại.");
    }
}


// =================================================================================
// BUNDLED FILE: services/sheetService.ts
// =================================================================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxaIW0K7t_0Nm5qA5_gycFydDoLWvlaItwk3obV7hjr7Hqx37luVBX7Y-SlsGbYgoRYRw/exec';

async function saveEvaluationToSheet(
  studentInfo: StudentInfo,
  passage: Passage,
  result: EvaluationResult
): Promise<void> {
    if (!APPS_SCRIPT_URL) {
        console.warn('URL Google Apps Script chưa được cấu hình. Bỏ qua việc lưu vào Sheet.');
        throw new Error('URL_NOT_CONFIGURED');
    }

    const formData = new FormData();
    formData.append('name', studentInfo.name);
    formData.append('class', studentInfo.class);
    formData.append('passageTitle', passage.title);
    formData.append('totalScore', result.tongDiem.toString());
    formData.append('fluency', result.doLuuLoat.toString());
    formData.append('pronunciation', result.phatAm.toString());
    formData.append('accuracy', result.doChinhXac.toString());
    formData.append('generalFeedback', result.nhanXetChung);
    formData.append('positivePoints', result.diemTichCuc.join('; '));
    formData.append('wordsToImprove', result.tuPhatAmSai.map(w => `${w.tu} -> ${w.suaLai}`).join('; '));

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData,
        });

        const responseData = await response.json();

        if (responseData.result !== 'success') {
            throw new Error(responseData.message || 'Lỗi không xác định từ Apps Script');
        }
    } catch (error) {
        console.error("Lỗi khi lưu vào Google Sheet:", error);
        throw new Error("Không thể lưu kết quả vào Google Sheet.");
    }
}

// =================================================================================
// BUNDLED FILE: components/Spinner.tsx
// =================================================================================
interface SpinnerProps {
    message: string;
}

function Spinner({ message }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100/50">
        <div className="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-blue-600"></div>
        <p className="text-blue-800 text-xl font-semibold mt-6">{message}</p>
    </div>
  );
}

// =================================================================================
// BUNDLED FILE: components/WelcomeScreen.tsx
// =================================================================================
interface WelcomeScreenProps {
  onStart: (studentInfo: StudentInfo) => void;
}

function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && studentClass.trim()) {
      onStart({ name, class: studentClass });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-300 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
        <div className="text-7xl text-blue-600 mb-6">
            <i className="fas fa-book-open"></i>
        </div>
        <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Luyện đọc Lớp 2</h1>
        <p className="text-gray-600 mb-8 text-lg">Cùng AI cải thiện kỹ năng đọc nhé!</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Họ và tên của em"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300"
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Lớp"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 text-xl rounded-xl hover:bg-blue-700 transition-all transform duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:shadow-md disabled:transform-none"
            disabled={!name.trim() || !studentClass.trim()}
          >
            Bắt đầu
          </button>
        </form>
      </div>
    </div>
  );
}

// =================================================================================
// BUNDLED FILE: components/PassageList.tsx
// =================================================================================
interface PassageListProps {
  studentInfo: StudentInfo;
  onSelectPassage: (passage: Passage) => void;
  onBackToWelcome: () => void;
}

function PassageList({ studentInfo, onSelectPassage, onBackToWelcome }: PassageListProps) {
  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 p-6 bg-white rounded-2xl shadow-lg flex justify-between items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-blue-800">Chào {studentInfo.name}!</h1>
              <p className="text-gray-600 mt-1 text-lg">Hãy chọn một bài để bắt đầu luyện đọc nhé.</p>
            </div>
            <button onClick={onBackToWelcome} className="text-sm font-semibold text-gray-600 hover:text-blue-700 hover:underline">
                <i className="fas fa-user-edit mr-1"></i>
                Đổi học sinh
            </button>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {READING_PASSAGES.map((passage) => (
            <button
              key={passage.id}
              onClick={() => onSelectPassage(passage)}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:border-blue-500 border-2 border-transparent transition-all text-left transform hover:-translate-y-2"
            >
              <h2 className="text-xl font-bold text-blue-700">{passage.title}</h2>
              <p className="text-gray-500 mt-2 line-clamp-3">{passage.content}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =================================================================================
// BUNDLED FILE: components/ReadingView.tsx
// =================================================================================
interface ReadingViewProps {
  passage: Passage;
  onBack: () => void;
  onFinishRecording: (audio: { audioBase64: string, mimeType: string }) => void;
}

function ReadingView({ passage, onBack, onFinishRecording }: ReadingViewProps) {
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

// =================================================================================
// BUNDLED FILE: components/EvaluationView.tsx
// =================================================================================
interface ScoreBarProps {
  label: string;
  score: number;
  color: string;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1 font-bold">
      <span className="text-gray-700">{label}</span>
      <span className={`${color}`}>{score}/100</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
      <div
        className={`bg-gradient-to-r ${color === 'text-blue-500' ? 'from-blue-400 to-blue-600' : color === 'text-green-500' ? 'from-green-400 to-green-600' : color === 'text-purple-500' ? 'from-purple-400 to-purple-600' : 'from-yellow-400 to-yellow-600'} h-4 rounded-full transition-all duration-500`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
  </div>
);

const SheetSaveStatusIndicator: React.FC<{ status: SheetSaveStatus }> = ({ status }) => {
    if (status === 'idle') return null;
    const baseClasses = "font-semibold flex items-center";
    if (status === 'saving') {
        return (
            <div className={`${baseClasses} text-gray-600`}>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                <span>Đang lưu kết quả...</span>
            </div>
        );
    }
    if (status === 'success') {
        return (
            <div className={`${baseClasses} text-green-600`}>
                <i className="fas fa-check-circle mr-2"></i>
                <span>Đã lưu thành công!</span>
            </div>
        );
    }
    if (status === 'error') {
        return (
            <div className={`${baseClasses} text-red-600`}>
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <span>Lưu thất bại.</span>
            </div>
        );
    }
    return null;
};


interface EvaluationViewProps {
  result: EvaluationResult;
  studentInfo: StudentInfo;
  passage: Passage;
  onChooseAnotherPassage: () => void;
  onReadAgain: () => void;
  sheetSaveStatus: SheetSaveStatus;
}

function EvaluationView({ result, studentInfo, passage, onChooseAnotherPassage, onReadAgain, sheetSaveStatus }: EvaluationViewProps) {
    const { playAudio, isPlaying } = useAudioPlayer();
    const [loadingWord, setLoadingWord] = useState<string | null>(null);

    const handlePlayWord = async (word: string) => {
        if (loadingWord || isPlaying) return; 
        
        setLoadingWord(word);
        try {
            const audioBase64 = await generateSpeech(word);
            await playAudio(audioBase64);
        } catch (error) {
            console.error("Failed to generate speech for word:", error);
        } finally {
            setLoadingWord(null);
        }
    };

    if (!result.docDayDu) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 p-4 text-center">
                <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                    <i className="fas fa-book-reader text-6xl text-yellow-500 mb-4"></i>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Em ơi, cố gắng lên nhé!</h1>
                    <p className="text-gray-700 text-lg mb-8">{result.nhanXetChung}</p>
                    <button
                        onClick={onReadAgain}
                        className="bg-blue-600 text-white font-bold py-3 px-8 text-lg rounded-xl hover:bg-blue-700 transition-all transform duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                        Đọc lại bài này
                    </button>
                </div>
            </div>
        );
    }


  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
        <header className="text-center border-b-2 border-gray-100 pb-6 mb-8">
          <h1 className="text-4xl font-extrabold text-blue-800">Kết quả luyện đọc</h1>
          <p className="text-lg text-gray-600 mt-2">
            Bài: <span className="font-semibold">{passage.title}</span> | Học sinh: <span className="font-semibold">{studentInfo.name}</span> - Lớp: <span className="font-semibold">{studentInfo.class}</span>
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Cột điểm số */}
          <div className="md:col-span-2 space-y-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Điểm số của em</h2>
            <div className="flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full w-48 h-48 mx-auto border-8 border-white shadow-xl">
              <span className="text-6xl font-extrabold text-blue-700">{result.tongDiem}</span>
            </div>
            <div className="space-y-4 w-full pt-4">
              <ScoreBar label="Độ lưu loát" score={result.doLuuLoat} color="text-blue-500" />
              <ScoreBar label="Phát âm" score={result.phatAm} color="text-green-500" />
              <ScoreBar label="Độ chính xác" score={result.doChinhXac} color="text-purple-500" />
            </div>
          </div>

          {/* Cột nhận xét */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                <i className="fas fa-comment-dots mr-3 text-2xl text-blue-500"></i>
                Nhận xét của AI
              </h3>
              <p className="bg-blue-50 p-4 rounded-xl text-gray-700 italic text-lg">"{result.nhanXetChung}"</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                <i className="fas fa-star mr-3 text-2xl text-yellow-400"></i>
                Những điểm em làm tốt
              </h3>
              <ul className="list-disc list-inside space-y-2 text-green-700 pl-2 font-semibold">
                {result.diemTichCuc.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Phần từ cần luyện tập */}
        <div className="mt-10 border-t-2 border-gray-100 pt-8">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
               Những từ cần luyện tập thêm
            </h3>
            {result.tuPhatAmSai.length > 0 ? (
                <div className="max-w-md mx-auto">
                    <ul className="space-y-3">
                        {result.tuPhatAmSai.map((word, index) => (
                            <li key={index} className="bg-yellow-50/70 p-3 rounded-xl flex items-center justify-between shadow-md">
                                <div className="text-left">
                                    <span className="text-gray-500 text-sm font-semibold">Em đọc</span>
                                    <p className="font-bold text-lg text-red-600 line-through">{word.phatAmSai}</p>
                                </div>
                                <i className="fas fa-long-arrow-alt-right text-gray-400 text-2xl mx-4"></i>
                                <div className="text-right flex items-center gap-3">
                                     <div className="flex-grow">
                                        <span className="text-gray-500 text-sm font-semibold">Đọc đúng là</span>
                                        <p className="font-bold text-lg text-green-600">{word.tu}</p>
                                     </div>
                                      <button
                                        onClick={() => handlePlayWord(word.tu)}
                                        disabled={!!loadingWord || isPlaying}
                                        className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                                        aria-label={`Nghe từ ${word.tu}`}
                                      >
                                        {loadingWord === word.tu ? (
                                          <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                          <i className="fas fa-volume-up"></i>
                                        )}
                                      </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center bg-green-50/80 p-5 rounded-xl max-w-md mx-auto shadow-md">
                    <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                    <p className="text-green-800 font-semibold text-lg">Tuyệt vời! Em đã đọc rất tốt, không có từ nào phát âm sai!</p>
                </div>
            )}
        </div>


        <footer className="mt-10 pt-8 border-t-2 border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <SheetSaveStatusIndicator status={sheetSaveStatus} />
           <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto ml-auto">
              <button
                onClick={onReadAgain}
                className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-6 text-lg rounded-xl hover:bg-green-700 transition-all transform duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                Đọc lại bài này
              </button>
              <button
                onClick={onChooseAnotherPassage}
                className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 text-lg rounded-xl hover:bg-blue-700 transition-all transform duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                Chọn bài đọc khác
              </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

// =================================================================================
// BUNDLED FILE: App.tsx
// =================================================================================
function App() {
  const [page, setPage] = useState<Page>('welcome');
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetSaveStatus, setSheetSaveStatus] = useState<SheetSaveStatus>('idle');
  
  const handleStart = (info: StudentInfo) => {
    setStudentInfo(info);
    setPage('passage-list');
  };

  const handleSelectPassage = (passage: Passage) => {
    setSelectedPassage(passage);
    setPage('reading');
  };

  const handleFinishRecording = async (audio: { audioBase64: string, mimeType: string }) => {
    if (!selectedPassage || !studentInfo) return;
    setIsLoading(true);
    setError(null);
    setSheetSaveStatus('idle');

    try {
      const result = await evaluateReading(selectedPassage.content, audio.audioBase64, audio.mimeType);
      setEvaluationResult(result);
      setPage('evaluation');
      
      if (result.docDayDu) {
        setSheetSaveStatus('saving');
        try {
          await saveEvaluationToSheet(studentInfo, selectedPassage, result);
          setSheetSaveStatus('success');
        } catch (sheetError) {
          console.error("Sheet saving failed:", sheetError);
          setSheetSaveStatus('error');
        }
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
      setPage('reading'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseAnotherPassage = () => {
    setSelectedPassage(null);
    setEvaluationResult(null);
    setError(null);
    setSheetSaveStatus('idle');
    setPage('passage-list');
  };

  const handleReadSamePassageAgain = () => {
    setEvaluationResult(null);
    setError(null);
    setSheetSaveStatus('idle');
    setPage('reading');
  };

  const handleBackToWelcome = () => {
    setStudentInfo(null);
    setSelectedPassage(null);
    setEvaluationResult(null);
    setError(null);
    setSheetSaveStatus('idle');
    setPage('welcome');
  };
  
  const handleBackToPassageList = () => {
    setSelectedPassage(null);
    setError(null);
    setPage('passage-list');
  }
  
  const renderPage = () => {
    if (isLoading) {
      return <Spinner message="AI đang chấm bài, em chờ một lát nhé..." />;
    }

    switch (page) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} />;
      case 'passage-list':
        if (studentInfo) {
          return <PassageList studentInfo={studentInfo} onSelectPassage={handleSelectPassage} onBackToWelcome={handleBackToWelcome} />;
        }
        return <WelcomeScreen onStart={handleStart} />;
      case 'reading':
        if (selectedPassage) {
          return <ReadingView passage={selectedPassage} onBack={handleBackToPassageList} onFinishRecording={handleFinishRecording} />;
        }
        return <WelcomeScreen onStart={handleStart} />; // Fallback
      case 'evaluation':
        if (evaluationResult && studentInfo && selectedPassage) {
          return <EvaluationView result={evaluationResult} studentInfo={studentInfo} passage={selectedPassage} onChooseAnotherPassage={handleChooseAnotherPassage} onReadAgain={handleReadSamePassageAgain} sheetSaveStatus={sheetSaveStatus} />;
        }
        return <WelcomeScreen onStart={handleStart} />; // Fallback
      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return <div className="font-sans">{renderPage()}</div>;
}

// =================================================================================
// BUNDLED FILE: index.tsx (Original Entry Point)
// =================================================================================
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);