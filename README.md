# Activité de démarrage : Ubuntu Server, SSH, Docker, Jenkins, Git et Vagrant

Ce dépôt contient le DevSecOps Portfolio (HTML5, CSS3, JavaScript) et le compte rendu du TP.
Pour chaque point : les commandes exécutées, des explications et les captures d'écran du dossier `cv-onepage/screenshots/`.

Dépôt GitHub : https://github.com/meryemelheni/cv-onepage
# Activité 1 : Ubuntu Server, SSH, Docker, Jenkins, Git et Vagrant
## Environnement

| Élément | Valeur |
|---|---|
| Machine physique | Windows, PowerShell, VS Code, Chrome |
| Hyperviseur | VMware Workstation Pro |
| Système invité | Ubuntu Server 26.04 LTS |
| Ressources de la VM | 2 CPU, 6 Go de RAM, disque de 25 Go |
| Réseau de la VM | NAT, adresse `192.168.65.132` |
| Utilisateur de la VM | `meryem` |

## 1. Ubuntu Server 26.04 et accès SSH sécurisé

La VM est créée avec l'ISO `ubuntu-26.04-live-server-amd64.iso`. L'option « Install OpenSSH server » est cochée pendant l'installation.

Vérification du service dans la VM :

```bash
ip a
systemctl status ssh --no-pager
```

![Service SSH actif](cv-onepage/screenshots/01-ssh-status.png)

Sécurisation : la connexion se fait par clé uniquement. Le mot de passe et la connexion en root sont désactivés.

```bash
sudo nano /etc/ssh/sshd_config.d/01-hardening.conf
```

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart ssh
sudo sshd -T | grep -i passwordauthentication
```

Résultat : `passwordauthentication no`. Le fichier porte le préfixe `01-` pour être lu avant les autres fichiers de configuration.

## 2. Test de l'accès SSH depuis la machine physique

Création d'une clé dédiée, protégée par une passphrase, et copie de la clé publique dans la VM :

```powershell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\id_tp_docker
type $env:USERPROFILE\.ssh\id_tp_docker.pub | ssh -o PubkeyAuthentication=no meryem@192.168.65.132 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && tr -d '\r' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Fichier `~/.ssh/config` sur Windows, pour utiliser cette clé avec la VM :

```
Host 192.168.65.132
    IdentityFile ~/.ssh/id_tp_docker
    IdentitiesOnly yes
    ServerAliveInterval 30
```

Connexion par clé :

```powershell
ssh meryem@192.168.65.132
```

![Connexion SSH par clé](cv-onepage/screenshots/02-ssh-connexion-cle.png)

Test du refus du mot de passe :

```powershell
ssh -o PubkeyAuthentication=no meryem@192.168.65.132
```

Résultat : `Permission denied (publickey)`.

![Mot de passe refusé](cv-onepage/screenshots/03-mot-de-passe-refuse.png)

## 3. Installation de Docker sur la VM

Installation depuis le dépôt officiel de Docker :

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Vérification et utilisation sans `sudo` :

```bash
sudo systemctl status docker
sudo usermod -aG docker $USER
docker --version
docker run hello-world
```

![Docker hello-world](cv-onepage/screenshots/04-docker-hello-world.png)

Test avec un serveur web nginx, ouvert depuis Windows sur `http://192.168.65.132` :

```bash
docker run -d -p 80:80 --name web nginx
docker ps
docker stop web && docker rm web
```

![docker ps avec nginx](cv-onepage/screenshots/05b-nginx-docker-ps.png)

![Page nginx](cv-onepage/screenshots/05-nginx.png)

## 4. Installation de Jenkins comme service

```bash
sudo apt install -y fontconfig openjdk-21-jre-headless
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
sudo systemctl enable --now jenkins
systemctl status jenkins --no-pager
```

Le service est `active (running)` et `enabled`, donc il démarre avec la VM.

![Service Jenkins](cv-onepage/screenshots/06-jenkins-status.png)

Tableau de bord ouvert depuis la machine physique sur `http://192.168.65.132:8080` :

![Tableau de bord Jenkins](cv-onepage/screenshots/07-jenkins-dashboard.png)

## 5. CV One Page avec Git

Le CV (`index.html`, `style.css`, `script.js`) est géré avec Git :

```powershell
git init
git add .
git commit -m "Premier commit : CV one page"
git branch -M main
```

![CV dans le navigateur](cv-onepage/screenshots/08-cv-navigateur.png)

