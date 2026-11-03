import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  required?: boolean;
  onSignatureChange: (dataUrl: string) => void;
  initialValue?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  label,
  required = false,
  onSignatureChange,
  initialValue = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (initialValue && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
          setHasSignature(true);
        }
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a2b';

    const coords = getCoordinates(e.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e.nativeEvent);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange('');
  };

  const autoSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a2b';
    ctx.beginPath();
    ctx.moveTo(40, 90);
    ctx.bezierCurveTo(90, 30, 130, 110, 180, 50);
    ctx.bezierCurveTo(210, 20, 240, 90, 290, 70);
    ctx.bezierCurveTo(340, 50, 390, 100, 480, 60);
    ctx.stroke();
    setHasSignature(true);
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-emerald-800" />
          {label} {required && <span className="text-amber-600">*</span>}
        </label>
        {hasSignature && (
          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Check className="w-3 h-3" /> Signed
          </span>
        )}
      </div>

      <div className="relative border-2 border-dashed border-stone-300 rounded-xl overflow-hidden bg-white shadow-inner focus-within:border-emerald-600 transition-colors">
        <canvas
          ref={canvasRef}
          width={600}
          height={140}
          className="w-full h-28 touch-none cursor-crosshair bg-stone-50/50"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label={label}
        />
        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-stone-400 font-medium">
            Sign here with mouse, finger or stylus
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-stone-500">
        <button
          type="button"
          onClick={autoSign}
          className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
        >
          <PenTool className="w-3 h-3" /> Adopt Signature
        </button>
        <button
          type="button"
          onClick={clear}
          className="text-stone-600 hover:text-red-600 font-medium flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-stone-100"
        >
          <RotateCcw className="w-3 h-3" /> Clear signature
        </button>
      </div>
    </div>
  );
};
