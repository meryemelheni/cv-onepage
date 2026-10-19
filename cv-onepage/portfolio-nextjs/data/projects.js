export const projects = [
  {
    slug: 'serveur-ubuntu-securise',
    title: 'Serveur Ubuntu 26.04 sécurisé',
    description: 'VM VMware, accès SSH par clé avec passphrase, mot de passe désactivé.',
    tech: ['Ubuntu', 'SSH'],
    details: [
      "Installation d'Ubuntu Server 26.04 sous VMware.",
      'Connexion par clé uniquement, mot de passe et root désactivés.',
      'Test depuis la machine physique avec une clé protégée par passphrase.',
    ],
    link: 'https://github.com/meryemelheni/cv-onepage',
  },
  {
    slug: 'nginx-docker',
    title: 'Nginx dans Docker',
    description: 'Conteneur nginx exposé sur un port et testé depuis la machine physique.',
    tech: ['Docker', 'Nginx'],
    details: [
      'Installation de Docker depuis le dépôt officiel.',
      'Conteneur lancé avec docker run et le port 80 publié.',
      'Image cv-docker construite avec un Dockerfile et déployée avec Docker Compose.',
    ],
    link: 'https://github.com/meryemelheni/cv-onepage',
  },
  {
    slug: 'serveur-jenkins',
    title: 'Serveur Jenkins',
    description: 'Jenkins installé comme service systemd avec Java 21.',
    tech: ['Jenkins', 'Java'],
    details: [
      'Service activé au démarrage de la VM.',
      'Tableau de bord ouvert depuis la machine physique sur le port 8080.',
      'Pipeline qui récupère le dépôt, installe les dépendances et construit Next.js.',
    ],
    link: 'https://github.com/meryemelheni/cv-onepage',
  },
  {
    slug: 'devsecops-portfolio',
    title: 'DevSecOps Portfolio',
    description: 'Ce site, migré vers Next.js avec des composants et des données séparées.',
    tech: ['Next.js', 'React', 'Docker Compose'],
    details: [
      'Version HTML, CSS et JavaScript conteneurisée avec Nginx.',
      'Version Next.js avec composants réutilisables et routes /projects.',
      'Données des projets et des compétences dans le dossier data.',
    ],
    link: 'https://github.com/meryemelheni/cv-onepage',
  },
];