## 6. Push GitHub via SSH

Création d'une clé dédiée à GitHub et copie de la clé publique :

```powershell
ssh-keygen -t ed25519 -C "elhenimeryem12@gmail.com" -f $env:USERPROFILE\.ssh\id_github
Get-Content $env:USERPROFILE\.ssh\id_github.pub | Set-Clipboard
```

Ajout de la clé publique dans GitHub : **Settings > SSH and GPG keys > New SSH key**.

![Clé SSH dans GitHub](cv-onepage/screenshots/09-github-cle-ssh.png)

Bloc ajouté au fichier `~/.ssh/config` :

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_github
    IdentitiesOnly yes
```

Test de l'authentification :

```powershell
ssh -T git@github.com
```

![ssh -T git@github.com](cv-onepage/screenshots/10-ssh-t-github.png)

Configuration du dépôt local pour utiliser SSH, puis envoi du code :

```powershell
git remote add origin git@github.com:meryemelheni/cv-onepage.git
git remote -v
git push -u origin main
```

![git remote -v](cv-onepage/screenshots/13-git-remote.png)

![git push](cv-onepage/screenshots/11-git-push.png)

![Dépôt en ligne](cv-onepage/screenshots/12-depot-github.png)

## 7. Évolution vers un DevSecOps Portfolio

Le CV est devenu une petite application web d'une page, avec les sections **About, Skills, DevSecOps Skills, Projects, Experience et Contact**.

Principales améliorations :

- une barre de navigation fixe, avec un lien vers chaque section ;
- six sections au lieu d'une page de présentation unique ;
- des cartes (grille responsive) pour les outils et les projets ;
- une frise chronologique pour l'expérience ;
- les données des outils et des projets séparées de la mise en page, dans des tableaux JavaScript ;
- un projet prêt à être conteneurisé (`Dockerfile` et `docker-compose.yml`).

![Portfolio DevSecOps](cv-onepage/screenshots/14-portfolio-complet.png)

## 8. Section DevSecOps Skills

La section affiche les technologies du projet : Git, Docker, Jenkins, Kubernetes, Ansible, Terraform et Argo CD. Chaque carte indique le rôle de l'outil. Elle se trouve au milieu de la capture ci-dessous, sous la section Skills.

![Section DevSecOps Skills](cv-onepage/screenshots/14-portfolio-complet.png)

## 9. Section Projects générée en JavaScript

Les projets sont décrits dans un tableau d'objets. Le script parcourt ce tableau et crée une carte par objet. Ajouter un projet revient à ajouter un objet au tableau, sans toucher au HTML.

Extrait de `script.js` :

```javascript
var projects = [
  { title: 'Serveur Ubuntu 26.04 sécurisé', description: 'VM VMware, accès SSH par clé avec passphrase, mot de passe désactivé.', tech: ['Ubuntu', 'SSH'], link: 'https://github.com/meryemelheni/cv-onepage' },
  { title: 'Nginx dans Docker', description: 'Conteneur nginx exposé sur un port et testé depuis la machine physique.', tech: ['Docker', 'Nginx'], link: 'https://github.com/meryemelheni/cv-onepage' },
  { title: 'Serveur Jenkins', description: 'Jenkins installé comme service systemd avec Java 21.', tech: ['Jenkins', 'Java'], link: 'https://github.com/meryemelheni/cv-onepage' },
  { title: 'DevSecOps Portfolio', description: 'Ce site, dockérisé avec Nginx et déployé avec Docker Compose.', tech: ['Docker Compose', 'JavaScript'], link: 'https://github.com/meryemelheni/cv-onepage' }
];

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
```

Résultat dans le navigateur :

![Projects générés dynamiquement](cv-onepage/screenshots/16-projects-dynamiques.png)

## 10. Dockerfile

```dockerfile
FROM nginx:alpine
COPY index.html style.css script.js /usr/share/nginx/html/
EXPOSE 80
```

- `FROM nginx:alpine` : image de départ légère, Nginx sur Alpine Linux.
- `COPY` : copie des trois fichiers du portfolio dans le dossier servi par Nginx.
- `EXPOSE 80` : indique le port d'écoute. La publication vers la VM se fait avec `-p` ou avec Docker Compose.

Aucune commande de démarrage n'est nécessaire : l'image `nginx` lance déjà Nginx.

## 11. Construction de l'image `cv-docker`

```bash
git clone https://github.com/meryemelheni/cv-onepage.git
cd cv-onepage/cv-onepage
docker build -t cv-docker .
docker images cv-docker
```

![docker build](cv-onepage/screenshots/17-docker-build.png)

![docker images](cv-onepage/screenshots/17b-docker-images.png)

## 12. Exécution d'un conteneur

```bash
docker run -d --name cv-docker -p 8081:80 cv-docker
docker ps
```

```
CONTAINER ID   IMAGE       COMMAND                  CREATED                  STATUS                  PORTS                                     NAMES
d7180b4acf85   cv-docker   "/docker-entrypoint.…"   Less than a second ago   Up Less than a second   0.0.0.0:8081->80/tcp, [::]:8081->80/tcp   cv-docker
```

![docker run et docker ps](cv-onepage/screenshots/18-docker-run.png)

Accès depuis la machine physique sur `http://192.168.65.132:8081` :

