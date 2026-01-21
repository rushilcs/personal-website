# Rushil Chandrupatla - Portfolio Website

An interactive portfolio website showcasing ML engineering projects, systems design, and problem-solving approaches. Built with React, Vite, and Tailwind CSS. Initially scaffolded from an open-source React portfolio template and now fully customized with original design, content, and functionality.

## 🚀 Features

- **Interactive Project Showcase**: Explore ML projects with detailed technical explanations
- **Systems Design Portfolio**: View systems I've owned and designed, with design rationale
- **AI-Powered Tools**: 
  - 90-day plan generator for ML engineering roles
  - Interactive chatbot for questions about my work
- **Responsive Design**: Optimized for all devices with dark mode support
- **Smooth Animations**: Built with Framer Motion for polished interactions

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI, Lucide Icons
- **Backend**: Vercel Serverless Functions
- **AI/ML**: OpenAI API, Anthropic API
- **Deployment**: Vercel

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rushilcs/rushilcs.github.io.git
cd rushilcs.github.io/client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the `client` directory:
```bash
OPENAI_API_KEY=your_openai_api_key
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key
```

4. Run the development server:
```bash
npm run dev
```

For local API development, run:
```bash
npm run dev:all
```

## 🏗️ Project Structure

```
client/
├── api/              # Serverless functions (Vercel)
├── public/           # Static assets
├── src/
│   ├── components/  # React components
│   ├── data/        # Data files
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utility functions
│   └── pages/       # Page components
└── vercel.json      # Vercel configuration
```

## 🚢 Deployment

The site is deployed on Vercel. The `client` directory is set as the root directory in Vercel settings.

### Environment Variables

Set the following in Vercel:
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (for AI features)

## 📝 License

This project is private and proprietary.

## 📬 Contact

- **Email**: rushilcs@gmail.com
- **LinkedIn**: [rushil-c](https://www.linkedin.com/in/rushil-c/)
- **Website**: [rushilcs.github.io](https://rushilcs.github.io)
