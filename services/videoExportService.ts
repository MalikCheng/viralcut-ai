import { StoryboardSegment, AspectRatio } from "../types";

// Helper to load image
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  // Simple wrapping logic
  let lineCount = 0;
  for(let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.strokeText(line, x, currentY);
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  ctx.strokeText(line, x, currentY);
  ctx.fillText(line, x, currentY);
};

// Draw frame with Ken Burns effect AND Subtitles
const drawFrame = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  segment: StoryboardSegment,
  progress: number, // 0 to 1
  canvasWidth: number,
  canvasHeight: number,
  burnSubtitles: boolean
) => {
  // 1. Clear background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Draw Image (Ken Burns)
  let scale = 1;
  let tx = 0;
  
  // Base scaling to cover the canvas (Object-fit: cover logic)
  const imgRatio = img.width / img.height;
  const canvasRatio = canvasWidth / canvasHeight;
  let baseWidth = canvasWidth;
  let baseHeight = canvasHeight;
  
  if (imgRatio > canvasRatio) {
    baseHeight = canvasHeight;
    baseWidth = canvasHeight * imgRatio;
  } else {
    baseWidth = canvasWidth;
    baseHeight = canvasWidth / imgRatio;
  }
  
  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);

  const movement = segment.camera_movement;
  switch (movement) {
    case 'Zoom In':
      scale = 1 + (0.25 * progress);
      ctx.scale(scale, scale);
      break;
    case 'Zoom Out':
      scale = 1.25 - (0.25 * progress);
      ctx.scale(scale, scale);
      break;
    case 'Pan Right':
      scale = 1.2;
      ctx.scale(scale, scale);
      tx = -50 + (100 * progress); 
      ctx.translate(tx, 0);
      break;
    case 'Pan Left':
      scale = 1.2;
      ctx.scale(scale, scale);
      tx = 50 - (100 * progress);
      ctx.translate(tx, 0);
      break;
    default:
      scale = 1.05;
      ctx.scale(scale, scale);
      break;
  }

  // Draw image centered
  ctx.drawImage(img, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
  ctx.restore();

  // 3. Draw Subtitles (Conditional)
  if (burnSubtitles && segment.text) {
      ctx.save();
      
      const fontSize = Math.floor(canvasWidth * 0.045); // ~4.5% of screen width
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = Math.max(2, fontSize / 6);
      ctx.lineJoin = 'round';
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const textX = canvasWidth / 2;
      const textY = canvasHeight - (canvasHeight * 0.15); // 15% from bottom
      const maxWidth = canvasWidth * 0.85;
      const lineHeight = fontSize * 1.4;

      wrapText(ctx, segment.text, textX, textY, maxWidth, lineHeight);
      
      ctx.restore();
  }
};

export const exportVideo = async (
  segments: StoryboardSegment[],
  aspectRatio: AspectRatio,
  onProgress: (percent: number) => void,
  burnSubtitles: boolean
): Promise<Blob> => {
  
  // Determine dimensions based on ratio
  // 9:16 = 720x1280
  // 16:9 = 1280x720
  const width = aspectRatio === '16:9' ? 1280 : 720;
  const height = aspectRatio === '16:9' ? 720 : 1280;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  // 1. Preload all images
  const images = await Promise.all(
    segments.map(async (seg) => {
        if (!seg.videoUri) throw new Error(`Missing image for segment: ${seg.text}`);
        return loadImage(seg.videoUri);
    })
  );

  // 2. Setup Recorder
  const stream = canvas.captureStream(30); // Request 30 FPS
  
  let mimeType = 'video/webm';
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    mimeType = 'video/webm;codecs=vp9';
  } else if (MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  }

  const recorder = new MediaRecorder(stream, { 
    mimeType,
    videoBitsPerSecond: 8000000 // 8 Mbps
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
        chunks.push(e.data);
    }
  };

  recorder.start();

  // 3. Real-time Render Loop
  const totalDuration = segments.reduce((acc, seg) => acc + seg.duration, 0);
  // Add 0.5s buffer at the end to prevent cutoff
  const durationWithBuffer = totalDuration + 0.5; 
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    
    const tick = () => {
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        
        // Check if finished (including buffer)
        if (elapsed >= durationWithBuffer) {
            recorder.stop();
            return;
        }
        
        // Find which segment we are currently in
        // Default to the LAST segment if we are in the buffer period or overshot
        let currentSeg = segments[segments.length - 1];
        let currentImg = images[images.length - 1];
        let segmentProgress = 1; // Default to finished state for last frame

        let tempTime = elapsed;
        
        // Linear search for the correct segment
        for (let i = 0; i < segments.length; i++) {
            if (tempTime <= segments[i].duration) {
                currentSeg = segments[i];
                currentImg = images[i];
                // Calculate progress 0..1
                segmentProgress = Math.max(0, Math.min(1, tempTime / currentSeg.duration));
                break;
            }
            tempTime -= segments[i].duration;
        }
        
        // Draw
        drawFrame(ctx, currentImg, currentSeg, segmentProgress, width, height, burnSubtitles);
        
        // Update UI Progress
        const progressPercent = Math.min(99, (elapsed / totalDuration) * 100);
        onProgress(progressPercent);
        
        requestAnimationFrame(tick);
    };
    
    recorder.onstop = () => {
        // Allow a small delay to ensure chunks are gathered
        setTimeout(() => {
            const blob = new Blob(chunks, { type: mimeType });
            if (blob.size === 0) {
                reject(new Error("Recording failed: Output file is empty. Did you switch tabs?"));
            } else {
                resolve(blob);
            }
        }, 100);
    };

    recorder.onerror = (e) => {
        reject(e);
    };
    
    // Start loop
    tick();
  });
};