![Portfolio sur le port 8081](cv-onepage/screenshots/18b-docker-run-navigateur.png)

## 13. Déploiement avec Docker Compose

Contenu de `docker-compose.yml` :

```yaml
services:
  portfolio:
    build: .
    image: cv-docker
    container_name: portfolio
    ports:
      - "8082:80"
    restart: unless-stopped
```

Le conteneur précédent est supprimé avant (`docker stop cv-docker && docker rm cv-docker`).

```bash
docker compose up -d
docker compose ps
```

```
NAME        IMAGE       COMMAND                  SERVICE     CREATED         STATUS                  PORTS
portfolio   cv-docker   "/docker-entrypoint.…"   portfolio   1 second ago    Up Less than a second   0.0.0.0:8082->80/tcp, [::]:8082->80/tcp
```

![docker compose up et ps](cv-onepage/screenshots/19-docker-compose.png)

Accès depuis la machine physique sur `http://192.168.65.132:8082` :

![Portfolio sur le port 8082](cv-onepage/screenshots/19b-docker-compose-navigateur.png)

## 14. Publication sur GitHub via SSH

Commandes Git utilisées, depuis Windows, avec la clé `id_github` :

```powershell
git add .
git commit -m "Portfolio DevSecOps, Dockerfile et docker-compose"
git push
git remote -v
```

`git remote -v` confirme que le dépôt utilise SSH (`git@github.com:meryemelheni/cv-onepage.git`). Tous les fichiers du projet sont dans le dossier `cv-onepage` du dépôt.

Lien du dépôt GitHub mis à jour : https://github.com/meryemelheni/cv-onepage

## 15. Vagrant : création automatique d'une VM Ubuntu Server

### Vérification des ressources

Avant de créer une VM dans la VM, vérification de la mémoire, du processeur et de l'espace disque :

```bash
df -h /
free -h
nproc
```

![Ressources de la VM](cv-onepage/screenshots/20-ressources-vm.png)

Le disque `/` ne faisait que 12 Go. Le groupe de volumes avait 11,5 Go libres, que j'ai ajoutés au volume logique :

```bash
sudo vgs
sudo lvextend -r -l +100%FREE /dev/mapper/ubuntu--vg-ubuntu--lv
df -h /
```

![Disque agrandi](cv-onepage/screenshots/21-disque-agrandi.png)

### Virtualisation imbriquée

Vagrant crée une VM dans la VM VMware. Il faut donc exposer la virtualisation du processeur :

- sous VMware, **Settings > Processors > Virtualize Intel VT-x/EPT or AMD-V/RVI** ;
- sous Windows, le lancement de l'hyperviseur a été désactivé : `bcdedit /set hypervisorlaunchtype off`, puis redémarrage.

Vérification dans la VM (résultat supérieur à 0) :

```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
```

![Virtualisation imbriquée](cv-onepage/screenshots/22-virtualisation-imbriquee.png)

### Installation de KVM et libvirt

Vagrant a besoin d'un fournisseur de machines virtuelles. J'ai choisi KVM/libvirt, intégré au noyau Linux :

```bash
sudo apt install -y qemu-system-x86 libvirt-daemon-system libvirt-clients libvirt-dev cpu-checker build-essential ruby-dev libxml2-dev libxslt1-dev zlib1g-dev pkg-config
sudo adduser meryem libvirt
sudo adduser meryem kvm
kvm-ok
```

![kvm-ok](cv-onepage/screenshots/23-kvm-ok.png)

### Installation de Vagrant

HashiCorp ne publie pas encore de paquets pour la version 26.04 : le dépôt `noble` (24.04) est utilisé.

