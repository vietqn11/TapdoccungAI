
import React from 'react';

interface SpinnerProps {
    message: string;
}

export function Spinner({ message }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100/50">
        <div className="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-blue-600"></div>
        <p className="text-blue-800 text-xl font-semibold mt-6">{message}</p>
    </div>
  );
}
