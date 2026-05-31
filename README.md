<div align="center">
  <h1>🇰🇷 K-Mastery: Master Korean with AI 🇰🇷</h1>
  <p>
    <strong>A next-generation, AI-powered platform designed to make learning Korean beautiful, engaging, and highly effective.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

<br />

## ✨ What is K-Mastery?

Learning a new language can be daunting, but it doesn't have to be! **K-Mastery** is an interactive, full-stack application designed specifically to help you master the Korean language and crush the TOPIK (Test of Proficiency in Korean) exams.

By combining the latest in **Artificial Intelligence**, **Spaced Repetition System (SRS)**, and **Gamification**, K-Mastery creates a personalized learning environment that adapts to you. Whether you're a complete beginner learning the Hangul alphabet or an advanced speaker preparing for TOPIK II, we've got you covered!

---

## 🚀 Awesome Features

- 🤖 **Smart AI Tutors**: Powered by advanced LLMs (like Groq/Llama-3 and Ollama/Phi-3), our AI conversational tutors give you real-time grammar and vocabulary corrections.
- 🎮 **Gamified Learning**: Level up, earn XP, maintain daily streaks, and compete on the global leaderboard! We make learning addictive in the best way possible.
- 🗺️ **Dynamic TOPIK Roadmap**: Your learning journey adapts to your skill level. Progress from Survival Korean (Level 1) all the way to Native-Like Mastery (Level 6).
- 🗣️ **Speech & Pronunciation Analysis**: Practice your speaking with built-in audio analysis to ensure your pronunciation sounds like a native speaker.
- 🧠 **Spaced Repetition System (SRS)**: Never forget a word again. Our intelligent flashcard system ensures maximum vocabulary retention.
- 🎨 **Beautiful 3D UI**: Built with React Three Fiber and Framer Motion for a stunning, immersive visual experience.

---

## 🛠️ Tech Stack

We believe in using the best tools for the job. Here's what makes K-Mastery tick:

### Frontend 🎨
- **Framework**: Next.js 16 (App Router) & React 19
- **Styling & Animations**: Tailwind CSS v4 & Framer Motion
- **State Management**: Zustand
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`

### Backend ⚙️
- **Framework**: FastAPI (Python)
- **Database**: SQLAlchemy (SQLite/PostgreSQL) & Redis
- **AI/ML Engine**: TensorFlow, Groq, Ollama, & Google Generative AI
- **Audio Processing**: Librosa & Soundfile

---

## 🏃‍♂️ Getting Started

Ready to dive in? Setting up the project locally is super simple thanks to Docker!

### Prerequisites
Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/k-mastery.git
   cd k-mastery
   ```

2. **Spin up the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the platform:**
   - The **Frontend** will be running at: `http://localhost:3000`
   - The **Backend API Docs** will be available at: `http://localhost:8000/docs`

> **Note**: The backend intelligently pre-warms TensorFlow models upon startup to ensure zero latency. The very first boot might take a few moments!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as you see fit!

---

<div align="center">
  <p><strong>Developed by Zeesh</strong> 👨‍💻</p>
  <p><em>Built with ❤️ and a passion for learning.</em></p>
</div>
