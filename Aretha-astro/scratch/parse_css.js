import fs from 'fs';
const content = fs.readFileSync('C:\\Users\\team\\.gemini\\antigravity\\brain\\f3a13009-17c7-4afe-880b-1cb8a6f2cc35\\.system_generated\\steps\\2187\\content.md', 'utf8');

// Find all occurrences of rules containing swiper or carousel
const rules = content.split('}');
const matches = rules.filter(r => r.includes('swiper') || r.includes('carousel') || r.includes('2590979'));
console.log(matches.slice(0, 20).join('\n}\n'));
