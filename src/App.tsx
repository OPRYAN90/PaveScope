import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login'; // Import the Login component
import GetStarted from './pages/GetStarted'; // Import the GetStarted component
import Workpage from './pages/WorkPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/get-started" element={<GetStarted />} /> 
        <Route path="/workpage" element={<Workpage />} />
      </Routes>
    </Router>
  );
}

export default App;
