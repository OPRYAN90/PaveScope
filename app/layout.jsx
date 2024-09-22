import '../styles/globals.css';
import { AuthProvider } from '../components/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AuthProvider>
        <body>{children}</body>
      </AuthProvider>
    </html>
  );
}