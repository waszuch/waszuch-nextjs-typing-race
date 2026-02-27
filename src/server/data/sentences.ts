export const sentences = [
  "The quick brown fox jumps over the lazy dog near the riverbank",
  "Pack my box with five dozen liquor jugs and ship them today",
  "How vexingly quick daft zebras jump over the sleeping fox",
  "The five boxing wizards jump quickly through the dark forest",
  "Bright vixens jump dozy fowl quack and the lazy dog sleeps",
  "A journey of a thousand miles begins with a single step forward",
  "She sells seashells by the seashore every morning before dawn",
  "The early bird catches the worm but the second mouse gets cheese",
  "All that glitters is not gold but it still shines very brightly",
  "To be or not to be that is the question we must all answer",
  "Every great dream begins with a dreamer who never gives up hope",
  "In the middle of difficulty lies opportunity for those who seek",
  "The only way to do great work is to love what you do each day",
  "Success is not final and failure is not fatal keep moving forward",
  "Life is what happens when you are busy making other plans today",
];

export function getRandomSentence(): string {
  return sentences[Math.floor(Math.random() * sentences.length)]!;
}
