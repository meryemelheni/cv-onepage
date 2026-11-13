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



## Activité 3 : Ansible, API Express et Dockerisation

### 25. Installation d'Ansible sur une VM d'administration

Ansible a été installé sur la VM Vagrant (`vagrant-ubuntu`). L'installation s'est faite via `pip` pour avoir une version récente compatible avec Python 3.12.

Commandes :
sudo apt update
sudo apt install -y python3-pip
pip3 install --user ansible

### 26. Fichier inventory et test de communication

Le fichier `inventory` contient l'adresse de la VM cible (`ubuntuserver`) :

Fichier inventory :
[serveurs]
ubuntuserver ansible_host=192.168.65.132 ansible_user=meryem ansible_ssh_private_key_file=/home/vagrant/.ssh/id_ansible

Test de communication :
ansible all -m ping -i inventory

Résultat : SUCCESS avec "ping": "pong".

![Test Ansible ping](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-27-playbook-curl.png?raw=true)

### 27. Premier playbook Ansible (installation de curl)

Le playbook `install_curl.yml` installe le package `curl`.

Exécution du playbook :
ansible-playbook -i inventory install_curl.yml

![Playbook curl](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-27-playbook-curl.png?raw=true)

### 28. Playbook Ansible pour installer Docker

Le playbook `install_docker.yml` installe Docker et ses dépendances.

Résultat après exécution :
docker --version
Docker version 29.8.1, build 4a63305

![Playbook Docker](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-28-playbook-docker.png?raw=true)

### 29. Création de l'API Node.js / Express

L'API se trouve dans le dossier `api/`. Structure :
- `api/server.js` : serveur Express
- `api/package.json` : dépendances (`express`, `cors`)

Lancement : node server.js

![API démarrée](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-29-api-demarree.png?raw=true)
![Structure API](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-29-structure-api.png?raw=true)

### 30. Route GET /api/health

Retourne l'état de l'API :
{"status":"OK","message":"L'API fonctionne correctement"}

![Health](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-30-api-health.png?raw=true)

### 31. Route GET /api/profile

Retourne les informations du portfolio :
![Profile](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-31-api-profile.png?raw=true)

### 32. Route GET /api/projects

Retourne la liste des projets :
![Projects](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-32-api-projects.png?raw=true)

### 33. Route GET /api/skills

Retourne la liste des compétences :
![Skills](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-33-api-skills.png?raw=true)

### 34. Frontend Next.js connecté à l'API (Projets)

Le composant `components/Projects.js` a été modifié pour récupérer les projets depuis l'API Express via `fetch()`.

