var tools = [
  { name: 'Git', use: 'Versionner le code et publier sur GitHub' },
  { name: 'Docker', use: 'Conteneuriser et servir le portfolio' },
  { name: 'Jenkins', use: "Serveur d'intégration continue" },
  { name: 'Kubernetes', use: 'Orchestrer des conteneurs' },
  { name: 'Ansible', use: 'Automatiser la configuration des serveurs' },
  { name: 'Terraform', use: "Décrire l'infrastructure en code" },
  { name: 'Argo CD', use: 'Déployer en GitOps sur Kubernetes' }
];

var projects = [
  { title: 'Serveur Ubuntu 26.04 sécurisé', description: 'VM VMware, accès SSH par clé avec passphrase, mot de passe désactivé.', tech: ['Ubuntu', 'SSH'], link: 'https://github.com/meryemelheni/cv-onepage' },
  { title: 'Nginx dans Docker', description: 'Conteneur nginx exposé sur un port et testé depuis la machine physique.', tech: ['Docker', 'Nginx'], link: 'https://github.com/meryemelheni/cv-onepage' },
  { title: 'Serveur Jenkins', description: 'Jenkins installé comme service systemd avec Java 21.', tech: ['Jenkins', 'Java'], link: 'https://github.com/meryemelheni/cv-onepage' },
  { title: 'DevSecOps Portfolio', description: 'Ce site, dockérisé avec Nginx et déployé avec Docker Compose.', tech: ['Docker Compose', 'JavaScript'], link: 'https://github.com/meryemelheni/cv-onepage' }
];

function card(title, text, extra) {
  var el = document.createElement('article');
  el.className = 'card';
  var h = document.createElement('h3');
  h.textContent = title;
  var p = document.createElement('p');
  p.textContent = text;
  el.appendChild(h);
  el.appendChild(p);
  if (extra) { el.appendChild(extra); }
  return el;
}

var toolsBox = document.getElementById('tools');
tools.forEach(function (t) { toolsBox.appendChild(card(t.name, t.use)); });

var projectBox = document.getElementById('project-list');
projects.forEach(function (p) {
  var foot = document.createElement('div');
  var tech = document.createElement('small');
  tech.textContent = p.tech.join(', ');
  var a = document.createElement('a');
  a.href = p.link;
  a.textContent = 'Voir le dépôt';
  foot.appendChild(tech);
  foot.appendChild(a);
  projectBox.appendChild(card(p.title, p.description, foot));
});
