import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

export const useImageShare = (fileName: string = '나의_한글_이름') => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const generateImage = async () => {
    if (!captureRef.current) return null;
    try {
      return await toPng(captureRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#F9FAFB', 
      });
    } catch (error) {
      console.error("이미지 생성 실패:", error);
      alert("이미지 생성 중 오류가 발생했습니다.");
      return null;
    }
  };

  const handleDownload = async () => {
    setIsSaving(true);
    const dataUrl = await generateImage();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    }
    setIsSaving(false);
  };

  const handleShare = async () => {
    setIsSharing(true);
    const dataUrl = await generateImage();
    
    if (dataUrl) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${fileName}.png`, { type: blob.type });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '나의 한글 이름 짓기',
            text: '나에게 딱 맞는 한글 이름을 확인해보세요!',
            files: [file],
          });
        } else {
          alert("현재 브라우저에서는 공유 기능을 지원하지 않아 기기에 저장합니다.");
          const link = document.createElement('a');
          link.download = `${fileName}.png`;
          link.href = dataUrl;
          link.click();
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') console.error("공유 실패:", error);
      }
    }
    setIsSharing(false);
  };

  return { captureRef, isSaving, isSharing, handleDownload, handleShare };
};