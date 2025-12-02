# Roommates Frontend

Modern React + TypeScript frontend for the Roommates platform - connecting students with compatible roommates.

## Features

- 🏠 **Browse Listings**: Search and filter available rooms
- 💬 **Real-time Chat**: Socket.io powered messaging
- 🤖 **AI Assistant**: Get help finding the perfect match
- 📊 **Admin Dashboard**: Manage users, listings, and reports
- 🌍 **Interactive Maps**: View listings on a map
- 🔔 **Notifications**: Real-time updates
- 🌙 **Dark Mode**: Eye-friendly interface
- 🌐 **Bilingual**: English & Arabic support

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io** for real-time features
- **Leaflet** for maps
- **Framer Motion** for animations

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running (see [Roommates-Backend](https://github.com/Ah-Fayyad/Roommates-Backend))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ah-Fayyad/Roommates-Frontend.git
cd Roommates-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.development` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Roommates Finder
VITE_ENVIRONMENT=development
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5174`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── context/        # React Context providers
├── services/       # API services
├── routes/         # Route configurations
├── locales/        # i18n translations
└── index.css       # Global styles
```

## Environment Variables

Create a `.env.development` file with:

- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_ENVIRONMENT` - Environment (development/production)

## Demo Accounts

After seeding the backend database:

- **Landlord**: `landlord@test.com` / `123456`
- **Tenant**: `tenant@test.com` / `123456`
- **Admin**: `admin@test.com` / `123456`

## Deployment

### Railway / Vercel / Netlify

1. Connect your GitHub repository
2. Set environment variables:
   - `VITE_API_URL=https://your-backend-url.com/api`
3. Build command: `npm run build`
4. Output directory: `dist`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
