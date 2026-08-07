import React, { useEffect, useRef } from 'react';

interface ChromaVideoProps {
  src: string;
  className?: string;
}

export const ChromaVideo: React.FC<ChromaVideoProps> = ({
  src,
  className = '',
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

        // Crop outer 5% of video frame to eliminate corner watermarks/logos
        const cropMarginX = video.videoWidth * 0.05;
        const cropMarginY = video.videoHeight * 0.05;
        const cropW = video.videoWidth * 0.9;
        const cropH = video.videoHeight * 0.9;

        ctx.drawImage(
          video,
          cropMarginX,
          cropMarginY,
          cropW,
          cropH,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        const len = data.length;
        const width = canvas.width;
        const height = canvas.height;

        for (let i = 0; i < len; i += 4) {
          const pixelIndex = i / 4;
          const x = pixelIndex % width;
          const y = Math.floor(pixelIndex / width);

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Green screen chroma keying:
          // Detect pixels where Green is dominant over Red and Blue
          const maxRB = Math.max(r, b);
          const greenDominance = g - maxRB;

          if (g > 45 && greenDominance > 15) {
            if (greenDominance > 35) {
              data[i + 3] = 0; // Fully transparent
            } else {
              // Soft edge alpha transition to eliminate green fringing
              const alpha = 1 - (greenDominance - 15) / 20;
              data[i + 3] = Math.floor(alpha * 255);
              // Spill suppression (reduce green tint on edge pixels)
              data[i + 1] = maxRB;
            }
          }

          // Corner Watermark / Gemini Logo Removal:
          // Check bottom-right and bottom-left 15% corners for remaining white/gray logo pixels
          const isBottomCorner = y > height * 0.85 && (x < width * 0.2 || x > width * 0.8);
          const isTopCorner = y < height * 0.15 && (x < width * 0.15 || x > width * 0.85);

          if ((isBottomCorner || isTopCorner) && data[i + 3] > 0) {
            // Remove white/light-gray/semi-transparent watermark pixels in corners
            const isWhiteOrGrayLogo = r > 160 && g > 160 && b > 160;
            const isLowContrastLogo = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && (r > 130 || g > 130 || b > 130);
            if (isWhiteOrGrayLogo || isLowContrastLogo) {
              data[i + 3] = 0; // Mask out the logo completely
            }
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
  }, [src]);

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
