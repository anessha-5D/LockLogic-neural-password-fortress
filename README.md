# 🔐 LockLogic: Neural Password Fortress

**Think like the attacker. Build like the vault.**

LockLogic is a privacy-focused password-strength analyzer and security education web application. It combines password analysis, a trained character-level Markov model, interactive attack simulations, breach checking, and security guidance to help users understand why a password may be strong or weak.

The application is designed with privacy in mind: password analysis and model scoring happen directly in the browser, and the optional AI Vault Coach receives numeric security metadata rather than the actual password.

---

## ✨ Features

- **Password Strength Analysis:** Evaluates password length, character variety, estimated keyspace, predictability, and common patterns.
- **Trained Predictability Model:** Uses a character-level 4-gram Markov model trained on a sample of leaked-password data to estimate how closely a password resembles human-created passwords.
- **Heuristic Fallback:** Uses a rule-based pattern detector if the trained model cannot be loaded.
- **Crack-Time Estimation:** Estimates how long different attacker profiles might need to guess a password using explicitly stated assumptions.
- **Interactive Attack Lab:** Visualizes brute-force, dictionary, and pattern-based attacks for educational purposes. It does not perform real attacks.
- **Breach Check:** Uses a k-anonymity lookup with Have I Been Pwned (HIBP). Only the first five characters of the password's SHA-1 hash are sent for the lookup.
- **AI Vault Coach:** Provides optional security recommendations through a backend service that receives numeric metadata, not the password.
- **Secure Password Generator:** Generates passwords using the browser's cryptographically secure random number generator.
- **Security Education:** Explains password safety, common attack methods, and ways to improve password security.
- **Privacy-Focused Design:** Keeps password analysis and model scoring on the client side.
- **Automated Testing:** Includes Vitest tests and Python/TypeScript model-scoring parity checks.

---

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Three.js
- React Three Fiber
- `@zxcvbn-ts` for password-strength estimation

### Backend
- Node.js
- Express
- TypeScript

### Machine Learning
- Python
- NumPy
- scikit-learn
- Google Colab
- Character-level Markov model
- RockYou password dataset

### Testing and Tools
- Vitest
- TypeScript compiler
- Git and GitHub
- npm

---

## 📁 Project Structure

```text
LockLogic/
├── public/
│   └── models/
│       └── predictability-v1.json
├── server/
│   └── ...
├── src/
│   ├── components/
│   │   └── ...
│   ├── data/
│   │   └── ...
│   ├── ml/
│   │   ├── heuristicModel.ts
│   │   └── markovModel.ts
│   ├── utils/
│   │   ├── attackRates.ts
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── fixtures/
│   │   └── parity-cases.json
│   └── markovModel.parity.test.ts
├── server.ts
├── index.html
├── package.json
├── vite.config.ts
├── README.md
└── README-BACKEND.md
```

*Note: The tree highlights the main project files. Adjust it if your actual repository structure differs.*

---

## 🚀 Getting Started

Follow these steps to run LockLogic locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) — use a current supported LTS version.
- npm — included with Node.js.
- Git — recommended for version control.

Check your installations:

```bash
node --version
npm --version
git --version
```

### 1. Clone the Repository

Replace `YOUR_USERNAME` with your GitHub username and `YOUR_REPOSITORY` with your repository name.

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

Alternatively, download the repository as a ZIP file from GitHub and extract it.

### 2. Install Dependencies

Run this command from the project root:

```bash
npm install
```

This installs the dependencies listed in `package.json`.

### 3. Configure Environment Variables

If the backend requires environment variables, create your local `.env` file from the provided example:

```bash
cp .env.example .env
```

On Windows Command Prompt, use:

```cmd
copy .env.example .env
```

Open `.env` and add the required configuration values described in `README-BACKEND.md`.

**Important:** Never commit `.env` files, API keys, or real credentials to GitHub. Keep placeholders in `.env.example`.

### 4. Run the Frontend in Development Mode

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed in the terminal, usually:

```text
http://localhost:5173/
```

The frontend's password analysis, trained model, and Attack Lab can operate in development mode. Features that require the backend, such as breach checking and AI Vault Coach, may need the backend server to be running.

### 5. Run the Complete Application

Build the application:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

If configured as described in the project scripts, open:

```text
http://localhost:3000/
```

