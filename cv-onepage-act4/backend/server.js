const express = require("express");
const cors = require("cors");
const { z } = require('zod');
const { Pool } = require('pg');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration SQS pour Floci
const sqsClient = new SQSClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});

// Connexion à PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://garderie_user:garderie_password@192.168.65.132:5432/garderie_db"
});

// Configuration des middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Limiteur de requêtes
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { status: 'error', message: 'Trop de requêtes. Veuillez réessayer dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Données statiques
const projects = [
  { slug: "serveur-ubuntu", title: "Serveur Ubuntu 26.04 sécurisé", description: "...", tech: ["Ubuntu", "SSH"], details: "...", link: "https://github.com/meryemelheni/cv-onepage" },
  { slug: "nginx-docker", title: "Nginx dans Docker", description: "...", tech: ["Docker", "Nginx"], details: "...", link: "https://github.com/meryemelheni/cv-onepage" },
  { slug: "serveur-jenkins", title: "Serveur Jenkins", description: "...", tech: ["Jenkins", "Java"], details: "...", link: "https://github.com/meryemelheni/cv-onepage" },
  { slug: "devsecops-portfolio", title: "DevSecOps Portfolio", description: "...", tech: ["Docker Compose", "JavaScript"], details: "...", link: "https://github.com/meryemelheni/cv-onepage" }
];

const skills = { techniques: ["Linux (Ubuntu Server)", "SSH et sécurité", "Réseau (NAT, ports)", "HTML5", "CSS3", "JavaScript", "Git et GitHub"], devsecops: [{ name: "Git", role: "versionner le code" }, { name: "Docker", role: "conteneuriser" }, { name: "Jenkins", role: "intégration continue" }, { name: "Kubernetes", role: "orchestrer" }, { name: "Ansible", role: "automatiser la configuration" }, { name: "Terraform", role: "infrastructure en code" }, { name: "Argo CD", role: "déployer en GitOps" }] };

const profile = { name: "Meryem Elheni", title: "Étudiante DevOps & Cloud", about: "Je monte et sécurise des serveurs Linux, je conteneurise des applications et j'automatise leur déploiement.", email: "elhenimeryem12@gmail.com", github: "github.com/meryemelheni" };

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
        const result = await pool.query('INSERT INTO contacts (nom, email, message) VALUES ($1, $2, $3) RETURNING *', [validatedData.nom, validatedData.email, validatedData.message]);
        console.log('Message enregistré :', result.rows[0]);
        res.status(201).json({ status: 'success', message: 'Message bien reçu. Merci !', data: result.rows[0] });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ status: 'error', message: 'Données invalides', errors: error.issues });
        }
        console.error('Erreur base de données :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// NOUVELLE ROUTE : Communication avec Floci (SQS)
app.post("/api/floci-contact", async (req, res) => {
  try {
    const command = new SendMessageCommand({
      QueueUrl: "http://localhost:4566/000000000000/ma-file",
      MessageBody: JSON.stringify(req.body),
    });
    const response = await sqsClient.send(command);
    res.json({ message: "Message envoyé à Floci", messageId: response.MessageId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Backend Ma Garderie démarré sur le port ${PORT}`);
    });
}
module.exports = app;