```bash
wget -O - https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com noble main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update
sudo apt install -y vagrant
vagrant --version
vagrant plugin install vagrant-libvirt
```

![Version de Vagrant](cv-onepage/screenshots/24-vagrant-version.png)

### Vagrantfile

```ruby
Vagrant.configure("2") do |config|
  config.vm.box = "generic/ubuntu2204"
  config.vm.hostname = "vagrant-ubuntu"
  config.vm.synced_folder ".", "/vagrant", disabled: true

  config.vm.provider :libvirt do |lv|
    lv.memory = 1024
    lv.cpus = 1
  end
end
```

Le fichier décrit une VM Ubuntu Server 22.04 avec 1 Go de RAM et 1 processeur. Le dossier partagé est désactivé pour éviter une configuration réseau supplémentaire avec libvirt.

### Création de la VM

La commande est lancée dans une session `tmux`, pour qu'une coupure de la connexion SSH n'interrompe pas le téléchargement de la box :

```bash
tmux new -s vagrant
cd ~/vagrant-ubuntu
vagrant up --provider=libvirt
```

![vagrant up](cv-onepage/screenshots/25-vagrant-up.png)

## 16. Connexion avec `vagrant ssh`

Depuis la VM, connexion à la VM créée par Vagrant :

```bash
cd ~/vagrant-ubuntu
vagrant status
vagrant ssh
```

![vagrant ssh](cv-onepage/screenshots/26-vagrant-ssh.png)

### Comparaison avec la création manuelle

| Critère | Création manuelle (VMware) | Vagrant |
|---|---|---|
| Procédure | assistant graphique, installeur Ubuntu, réponses à chaque écran | un fichier `Vagrantfile` et la commande `vagrant up` |
| Reproductibilité | difficile : les réglages dépendent de ce qu'on clique | identique à chaque exécution |
| Durée | longue, avec de nombreuses étapes à la main | rapide une fois la box téléchargée |
| Traçabilité | aucune trace des choix | le `Vagrantfile` se versionne avec Git |
| Accès | clé SSH à configurer à la main | `vagrant ssh`, clé générée automatiquement |
| Suppression et recréation | longues | `vagrant destroy` puis `vagrant up` |
| Prérequis | un hyperviseur | un hyperviseur, un fournisseur, une box et la virtualisation imbriquée |
| Contrôle | total, avec interface graphique | limité à ce que décrit le fichier |

La création manuelle aide à comprendre chaque étape de l'installation. Vagrant convient mieux dès qu'il faut recréer la même machine plusieurs fois, la partager ou l'inclure dans un projet géré avec Git.

# Activité 2 : Migration Next.js et Premier Pipeline Jenkins
## 18. Migration vers Next.js

Le portfolio a été migré vers une application Next.js 16 (App Router), en conservant le design et les sections de la version HTML/CSS/JS.

Commande de création du projet (exécutée dans le dossier `cv-onepage/cv-onepage`) :
npx create-next-app@latest portfolio-nextjs --js --app --no-tailwind --no-src-dir --use-npm --disable-git

Capture de l'application Next.js en local :
![Application Next.js](cv-onepage/screenshots/a2-18-accueil.png)

## 19. Composants réutilisables

Les principales parties du portfolio ont été découpées en composants React dans le dossier `components/`.
Structure des composants :
- `Header.js` : barre de navigation
- `About.js` : section de présentation
- `Skills.js` : compétences techniques et DevSecOps
- `Projects.js` : liste des projets
- `Experience.js` : frise chronologique
- `Contact.js` : coordonnées
- `Footer.js` : pied de page

Capture de la structure :
![Structure des composants](cv-onepage/screenshots/a2-19-composants.png)

## 20. Fichiers de données

Les informations des projets et des compétences ont été extraites dans des fichiers séparés dans le dossier `data/` (`projects.js` et `skills.js`). Cela permet de modifier le contenu sans toucher aux composants.

Exemple de données utilisées (`data/projects.js`) :
{
  slug: 'serveur-ubuntu-securise',
  title: 'Serveur Ubuntu 26.04 sécurisé',
  description: 'VM VMware, accès SSH par clé avec passphrase, mot de passe désactivé.',
  tech: ['Ubuntu', 'SSH'],
  details: [
    'Installation d\'Ubuntu Server 26.04 sous VMware.',
    'Connexion par clé uniquement, mot de passe et root désactivés.',
    'Test depuis la machine physique avec une clé protégée par passphrase.'
  ],
  link: 'https://github.com/meryemelheni/cv-onepage'
}

