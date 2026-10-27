const express = require("express");
const cors = require("cors");
const { z } = require('zod');
const { Pool } = require('pg');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Connexion à PostgreSQL (localhost pour la VM, ou 192.168.65.132 pour Windows)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://garderie_user:garderie_password@192.168.65.132:5432/garderie_db"
});
// Configuration des middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Limiteur de requêtes pour la route contact
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { status: 'error', message: 'Trop de requêtes. Veuillez réessayer dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Données statiques (Portfolio)
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

// Routes GET
app.get('/api/health', (req, res) => res.json({ status: "OK", message: "L'API fonctionne correctement" }));
app.get('/api/profile', (req, res) => res.json(profile));
app.get('/api/projects', (req, res) => res.json(projects));
app.get('/api/skills', (req, res) => res.json(skills));

// Schéma de validation Zod
const contactSchema = z.object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Adresse email invalide"),
    message: z.string().min(5, "Le message doit contenir au moins 5 caractères")
});

// Route POST pour le formulaire de contact
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const validatedData = contactSchema.parse(req.body);
        const result = await pool.query(
            'INSERT INTO contacts (nom, email, message) VALUES ($1, $2, $3) RETURNING *',
            [validatedData.nom, validatedData.email, validatedData.message]
        );
        console.log('Message enregistré :', result.rows[0]);
        res.status(201).json({ status: 'success', message: 'Message bien reçu. Merci !', data: result.rows[0] });
           } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Données invalides', 
                errors: error.issues 
            });
        }
        console.error('Erreur base de données :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend Ma Garderie démarré sur le port ${PORT}`);
});

module.exports = app;