The production server serves the built frontend and handles the backend API requests.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm install` | Installs project dependencies |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the frontend and bundles the backend |
| `npm start` | Starts the built application server |
| `npm run preview` | Previews the production frontend build |
| `npm test` | Runs the Vitest test suite |
| `npm run lint` | Runs the configured TypeScript checks |

*The commands above reflect the intended project configuration. Check `package.json` if a script is unavailable.*

---

## 🧠 How Password Analysis Works

LockLogic combines multiple signals instead of relying on password length alone.

### 1. Character Variety and Keyspace

The application estimates the maximum number of possible combinations based on password length and the character set.

The theoretical keyspace entropy is:

\[
H = L \times \log_2(P)
\]

Where:

- \(H\) = theoretical keyspace entropy in bits.
- \(L\) = password length.
- \(P\) = size of the available character pool.

For example, if a password contains 10 characters selected uniformly from a pool of 62 characters:

\[
H = 10 \times \log_2(62) \approx 59.5 \text{ bits}
\]

This is a theoretical upper bound. It assumes every character is selected independently and uniformly at random. Human-created passwords often do not satisfy these assumptions.

### 2. Password Guess Estimation

LockLogic uses `@zxcvbn-ts` to estimate how easily a password might be guessed.

The library recognizes patterns such as:

- Common dictionary words.
- Keyboard sequences.
- Repeated characters.
- Dates and familiar number sequences.
- Common password substitutions.
- Predictable combinations of words and numbers.

A longer password is not automatically stronger if it contains predictable patterns.

### 3. Effective Entropy

For most passwords, the application estimates effective entropy using the lower of the theoretical keyspace entropy and the base-2 logarithm of the estimated guess count:

Effective Entropy = min(Keyspace Entropy, log2(Estimated Number of Guesses))
Where (G) is the estimated number of guesses.

This helps prevent theoretical keyspace calculations from overstating the security of a predictable password.

### 4. Crack-Time Estimation

The application estimates crack time using different attacker profiles, such as:

- **Online throttled attacker:** Limited by server-side rate limits.
- **Offline fast-hash attacker:** Uses a high-speed password-guessing setup.
- **Nation-state attacker:** Represents a hypothetical attacker with substantial resources.

A simplified estimate is:

\[
T = \frac{0.5 \times G}{R}
\]

Where:

- \(T\) = estimated time.
- \(G\) = estimated number of guesses.
- \(R\) = assumed guesses per second.
- \(0.5\) = average fraction of the search space expected to be tried.

The app uses shared attacker-rate assumptions from `src/utils/attackRates.ts`.

**These are estimates, not guarantees.** Actual cracking times depend on the hashing algorithm, hardware, attack strategy, rate limits, and other conditions.

### 5. Overall Password Score

The overall score combines the application's password-strength signals, including effective entropy, the `zxcvbn` score, and the predictability score.

Hard caps prevent passwords estimated to be crackable in under a second offline from receiving the Strong or Fortress rating.

The exact score and thresholds are determined by the implementation in the source code.

---

## 🤖 Trained Model: predictability-v1

### What Does the Model Do?

The trained model estimates how closely a password resembles patterns commonly found in human-created passwords.

Examples:

- `iloveyou` contains a common phrase and is highly predictable.
- `qwertyuiop` follows a familiar keyboard sequence.
- `xK9#mQ2$vL7@nR4!pW8^` resembles a randomly generated string and is less predictable under this model.

A high predictability score means the password resembles common human password patterns. A low score means the model finds it less similar to those patterns.

**Important:** This is a predictability estimate, not a direct measurement of security or a guarantee that a password can or cannot be cracked.

### Model Architecture

The model is a **character-level 4-gram Markov model**, not a neural network.

It uses character sequences of different lengths to estimate the likelihood of the next character.

The model combines:

- 4-gram probabilities.
- 3-gram probabilities.
- 2-gram probabilities.
- 1-gram probabilities.

Linear interpolation combines these probabilities using weights selected on the validation set.

Add-one smoothing is applied to single-character probabilities so that unseen characters do not receive a zero probability in that part of the model.

### Training Data

The model was trained using a sample of the RockYou leaked-password dataset, obtained from the public SecLists repository.

The preprocessing pipeline:

1. Reads the dataset.
2. Removes passwords outside the permitted length range of 4–40 characters.
3. Keeps printable ASCII characters.
4. Removes duplicate passwords.
5. Shuffles the cleaned data.
6. Selects up to 3,000,000 passwords for training and evaluation.
7. Splits the selected sample into training, validation, and test sets.

The split is:

| Dataset | Percentage | Number of passwords |
|---|---:|---:|
| Training | 80% | 2,400,000 |
| Validation | 10% | 300,000 |
| Test | 10% | 300,000 |
| **Total** | **100%** | **3,000,000** |

The model is trained on the training set. The validation set is used to select interpolation weights and calibrate the scoring range. The test set is used for final evaluation.

The original leaked-password dataset is used for research and education only. It should not be committed to the repository.

### Predictability Scoring

For each password, the model:

