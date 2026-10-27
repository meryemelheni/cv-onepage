export default function Hero({ garderie }) {
  const description =
    garderie?.description ||
    "Un lieu chaleureux où chaque enfant grandit, joue et découvre à son rythme.";

  return (
    <section className="hero" id="accueil">
      <div className="container hero__inner">
        <div className="hero__text">
          <h1>Bienvenue à Ma Garderie</h1>
          {garderie?.slogan && <p className="hero__slogan">{garderie.slogan}</p>}
          <p>{description}</p>
          <a className="button" href="#services">Découvrir nos services</a>
        </div>
        <img
          className="hero__image"
          src="/hero.svg"
          alt="Illustration de blocs de jeu colorés sous le soleil"
          width="560"
          height="420"
        />
      </div>
    </section>
  );
}
