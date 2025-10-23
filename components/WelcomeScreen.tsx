import React, { useState } from 'react';
import type { StudentInfo } from '../types.ts';

interface WelcomeScreenProps {
  onStart: (studentInfo: StudentInfo) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && studentClass.trim()) {
      onStart({ name, class: studentClass });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Luyện đọc Lớp 2</h1>
        <p className="text-gray-600 mb-8">Cùng AI cải thiện kỹ năng đọc nhé!</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Họ và tên của em"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Lớp"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 text-xl rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md disabled:bg-gray-400"
            disabled={!name.trim() || !studentClass.trim()}
          >
            Bắt đầu
          </button>
        </form>
      </div>
    </div>
  );
}