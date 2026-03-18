import { createRoot } from 'react-dom/client';
import { Routes } from './routes';
import './index.css';
import './lib/i18n'; // Import the i18n configuration

createRoot(document.getElementById('root')!).render(<Routes />);
