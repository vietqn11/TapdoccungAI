import React from 'react';
import { READING_PASSAGES } from '../constants.ts';
import type { Passage, StudentInfo } from '../types.ts';

interface PassageListProps {
  studentInfo: StudentInfo;
  onSelectPassage: (passage: Passage) => void;
  onBackToWelcome: () => void;
}

export function PassageList({ studentInfo, onSelectPassage, onBackToWelcome }: PassageListProps) {
  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 p-4 bg-white rounded-xl shadow flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-800">Chào {studentInfo.name}!</h1>
              <p className="text-gray-600">Hãy chọn một bài để bắt đầu luyện đọc nhé.</p>
            </div>
            <button onClick={onBackToWelcome} className="text-sm text-gray-600 hover:text-blue-700 hover:underline">
                <i className="fas fa-user-edit mr-1"></i>
                Đổi học sinh
            </button>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {READING_PASSAGES.map((passage) => (
            <button
              key={passage.id}
              onClick={() => onSelectPassage(passage)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-100 transition-all text-left transform hover:-translate-y-1"
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