export interface MarkovModelData {
  version: string;
  order: number;
  start: string;
  end: string;
  weights: number[];
  unigramFloor: number;
  scoreLo: number;
  scoreHi: number;
  grams: Record<string, Record<string, number>>;
}

export class MarkovModel {
  constructor(private m: MarkovModelData) {}

  get version(): string {
    return this.m.version;
  }

  avgLogP(password: string): number {
    const { order: N, start, end, weights, grams, unigramFloor } = this.m;
    const s = Array.from(start.repeat(N - 1) + password + end);
    let total = 0;
    for (let i = N - 1; i < s.length; i++) {
      let pr = 0;
      for (let k = 1; k <= N; k++) {
        const g = s.slice(i - k + 1, i + 1).join('');
        let q = grams[String(k)][g];
        if (q === undefined && k === 1) q = unigramFloor;
        if (q) pr += weights[k - 1] * q;
      }
      total += Math.log(pr);
    }
    return total / (Array.from(password).length + 1);
  }

  predictability(password: string): number {
    const { scoreLo, scoreHi } = this.m;
    const x = (this.avgLogP(password) - scoreLo) / (scoreHi - scoreLo);
    return Math.round(100 * Math.min(1, Math.max(0, x)));
  }
}

let cached: Promise<MarkovModel | null> | null = null;

export function loadMarkovModel(url = '/models/predictability-v1.json'): Promise<MarkovModel | null> {
  if (!cached) {
    cached = fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: MarkovModelData) => new MarkovModel(data))
      .catch(() => null);
  }
  return cached;
}