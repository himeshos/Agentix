# 🤖 Nexus AI – Multi-Agent Research & Analysis Platform

Nexus AI is an experimental **multi-model agent collaboration tool** that automates **deep research, market validation, and structured report generation**.  
It combines a **Next.js frontend** with a **FastAPI backend**, powered by multiple LLM providers (OpenAI, Anthropic, Gemini, xAI, etc.), orchestrated through a **consensus-based multi-agent pipeline**.

---

## ✨ Features

- 🧑‍🤝‍🧑 **Multi-Agent Collaboration**  
  Multiple AI models (agents) analyze, debate, and **vote** to reach a consensus-driven answer.

- 🔍 **Startup Validator & Market Research**  
  Validate ideas with structured insights:
  - Market Size & Trends  
  - Competitor Landscape  
  - Risks & Challenges  
  - Financial Forecasts  

- ⚡ **Fast vs Deep Search Modes**  
  - **Free mode** → quick, surface-level research  
  - **Pro mode ($15/month)** → deep multi-model research + access to **Agentix**, an internal agent-chat workspace for deeper analysis  

- 📊 **Structured Report Generation**  
  - Automatic formatting into sections (Market, Competitors, Financials, etc.)  
  - Export as DOCX / PDF  

- 🛠️ **Developer-Friendly**  
  - Modular provider factory for plugging in new LLMs  
  - Configurable pipelines & agents  
  - API + CLI support  

- 🎨 **Modern Frontend**  
  Built with **Next.js 14, TailwindCSS, Framer Motion, and shadcn/ui** for sleek design and smooth animations.  

---

## 🏗️ Tech Stack

### Frontend
- ⚡ **Next.js 14 (App Router)**  
- 🎨 **TailwindCSS + shadcn/ui**  
- 🎥 **Framer Motion** for animations  

### Backend
- ⚙️ **FastAPI** – APIs & orchestrator  
- 🗂️ Modular **Agent & Provider system**  
- 📦 **Providers:** OpenAI, Anthropic, Gemini, xAI (extendable)  

### Infrastructure
- 🌐 REST API endpoints  
- 🔑 API key management  
- 🖥️ CLI integration  
- 📊 Docx/PDF report generation  

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/nexus-ai.git
cd nexus-ai
