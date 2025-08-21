# Linkly Frontend

This is the frontend application for the Linkly URL shortener service. It's built with React.js and provides a user interface for shortening links, managing shortened URLs, and viewing analytics.

## Features

- URL shortening
- User authentication (login/signup)
- Dashboard for managing URLs
- QR code generation for shortened URLs
- Click tracking and analytics for premium users
- Subscription management

## Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- Backend service running (see backend README)

## Environment Variables

Create a `.env` file in the root of the frontend directory with the following variables:

```
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_JWT_KEY=your_frontend_jwt_key
REACT_APP_TIMEOUT=10000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Installation

1. Install dependencies
```bash
npm install
```

2. Start the development server
```bash
npm start
```

3. For production build
```bash
npm run build
```

## Project Structure

```
frontend/
├── public/             # Static files
├── src/
│   ├── api/           # API configuration
│   │   └── axiosConfig.js
│   ├── components/    # Reusable components
│   │   ├── navbar.js
│   │   ├── navbarlogin.js
│   │   ├── Dashboard.js
│   │   └── Dashboard_Loginned.js
│   ├── Pages/         # Page components
│   │   ├── HomePage.js
│   │   ├── HomePageLoggedin.js
│   │   ├── login.js
│   │   ├── signup.js
│   │   ├── qrdisplayer.js
│   │   ├── redirect_url.js
│   │   └── Subscription.js
│   ├── App.js         # Main application component
│   ├── index.js       # Application entry point
│   └── index.css      # Global styles
└── package.json       # Project dependencies
```

## User Flows

### Anonymous Users:
1. Access the homepage
2. Shorten up to 15 URLs without registration
3. View and manage shortened URLs in the dashboard
4. Register/login for additional features

### Registered Users:
1. Login via email/password or Google OAuth
2. Access personalized dashboard
3. Shorten up to 100 URLs (Free tier)
4. Manage (view, edit, delete) shortened URLs

### Premium Users:
1. Access all free tier features
2. Generate QR codes for shortened URLs
3. View click analytics for each URL
4. No limit on the number of shortened URLs

## Subscription Management

The application includes a subscription management system that allows users to upgrade to a premium plan for additional features:

1. Navigate to the subscription page
2. Select the premium plan
3. Complete payment via PhonePe integration
4. Access premium features immediately after payment confirmation

