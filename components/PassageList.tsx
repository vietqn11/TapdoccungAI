import React from 'react';
import { READING_PASSAGES } from '../constants';
import type { Passage, StudentInfo } from '../types';

interface PassageListProps {
  studentInfo: StudentInfo;
  onSelectPassage: (passage: Passage) => void;
  onBackToWelcome: () => void;
}

export function PassageList({ studentInfo, onSelectPassage, onBackToWelcome }: PassageListProps) {
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