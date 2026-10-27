export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <a href="#accueil" className="navbar__brand">
          <img src="/logo.svg" alt="" width="40" height="40" />
          <span>Ma Garderie</span>
        </a>
        <nav aria-label="Navigation principale">
          <ul className="navbar__menu">
            <li><a href="#accueil">Accueil</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#activites">Activités</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
