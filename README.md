# AIRPRED Web

AIRPRED is a Next.js web application for viewing 24-hour PM2.5 forecasts for Philippine urban areas.

## Prerequisites

Install the following before running the project:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) 20 or later, including npm

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/wake504/airpred-web.git
cd airpred-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The development server reloads automatically when you edit files. The main page is in `app/page.tsx`.

## Available Commands

```bash
npm run dev      # Start the development server
npm run lint     # Check the code with ESLint
npm run build    # Create a production build
npm run start    # Start the production server after building
```

To test the production version locally:

```bash
npm run build
npm run start
```

Then open [http://localhost:3000](http://localhost:3000).
