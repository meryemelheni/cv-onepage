const express = require("express");
const cors = require("cors");
const { z } = require('zod');
const { Pool } = require('pg');
const app = express();
const pool = new Pool({
    connectionString: "postgresql://garderie_user:garderie_password@localhost:5432/garderie_db"
});
const PORT = process.env.PORT || 3001;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(cors());
app.use(helmet());
// Limiteur de requêtes pour la route contact
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requêtes max par IP
    message: { 
        status: 'error', 
        message: 'Trop de requêtes. Veuillez réessayer dans 15 minutes.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(express.json());

const garderie = {
  nom: "Ma Garderie",
  slogan: "Un second foyer pour les petits explorateurs",
  description:
    "Ma Garderie accueille les enfants de 3 mois à 6 ans dans un cadre chaleureux, sécurisé et stimulant, avec une équipe éducative à l'écoute des familles.",
  adresse: "12 rue des Jasmins, Tunis",
  telephone: "+216 71 000 000",
  email: "contact@magarderie.tn",
  horaires: "Du lundi au vendredi, 7h30 - 18h30",
};

const services = [
  { id: 1, nom: "Accueil à la journée", description: "Repas équilibrés, siestes et jeux encadrés du matin au soir.", icone: "☀️" },
  { id: 2, nom: "Halte-garderie", description: "Accueil ponctuel à l'heure ou à la demi-journée selon vos besoins.", icone: "🕒" },
  { id: 3, nom: "Éveil et éducation", description: "Ateliers d'éveil sensoriel, langage et préparation à l'école.", icone: "🌱" },
  { id: 4, nom: "Restauration", description: "Repas frais préparés sur place, adaptés aux allergies.", icone: "🍎" },
  { id: 5, nom: "Suivi des familles", description: "Compte rendu quotidien et rencontres régulières avec les parents.", icone: "💬" },
];

const activites = [
  { id: 1, nom: "Peinture et dessin", horaire: "Lundi 9h30", age: "2 - 6 ans" },
  { id: 2, nom: "Éveil musical", horaire: "Mardi 10h00", age: "1 - 4 ans" },
  { id: 3, nom: "Jardinage", horaire: "Mercredi 10h30", age: "3 - 6 ans" },
  { id: 4, nom: "Contes et comptines", horaire: "Jeudi 15h30", age: "0 - 6 ans" },
  { id: 5, nom: "Jeux d'eau et motricité", horaire: "Vendredi 10h00", age: "2 - 6 ans" },
];

app.get("/api/garderie", (req, res) => res.json(garderie));
app.get("/api/services", (req, res) => res.json(services));
app.get("/api/activites", (req, res) => res.json(activites));
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Schéma de validation Zod
const contactSchema = z.object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Adresse email invalide"),
    message: z.string().min(5, "Le message doit contenir au moins 5 caractères")
});

app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        // Validation avec Zod
        const validatedData = contactSchema.parse(req.body);
        
        // Enregistrement dans PostgreSQL
        const result = await pool.query(
            'INSERT INTO contacts (nom, email, message) VALUES ($1, $2, $3) RETURNING *',
            [validatedData.nom, validatedData.email, validatedData.message]
        );

        console.log('Message enregistré :', result.rows[0]);

        res.status(201).json({ 
            status: 'success', 
            message: 'Message bien reçu. Merci !',
            data: result.rows[0]
        });
    } catch (error) {
        // Si la validation échoue
        if (error instanceof z.ZodError) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Données invalides', 
                errors: error.errors 
            });
        }
        // Si c'est une erreur de base de données
        console.error('Erreur base de données :', error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend Ma Garderie démarré sur le port ${PORT}`);
});
module.exports = app;