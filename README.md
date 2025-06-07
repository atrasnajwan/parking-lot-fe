# 🚗 Parking Lot Frontend

A React-based frontend application for managing a parking lot system. This application provides a user-friendly interface to manage vehicle parking, including check-in, check-out, and parking lot visualization.

This is the frontend application for the parking lot management system. The backend repository can be found at [https://github.com/atrasnajwan/parking-lot](https://github.com/atrasnajwan/parking-lot).

## ✨ Features

- Interactive parking lot visualization with coordinate guides
- Vehicle check-in and check-out with time selection
- Size-based slot matching (small, medium, large)
- Real-time parking records display
- Gate management with clickable gates
- Manual unparking functionality
- Detailed parking ticket view
- Responsive design

## 🧰 Tech Stack

- React with TypeScript
- Vite for build tooling
- Mantine UI components
- Axios for API communication
- Day.js for date handling

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.development`
   - Update the variables if needed:
     - `VITE_API_BASE_URL`: Backend API URL
     - `VITE_PORT`: Frontend development server port
4. Make sure the [backend server](https://github.com/atrasnajwan/parking-lot) is running
5. Start the development server:
   ```bash
   pnpm dev
   ```
6. Open [http://localhost:${VITE_PORT}](http://localhost:5173) in your browser (default port: 5173)

## 🔧 Configuration

The application uses environment variables for configuration:

- `VITE_API_BASE_URL`: The URL of the backend API (default: `http://localhost:3000`)
- `VITE_PORT`: The port for the development server (default: `5173`)

For development:
1. Create `.env.development` file with:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   VITE_PORT=5173
   ```
2. Adjust values as needed for your environment

For production:
1. Create `.env.production` file with:
   ```env
   VITE_API_BASE_URL=https://your-production-api-url
   VITE_PORT=5173
   ```
2. Set appropriate values for your production environment

## 📝 Usage

1. Create a new parking lot using the "Create Parking Lot" button
2. Park vehicles by either:
   - Clicking the "Park Vehicle" button
   - Clicking directly on a gate in the grid
3. View parking slot details by clicking on any slot
4. Unpark vehicles through:
   - Clicking on the parking record
   - Using the manual unpark feature
5. View all parking records in the sidebar
6. Add or remove gates as needed

## 🎨 Color Coding

- Green: Small parking slot
- Yellow: Medium parking slot
- Blue: Large parking slot
- Red: Occupied slot
- Purple: Gate
- Gray: Empty space

## 📦 Building for Production

To create a production build:

```bash
pnpm build
```

The build artifacts will be stored in the `dist/` directory.
