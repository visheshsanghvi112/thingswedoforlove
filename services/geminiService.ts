// Predefined romantic poem for Bini
const LOVE_POEM = `Oh Bini, the "No" button tried to flee,
But destiny knows you belong with me.
It danced across the screen in playful flight,
Because our love was always meant to be right.

You clicked "Yes" (though you had no choice, it's true),
But deep down, we both know what we always knew.
Through every laugh, every moment we share,
You're my favorite person, beyond compare.

This Valentine's, and every day that follows,
I promise you joy, and love that never hollows.
So here's to us, to our beautiful start,
Forever and always, you have my heart. ❤️`;

// Simulate a realistic typing effect with delays
const typeWriter = async (
  text: string,
  callback: (chunk: string) => void,
  speed = 30
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
    await typeWriter(LOVE_POEM, onProgress, 30);
    return LOVE_POEM;
  }
  
  return LOVE_POEM;
};
