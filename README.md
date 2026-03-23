# The Pros Weddings - React + Node.js

A replica of [The Pros Weddings](https://www.thepros.com) landing page built with React.js (frontend) and Node.js/Express (backend).

## Project Structure

```
├── client/              # React frontend
│   ├── public/
│   │   ├── images/      # All images from the original site
│   │   └── index.html
│   └── src/
│       ├── components/  # React components
│       ├── styles/      # Component CSS files
│       ├── App.js       # Root component
│       └── server.js    # Entry point
├── server/
│   └── server.js        # Express API server
└── package.json         # Root package with scripts
```

## Getting Started

### Install all dependencies

```bash
npm run install-all
```

### Run both servers (development)

```bash
npm start
```

- React dev server: http://localhost:3000
- Node API server: http://localhost:5000

### Build for production

```bash
npm run build
npm run server
```

Then visit http://localhost:5000

## API Endpoints

### POST /api/find-professionals

Handles the "Find Professionals" form submission.

**Body:**
```json
{
  "name": "First Last",
  "email": "you@email.com",
  "phone": "555-555-5555",
  "weddingDate": "MM/DD/YYYY",
  "weddingLocation": "City, ST Zip",
  "okToText": true
}
```
