# 🔐 LockLogic: Neural Password Fortress
**Think like the attacker. Build like the vault.**

LockLogic is a privacy-focused password-strength analyzer and security education web application that helps users understand password security through interactive analysis and attack simulations.

## ✨ Features
- **Password Strength Analysis:** Evaluates password strength, character variety, predictability, and estimated crack time.
- **Markov Model:** Uses a trained character-level 4-gram model to detect predictable password patterns.
- **Heuristic Fallback:** Provides rule-based analysis when the trained model is unavailable.
- **Attack Lab:** Simulates brute-force, dictionary, and pattern-based attacks for educational purposes.
- **Breach Check:** Uses Have I Been Pwned k-anonymity lookup to check for exposed passwords.
- **AI Vault Coach:** Provides security recommendations using numeric password metadata without sending the actual password.
- **Password Generator:** Generates secure passwords using browser cryptographic randomness.
- **Privacy-Focused:** Performs password analysis and model scoring locally in the browser.
- **Testing:** Includes Vitest tests and Python/TypeScript model-scoring parity checks.

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Three.js
- **Backend:** Node.js, Express
- **Machine Learning:** Python, NumPy, scikit-learn, Character-level Markov Model
- **Testing:** Vitest, TypeScript

## 🚀 Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
npm install
npm run dev
```

Open the local URL displayed in the terminal.

To build and run the application:

```bash
npm run build
npm start
```

## 🧪 Testing

```bash
npm test
npm run lint
npm run build
```

## 🔒 Privacy & Security
Password analysis and model scoring run locally in the browser. Breach checking sends only a five-character SHA-1 hash prefix, while AI Vault Coach receives numeric security metadata instead of the password.

**Note:** Crack-time estimates and predictability scores are educational estimates, not security guarantees. Always use unique passwords, a password manager, and multi-factor authentication.

## 📚 References
RockYou Dataset, Have I Been Pwned, zxcvbn-ts, React, Vite, Express, and Vitest.

**LockLogic — Think like the attacker. Build like the vault.**
