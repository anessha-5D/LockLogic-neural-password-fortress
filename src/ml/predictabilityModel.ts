/**
 * Standard typed interface for password predictability evaluation models.
 * Allows seamless hot-swapping between heuristic baseline rules and future
 * genuine trained ML models (e.g. ONNX, TensorFlow.js, character-level Markov/Transformers).
 */
export interface PredictabilityResult {
  /** 0 - 100 score where lower means less predictable / higher human unpredictability */
  predictability: number;
  /** List of detected patterns, motifs, or suspicious character transitions */
  patterns: string[];
}

export interface PredictabilityModel {
  /** Model identifier */
  name: string;
  /** Model version */
  version: string;
  /** Evaluates password predictability and identifies structural human motifs */
  score(password: string): PredictabilityResult;
}
