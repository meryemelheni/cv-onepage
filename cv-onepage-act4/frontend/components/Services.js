export default function Services({ services = [], activites = [] }) {
  return (
    <>
      <section className="section" id="services">
        <div className="container">
          <h2>Nos services</h2>
          {services.length === 0 ? (
            <p>Aucun service à afficher pour le moment.</p>
          ) : (
            <ul className="services">
              {services.map((s) => (
                <li key={s.id} className="service">
                  <span className="service__icon" aria-hidden="true">{s.icone}</span>
                  <div>
                    <h3>{s.nom}</h3>
                    <p>{s.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="section section--alt" id="activites">
        <div className="container">
          <h2>Les activités de la semaine</h2>
          {activites.length === 0 ? (
            <p>Aucune activité à afficher pour le moment.</p>
          ) : (
            <ul className="activites">
              {activites.map((a) => (
                <li key={a.id}>
                  <strong>{a.nom}</strong>
                  <span>{a.horaire}</span>
                  <span>{a.age}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
