# ProofPulse

## Evidence Intelligence for the AI Era

**"Trust what you can verify."**

### Problem

Digital evidence — screenshots, receipts, certificates, notices — is easier than ever to create, edit, or imitate. A document can look completely convincing without actually proving the claim attached to it, and most people have no structured way to tell the difference between what a file *shows* and what it *proves*.

### Solution

ProofPulse is a frontend evidence-analysis prototype. It helps people inspect an uploaded document and understand:

1. What the document visibly contains
2. What observable signals deserve attention
3. What the evidence can reasonably support
4. What it cannot independently prove
5. What should be verified next

ProofPulse never claims to detect fake documents with certainty. It communicates uncertainty honestly, using language like "Verification Recommended" instead of "Fake Detected," because a trustworthy tool should be clear about the limits of what it can actually determine from a file.

### Signature Feature: Claim vs Evidence

The core of ProofPulse is a simple but powerful distinction:

- **Claim** — what someone says a document proves.
- **Evidence** — what can actually be observed from the document.
- **Limitation** — what the evidence cannot independently establish.
- **Verification** — what should be checked through an independent source.

For example, a payment screenshot might *claim* that a transfer was successfully completed. The *evidence* only shows an amount and a reference number. The *limitation* is that a screenshot cannot confirm the transaction actually settled. The *verification* step is to check with the official payment provider.

### Features

- Sticky navigation with smooth scrolling and active-section highlighting
- Responsive mobile hamburger menu
- Drag-and-drop and click-to-browse file upload (PNG, JPG, JPEG, PDF)
- Live image preview via `FileReader`, with a document placeholder for PDFs
- "Try Demo Evidence" mode with three prepared scenarios, fully usable offline
- A 3-step animated analysis sequence (Extracting → Analyzing → Explaining)
- An animated circular Trust Signal gauge built with SVG (no chart library)
- Four dynamic evidence metrics with plain-language explanations
- An observed-signals list distinguishing positive signals from warnings
- A dedicated Claim vs Evidence breakdown with a claim → observation → limitation → verification flow
- Toast notifications, scroll-reveal animations, and a working reset flow
- Accessibility support: semantic HTML, keyboard-operable controls, visible focus states, and `prefers-reduced-motion` support

### Technology

- HTML5
- CSS3
- Vanilla JavaScript

No frameworks, build tools, servers, databases, API keys, or external libraries are used.

### Architecture

ProofPulse is entirely frontend-only and runs by opening a single HTML file in a browser. All "analysis" is demo data defined directly in `script.js` — there is no real document forensics, OCR, or AI model behind it in this prototype. Uploading a real file demonstrates the interaction (preview, validation, file metadata) and then runs the same illustrative reporting pipeline as the demo scenarios, clearly labeled as a prototype analysis.

### How to Run

1. Download the project folder.
2. Open `index.html` by double-clicking it.
3. Click **Try Demo Evidence** and select a scenario, or upload your own PNG/JPG/PDF.
4. Click **Run Evidence Analysis** to see the report.

### Hackathon

Built for **Hack Devengers 2.0**, a 24-hour open-innovation hackathon.

### Limitations

This is a frontend prototype. The "analysis" is deterministic demo data, not production-grade document forensics. It does not perform real OCR, does not inspect embedded file metadata for authenticity signals, and does not connect to any payment provider, institution, or verification registry. Trust Signal scores and metrics are illustrative, meant to demonstrate the product's reasoning and communication style — not a real assessment of any specific document.

### Future Scope

- Real OCR and text extraction
- Genuine document forensics (compression artifacts, font/kerning analysis, edit-history detection)
- Cryptographic verification of digitally signed documents
- Direct issuer verification through institutional APIs
- Trusted registries for certificates, receipts, and transaction records
- Real AI models for content and consistency analysis
- Organization dashboards for reviewing evidence at scale
