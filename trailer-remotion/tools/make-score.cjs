// Original procedural score; no downloaded music or copyrighted melody.
const fs = require('node:fs');
const path = require('node:path');
const rate = 24000, seconds = 90;
const samples = new Float32Array(rate * seconds);
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
function note(start, length, midi, gain, type = 'bell') {
  const offset = Math.floor(start * rate), count = Math.floor(length * rate);
  for (let i = 0; i < count && offset + i < samples.length; i++) {
    const t = i / rate, p = 2 * Math.PI * hz(midi) * t;
    const envelope = Math.min(1, t / .012) * (1 - i / count) ** 2;
    const wave = type === 'bass' ? Math.sin(p) : Math.sin(p) * .72 + Math.sin(p * 2) * .2 + Math.sin(p * 3) * .08;
    samples[offset + i] += wave * envelope * gain;
  }
}
const beat = 60 / 112;
const roots = [48, 53, 45, 55];
const motif = [12, 19, 16, 24, 21, 19, 14, 16];
for (let b = 0; b * beat < 87; b++) {
  const t = b * beat, root = roots[Math.floor(b / 8) % roots.length];
  const chase = t > 14 && t < 76;
  note(t, beat * .9, root, chase ? .24 : .16, 'bass');
  if (b % 2 === 0) [0, 4, 7].forEach(n => note(t, beat * 1.7, root + 12 + n, .045));
  note(t, beat * .8, root + motif[b % 8], chase ? .12 : .095);
  if (chase) note(t + beat / 2, beat * .35, root + motif[(b + 3) % 8], .065);
  if (chase) {
    const start = Math.floor(t * rate);
    for (let i = 0; i < rate * .12; i++) {
      const q = i / rate;
      samples[start + i] += .15 * Math.sin(2 * Math.PI * (70 * q + 8 * (1 - Math.exp(-q * 40)))) * Math.exp(-q * 35);
    }
  }
}
[48, 60, 64, 67, 72].forEach(n => note(87, 3, n, .10));
const pcm = Buffer.alloc(samples.length * 2);
for (let i = 0; i < samples.length; i++) {
  const t = i / rate;
  const fade = Math.min(1, t / 2, (seconds - t) / 2);
  pcm.writeInt16LE(Math.round(Math.tanh(samples[i]) * fade * 28000), i * 2);
}
const header = Buffer.alloc(44);
header.write('RIFF'); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 2, 28); header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
fs.writeFileSync(path.resolve(__dirname, '../public/adventure.wav'), Buffer.concat([header, pcm]));
console.log('Original 90-second adventure score generated.');
