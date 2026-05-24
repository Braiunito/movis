import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Room from './pages/Room.jsx';

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/r/:id" element={<Room />} />
      </Routes>
    </div>
  );
}
