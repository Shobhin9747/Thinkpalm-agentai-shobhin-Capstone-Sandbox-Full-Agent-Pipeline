# 🌌 UI Generator + Agent Pipeline

A high-performance, distraction-free system for generating premium React components using an **AI-driven multi-agent pipeline**. The system evolves from a PRD-based UI generator into a complete **agentic architecture with memory, tool-calling, and multi-agent orchestration**.

<video width="100%" controls poster="src/assets/prototype.png">
  <source src="SpecToUIAgent.mp4" type="video/mp4">
  Your browser does not support the video tag. [Watch Demo Video here](SpecToUIAgent.mp4)
</video>

![Prototype Dashboard](src/assets/prototype.png)

---

# 🚀 Project Phases

## 🟢 Phase 1 — UI Generator (Frontend Task)

Built a React/Next.js application where:

- User provides a **Product Requirements Document (PRD)**
- AI generates:
  - UI component tree
  - Tailwind-based React code
- Features:
  - Real-time preview using Babel
  - Code export
  - Multi-model LLM support
  - Design history

👉 This phase focuses on **PRD → UI generation**

---

## 🔵 Phase 2 — Agent Pipeline (Capstone)

Extended Phase 1 into a **complete agentic system** with:

### 🤖 Multi-Agent Architecture
- **Agent 1: PRD Analyzer**
  - Converts raw PRD → structured JSON (pages, components, features)
- **Agent 2: UI Generator**
  - Converts structured data → React + Tailwind UI

---

### 🔧 Tool Calling Layer
Agents use tools instead of directly generating everything:

- `generateComponentTree()`
- `previewUI()`
- `exportCode()`

---

### 🧠 Memory System
- Stores:
  - Previous PRDs
  - Generated UI
  - Structured outputs
- Enables:
  - reuse
  - iteration
  - history tracking

---

### 🔄 Agent Flow

```mermaid
graph TD
    User([User PRD Input]) --> Analyzer[Agent 1: PRD Analyzer]
    Analyzer --> Memory[Memory Store]
    Memory --> UIGen[Agent 2: UI Generator]
    UIGen --> Tools[Tool Layer]

    Tools --> Preview[Preview UI]
    Tools --> Export[Export Code]

    Preview --> UI[Frontend Display]
```

---

# ✨ Features

- **🚀 Real-time UI Generation**
- **🤖 Multi-Agent Pipeline (Analyzer + Generator)**
- **🧠 Memory Persistence**
- **🔧 Tool Calling Architecture**
- **💎 Premium UI Rendering**
- **🛠 Code Preview + Export**
- **📦 PRD → Structured → UI Flow**

---

# 🏗 Architecture

The system uses a **hybrid execution model**:

- Server: LLM + agent orchestration  
- Client: UI rendering + preview  

```mermaid
graph TD
    User([User]) -->|Inputs PRD| AnalyzerAgent
    AnalyzerAgent -->|Structured JSON| Memory
    Memory --> UIGeneratorAgent

    UIGeneratorAgent --> Tools

    Tools -->|Generate UI| API
    API --> Frontend

    Frontend --> Preview[Babel Preview]
    Frontend --> Export[Code Viewer]
```

---

# 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Next.js 15, Tailwind CSS |
| **Runtime** | Babel Standalone |
| **AI Models** | Gemini / Groq / Grok |
| **Agent System** | Custom multi-agent logic |
| **Memory** | Local storage / JSON |

---

# 🚀 Getting Started

### 1. Setup Environment

```
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

---

### 2. Install

```
npm install
```

---

### 3. Run

```
npm run dev
```

---

# 🎯 Key Concept

This project demonstrates:

> Transition from a **single AI feature** → **complete agentic system**

---

# 👥 Team: TeamDelta

- Shobhin Shaji  
- Mohammed Jalal MK  

---

# 📜 License

MIT License
