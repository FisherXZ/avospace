import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import LayoutWrapper from '../../components/LayoutWrapper';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AvoSpace',
  description: 'Welcome!', 
};

export default function RootLayout({ children 

}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