1. Adds special start and end markers.
2. Extracts character sequences of lengths 1, 2, 3, and 4.
3. Looks up their estimated probabilities.
4. Combines the probabilities using the selected interpolation weights.
5. Calculates an average log-probability score.
6. Maps the result to a 0–100 predictability score using percentile-based calibration.

Higher scores indicate greater similarity to the human-password patterns learned during training.

### Model Evaluation

The trained model was evaluated by comparing held-out human-created passwords against randomly generated strings with the same length distribution.

| Metric | Observed result |
|---|---:|
| Test ROC-AUC | 0.9989 |
| Median predictability of human passwords | 89 |
| Median predictability of random strings | 0 |
| Training passwords | 2,400,000 |
| Validation passwords | 300,000 |
| Test passwords | 300,000 |
| Exported JSON size | Approximately 2,836 KB |
| Gzipped JSON size | Approximately 1,133 KB |

The reported ROC-AUC of 0.9989 indicates that the model distinguished the two evaluation groups very well under this particular experimental setup.

However, this experiment is relatively easy because the comparison is between human-created passwords and random strings. It does **not** demonstrate that the model can predict a specific user's password or that it will perform equally well against every kind of password.

### Model Export

The trained model is exported to:

```text
public/models/predictability-v1.json
```

The exported file contains model statistics, interpolation weights, scoring calibration values, and other information needed for inference.

Rare n-grams are pruned to reduce file size. The original password list is not included in the model file.

### Browser Inference

The TypeScript implementation loads and scores passwords in the browser.

The model is loaded through:

```text
src/ml/markovModel.ts
```

If the trained model cannot be loaded, the application uses the rule-based fallback:

```text
src/ml/heuristicModel.ts
```

This allows the core analysis functionality to remain available when the trained model is missing or unavailable.

---

## 🧪 Model Verification and Parity Testing

The project implements model scoring in both Python and TypeScript.

The parity test checks that the browser implementation produces the expected scores for reference passwords generated by the Python training pipeline.

Relevant files:

```text
tests/fixtures/parity-cases.json
tests/markovModel.parity.test.ts
```

Run the test suite with:

```bash
npm test
```

The parity test helps identify differences between the training implementation and the browser implementation.

It does not independently prove that the model is secure or that its predictions are universally accurate.

---

## ⚔️ Attack Lab

The Attack Lab is an interactive educational visualization of common password-guessing approaches.

### Attack Types

- **Brute-Force Attack:** Demonstrates trying combinations from a character set.
- **Dictionary Attack:** Demonstrates trying likely words and commonly used passwords.
- **Pattern Attack:** Demonstrates exploiting predictable sequences, repetitions, and familiar character substitutions.

The visualizations help explain why predictable passwords may be guessed before an attacker exhausts the theoretical keyspace.

**The Attack Lab is a simulation for security education.** It is not intended to attack real accounts, systems, or services.

---

## 🛡️ Breach Check

LockLogic optionally checks whether a password appears in known breach datasets using Have I Been Pwned.

The integration uses a k-anonymity approach:

1. The browser calculates the password's SHA-1 hash for the breach lookup.
2. Only the first five characters of the hash are sent to the lookup service through the configured backend.
3. The service returns matching hash suffixes.
4. The application compares the suffix locally to determine whether a match exists.

The complete password is not required by the lookup API.

SHA-1 is used here to identify breach-list entries, **not to store passwords or recommend SHA-1 for password hashing**.

A breach check is a useful warning, but a negative result does not prove that a password is safe or has never been exposed.

---

## 💡 AI Vault Coach

The optional AI Vault Coach provides additional password-security recommendations through the backend.

Depending on the implementation, the service can receive numeric metadata such as:

- Password-strength score.
- Password length.
- Character-class flags.
- Other non-password security indicators.

The intended design does not send the actual password to the coach endpoint. The backend should reject requests containing a password field.

The coach is an optional advisory feature. Its recommendations should supplement, not replace, the application's local password analysis.

Refer to `README-BACKEND.md` for backend configuration and environment variables.

---

## 🔐 Password Generator

LockLogic includes a password generator that uses the browser's cryptographically secure random source.

Cryptographically secure randomness helps avoid the predictability associated with ordinary pseudo-random number generators.

Users should still:

- Generate unique passwords for different accounts.
- Prefer long, randomly generated passwords or passphrases.
- Store passwords in a reputable password manager.
- Enable multi-factor authentication where available.
- Never share passwords or reuse passwords exposed in a breach.

---

## 🔒 Privacy and Security

Privacy is an important design principle of LockLogic.

