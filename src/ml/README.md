# Machine Learning Predictability Architecture

This directory defines the interface and drop-in integration layer for password predictability modeling in LockLogic.

## Current State: Phase 1 (Baseline Heuristic)
In this phase, `heuristicModel.ts` implements the `PredictabilityModel` interface using lexical heuristics (leak corpus trigrams, keyboard walks, leetspeak mappings, repeated characters, date detectors).

No genuine neural network or trained weights are bundled in this phase.

## Future Phase: Dropping in a Genuine Trained Model

To integrate a genuine ML model in the next phase:

### 1. Model Interface Contract
Any new model must implement `PredictabilityModel` defined in `predictabilityModel.ts`:

```typescript
export interface PredictabilityResult {
  predictability: number; // 0 - 100 (lower means less predictable / more random)
  patterns: string[];      // detected patterns or structural anomalies
}

export interface PredictabilityModel {
  name: string;
  version: string;
  score(password: string): PredictabilityResult;
}
```

### 2. Supported Runtime Formats
- **ONNX Web Runtime (`onnxruntime-web`)**: Recommended for compact transformer or bidirectional GRU models.
- **TensorFlow.js (`@tensorflow/tfjs`)**: Compatible with quantized char-level RNN/LSTM models.
- **Pure JavaScript / JSON Weights**: Lightweight n-gram Markov transition matrices or quantized decision trees.

### 3. Model Specifications
- **Input**: Raw password string (UTF-8 character sequence) tokenized into character IDs (vocabulary: ASCII printable + common Unicode, sequence length up to 64).
- **Output**:
  - `predictability`: Perplexity or cross-entropy normalized to `[0, 100]`.
  - `patterns`: High-probability token transitions or flagged substrings.
- **Privacy & Execution**: The model must run **100% client-side in the browser** (WebAssembly / WebGL). Passwords must never be transmitted to an external inference endpoint.

### 4. Swapping the Active Model
In `src/utils/analyzer.ts`, replace the imported model:

```typescript
// Replace:
import { defaultPredictabilityModel } from '../ml/heuristicModel';
// With:
import { trainedPredictabilityModel } from '../ml/neuralModel';
```
