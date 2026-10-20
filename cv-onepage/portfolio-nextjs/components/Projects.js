import Link from 'next/link';

async function getProjects() {
  const apiUrl = process.env.API_URL || 'http://localhost:3001';
  const res = await fetch(`${apiUrl}/api/projects`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des projets');
  }
  return res.json();
}

export default async function Projects() {
  const projects = await getProjects();

  return (
    <section id="projects" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#17414F' }}>Projects</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '1rem' }}>
        {projects.map((project) => (
          <div key={project.slug} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', borderTop: '4px solid #E2A83B', backgroundColor: 'white' }}>
            <h3 style={{ color: '#17414F', marginTop: 0 }}>{project.title}</h3>
            <p style={{ color: '#5C6A70' }}>{project.description}</p>
            <p><strong>Tech :</strong> {project.tech.join(', ')}</p>
            <Link href={`/projects/${project.slug}`} style={{ display: 'inline-block', marginTop: '10px', color: '#E2A83B', textDecoration: 'none', fontWeight: 'bold' }}>
              Voir le projet &rarr;
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}