Capture du fichier de données :
![Fichier de données](cv-onepage/screenshots/a2-20-donnees.png)

## 21. Pages dédiées aux projets

Une page listant tous les projets et une page de détail par projet ont été ajoutées. La génération des pages de détail utilise `generateStaticParams`.

- `/projects` : liste des projets
- `/projects/[slug]` : détail d'un projet (ex: `/projects/serveur-ubuntu-securise`)

Capture de la page `/projects` :
![Page Projets](cv-onepage/screenshots/a2-21-projets.png)

Capture de la page de détail d'un projet :
![Détail d'un projet](cv-onepage/screenshots/a2-21-detail-projet.png)

## 22. Premier pipeline Jenkins

Un job Jenkins de type "Pipeline script from SCM" a été créé. Il récupère automatiquement le dépôt GitHub `cv-onepage`, puis exécute le fichier `Jenkinsfile` situé dans `cv-onepage/portfolio-nextjs/`.

Contenu du `Jenkinsfile` :
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Récupération du code source depuis GitHub...'
                checkout scm
            }
        }
        
        stage('Install') {
            steps {
                echo 'Installation des dépendances Next.js...'
                dir('cv-onepage/portfolio-nextjs') {
                    sh 'npm ci'
                }
            }
        }
        
        stage('Build') {
            steps {
                echo 'Construction de l\'application Next.js...'
                dir('cv-onepage/portfolio-nextjs') {
                    sh 'npm run build'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline terminé.'
        }
    }
}

Capture du pipeline exécuté avec succès :
![Pipeline Jenkins](cv-onepage/screenshots/a2-22-pipeline.png)

## 23. Installation des dépendances (Stage Install)

Le pipeline contient une étape `Install` qui exécute `npm ci` dans le dossier du projet Next.js. Cette commande installe les dépendances exactes listées dans le fichier `package-lock.json`, garantissant un build reproductible.

Capture du stage Install :
![Stage Install](cv-onepage/screenshots/a2-23-install.png)

## 24. Construction de l'application (Stage Build)

L'étape `Build` exécute `npm run build`. Next.js compile l'application en mode production et génère les pages statiques, y compris les pages de détail des projets grâce à `generateStaticParams`.

Capture du résultat du build :
![Stage Build](cv-onepage/screenshots/a2-24-build.png)

# Activité 3 : Ansible, API Express et Dockerisation
## 25. Installation d'Ansible sur une VM d'administration

Ansible a été installé sur la VM Vagrant (`vagrant-ubuntu`), qui sert de machine d'administration. L'installation s'est faite via `pip` pour avoir une version récente compatible avec Python 3.12.

Commandes :
sudo apt update
sudo apt install -y python3-pip
pip3 install --user ansible

## 26. Fichier inventory et test de communication

Le fichier `inventory` contient l'adresse de la VM cible (`ubuntuserver`) :

Fichier inventory :
[serveurs]
ubuntuserver ansible_host=192.168.65.132 ansible_user=meryem ansible_ssh_private_key_file=/home/vagrant/.ssh/id_ansible

Test de communication :
ansible all -m ping -i inventory

Résultat : SUCCESS avec "ping": "pong".

![Test Ansible ping](cv-onepage/screenshots/a3-27-playbook-curl.png)

## 27. Premier playbook Ansible (installation de curl)

Le playbook `install_curl.yml` installe le package `curl`.

Exécution du playbook :
ansible-playbook -i inventory install_curl.yml

![Playbook curl](cv-onepage/screenshots/a3-27-playbook-curl.png)

## 28. Playbook Ansible pour installer Docker

Le playbook `install_docker.yml` installe Docker et ses dépendances.

Résultat après exécution :
docker --version
Docker version 29.8.1, build 4a63305

![Playbook Docker](cv-onepage/screenshots/a3-28-playbook-docker.png)

## 29. Création de l'API Node.js / Express

L'API se trouve dans le dossier `api/`. Structure :
- `api/server.js` : serveur Express
- `api/package.json` : dépendances (`express`, `cors`)

Lancement : node server.js

![API démarrée](cv-onepage/screenshots/a3-29-api-demarree.png)
![Structure API](cv-onepage/screenshots/a3-29-structure-api.png)

## 30. Route GET /api/health

Retourne l'état de l'API :
{"status":"OK","message":"L'API fonctionne correctement"}

