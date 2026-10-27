import "./globals.css";

export const metadata = {
  title: "Ma Garderie",
  description: "Garderie d'enfants : accueil, éveil et bienveillance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
