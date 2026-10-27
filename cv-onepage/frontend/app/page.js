import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";

// Les données viennent du backend à chaque requête (pas au moment du build Docker).
export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL || "http://backend:3001";

async function getJson(path, fallback) {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { data: await res.json(), error: false };
  } catch (e) {
    console.error(`Erreur API ${path} :`, e.message);
    return { data: fallback, error: true };
  }
}

export default async function Home() {
  const [garderie, services, activites] = await Promise.all([
    getJson("/api/garderie", null),
    getJson("/api/services", []),
    getJson("/api/activites", []),
  ]);

  const apiDown = garderie.error || services.error || activites.error;

  return (
    <>
      <Navbar />
      <main>
        {apiDown && (
          <p role="alert" className="alert">
            Le serveur de données ne répond pas. Vérifiez que le backend est démarré.
          </p>
        )}
        <Hero garderie={garderie.data} />
        <Services services={services.data} activites={activites.data} />
      </main>
      <footer className="footer" id="contact">
        <div className="container">
          <strong>Ma Garderie</strong>
          {garderie.data && (
            <p>
              {garderie.data.adresse} · {garderie.data.telephone} · {garderie.data.horaires}
            </p>
          )}
        </div>
      </footer>
    </>
  );
}
