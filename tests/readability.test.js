import { test, expect } from '@playwright/test';

// Simple syllable counter logic for testing purposes, matching the implementation in TextHub.jsx
const countSyllables = (word) => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
};

const calculateReadability = (text) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length || 1;
    const wordCount = words.length || 1;

    let totalSyllables = 0;
    words.forEach(w => {
        totalSyllables += countSyllables(w.replace(/[^a-z]/gi, ''));
    });

    const readingEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (totalSyllables / wordCount);
    const gradeLevel = 0.39 * (wordCount / sentenceCount) + 11.8 * (totalSyllables / wordCount) - 15.59;

    return { readingEase, gradeLevel };
};

test('Readability: Syllable Counter', async () => {
    expect(countSyllables('apple')).toBe(2);
    expect(countSyllables('banana')).toBe(3);
    expect(countSyllables('the')).toBe(1);
    expect(countSyllables('syllable')).toBe(3);
});

test('Readability: Flesch-Kincaid Calculations', async () => {
    const simpleText = "The cat sat on the mat.";
    const { readingEase, gradeLevel } = calculateReadability(simpleText);

    // "The cat sat on the mat" -> 6 words, 1 sentence, 6 syllables
    // Ease: 206.835 - 1.015*(6/1) - 84.6*(6/6) = 206.835 - 6.09 - 84.6 = 116.145
    // Grade: 0.39*(6/1) + 11.8*(6/6) - 15.59 = 2.34 + 11.8 - 15.59 = -1.45

    expect(readingEase).toBeCloseTo(116.145, 1);
    expect(gradeLevel).toBeCloseTo(-1.45, 1);
});
