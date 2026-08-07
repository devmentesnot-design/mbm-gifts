import React, { useEffect, useRef } from 'react';

interface TransparentVideoProps {
  src: string;
  className?: string;
  threshold?: number;
  smoothing?: number;
}

export const TransparentVideo: React.FC<TransparentVideoProps> = ({
  src,
  className = '',
  threshold = 18,
  smoothing = 22,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Use max color intensity to detect black/near-black background
          const maxVal = Math.max(r, g, b);

          if (maxVal < threshold) {
            data[i + 3] = 0;
          } else if (maxVal < threshold + smoothing) {
            const alpha = (maxVal - threshold) / smoothing;
            data[i + 3] = Math.floor(alpha * 255);
          }
        }

        ctx.putImageData(frame, 0, 0);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleCanPlay = () => {
      video.play().catch(() => {});
    };

    video.addEventListener('canplay', handleCanPlay);
    video.play().catch(() => {});
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [src, threshold, smoothing]);

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="hidden"
      />
      <canvas ref={canvasRef} className="w-full h-auto object-contain" />
    </div>
  );
};