![Health](cv-onepage/screenshots/a3-30-api-health.png)

## 31. Route GET /api/profile

Retourne les informations du portfolio :
![Profile](cv-onepage/screenshots/a3-31-api-profile.png)

## 32. Route GET /api/projects

Retourne la liste des projets :
![Projects](cv-onepage/screenshots/a3-32-api-projects.png)

## 33. Route GET /api/skills

Retourne la liste des compétences :
![Skills](cv-onepage/screenshots/a3-33-api-skills.png)

## 34. Frontend Next.js connecté à l'API (Projets)

Le composant `components/Projects.js` a été modifié pour récupérer les projets depuis l'API Express via `fetch()`.

![Frontend connecté à l'API](cv-onepage/screenshots/a3-34-35-frontend-api.png)

## 35. Frontend Next.js connecté à l'API (Compétences)

Même principe pour le composant `components/Skills.js`. Les données viennent désormais de l'API.

## 36. Variable d'environnement API_URL

L'URL de l'API est configurée via la variable `API_URL` (dans `.env.local`). Il ne faut pas la coder en dur car elle change entre le développement local (`http://localhost:3001`) et la production (`http://api:3001` dans Docker). Cela permet de déployer la même application dans différents environnements sans modifier le code.

## 37. Fichier .env.example

Contenu :
API_URL=http://localhost:3001

## 38. Dockerfile pour le frontend Next.js

Le `Dockerfile` utilise une construction multi-stage pour optimiser l'image. Il compile le code avec Node.js puis copie le résultat dans une image légère.

## 39. Dockerfile pour l'API Express

Le `Dockerfile` de l'API installe les dépendances de production et lance `node server.js`.

## 40. Construction des images Docker

Commande utilisée :
docker compose -f docker-compose.activite3.yml build

![Build des images](cv-onepage/screenshots/a3-40-docker-images.png)

## 41. Fichier Docker Compose (Frontend + API)

Le fichier `docker-compose.activite3.yml` déclare les deux services. Le frontend utilise la variable `API_URL=http://api:3001` pour communiquer avec l'API via le réseau Docker.

Lancement et vérification :
docker compose -f docker-compose.activite3.yml up -d
docker compose -f docker-compose.activite3.yml ps

![Docker compose up](cv-onepage/screenshots/a3-41-docker-compose-up.png)
![Docker compose ps](cv-onepage/screenshots/a3-41-docker-compose-ps.png)

## 42. Communication Frontend / API via Docker Compose

Le frontend communique avec l'API à travers le réseau Docker Compose (en utilisant le nom de service `api`). Le portfolio affiche les données fournies par l'API.


![Portfolio avec Docker Compose](screenshots/a3-42-portfolio-compose.png)


# Activité 4 : Vagrant, Ansible, Sécurité API et DevSecOps

## 12. Sécurité de l'API (OWASP API Security Top 10)

| Risque OWASP | Description | Mesure mise en place |
|---|---|---|
| API1: Broken Object Level Authorization | Accès non autorisé aux objets | Aucune donnée sensible exposée sans authentification (routes publiques uniquement en lecture) |
| API2: Broken Authentication | Authentification faible | Non applicable (pas d'authentification pour l'instant, API publique) |
| API3: Broken Object Property Level Authorization | Exposition de propriétés sensibles | Validation stricte avec Zod (seuls les champs nom, email, message sont acceptés) |
| API4: Unrestricted Resource Consumption | Absence de limite de requêtes | Rate limiting configuré sur `POST /api/contact` (5 requêtes / 15 min) |
| API5: Broken Function Level Authorization | Accès à des fonctions d'administration | Non applicable (pas de fonction admin) |
| API6: Unrestricted Access to Sensitive Business Flows | Automatisation abusive | Rate limiting sur les routes sensibles |
| API7: Server Side Request Forgery | Requêtes forgées côté serveur | Aucune URL fournie par l'utilisateur n'est appelée par le serveur |
| API8: Security Misconfiguration | Mauvaise configuration | Helmet configuré pour ajouter les headers de sécurité HTTP |
| API9: Improper Inventory Management | Inventaire incomplet | API versionnée (`/api/...`) et documentée dans le README |
| API10: Unsafe Consumption of APIs | Consommation non sécurisée d'API tierces | Aucune API tierce consommée pour l'instant |

![Portfolio avec Docker Compose](cv-onepage/screenshots/a3-42-portfolio-compose.png)
