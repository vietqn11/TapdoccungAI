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
    <div className="flex justify-between items-center mb-1 font-bold">
      <span className="text-gray-700">{label}</span>
      <span className={`${color}`}>{score}/100</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
      <div
        // FIX: The original ternary operator for className had a syntax error which likely caused the "Cannot find name 'div'" parsing error.
        // Added the missing condition for 'text-purple-500'.
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
              {/* FIX: Corrected typo from 'doChinhExac' to 'doChinhXac' to match the 'EvaluationResult' type. */}
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