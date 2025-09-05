# Personal Finance Dashboard

A modern, responsive personal finance dashboard built with Vue 3, TypeScript, and Tailwind CSS. This application helps you track your finances, manage freelance work, and achieve your savings goals.

## Features

- **Dashboard Overview**: Get a quick snapshot of your financial health
- **Transaction Management**: Track income and expenses
- **Freelance Tools**: Manage invoices, time tracking, and freelance income
- **Salary Tracking**: Monitor your regular income and benefits
- **Savings Goals**: Set and track progress towards financial goals
- **Reports & Analytics**: Visualize your financial data with charts
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **Icons**: Heroicons
- **Build Tool**: Vite
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd my-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── dashboard/      # Dashboard-specific components
│   └── layout/         # Layout components (navbar, sidebar)
├── views/              # Page components
├── router/             # Vue Router configuration
├── stores/             # Pinia stores (state management)
└── style.css           # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

This is a personal project, but feel free to fork and modify for your own use.

## License

This project is for personal use only.

## Screenshots

[Add screenshots of your dashboard here]

## Future Enhancements

- [ ] Data persistence with backend API
- [ ] User authentication
- [ ] Data export functionality
- [ ] Mobile app version
- [ ] Integration with banking APIs
