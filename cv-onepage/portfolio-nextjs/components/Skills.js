async function getSkills() {
  const apiUrl = process.env.API_URL || 'http://localhost:3001';
  const res = await fetch(`${apiUrl}/api/skills`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des compétences');
  }
  return res.json();
}

export default async function Skills() {
  const skills = await getSkills();

  return (
    <section id="skills" style={{ padding: '2rem', backgroundColor: '#F4F6F7' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ color: '#17414F' }}>Skills</h2>
        
        <h3 style={{ color: '#1F2A30', marginTop: '1.5rem' }}>Compétences Techniques</h3>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', listStyle: 'none', padding: 0 }}>
          {skills.techniques.map((skill, index) => (
            <li key={index} style={{ backgroundColor: 'white', padding: '8px 12px', borderRadius: '4px', borderTop: '3px solid #E2A83B', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {skill}
            </li>
          ))}
        </ul>

        <h3 style={{ color: '#1F2A30', marginTop: '1.5rem' }}>DevSecOps Skills</h3>
        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', listStyle: 'none', padding: 0 }}>
          {skills.devsecops.map((tool, index) => (
            <li key={index} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', borderTop: '4px solid #E2A83B', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <strong style={{ color: '#17414F' }}>{tool.name}</strong> : {tool.role}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}