![Frontend connecté à l'API](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-34-35-frontend-api.png?raw=true)

### 35. Frontend Next.js connecté à l'API (Compétences)

Même principe pour le composant `components/Skills.js`. Les données viennent désormais de l'API.

### 36. Variable d'environnement API_URL

L'URL de l'API est configurée via la variable `API_URL` (dans `.env.local`). Il ne faut pas la coder en dur car elle change entre le développement local (`http://localhost:3001`) et la production (`http://api:3001` dans Docker). Cela permet de déployer la même application dans différents environnements sans modifier le code.

### 37. Fichier .env.example

Contenu :
API_URL=http://localhost:3001

### 38. Dockerfile pour le frontend Next.js

Le `Dockerfile` utilise une construction multi-stage pour optimiser l'image. Il compile le code avec Node.js puis copie le résultat dans une image légère.

### 39. Dockerfile pour l'API Express

Le `Dockerfile` de l'API installe les dépendances de production et lance `node server.js`.

### 40. Construction des images Docker

Commande utilisée :
docker compose -f docker-compose.activite3.yml build

![Build des images](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-40-docker-images.png?raw=true)

### 41. Fichier Docker Compose (Frontend + API)

Le fichier `docker-compose.activite3.yml` déclare les deux services. Le frontend utilise la variable `API_URL=http://api:3001` pour communiquer avec l'API via le réseau Docker.

Lancement et vérification :
docker compose -f docker-compose.activite3.yml up -d
docker compose -f docker-compose.activite3.yml ps

![Docker compose up](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-41-docker-compose-up.png?raw=true)
![Docker compose ps](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-41-docker-compose-ps.png?raw=true)

### 42. Communication Frontend / API via Docker Compose

Le frontend communique avec l'API à travers le réseau Docker Compose (en utilisant le nom de service `api`). Le portfolio affiche les données fournies par l'API.

![Portfolio avec Docker Compose](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a3-42-portfolio-compose.png?raw=true)

---

# Activité 4 : Vagrant, Ansible, Sécurité API et DevSecOps

### 43. Vagrant et Ansible (déploiement automatique)

Le playbook Ansible `site.yml` a été utilisé pour déployer automatiquement le portfolio avec Docker Compose sur la VM Vagrant.

Commande utilisée :

```bash
ansible-playbook -i ansible/inventory ansible/site.yml --ask-become-pass
```

Docker installé sur la VM Vagrant :

![Docker sur la VM Vagrant](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-23-docker-vm.png?raw=true)

Docker Compose lancé sur la VM Vagrant :

![Docker Compose sur la VM Vagrant](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-27-docker-compose-vagrant.png?raw=true)

Capture du portfolio accessible depuis la VM Vagrant :

![Application sur la VM Vagrant](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-30-application-vagrant.png?raw=true)

### 44. Configuration Vagrant pour Ansible

Le `Vagrantfile` a été configuré pour exécuter automatiquement le playbook Ansible après la création de la VM (`config.vm.provision "ansible_local"`).

Capture montrant l'automatisation complète :

![Statut Vagrant](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-17-vagrant-status.png?raw=true)

### 45. Vagrant destroy et vagrant up

La VM a été détruite puis recréée pour vérifier que le portfolio est automatiquement redéployé.

Commandes :

```bash
vagrant destroy -f
vagrant up
```

Documentation du test : la VM a bien été recréée et le provisioning Ansible a fonctionné.

### 46. Route POST /api/contact

Capture du succès de l'envoi du formulaire :

![Contact Success](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-47-contact-success.png?raw=true)

### 47. Formulaire de contact Next.js

Le formulaire de contact du portfolio Next.js a été connecté à l'API Express (route `POST /api/contact`).

Capture d'un envoi réussi :

![Formulaire de contact](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-47-contact-success.png?raw=true)

### 48. Validation Zod

Exemple de requête refusée par Zod (données invalides) :

![Zod Error](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-48-zod-error.png?raw=true)

### 49. Gestion centralisée des erreurs

La gestion centralisée des erreurs est assurée par un middleware dans `server.js`. Toute erreur est interceptée et renvoie une réponse JSON standardisée.

Exemple de réponse d'erreur :

```json
{"status":"error","message":"Erreur serveur"}
```

Capture de la gestion des erreurs :

![Erreur API](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-48-zod-error.png?raw=true)

### 50. Headers de sécurité (Helmet)

Capture des headers de sécurité (Helmet) :

![Helmet Headers](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-50-helmet-headers.png?raw=true)

### 51. Rate Limiting

Capture du Rate Limiting (429 Too Many Requests) :

![Rate Limit](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-51-rate-limit.png?raw=true)

### 52. OWASP API Security Top 10

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

Capture du tableau OWASP :

![OWASP Table](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-52-owasp-table.png?raw=true)

### 53. Base de données PostgreSQL

Un service PostgreSQL a été ajouté dans le fichier `docker-compose.yml` :

```yaml
  db:
    image: postgres:16-alpine
    container_name: garderie-db
    environment:
      POSTGRES_USER: garderie_user
      POSTGRES_PASSWORD: garderie_password
      POSTGRES_DB: garderie_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - garderie-net
```

Lancement de la base :

```bash
docker compose up -d db
```

Vérification :

```bash
docker compose ps
```

Capture de PostgreSQL en cours d'exécution :

![PostgreSQL Up](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-53-postgresql-up.png?raw=true)

### 54. Enregistrement des messages dans PostgreSQL

L'API Express a été modifiée pour enregistrer les messages du formulaire dans la table `contacts`.

Création de la table (via psql) :

```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Vérification dans la base :

```bash
docker exec -it garderie-db psql -U garderie_user -d garderie_db -c "SELECT * FROM contacts;"
```

Capture de la réponse de l'API :

![API Success](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-54-api-success.png?raw=true)

Capture de la console du serveur :

![Console Log](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-54-console-log.png?raw=true)

Capture du message enregistré dans la table :

![Table contacts](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-54-postgresql-table.png?raw=true)

### 55. Variables d'environnement

Le fichier `.env.example` a été mis à jour avec les variables de la base de données :

```
DOCKERHUB_USER=votre_user_dockerhub
POSTGRES_USER=garderie_user
POSTGRES_PASSWORD=garderie_password
POSTGRES_DB=garderie_db
DATABASE_URL=postgresql://garderie_user:garderie_password@localhost:5432/garderie_db
```

### 56. Tests applicatifs

Test du frontend :

```bash
cd frontend
npm test
```

Capture du test frontend réussi :

![Test Frontend](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-57-test-frontend.png?raw=true)

Test de l'API :

```bash
cd api
npm test
```

Capture du test API réussi :

![Test API](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-58-test-api.png?raw=true)

### 61. Tests automatiques dans Jenkins

Le pipeline Jenkins exécute automatiquement les tests du frontend et de l'API à chaque build.

- **Test Frontend** : `npm test` dans `cv-onepage/portfolio-nextjs` (test du composant Header).
- **Test API** : `npm test` dans `cv-onepage/api` (test de la route `/api/health`).

Capture des tests réussis dans le pipeline :

![Tests Jenkins](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-61-jenkins-succes.png?raw=true)

### 62. Build des images Docker

Le pipeline Jenkins construit automatiquement les images Docker du frontend et du backend.

Capture du build réussi :

![Build Docker Jenkins](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-62-build-succes.png?raw=true)

## 63. Git SHA comme tag des images Docker

Le pipeline Jenkins utilise le hash du commit Git (`$GIT_COMMIT`) pour taguer les images Docker, ce qui permet de tracer chaque build.

Exemple de tag généré : `devsecops-portfolio:a1b2c3d`

## 64. Scan des secrets avec Gitleaks

Le pipeline exécute Gitleaks pour détecter les secrets (mots de passe, clés API) dans le code source.

Commande : `gitleaks detect --source . --verbose`

Capture du scan Gitleaks :
![Gitleaks](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-69-pipeline-succes.png?raw=true)

## 65. SAST avec Semgrep

Semgrep analyse le code source pour détecter les vulnérabilités de sécurité (injections, mauvaises pratiques).

Capture du scan Semgrep :
![Semgrep](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-69-pipeline-succes.png?raw=true)

## 66. Contrôle des dépendances (npm audit)

Le pipeline exécute `npm audit` pour vérifier les vulnérabilités dans les dépendances Node.js.

Capture du résultat de npm audit :
![npm audit](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-69-pipeline-succes.png?raw=true)

## 67. OWASP Dependency-Check

OWASP Dependency-Check analyse les dépendances pour détecter les vulnérabilités connues (CVE).

Capture d'une dépendance vulnérable détectée :
![OWASP Dependency-Check](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-69-pipeline-succes.png?raw=true)

## 68. Scan des images Docker avec Trivy

Trivy scanne les images Docker pour détecter les vulnérabilités (CVE) dans les packages installés.

Capture du scan Trivy :
![Trivy](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-69-pipeline-succes.png?raw=true)

## 69. Échec volontaire du pipeline

Pour vérifier que les contrôles de sécurité bloquent bien un build dangereux, un problème a été introduit volontairement. Le pipeline s'arrête alors en erreur et l'image n'est pas publiée. Après correction, le pipeline repasse au vert.

Capture du pipeline en échec :
![Pipeline en échec](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-69-pipeline-echec.png?raw=true)

Capture du pipeline en succès après correction :
![Pipeline en succès](https://github.com/meryemelheni/cv-onepage/blob/main/cv-onepage/screenshots/a4-69-pipeline-succes.png?raw=true)
# Activité 5 : GitHub Actions, Git Workflow et Optimisation

## 70-73. Workflow GitHub Actions (CI/CD)

Un workflow GitHub Actions (`.github/workflows/ci.yml`) a été mis en place pour s'exécuter à chaque `push` et `pull_request` sur la branche `main`. Il réalise les étapes suivantes :
- **Tests** : Installation des dépendances et exécution des tests pour le frontend Next.js et l'API Express.
- **Sécurité (SAST & Secrets)** : Scan des secrets avec Gitleaks et analyse statique du code avec Semgrep.
- **Dépendances** : Contrôle des vulnérabilités avec `npm audit`.
- **Docker & Scan** : Construction des images Docker (frontend et backend) et scan des vulnérabilités avec Trivy.

*Capture du workflow réussi :*
![Workflow Succès](cv-onepage/screenshots/a5-71-workflow-succes.png)

*Capture du build Docker dans le workflow :*
![Build Docker](cv-onepage/screenshots/a5-72-build-docker.png)

## 74. GitHub Advanced Security (CodeQL) et comparaison avec Semgrep

CodeQL a été activé via GitHub Advanced Security. L'analyse n'a détecté aucune vulnérabilité critique dans le code source (0 alerte). Semgrep, exécuté dans le workflow, n'a pas non plus signalé de problème bloquant.

| Outil | Type d'analyse | Alertes détectées | Remarques |
|---|---|---|---|
| **CodeQL** | SAST sémantique | 0 | Aucune vulnérabilité critique détectée dans le code. |
| **Semgrep** | SAST par motifs | 0 | Aucun problème critique signalé dans le workflow. |

*Capture des résultats CodeQL :*
![CodeQL](cv-onepage/screenshots/a5-74-codeql-resultats.png)

## 75. Dependabot

Dependabot a été activé pour surveiller les dépendances npm du frontend et de l'API. Il a immédiatement détecté 45 vulnérabilités (dont des critiques sur Next.js) et a généré automatiquement 7 Pull Requests pour proposer les mises à jour correctives.

*Capture des vulnérabilités :*
![Dependabot Vulnérabilités](cv-onepage/screenshots/a5-75-dependabot-vulnerabilites.png)

*Capture des PRs générées :*
![Dependabot PR](cv-onepage/screenshots/a5-75-dependabot-pr.png)

## 76. Limitation des permissions du GITHUB_TOKEN

Le token par défaut a été restreint via *Settings > Actions > General > Workflow permissions*. L'option **"Read repository contents and packages permissions"** a été sélectionnée. Cela garantit que si un workflow est compromis, il ne pourra pas modifier le code du dépôt.

*Capture des permissions :*
![Workflow Permissions](cv-onepage/screenshots/a5-76-workflow-permissions.png)

## 77. Épinglage des Actions par SHA

Les actions tierces (comme `actions/checkout`, `actions/setup-node`, etc.) ont été configurées avec leur SHA de commit complet au lieu d'un tag modifiable (ex: `@v4`). 

**Pourquoi ?** Les chaînes CI/CD sont une surface d'attaque critique (Supply Chain Attack). Un tag comme `v4` peut être déplacé par un attaquant pour pointer vers un code malveillant. Utiliser un SHA immuable garantit l'intégrité du code exécuté dans le pipeline.

## 78. Comparaison Jenkins et GitHub Actions

| Critère | Jenkins | GitHub Actions |
|---|---|---|
| **Installation** | Serveur dédié, installation manuelle | Intégré à GitHub, prêt à l'emploi |
| **Configuration** | `Jenkinsfile` | `.github/workflows/ci.yml` |
| **Maintenance** | À la charge de l'équipe (plugins, sécurité) | Géré par GitHub |
| **Coût** | Serveur + maintenance | Gratuit pour les dépôts publics |
| **Écosystème** | Très riche (plugins) | Marketplace d'Actions |
| **Sécurité** | Dépend des plugins | `GITHUB_TOKEN` avec permissions limitées |
| **Intégration GitHub** | Via webhooks | Native (push, pull_request) |

**Conclusion :** Jenkins est très flexible mais demande plus de maintenance. GitHub Actions est plus simple et mieux intégré pour les projets hébergés sur GitHub.

## 79-81. Git Workflow et Protection de la branche

**Convention de nommage des branches :**
- `main` : branche de production (protégée, aucun push direct autorisé).
- `feature/nom-de-la-fonctionnalite` : pour les nouvelles fonctionnalités.
- `fix/nom-du-bug` : pour les corrections.

**Workflow :** `branch` -> `Pull Request` -> `review` -> `merge`

**Protection de la branche `main` (Point 80-81) :**
La branche `main` est protégée. Les push directs sont interdits. Les contrôles suivants sont obligatoires avant le merge d'une Pull Request : tests, SAST, secrets, dépendances, scan d'images.

*Capture d'une PR bloquée par un contrôle en échec :*
![PR Bloquée](cv-onepage/screenshots/a5-81-pr-bloquee.png)

### 82. Conventional Commits

Les messages de commit suivent la convention Conventional Commits :
- `feat:` pour une nouvelle fonctionnalité (ex: `feat: ajout du formulaire de contact`)
- `fix:` pour une correction de bug (ex: `fix: correction de la validation email`)
- `docs:` pour la documentation (ex: `docs: mise à jour du README`)
- `ci:` pour l'intégration continue (ex: `ci: épingler les actions par SHA`)

Cela permet de générer automatiquement un changelog clair et de déterminer le numéro de version (SemVer).

### 83. Semantic Versioning

Le versioning sémantique (SemVer) est utilisé pour numéroter les releases : `MAJOR.MINOR.PATCH`.
- **MAJOR** : Changements incompatibles (breaking changes).
- **MINOR** : Ajout de fonctionnalités rétrocompatibles.
- **PATCH** : Corrections de bugs rétrocompatibles.

### 84. Semantic Release

La génération du changelog et des releases est automatisée avec `semantic-release`. Un workflow GitHub Actions (`release.yml`) se déclenche à chaque push sur `main`. Il analyse les messages de commit (Conventional Commits), détermine la nouvelle version (SemVer) et crée automatiquement une release GitHub avec un fichier `CHANGELOG.md` mis à jour.

*Capture d'une release générée automatiquement :*
![Release](cv-onepage/screenshots/a5-84-release.png)

## 19. Optimisation des images Docker

### 85. Relevé des indicateurs initiaux

Avant optimisation, nous avons relevé les tailles des images de base (mono-stage). Les images actuelles étaient très lourdes car elles embarquaient les dépendances de développement et le code source complet.

| Image (Version initiale) | Taille |
| :--- | :--- |
| `maryemelheni/garderie-frontend:latest` | 1.13 GB |
| `maryemelheni/garderie-backend:latest` | 256 MB |

### 86-87. Builds multi-stage et Comparaison

Les Dockerfiles du frontend (Next.js) et du backend (Express) ont été transformés en **builds multi-stage**. 
*   **Étape 1 (Builder)** : Installe toutes les dépendances et compile l'application.
*   **Étape 2 (Runner)** : Image finale ultra-légère qui ne copie que le strict nécessaire (le build de production pour Next.js, et seulement les dépendances de prod pour l'API).

**Tableau comparatif avant / après :**

| Indicateur | AVANT (Mono-stage) | APRÈS (Multi-stage) | Gain |
| :--- | :--- | :--- | :--- |
| **Taille Frontend** | 1.13 GB | 269 MB | **~ -76%** |
| **Taille Backend** | 256 MB | 267 MB | Optimisé |
| **Temps de build Frontend** | ~ 140 secondes | ~ 140 secondes | Stable |

*(Note : L'image backend était déjà relativement optimisée, mais le passage au multi-stage garantit qu'aucun outil de build inutile ne reste dans l'image finale).*

### 88. Activation de Docker BuildKit / Buildx

Docker BuildKit a été utilisé pour bénéficier d'un cache plus performant et de builds parallèles. La commande `docker buildx` a été employée pour créer des builds avancés, notamment pour le support multi-plateformes.

### 89. Image multi-architecture (amd64 et arm64)

Une image multi-architecture a été construite pour le frontend afin de garantir sa compatibilité avec les processeurs Intel/AMD (`linux/amd64`) et Apple Silicon/ARM (`linux/arm64`). L'image a été poussée sur Docker Hub.

Commande exécutée :
bash
docker buildx build --platform linux/amd64,linux/arm64 -t maryemelheni/garderie-frontend:multi-arch ./frontend --push
docker buildx imagetools inspect maryemelheni/garderie-frontend:multi-arch
![Résultat multi-arch](cv-onepage/screenshots/a5-89-multiarch.png)

## 20. Registre privé Harbor

### 90. Installation de Harbor

Harbor a été installé sur la VM via l'installateur offline (v2.10.0).
Le fichier `harbor.yml` a été configuré avec :

- **hostname** : `192.168.65.132` (IP de la VM)
- **http.port** : `80`
- **https** : Désactivé (pas de certificat SSL pour le TP).
- **harbor_admin_password** : `Harbor12345`

L'installation a réussi : `Harbor has been installed and started successfully.`

*Capture du tableau de bord Harbor :*

![Harbor Dashboard](https://raw.githubusercontent.com/meryemelheni/cv-onepage/refs/heads/main/cv-onepage/screenshots/a5-90-harbor-dashboard.png)

### 91. Publication des images dans Harbor

Un projet nommé **`portfolio`** a été créé dans Harbor. Les images ont été taguées et poussées vers ce registre privé.

Commandes exécutées :

```bash
# Connexion au registre
docker login 192.168.65.132 -u admin -p Harbor12345

# Publication de l'image frontend
docker tag maryemelheni/garderie-frontend:latest 192.168.65.132/portfolio/garderie-frontend:latest
docker push 192.168.65.132/portfolio/garderie-frontend:latest

# Publication de l'image backend
docker tag maryemelheni/garderie-backend:latest 192.168.65.132/portfolio/garderie-backend:latest
docker push 192.168.65.132/portfolio/garderie-backend:latest
```

Noms complets des images et tags :

- `192.168.65.132/portfolio/garderie-frontend:latest`
- `192.168.65.132/portfolio/garderie-backend:latest`

*Capture des images dans Harbor :*

![Harbor Images](https://raw.githubusercontent.com/meryemelheni/cv-onepage/refs/heads/main/cv-onepage/screenshots/a5-91-harbor-images.png)

### 92. Permissions d'accès avec RBAC

Le système RBAC de Harbor a été configuré :

- Projet : `portfolio`
- Utilisateur : `developer` (rôle "Développeur" : lecture/écriture)

*Capture de la configuration RBAC :*

![Harbor RBAC](https://raw.githubusercontent.com/meryemelheni/cv-onepage/refs/heads/main/cv-onepage/screenshots/a5-92-harbor-rbac.png)

### 93. Scan automatique des vulnérabilités

Le scan automatique (via Trivy) a été activé sur le projet `portfolio` dans les paramètres de configuration.

*Capture de l'activation du scan :*

![Harbor Scan Config](https://raw.githubusercontent.com/meryemelheni/cv-onepage/refs/heads/main/cv-onepage/screenshots/a5-93-harbor-scan-config.png)

### 94. Politique de rétention des images

Une politique de rétention a été configurée pour ne conserver que les 10 dernières images du projet `portfolio`.

*Capture de la politique de rétention :*

![Harbor Retention](https://raw.githubusercontent.com/meryemelheni/cv-onepage/refs/heads/main/cv-onepage/screenshots/a5-94-harbor-retention.png)

### 95. Comparaison GitHub Container Registry (GHCR) et Harbor

| Critère | GitHub Container Registry (GHCR) | Harbor |
|---|---|---|
| **Hébergement** | Cloud (GitHub) | On-premise (sur la VM) |
| **Coût** | Gratuit pour les dépôts publics | Gratuit (auto-hébergé) |
| **Maintenance** | Géré par GitHub | À la charge de l'équipe |
| **Scan de vulnérabilités** | Limité (via GitHub Advanced Security) | Intégré (Trivy) |
| **RBAC** | Basique (via GitHub teams) | Avancé (projets, rôles, robot accounts) |
| **Politique de rétention** | Oui | Oui (très configurable) |

## 21. Software Supply Chain Security

### 96-97. Génération de SBOM avec Syft et conservation comme artefact

Un SBOM (Software Bill of Materials) est un inventaire de tous les composants logiciels présents dans une image Docker. Il permet de savoir exactement ce qu'il y a dans une image et de détecter rapidement les vulnérabilités (CVE).

L'outil **Syft** est utilisé pour générer ce SBOM au format SPDX ou CycloneDX.

Commande :

```bash
syft maryemelheni/garderie-frontend:latest -o spdx-json > sbom-frontend.json
```

*Capture de la génération du SBOM avec Syft :*

![Syft SBOM](https://raw.githubusercontent.com/meryemelheni/cv-onepage/refs/heads/main/cv-onepage/screenshots/a5-96-syft.png)

### 98. Attachement automatique du SBOM aux releases GitHub

Une fois généré, le SBOM serait attaché à la release GitHub correspondante (ex : v1.0.0). Cela permet aux utilisateurs de vérifier l'intégrité de l'image qu'ils téléchargent.

### 99-100. Signature des images avec Cosign et vérification

Cosign (de Sigstore) est utilisé pour signer les images Docker. Cela garantit que l'image provient bien de nous et qu'elle n'a pas été altérée.

Commande de signature :

```bash
cosign sign --key cosign.key maryemelheni/garderie-frontend:latest
```

Commande de vérification (avant utilisation) :

```bash
cosign verify --key cosign.pub maryemelheni/garderie-frontend:latest
```

*Capture de la vérification de la signature :*

![Cosign Verify](https://raw.githubusercontent.com/meryemelheni/cv-onepage/refs/heads/main/cv-onepage/screenshots/a5-100-cosign.png)

### 101-102. Attestations de build et provenance

Les attestations de build (générées par BuildKit ou GitHub Actions) prouvent comment l'image a été construite (quel Dockerfile, quels commits, quel runner).

La provenance permet de tracer l'origine d'un artefact. On peut la vérifier avec :

```bash
cosign verify-attestation --key cosign.pub maryemelheni/garderie-frontend:latest
```

### 103. Principes SLSA et in-toto

SLSA (Supply-chain Levels for Software Artifacts) est un cadre de sécurité qui définit des niveaux de confiance pour la chaîne d'approvisionnement logicielle :

- **Niveau 1** : Documentation du processus de build.
- **Niveau 2** : Build hébergé et signé.
- **Niveau 3** : Build durci (isolation, provenance vérifiée).
- **Niveau 4** : Build reproductible et vérification à deux parties.

In-toto est un framework qui permet de vérifier l'intégrité de la chaîne d'approvisionnement (qui a fait quoi, à quel moment).

Notre pipeline se situe au niveau SLSA 2 : nous avons un build hébergé (GitHub Actions) et des artefacts signés (Cosign), mais nous n'avons pas encore de build reproductible ni de vérification à deux parties.

### 104-105. Refus d'image non signée et simulation d'attaque

Le pipeline peut être configuré pour refuser une image non signée. Par exemple, avant de déployer une image, on exécute `cosign verify`. Si l'image n'est pas signée, la commande échoue et le déploiement est bloqué.

**Scénario d'attaque simulé** : si une image non signée ou une dépendance compromise (via un `package.json` modifié) était introduite dans le pipeline, les contrôles de sécurité (Trivy, `npm audit`) et la vérification de signature (Cosign) bloqueraient la livraison de l'image, empêchant ainsi la compromission de la chaîne d'approvisionnement.

# Activité 6 : Cloud local avec Floci et Terraform

## 22. Cloud local avec Floci

### 106. Installation de Floci

Floci a été lancé en tant que conteneur Docker.

```bash
docker run -d --name floci -p 4566:4566 floci/floci
docker ps
https://cv-onepage/screenshots/a6-106-floci.png

107. Configuration AWS CLI
bash
aws configure --profile floci
# (Access Key: test, Secret Key: test, Region: us-east-1, Format: json)
aws --profile floci --endpoint-url http://localhost:4566 sts get-caller-identity
https://cv-onepage/screenshots/a6-107-awscli.png

108. Création d'un bucket S3
bash
aws --profile floci --endpoint-url http://localhost:4566 s3 mb s3://mon-bucket-local
aws --profile floci --endpoint-url http://localhost:4566 s3 ls
https://cv-onepage/screenshots/a6-108-s3-create.png

109. Upload et Download S3
bash
echo "Hello Floci" > test.txt
aws --profile floci --endpoint-url http://localhost:4566 s3 cp test.txt s3://mon-bucket-local/
aws --profile floci --endpoint-url http://localhost:4566 s3 cp s3://mon-bucket-local/test.txt test-recup.txt
cat test-recup.txt
https://cv-onepage/screenshots/a6-109-s3-upload.png

110. File SQS
bash
curl -X POST "http://localhost:4566/000000000000/ma-file" -H "Content-Type: application/x-www-form-urlencoded" -d "Action=CreateQueue&QueueName=ma-file&Version=2012-11-05"
curl -X POST "http://localhost:4566/000000000000/ma-file" -H "Content-Type: application/x-www-form-urlencoded" -d "Action=SendMessage&MessageBody=Message+test&Version=2012-11-05"
curl -X POST "http://localhost:4566/000000000000/ma-file" -H "Content-Type: application/x-www-form-urlencoded" -d "Action=ReceiveMessage&Version=2012-11-05"
https://cv-onepage/screenshots/a6-110-sqs.png

111. Table DynamoDB
bash
curl -X POST "http://localhost:4566" -H "Content-Type: application/x-amz-json-1.0" -H "X-Amz-Target: DynamoDB_20120810.CreateTable" -d '{"TableName": "MaTable", "KeySchema": [{"AttributeName": "Id", "KeyType": "HASH"}], "AttributeDefinitions": [{"AttributeName": "Id", "AttributeType": "S"}], "BillingMode": "PAY_PER_REQUEST"}'
curl -X POST "http://localhost:4566" -H "Content-Type: application/x-amz-json-1.0" -H "X-Amz-Target: DynamoDB_20120810.PutItem" -d '{"TableName": "MaTable", "Item": {"Id": {"S": "1"}, "Nom": {"S": "Test"}}}'
curl -X POST "http://localhost:4566" -H "Content-Type: application/x-amz-json-1.0" -H "X-Amz-Target: DynamoDB_20120810.Scan" -d '{"TableName": "MaTable"}'
https://cv-onepage/screenshots/a6-111-dynamodb.png

112. Fonction Lambda
bash
echo 'exports.handler = async (event) => { return "Hello from Lambda"; };' > index.js
zip function.zip index.js
curl -X POST "http://localhost:4566/2015-03-31/functions" -H "Content-Type: application/json" -d '{"FunctionName": "MaLambda", "Runtime": "nodejs18.x", "Role": "arn:aws:iam::000000000000:role/lambda-role", "Handler": "index.handler", "Code": {"ZipFile": "'$(base64 -w0 function.zip)'"}}'
curl -X POST "http://localhost:4566/2015-03-31/functions/MaLambda/invocations" -H "Content-Type: application/json" -d '{}'
https://cv-onepage/screenshots/a6-112-lambda.png

113. Secrets Manager
bash
curl -X POST "http://localhost:4566" -H "Content-Type: application/x-amz-json-1.1" -H "X-Amz-Target: secretsmanager.CreateSecret" -d '{"Name": "MonSecret", "SecretString": "motdepasse123"}'
curl -X POST "http://localhost:4566" -H "Content-Type: application/x-amz-json-1.1" -H "X-Amz-Target: secretsmanager.GetSecretValue" -d '{"SecretId": "MonSecret"}'
https://cv-onepage/screenshots/a6-113-secrets.png

114. Communication API Express avec Floci
L'API Express a été modifiée pour envoyer un message dans SQS lors d'un appel sur la route /api/floci-contact.

javascript
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
Test :

bash
curl -X POST http://localhost:3001/api/floci-contact -H "Content-Type: application/json" -d '{"nom": "Test", "email": "test@test.com"}'
https://cv-onepage/screenshots/a6-114-api-floci.png

115. Floci dans Docker Compose
yaml
  floci:
    image: floci/floci
    container_name: floci-compose
    ports:
      - "4566:4566"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
https://cv-onepage/screenshots/a6-115-docker-compose-floci.png

116. Floci dans GitHub Actions
Le workflow ci.yml a été modifié pour ajouter Floci comme service container.

yaml
    services:
      floci:
        image: floci/floci
        ports:
          - 4566:4566
        options: >-
          --health-cmd "curl -f http://localhost:4566/_floci/health || exit 1"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
https://cv-onepage/screenshots/a6-116-github-actions-floci.png

117. Comparaison Floci, LocalStack et AWS réel
Critère	Floci	LocalStack	Cloud AWS réel
Licence	Open Source (gratuit)	Freemium (version Pro payante)	Payant à l'usage
Services	S3, SQS, DynamoDB, Lambda, Secrets Manager	Très large (S3, SQS, Lambda, RDS, etc.)	Tous les services AWS
Fidélité	Bonne pour les tests de base	Très bonne (proche du réel)	Parfaite
Coût	Gratuit	Gratuit en Community, payant en Pro	Payant
Usage en CI	Léger, rapide, parfait pour les tests	Plus lourd, mais complet	Déconseillé (coût)

## 23. Introduction à Terraform

### 118. Installation de Terraform

```bash
terraform version
Capture de la version de Terraform :
https://cv-onepage/screenshots/a6-118-terraform-version.png

119-120. Premier projet Terraform
Les fichiers providers.tf, main.tf, variables.tf et outputs.tf ont été créés dans le dossier terraform/.

Commandes exécutées :

bash
terraform init
terraform fmt
terraform validate
terraform plan
Capture du plan Terraform :
https://cv-onepage/screenshots/a6-120-terraform-plan.png

121. Création des ressources dans Floci
bash
terraform apply -auto-approve
Capture de l'application Terraform :
https://cv-onepage/screenshots/a6-121-terraform-apply.png

122. Vérification avec AWS CLI
bash
aws --profile floci --endpoint-url http://localhost:4566 s3 ls
aws --profile floci --endpoint-url http://localhost:4566 sqs list-queues
aws --profile floci --endpoint-url http://localhost:4566 dynamodb list-tables
Capture de la vérification :
https://cv-onepage/screenshots/a6-122-terraform-verify.png

123. Destruction des ressources
bash
terraform destroy -auto-approve
Capture de la destruction :
https://cv-onepage/screenshots/a6-123-terraform-destroy.png

24. Terraform avancé
124. Modules réutilisables
La configuration a été transformée en module réutilisable dans modules/storage/, utilisé pour deux environnements (dev et prod).

Capture des modules :
https://cv-onepage/screenshots/a6-124-terraform-modules.png

125. Configurations séparées (dev, staging, prod)
Les dossiers environments/dev, environments/staging et environments/prod ont été créés.

bash
cd environments/dev
terraform init && terraform apply -auto-approve
Capture de l'environnement dev :
https://cv-onepage/screenshots/a6-125-terraform-env-dev.png

126. Rôle du fichier Terraform State
Le fichier terraform.tfstate stocke l'état actuel de l'infrastructure. Il permet à Terraform de savoir quelles ressources existent déjà, d'éviter les doublons, et de calculer les différences lors d'un plan ou d'un apply. Il ne faut jamais le versionner sur Git car il peut contenir des informations sensibles.

127-128. Backend distant S3 et verrouillage du state
Le backend S3 a été configuré dans environments/dev/providers.tf pour stocker le state dans Floci.

hcl
terraform {
  backend "s3" {
    bucket = "mon-bucket-terraform-dev"
    key    = "dev/terraform.tfstate"
    region = "us-east-1"
    endpoint = "http://localhost:4566"
    access_key = "test"
    secret_key = "test"
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    s3_use_path_style           = true
  }
}
Capture du backend S3 :
https://cv-onepage/screenshots/a6-127-terraform-backend.png

129-130. Checkov / Trivy IaC
Le pipeline peut être configuré pour analyser le code Terraform avec Checkov ou Trivy IaC. Une mauvaise configuration (bucket public, chiffrement désactivé) serait détectée et bloquerait le pipeline.

Capture du pipeline échoué :
https://cv-onepage/screenshots/a6-130-terraform-security.png

### 131. Comparaison Terraform et OpenTofu

| Critère | Terraform | OpenTofu |
|---|---|---|
| **Licence** | BSL (Business Source License) | Open Source (MPL 2.0) |
| **Maintenance** | HashiCorp | Linux Foundation |
| **Compatibilité** | Standard | Compatible avec Terraform |
| **Communauté** | Très large | En croissance |

### 132. Terragrunt

Terragrunt est un wrapper autour de Terraform qui permet de factoriser les configurations (DEV/STAGING/PROD) en évitant la duplication de code (DRY). Il gère aussi les dépendances entre modules et le backend distant de manière centralisée.

### 133. Comparaison Terraform, OpenTofu et Pulumi

| Critère | Terraform | OpenTofu | Pulumi |
|---|---|---|---|
| **Langage** | HCL | HCL | TypeScript, Python, Go, etc. |
| **Licence** | BSL | MPL 2.0 | Apache 2.0 |
| **Écosystème** | Très large | Compatible Terraform | En croissance |

### 134. Terraform + Ansible

Terraform crée l'infrastructure (VM, réseau) puis Ansible configure le serveur (Docker, K3s).

**Schéma :** Terraform → création infrastructure → Ansible → configuration serveur → Docker / K3s

### 135. Reconstruction complète

Commandes utilisées :
```bash
terraform destroy -auto-approve
terraform apply -auto-approve
ansible-playbook -i ansible/inventory ansible/site.yml