# NFTickets - Web3 Event Platform

A Web3-native event platform for NFT ticket sales with advanced wallet connectivity and user experience enhancements.

## Features

- React frontend with Web3 wallet integration
- Base chain connectivity
- NFT ticketing infrastructure
- Intelligent wallet connection error handling
- OnchainKit and Coinbase CDP SDK integration

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Web3: Coinbase Wallet SDK, OnchainKit
- Backend: Express.js
- State Management: TanStack Query
- Authentication: Passport.js

## Getting Started

### Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd nftickets
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with:
```env
# Generate a random string for session encryption
# You can use this command in your terminal to generate one:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your_generated_secret
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5000](http://localhost:5000) in your browser

### Downloading from Replit

1. From your Replit workspace:
   - Click on the 'Files' button in the left sidebar
   - Click on the three dots menu (...)
   - Select 'Download as zip'

2. Extract the downloaded ZIP file
3. Follow steps 2-5 from the Local Development Setup above


## Development

The project uses the following development tools:

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- shadcn/ui for component library

## License

MIT