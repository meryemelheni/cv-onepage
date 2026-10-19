import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Meryem Elheni - DevSecOps Portfolio',
  description: 'DevSecOps Portfolio de Meryem Elheni, étudiante DevOps et Cloud.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
