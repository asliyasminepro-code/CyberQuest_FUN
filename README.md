# CyberQuest: CyberCity Defense

An interactive, offline-first educational cybersecurity game designed for youth and teenagers aged 10–18. Players explore CyberCity, investigate deceptive attacks, harden workstations, test password entropy, solve ethical dilemmas, and rise through five ranks to achieve the distinction of **CyberGuardian**.

Built with **pure Vanilla HTML, CSS, and modern JavaScript (ES Modules)**. Zero frameworks, zero external runtime libraries, zero CDN calls, and zero tracking databases.

---

## 🏙️ The Eight Canonical CyberCity Districts

CyberCity features an **Open-Campus Exploration Architecture** where all 8 districts and bonus challenges are accessible from the very beginning.

1. **Mailbox Quarter — Phishing Detective (`js/modules/phishing.js`)**
   - Simulated webmail inbox featuring **9 realistic messages** (phishing traps and legitimate school/club notices).
   - Players inspect true sender email headers, analyze hover URLs with a simulated hyperlink inspector, and identify artificial panic triggers.

2. **Vault District — Password Lab (`js/modules/password.js`)**
   - Live entropy calculation and brute-force cracking estimates at an explicit baseline of **10 billion ($10^{10}$) guesses per second offline**.
   - Includes a 4-word passphrase generator and a Multi-Factor Authentication (2FA) simulator.
   - **Privacy Enforcement**: Typed passwords are evaluated strictly in volatile component memory; never saved to `localStorage`, never logged, and never transmitted.
   - **Theoretical Disclaimer**: Explains that theoretical estimates do not account for data breaches, phishing, or malware.

3. **Firewall Fortress — Ethical Hacker Mission (`js/modules/ethical.js`)**
   - Branching narrative decision scenarios on responsible disclosure, academic portal access, and game cheat malware.
   - Teaches the real-world legal and ethical boundaries of White-Hat defense.

4. **Office Tower — Spot the Flaws (`js/modules/flaws.js`)**
   - Interactive visual inspection of a school/office workstation scene.
   - Players locate **8 physical and digital security flaws**: sticky-note passwords, unlocked screens, rogue USB drives, postponed updates, unencrypted HTTP, open Wi-Fi, exposed trash records, and uncovered webcams.

5. **Academy — Cybersecurity Quiz (`js/modules/quiz.js`)**
   - 10 comprehensive knowledge-check questions covering malware definitions, TLS/HTTPS, MFA, the 3-2-1 backup strategy, and network hygiene.
   - Features streak multipliers and CyBot tactical explanations.

6. **Myth Plaza — True or False (`js/modules/myths.js`)**
   - Fast-paced myth-busting card deck addressing common misconceptions (Apple immunity, Incognito mode invisibility, hacker targets, and public Wi-Fi safety).

7. **AI Lab — AI and Cybersecurity (`js/modules/ai.js`)**
   - 6 emerging challenges: detecting AI voice cloning emergency scams, establishing chatbot data privacy boundaries, recognizing prompt injection, and analyzing synthetic media.

8. **Bonus Alley — Quick Bonus Missions (`js/modules/bonus.js`)**
   - Arcade hub housing **six distinct, self-contained playable challenges**:
     1. **Evil Twin Wi-Fi**: Network defense against rogue access points.
     2. **QR Code Trap**: Quishing defense against malicious physical stickers.
     3. **App Permissions**: Mobile security applying least-privilege toggles.
     4. **Oversharing / Privacy**: Digital footprint audit of public social media posts.
     5. **Caesar Cipher**: Rotating wheel encryption and decryption challenge.
     6. **Real or Deepfake**: AI forensics identifying optical anomalies.

---

## 🎖️ Gamification & The Five Canonical Ranks

Rank progression is governed by cumulative Experience Points (XP) stored in `data/config.json`:

| Rank Title | Minimum XP | District Completion Requirement | Badge Icon |
|:---|:---:|:---:|:---:|
| **Recruit** | 0 XP | None (Starting rank) | 🔰 |
| **Agent** | 250 XP | None | 🛡️ |
| **Senior Agent** | 600 XP | None | ⭐ |
| **Expert** | 1050 XP | None | 🎖️ |
| **CyberGuardian** | **1500 XP** | **Must have completed ALL 8 main districts** | 👑 |

### Replay Differential Scoring (Zero-Farming)
To allow players to learn from mistakes while eliminating infinite replay farming, the state engine awards only differential gains:
$$\Delta \text{XP} = \max\left(0, \; \text{NewScore} - \text{PreviousHighScore}\right)$$
The maximum achievable score across all 8 main districts (150 XP each) and 6 bonus challenges (75 XP each) is exactly **1500 XP**. Attaining **CyberGuardian** unlocks the official printable **CyberGuardian Diploma** (`css/print.css`).

---

## 🔒 Player Privacy & Zero-Knowledge Architecture

- **No Accounts / No PII**: No login, no email, no name collection, and no telemetry tracking.
- **Volatile Password Evaluation**: Passwords entered in the Vault District exist only in component memory during input. Inputs are marked `autocomplete="off"` and `type="password"`.
- **Anonymous Storage**: `localStorage` stores only total XP, current rank, completed district IDs, and accessibility preferences.
- **"New Player" Reset Button**: An instant reset button in the top HUD clears all stored data and returns the workstation to Recruit 0 XP.

---

## ⏱️ Inactivity & Event Mode (Classrooms & Kiosks)

- **60-Second Inactivity Trigger**: When 60 seconds elapse with zero mouse/keyboard input, CyBot appears with a gentle prompt.
- **15-Second Countdown**: A visible timer offers an *"I'm Here!"* button to resume.
- **Event-Mode Reset**: If the countdown expires without user response, the workstation cleanly resets to the CyberCity map, ready for the next student.
- **Educator Demo Console**: Teachers can press **`Ctrl + Shift + D`** (or triple-click the logo) to fast-forward progress or demonstrate the CyberGuardian diploma.

---

## 🚀 Running CyberQuest Locally

Because CyberQuest uses native **JavaScript ES Modules** (`import`/`export`) and Service Workers, browsers require HTTP/HTTPS serving rather than direct `file:///` execution.

### Option 1: Python Static Server (Zero-Install)
Open your terminal in the `CyberQuest_FUN` folder:
```bash
# Python 3
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your web browser.

### Option 2: Node.js (npx)
```bash
npx serve .
```

### Option 3: VS Code / IDE Live Server
Right-click `index.html` and select **"Open with Live Server"**.

---

## 📱 PWA & Offline Support

CyberQuest installs as an offline Progressive Web App (PWA). The service worker (`sw.js`) pre-caches the full application shell and all JSON datasets. Audio sound effects are procedurally generated via the native **Web Audio API (`AudioContext`)**, requiring zero external audio downloads.

