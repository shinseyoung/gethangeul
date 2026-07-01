import React from 'react';
import { useFlowStore } from '../store/useFlowStore';

export default function Step1Gender() {
  // 🟢 [개선] App.tsx가 주는 데이터를 기다리지 않고, 스토어에서 직접 구독(Subscribe)합니다.
  const { gender: selectedGender, setGender } = useFlowStore();

  const genderOptions = [
    { id: 'male', label: '남성', icon: '👨' },
    { id: 'female', label: '여성', icon: '👩' },
    { id: 'neutral', label: '성별 무관', icon: '🧑' },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full md:flex-1">
      {genderOptions.map((option) => {
        const isSelected = selectedGender === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => setGender(option.id)}
            className={`flex flex-col items-center justify-center p-8 h-full rounded-[24px] border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm ${
              isSelected 
                ? 'border-[#1e4a38] bg-green-50/50 scale-[1.02] shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-white'
            }`}
          >
            <span className="text-4xl mb-4">{option.icon}</span>
            <span className={`text-xl font-bold ${isSelected ? 'text-[#1e4a38]' : 'text-gray-700'}`}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}