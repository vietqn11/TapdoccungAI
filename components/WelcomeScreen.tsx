import React, { useState } from 'react';
import type { StudentInfo } from '../types';

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