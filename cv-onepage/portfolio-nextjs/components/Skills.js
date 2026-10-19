import { skills, devsecopsTools } from '../data/skills';

export default function Skills() {
  return (
    <>
      <section id="skills">
        <h2>Skills</h2>
        <ul className="tags">
          {skills.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </section>
      <section id="devsecops">
        <h2>DevSecOps Skills</h2>
        <div className="grid">
          {devsecopsTools.map((t) => (
            <article className="card" key={t.name}>
              <h3>{t.name}</h3>
              <p>{t.use}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
