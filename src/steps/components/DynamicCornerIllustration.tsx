import React from 'react';

export const DynamicCornerIllustration = ({ seasonNature, color }: { seasonNature: string | null; color: string }) => {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm transition-all duration-700" style={{ filter: 'blur(0.8px)' }}>
      {seasonNature === 'spring' && <path d="M100,20 C120,60 160,80 180,100 C160,120 120,140 100,180 C80,140 40,120 20,100 C40,80 80,60 100,20 Z" fill={color} />}
      {seasonNature === 'summer' && <circle cx="100" cy="100" r="70" fill={color} />}
      {seasonNature === 'autumn' && <path d="M100,10 L130,70 L190,80 L145,120 L160,180 L100,150 L40,180 L55,120 L10,80 L70,70 Z" fill={color} />}
      {seasonNature === 'winter' && <path d="M100,15 L115,85 L185,100 L115,115 L100,185 L85,115 L15,100 L85,85 Z" fill={color} />}
      {seasonNature === 'mountain' && <path d="M20,180 L80,60 L120,120 L160,40 L190,180 Z" fill={color} />}
      {seasonNature === 'sea' && <path d="M10,140 Q55,90 100,140 T190,140 L190,190 L10,190 Z" fill={color} />}
      {seasonNature === 'river' && <path d="M20,40 Q100,100 60,180 C120,160 160,80 180,40 Z" fill={color} />}
      {(!seasonNature || seasonNature === 'forest') && <path d="M100,20 C150,70 170,120 100,180 C30,120 50,70 100,20 Z" fill={color} />}
    </svg>
  );
};