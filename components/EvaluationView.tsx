import React, { useState } from 'react';
import type { EvaluationResult, StudentInfo, Passage, SheetSaveStatus } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { generateSpeech } from '../services/geminiService';

interface ScoreBarProps {
  label: string;
  score: number;
  color: string;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="font-semibold text-gray-700">{label}</span>
      <span className={`font-bold ${color}`}>{score}/100</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className={`bg-gradient-to-r ${color === 'text-blue-500' ? 'from-blue-400 to-blue-600' : color === 'text-green-500' ? 'from-green-400 to-green-600' : color === 'text-purple-500' ? 'from-purple-400 to-purple-600' : 'from-yellow-400 to-yellow-600'} h-4 rounded-full`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
  </div>
);

const SheetSaveStatusIndicator: React.FC<{ status: SheetSaveStatus }> = ({ status }) => {
    if (status === 'idle') return null;

    if (status === 'saving') {
        return (
            <div className="flex items-center text-gray-600">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                <span>Đang lưu kết quả vào Google Sheet...</span>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex items-center text-green-600">
                <i className="fas fa-check-circle mr-2"></i>
                <span>Đã lưu kết quả thành công!</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex items-center text-red-600">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <span>Lưu kết quả thất bại. Vui lòng thử lại sau.</span>
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

export function EvaluationView({ result, studentInfo, passage, onChooseAnotherPassage, onReadAgain, sheetSaveStatus }: EvaluationViewProps) {
    const { playAudio, isPlaying } = useAudioPlayer();
    const [loadingWord, setLoadingWord] = useState<string | null>(null);

    const handlePlayWord = async (word: string) => {
        if (loadingWord || isPlaying) return; 
        
        setLoadingWord(word);
        try {
            const audioBase64 = await generateSpeech(word);
            await playAudio(audioBase64);
        } catch (error) {
            console.error('Failed to generate speech for word:', error);
        } finally {
            setLoadingWord(null);
        }
    };

    if (!result.docDayDu) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 p-4 text-center">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
                    <i className="fas fa-book-reader text-5xl text-yellow-500 mb-4"></i>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Em ơi, cố gắng lên nhé!</h1>
                    <p className="text-gray-600 text-lg mb-8">{result.nhanXetChung}</p>
                    <button
                        onClick={onReadAgain}
                        className="bg-blue-600 text-white font-bold py-3 px-8 text-lg rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                    >
                        Đọc lại bài này
                    </button>
                </div>
            </div>
        );
    }


  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <header className="text-center border-b pb-6 mb-6">
          <h1 className="text-4xl font-extrabold text-blue-800">Kết quả luyện đọc</h1>
          <p className="text-lg text-gray-600 mt-2">
            Bài: <span className="font-semibold">{passage.title}</span> | Học sinh: <span className="font-semibold">{studentInfo.name}</span> - Lớp: <span className="font-semibold">{studentInfo.class}</span>
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cột điểm số */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Điểm số của em</h2>
              <div className="flex items-center justify-center bg-blue-100 rounded-full w-40 h-40 mx-auto border-8 border-blue-200">
                <span className="text-5xl font-bold text-blue-700">{result.tongDiem}</span>
              </div>
            </div>
            <div className="space-y-4">
              <ScoreBar label="Độ lưu loát" score={result.doLuuLoat} color="text-blue-500" />
              <ScoreBar label="Phát âm" score={result.phatAm} color="text-green-500" />
              <ScoreBar label="Độ chính xác" score={result.doChinhXac} color="text-purple-500" />
            </div>
          </div>

          {/* Cột nhận xét */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                <i className="fas fa-comment-dots mr-2 text-blue-500"></i>
                Nhận xét của AI
              </h3>
              <p className="bg-blue-50 p-4 rounded-lg text-gray-700 italic">"{result.nhanXetChung}"</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                <i className="fas fa-star mr-2 text-yellow-500"></i>
                Những điểm em làm tốt
              </h3>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                {result.diemTichCuc.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Phần từ cần luyện tập */}
        <div className="mt-8 border-t pt-6">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
               Những từ cần luyện tập thêm
            </h3>
            {result.tuPhatAmSai.length > 0 ? (
                <div className="max-w-md mx-auto">
                    <ul className="space-y-3">
                        {result.tuPhatAmSai.map((word, index) => (
                            <li key={index} className="bg-yellow-50 p-3 rounded-lg flex items-center justify-between shadow-sm">
                                <div className="text-left">
                                    <span className="text-gray-500 text-sm">Em đọc</span>
                                    <p className="font-bold text-lg text-red-600 line-through">{word.phatAmSai}</p>
                                </div>
                                <i className="fas fa-long-arrow-alt-right text-gray-400 text-2xl mx-2"></i>
                                <div className="text-right flex items-center gap-2">
                                     <div className="flex-grow">
                                        <span className="text-gray-500 text-sm">Đọc đúng là</span>
                                        <p className="font-bold text-lg text-green-600">{word.tu}</p>
                                     </div>
                                      <button
                                        onClick={() => handlePlayWord(word.tu)}
                                        disabled={!!loadingWord || isPlaying}
                                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
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
                <div className="text-center bg-green-50 p-4 rounded-lg">
                    <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
                    <p className="text-green-700 font-semibold">Tuyệt vời! Em đã đọc rất tốt, không có từ nào phát âm sai!</p>
                </div>
            )}
        </div>


        <footer className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <SheetSaveStatusIndicator status={sheetSaveStatus} />
           <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto ml-auto">
              <button
                onClick={onReadAgain}
                className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-6 text-lg rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-md"
              >
                Đọc lại bài này
              </button>
              <button
                onClick={onChooseAnotherPassage}
                className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 text-lg rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md"
              >
                Chọn bài đọc khác
              </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
