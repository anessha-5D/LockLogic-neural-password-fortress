import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { MarkovModel } from '../src/ml/markovModel';

describe('Markov model parity with Python', () => {
  const model = new MarkovModel(JSON.parse(readFileSync('public/models/predictability-v1.json', 'utf8')));
  const cases = JSON.parse(readFileSync('tests/fixtures/parity-cases.json', 'utf8'));
  for (const c of cases) {
    it(`matches Python for ${JSON.stringify(c.password)}`, () => {
      expect(model.avgLogP(c.password)).toBeCloseTo(c.avgLogP, 6);
      expect(model.predictability(c.password)).toBe(c.predictability);
    });
  }
});