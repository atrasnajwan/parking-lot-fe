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
3. Make sure the [backend server](https://github.com/atrasnajwan/parking-lot) is running
4. Start the development server:
   ```bash
   pnpm dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🔧 Configuration

The application expects the backend API to be running at `http://localhost:3000`. If your backend is running on a different URL, update the `API_BASE_URL` in `src/services/api.ts`.

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
