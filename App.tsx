import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { PassageList } from './components/PassageList.tsx';
import { ReadingView } from './components/ReadingView.tsx';
import { EvaluationView } from './components/EvaluationView.tsx';
import { Spinner } from './components/Spinner.tsx';
import { evaluateReading } from './services/geminiService.ts';
import { saveEvaluationToSheet } from './services/sheetService.ts';
import type { Page, StudentInfo, Passage, EvaluationResult, SheetSaveStatus } from './types.ts';


export default function App() {
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
      
      // Chỉ lưu vào Sheet nếu bài đọc được đánh giá là đầy đủ
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