// Predefined romantic message for Bini
const LOVE_POEM = `Hey sunshine,

I know the "No" button kept running away from you... but honestly? There was never really a choice. My heart has been yours all along.

I love you, Bini. Through thick and thin, through every high and low, I'm here. You're not just my favorite person - you're my everything. The one who makes every day brighter just by existing.

This Valentine's Day and every single day after, I want you to know how much you mean to me. You're my best decision, my greatest adventure, my home.

Forever yours,
Always and forever. ❤️`;

// Simulate a realistic typing effect with delays
const typeWriter = async (
  text: string,
  callback: (chunk: string) => void,
  speed = 20
): Promise<void> => {
  const lines = text.split('\n');
  let currentText = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Type each character in the line
    for (let j = 0; j < line.length; j++) {
      currentText += line[j];
      callback(currentText);
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    
    // Add newline after each line (except the last one)
    if (i < lines.length - 1) {
      currentText += '\n';
      callback(currentText);
      await new Promise(resolve => setTimeout(resolve, speed * 2));
    }
  }
};

export const generateLovePoem = async (
  name: string,
  onProgress?: (text: string) => void
): Promise<string> => {
  // Simulate "thinking/generating" delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (onProgress) {
    // Stream the poem with typing effect
    await typeWriter(LOVE_POEM, onProgress, 20);
    return LOVE_POEM;
  }
  
  return LOVE_POEM;
};