- **Local analysis:** Password-strength analysis and trained-model scoring run in the browser.
- **Local model:** The trained model is loaded as a static JSON asset.
- **Breach checking:** Only a five-character SHA-1 hash prefix is sent for the HIBP lookup.
- **AI Vault Coach:** The intended backend interface accepts numeric metadata rather than the password.
- **Training data:** The original leaked-password dataset is not included in the repository.
- **Model export:** The shipped model contains pruned statistics, not the original password list.
- **Secret management:** API keys and environment-specific secrets must remain outside version control.
- **Third-party requests:** If external fonts or services are enabled, the browser may contact those providers.

Before deploying the application, inspect its network requests and verify that the implementation matches these privacy claims.

### Important Security Note

The application's privacy guarantees depend on the actual source code, server configuration, and third-party integrations. Review these components before using the project with real passwords.

Do not use LockLogic as the sole basis for deciding whether a password is safe.

---

## ⚠️ Limitations

- The model uses historical password data from 2009 and may not represent current password-selection habits.
- The model does not know personal information such as a user's name, pet, birthday, or other private details unless those patterns happen to be represented in its learned statistics.
- A high ROC-AUC on the human-versus-random test does not mean the model can predict every real password.
- Predictability scores are model estimates and should not be interpreted as probabilities that a password will be cracked.
- Crack-time estimates depend on assumed attacker speeds and attack conditions.
- Password-strength scoring is only one part of account security.
- Breach checks cannot establish that a password has never been exposed.
- Third-party integrations may have their own privacy policies and operational limitations.

---

## 🔬 Reproducing Model Training

The model can be retrained in Google Colab.

1. Obtain the RockYou dataset from the public SecLists repository.
2. Load the dataset in Google Colab.
3. Run the training pipeline in order: preprocessing, splitting, n-gram counting, probability estimation, weight tuning, evaluation, and export.
4. Generate `predictability-v1.json`.
5. Copy the exported model to `public/models/predictability-v1.json`.
6. Generate the reference scoring cases and save them to `tests/fixtures/parity-cases.json`.
7. Run the test suite to verify parity between the Python and TypeScript implementations.

Do not commit the original password dataset to GitHub.

The training environment may require substantial memory. If Colab runs out of RAM, reduce the training sample size and document the changed experiment settings.

---

## 🧰 Troubleshooting

### The application does not start

Check the Node.js and npm versions:

```bash
node --version
npm --version
```

Install dependencies again if necessary:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

### The trained model does not load

Check that the model file exists at:

```text
public/models/predictability-v1.json
```

Verify that the file contains valid JSON and that the model loader points to the correct asset path.

The heuristic fallback should be used if the model is unavailable.

### Breach checking does not work

Check that:

- The Express backend is running.
- The frontend is configured to reach the correct backend URL.
- Required environment variables are configured.
- The backend can reach the HIBP service.
- Browser and server logs do not show request or configuration errors.

### AI Vault Coach does not work

Check the backend setup described in `README-BACKEND.md`, including required API keys, environment variables, and endpoint configuration.

Never expose private API keys in frontend source code.

### Tests fail

Run:

```bash
npm test
npm run lint
npm run build
```

Review the error output and confirm that the model file, parity fixtures, dependencies, and TypeScript implementation are consistent.

---

## 🚢 Deployment

LockLogic contains a frontend and an Express backend. Features requiring the backend must be deployed with a compatible server environment.

Before deployment:

1. Run the test suite.
2. Run the TypeScript checks.
3. Build the application.
4. Configure production environment variables.
5. Verify that the production server serves the frontend correctly.
6. Verify the breach-check and AI Vault Coach endpoints.
7. Confirm that no passwords, API keys, or sensitive datasets are committed.
8. Inspect network requests to verify the intended privacy behavior.

Useful commands:

```bash
npm test
npm run lint
npm run build
npm start
```

For deployment-specific instructions, consult `README-BACKEND.md` and the hosting provider's documentation. Do not assume that a static frontend host can run the Express backend.

---

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a separate feature branch.
3. Make focused changes.
4. Run the tests, lint checks, and production build.
5. Commit your changes without secrets or leaked-password datasets.
6. Push your branch.
7. Open a pull request describing the changes.

Please keep privacy, responsible security education, and reproducible model evaluation in mind when contributing.

---

## 📚 References

- [RockYou dataset and SecLists repository](https://github.com/danielmiessler/SecLists)
- [Have I Been Pwned — Pwned Passwords](https://haveibeenpwned.com/Passwords)
- [zxcvbn password-strength estimator](https://github.com/dropbox/zxcvbn)
- [zxcvbn-ts](https://github.com/zxcvbn-ts/zxcvbn)
- [React documentation](https://react.dev/)
- [Vite documentation](https://vite.dev/)
- [Express documentation](https://expressjs.com/)
- [Vitest documentation](https://vitest.dev/)
- [Node.js documentation](https://nodejs.org/docs/)

---

**LockLogic: Think like the attacker. Build like the vault.**