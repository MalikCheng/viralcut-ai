import { SrtSubtitle } from '../types';

function parseTime(timeString: string): number {
  if (!timeString) return 0;
  const parts = timeString.split(':');
  if (parts.length < 3) return 0;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsParts = parts[2].split(',');
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = parseInt(secondsParts[1] || '0', 10);

  return (hours * 3600) + (minutes * 60) + seconds + (milliseconds / 1000);
}

export const parseSrt = (srtContent: string): SrtSubtitle[] => {
  const subtitles: SrtSubtitle[] = [];
  // Normalize line endings
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split('\n\n');

  blocks.forEach((block) => {
    const lines = block.trim().split('\n');
    if (lines.length >= 3) {
      const id = lines[0];
      const timeLine = lines[1];
      const [start, end] = timeLine.split(' --> ');
      
      // The rest of the lines are the text
      const text = lines.slice(2).join(' ');

      if (start && end) {
        subtitles.push({
          id,
          startTime: start.trim(),
          endTime: end.trim(),
          startSeconds: parseTime(start.trim()),
          endSeconds: parseTime(end.trim()),
          text: text.trim(),
        });
      }
    }
  });

  return subtitles;
};