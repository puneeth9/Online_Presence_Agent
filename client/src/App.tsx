import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Requests from './pages/Requests';
import JobDetail from './pages/JobDetail';
import './App.css';

function App() {
  return (
    <div className="appShell">
      <header className="topNav">
        <div className="brand">
          <Link to="/" className="brandLink">
            Online Presence Agent
          </Link>
        </div>
        <nav className="navLinks">
          <Link to="/">New request</Link>
          <Link to="/requests">Requests</Link>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/:id" element={<JobDetail />} />
        </Routes>
      </main>

      <footer className="footer">
        <span>Async jobs + polling UI</span>
      </footer>
    </div>
  );
}

export default App;
