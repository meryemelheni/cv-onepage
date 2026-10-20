const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Données du portfolio (tu peux les importer ou les définir ici)
const projects = [
  {
    slug: "serveur-ubuntu",
    title: "Serveur Ubuntu 26.04 sécurisé",
    description: "Installation et sécurisation d'un serveur Ubuntu avec accès SSH par clés.",
    tech: ["Ubuntu", "SSH"],
    details: "Configuration du fichier sshd_config, désactivation de l'accès root et du mot de passe. Mise en place d'une clé ED25519 pour l'accès distant sécurisé.",
    link: "https://github.com/meryemelheni/cv-onepage"
  },
  {
    slug: "nginx-docker",
    title: "Nginx dans Docker",
    description: "Conteneurisation d'un site statique avec Nginx.",
    tech: ["Docker", "Nginx"],
    details: "Création d'un Dockerfile basé sur l'image nginx:alpine pour servir le portfolio. Exposition sur le port 8082 via Docker Compose.",
    link: "https://github.com/meryemelheni/cv-onepage"
  },
  {
    slug: "serveur-jenkins",
    title: "Serveur Jenkins",
    description: "Installation de Jenkins pour l'intégration continue.",
    tech: ["Jenkins", "Java"],
    details: "Installation de Jenkins en tant que service systemd. Configuration initiale via l'interface web sur le port 8080.",
    link: "https://github.com/meryemelheni/cv-onepage"
  },
  {
    slug: "devsecops-portfolio",
    title: "DevSecOps Portfolio",
    description: "Ce portfolio, généré dynamiquement et déployé avec Docker.",
    tech: ["Docker Compose", "JavaScript"],
    details: "Portfolio one-page avec des sections dynamiques. Déployé à l'aide de Docker Compose et versionné avec Git.",
    link: "https://github.com/meryemelheni/cv-onepage"
  }
];

const skills = {
  techniques: [
    "Linux (Ubuntu Server)",
    "SSH et sécurité",
    "Réseau (NAT, ports)",
    "HTML5",
    "CSS3",
    "JavaScript",
    "Git et GitHub"
  ],
  devsecops: [
    { name: "Git", role: "versionner le code" },
    { name: "Docker", role: "conteneuriser" },
    { name: "Jenkins", role: "intégration continue" },
    { name: "Kubernetes", role: "orchestrer" },
    { name: "Ansible", role: "automatiser la configuration" },
    { name: "Terraform", role: "infrastructure en code" },
    { name: "Argo CD", role: "déployer en GitOps" }
  ]
};

const profile = {
  name: "Meryem Elheni",
  title: "Étudiante DevOps & Cloud",
  about: "Je monte et sécurise des serveurs Linux, je conteneurise des applications et j'automatise leur déploiement.",
  email: "elhenimeryem12@gmail.com",
  github: "github.com/meryemelheni"
};

// 30 - Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: "OK", message: "L'API fonctionne correctement" });
});

// 31 - Route profil
app.get('/api/profile', (req, res) => {
  res.json(profile);
});

// 32 - Route projets
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// 33 - Route compétences
app.get('/api/skills', (req, res) => {
  res.json(skills);
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur API démarré sur http://localhost:${PORT}`);
});