# NetCraft AI

> Tu decris ton reseau. NetCraft AI le construit.

**NetCraft AI** est une plateforme SaaS de planification et de configuration automatisee d'infrastructure reseau. L'utilisateur decrit la topologie de son reseau (sites, departements, equipements), et l'application genere automatiquement le plan d'adressage IP (VLSM), les VLANs, les configurations Cisco IOS pour chaque equipement, et valide l'ensemble du design selon 16 regles de bonnes pratiques.

**[Acceder a l'application](https://netcraft-ai.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)

---

## Table des matieres

- [Le probleme](#le-probleme)
- [La solution](#la-solution)
- [Fonctionnalites detaillees](#fonctionnalites-detaillees)
- [Types de projets](#types-de-projets)
- [Guide d'utilisation](#guide-dutilisation)
- [Architecture technique](#architecture-technique)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Modele de donnees](#modele-de-donnees)
- [Les moteurs (engines)](#les-moteurs-engines)
- [Installation locale](#installation-locale)
- [Deploiement](#deploiement)
- [Securite](#securite)
- [Auteur](#auteur)

---

## Le probleme

Quand on concoie un reseau d'entreprise, on doit :

1. **Calculer manuellement les sous-reseaux** (VLSM) — trouver les masques, les plages d'adresses, les passerelles, eviter les chevauchements
2. **Attribuer les VLANs** — decider quel numero pour quel departement, ne pas oublier le VLAN natif et le blackhole
3. **Ecrire les configurations Cisco** — des dizaines de lignes de CLI par equipement, avec les VLANs, le trunking, DHCP, SSH, STP...
4. **Verifier que tout est coherent** — pas de chevauchement d'IP, pas de VLAN inutilise, pas de faille de securite

Ce processus est long, repetitif et source d'erreurs. Un oubli dans un masque, un mauvais numero de VLAN, un port non securise — et le reseau tombe ou devient vulnerable.

## La solution

**NetCraft AI automatise tout ca.** En quelques clics :

- Tu definis ta topologie (sites, departements, equipements)
- Tu cliques "Calculate VLSM" et tous les sous-reseaux sont generes optimalement
- Tu cliques "Auto-suggest VLANs" et chaque departement recoit un VLAN adapte a son type
- Tu cliques "Generate Configs" et tu obtiens des configurations Cisco IOS completes, prete a copier-coller
- Tu cliques "Run Validation" et 16 regles verifient que ton design est correct et securise

---

## Fonctionnalites detaillees

### 1. Gestion de projets

- Creer, modifier, supprimer des projets reseau
- Choisir le type de topologie : LAN, WAN, ou LAN+WAN
- Definir l'espace d'adressage de base (ex: `192.168.10.0/24`, `10.0.0.0/8`)
- Dashboard avec statistiques en temps reel (nombre de projets, equipements, sous-reseaux)

### 2. Topologie reseau

**Pour un projet LAN (site unique) :**
- Ajouter directement des departements (IT, Ventes, RH, Salle serveur, etc.)
- Ajouter des equipements dans chaque departement

**Pour un projet WAN ou LAN+WAN (multi-sites) :**
- Creer des branches/sites (ex: Siege, Succursale Bamako, Bureau Dakar)
- Chaque branche contient ses propres departements et equipements

### 3. Gestion des equipements

Chaque departement peut contenir des equipements classes par categorie :

| Categorie | Types d'equipements |
|-----------|-------------------|
| **Routeurs** | Core Router, Edge Router, Branch Router |
| **Switches** | Switch Layer 2, Switch Layer 3, PoE Switch |
| **Points d'acces** | Access Point (AP) |
| **Terminaux** | PC, Laptop, Telephone IP, Imprimante, Camera IP, Serveur |

Chaque equipement reseau (routeur, switch, AP) recoit automatiquement un **hostname Cisco** selon la convention :
```
[TYPE]-[CODE_SITE]-[ROLE]-[NUMERO]
```
Exemples : `RTR-HQ-CORE-01`, `SW-BKL-ACCESS-02`, `AP-DKR-WIFI-01`

### 4. Calcul VLSM automatique

Le moteur VLSM (Variable Length Subnet Masking) :
- Prend l'espace d'adressage de base et la liste de tous les departements
- Trie par nombre d'hotes (du plus grand au plus petit)
- Calcule le plus petit bloc en puissance de 2 qui satisfait chaque departement
- Aligne les sous-reseaux sur les frontieres correctes
- Verifie qu'il n'y a pas de debordement

**Resultat :** Un tableau complet avec pour chaque departement :
- Adresse reseau, masque, CIDR, broadcast
- Premier et dernier hote utilisable
- Adresse de passerelle
- Masque wildcard
- Capacite totale et taux d'utilisation

### 5. Attribution automatique des VLANs

Le moteur VLAN attribue automatiquement un numero de VLAN selon le type de departement :

| Type de departement | VLAN |
|-------------------|------|
| Management | 10 |
| IT | 20 |
| Sales / Ventes | 30 |
| HR / RH | 40 |
| Server Room | 50 |
| Reception | 60 |
| Open Space | 70 |
| Meeting Room | 80 |
| Security | 90 |

Deux VLANs speciaux sont toujours ajoutes :
- **VLAN 99 (NATIVE)** — VLAN natif pour les trunks
- **VLAN 999 (BLACKHOLE)** — VLAN de securite pour les ports inutilises

### 6. Generation de configurations Cisco IOS

Trois generateurs de configurations :

**Switch (Layer 2/3) :**
- Declaration de tous les VLANs
- Ports d'acces avec VLAN correct
- Ports trunk avec VLANs autorises
- Ports inutilises en VLAN 999 + shutdown (securite)
- STP mode rapid-pvst
- Interface de management avec IP

**Routeur :**
- Sous-interfaces router-on-a-stick pour chaque VLAN
- Pools DHCP avec adresses exclues (passerelle + serveurs)
- Configuration SSH (version 2, timeout, tentatives max)
- Route par defaut
- Banniere de connexion
- `enable secret` et `service password-encryption`

**Point d'acces (AP) :**
- SSID avec WPA2-PSK
- Radios dual-band (2.4 GHz + 5 GHz)
- Interface BVI pour le management
- Configuration de base securisee

Chaque config est affichee avec :
- Numeros de ligne
- Coloration syntaxique
- Bouton copier dans le presse-papiers
- Bouton telecharger en `.txt`

### 7. Validation du design (16 regles)

Le moteur de validation verifie :

**Erreurs (bloquantes) :**
- Pas de reseau de base defini
- Debordement VLSM (espace insuffisant)
- Chevauchement de sous-reseaux
- Conflits d'adresses IP
- Aucun departement defini
- Incoherence type de projet / nombre de branches

**Avertissements :**
- Pas de `enable secret` dans les configs
- Pas de passerelle par defaut
- VLAN 1 utilise (risque de securite)
- Trunking sur des ports non prevus
- Projet WAN avec moins de 2 branches

**Recommandations :**
- Ajouter un `exec-timeout` sur les lignes console/vty
- Exclure les adresses de passerelle dans les pools DHCP
- Securiser les ports inutilises
- Ajouter une banniere de connexion
- Utiliser SSH au lieu de Telnet
- Retirer les VLANs non assignes

### 8. Interface utilisateur

- **Dark mode** exclusif avec design glassmorphism
- **Animations fluides** : fade-in, slide-up, hover lift sur les cartes
- **Gradients** sur les boutons, les titres, et les accents
- **Responsive** : sidebar desktop, drawer mobile avec hamburger
- **Etats de chargement** : squelettes animes sur chaque page
- **Navigation par onglets** sur les projets (Overview, Subnets, VLANs, Configs, Validation)

---

## Types de projets

### LAN — Reseau local (site unique)

```
Projet "Campus HQ"
├── Departement IT (30 postes)
├── Departement Ventes (20 postes)
├── Salle serveur (10 postes)
└── Open Space (50 postes)
```

Ideal pour : un bureau, un campus, un batiment. L'utilisateur ajoute directement ses departements sans passer par des branches.

### WAN — Reseau etendu (multi-sites)

```
Projet "Reseau National"
├── Branche Siege (Bamako)
│   ├── IT (30 postes)
│   └── Direction (10 postes)
├── Branche Succursale (Dakar)
│   ├── Ventes (15 postes)
│   └── Support (10 postes)
└── Branche Bureau (Abidjan)
    └── Open Space (20 postes)
```

Ideal pour : une entreprise avec plusieurs sites geographiques. Chaque branche represente un site physique.

### LAN+WAN — Combine

Meme structure que WAN, mais avec l'intention de planifier le reseau local de chaque site en detail. Le comportement dans l'application est identique a WAN.

---

## Guide d'utilisation

### Etape 1 : Creer un projet

1. Aller sur le Dashboard
2. Cliquer **"New Project"**
3. Remplir le nom, la description, choisir le type (LAN/WAN/LAN+WAN)
4. Entrer le reseau de base en notation CIDR (ex: `192.168.10.0/24`)
5. Cliquer **"Create Project"**

### Etape 2 : Definir la topologie

**Si LAN :** Ajouter directement des departements sur la page overview du projet.

**Si WAN/LAN+WAN :** Creer d'abord des branches (sites), puis dans chaque branche, ajouter des departements.

Pour chaque departement, preciser :
- Le nom (ex: "IT Department")
- Le type (IT, Sales, HR, etc.) — determine le VLAN auto-attribue
- Le nombre d'hotes estimes — determine la taille du sous-reseau

### Etape 3 : Ajouter les equipements

Dans chaque departement, cliquer **"+ Add Device"** et choisir le type d'equipement. Les routeurs, switches et AP recevront un hostname automatique.

### Etape 4 : Generer le plan reseau

1. Aller sur l'onglet **Subnets** > cliquer **"Calculate VLSM"**
2. Aller sur l'onglet **VLANs** > cliquer **"Auto-suggest VLANs"**
3. Aller sur l'onglet **Configs** > cliquer **"Generate All Configs"**
4. Aller sur l'onglet **Validation** > cliquer **"Run Validation"**

### Etape 5 : Exporter

- Copier chaque configuration avec le bouton **Copy**
- Telecharger chaque config en `.txt` avec le bouton **Download**
- Coller directement dans le terminal Cisco ou un simulateur (Packet Tracer, GNS3, EVE-NG)

---

## Architecture technique

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│         Next.js 16 (App Router + RSC)           │
│         Tailwind CSS v4 (Dark mode)             │
├─────────────────────────────────────────────────┤
│                 API Routes                       │
│        REST endpoints (Next.js Route Handlers)  │
│        Zod validation on all inputs             │
│        Session-based ownership checks           │
├─────────────────────────────────────────────────┤
│               Core Engines                       │
│   VLSM | VLAN | Hostname | Config | Validate   │
│        Pure TypeScript — zero dependencies       │
├─────────────────────────────────────────────────┤
│                   ORM                            │
│              Prisma 6 Client                     │
├─────────────────────────────────────────────────┤
│                 Database                         │
│          Supabase PostgreSQL                     │
├─────────────────────────────────────────────────┤
│              Authentication                      │
│      NextAuth v5 + Google OAuth + JWT           │
└─────────────────────────────────────────────────┘
```

---

## Stack technique

| Couche | Technologie | Version |
|--------|------------|---------|
| Framework | Next.js (App Router + Turbopack) | 16.2 |
| Langage | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| Base de donnees | PostgreSQL via Supabase | - |
| ORM | Prisma | 6 |
| Authentification | NextAuth (Auth.js) + Google OAuth | 5 |
| Icones | Lucide React | - |
| Validation | Zod | - |
| Utilitaires CSS | clsx + tailwind-merge | - |
| Deploiement | Vercel | - |

---

## Structure du projet

```
netcraft-ai/
├── prisma/
│   └── schema.prisma              # 10 modeles (User, Project, Branch, Department, Device, Subnet, Vlan, Config, Account, Session)
├── src/
│   ├── app/
│   │   ├── globals.css            # Tailwind v4 + animations keyframes
│   │   ├── layout.tsx             # Layout racine (fonts, dark mode)
│   │   ├── page.tsx               # Redirect vers /dashboard
│   │   ├── (auth)/
│   │   │   └── login/page.tsx     # Page de connexion Google (glassmorphism)
│   │   ├── (app)/
│   │   │   ├── layout.tsx         # Shell app (sidebar + topbar)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx       # Statistiques + projets recents
│   │   │   │   └── loading.tsx    # Squelette de chargement
│   │   │   └── projects/
│   │   │       ├── page.tsx       # Grille de tous les projets
│   │   │       ├── new/page.tsx   # Formulaire de creation
│   │   │       └── [projectId]/
│   │   │           ├── page.tsx       # Overview (adapte LAN vs WAN)
│   │   │           ├── layout.tsx     # Navigation par onglets
│   │   │           ├── subnets/       # Tableau VLSM
│   │   │           ├── vlans/         # Tableau VLANs
│   │   │           ├── configs/       # Visualiseur de configs
│   │   │           ├── validation/    # Resultats de validation
│   │   │           └── branches/[branchId]/  # Detail branche (WAN)
│   │   └── api/                   # 11 endpoints REST
│   ├── components/
│   │   ├── layout/                # Sidebar (responsive), Topbar (search, avatar)
│   │   ├── projects/              # ProjectNav (onglets)
│   │   ├── branches/              # AddBranchForm
│   │   ├── departments/           # AddDepartmentForm (type select, hosts input)
│   │   ├── devices/               # AddDeviceForm (grille categorisee)
│   │   ├── vlsm/                  # VlsmPanel (bouton + tableau 11 colonnes)
│   │   ├── vlans/                 # VlanPanel (suggestion + tableau avec badges)
│   │   ├── configs/               # ConfigPanel (onglets, numeros de ligne, copier, telecharger)
│   │   ├── validation/            # ValidationPanel (erreurs/avertissements/recommandations)
│   │   └── ui/                    # Skeleton, DeleteButton (confirmation)
│   └── lib/
│       ├── engines/
│       │   ├── vlsm.ts           # Algorithme VLSM pur
│       │   ├── vlan.ts           # Suggestion VLANs par type
│       │   ├── hostname.ts       # Convention nommage Cisco
│       │   ├── config-switch.ts  # Generateur config switch
│       │   ├── config-router.ts  # Generateur config routeur
│       │   ├── config-ap.ts      # Generateur config AP
│       │   └── validate.ts       # 16 regles de validation
│       ├── auth.ts               # Config NextAuth v5
│       ├── db.ts                 # Singleton Prisma
│       └── utils.ts              # cn() helper
├── .env.example                   # Template des variables d'environnement
├── .gitignore                     # .env* ignore, node_modules ignore
└── package.json
```

---

## Modele de donnees

```
User (NextAuth)
│
└── Project
    ├── type: LAN | WAN | LAN_WAN
    ├── baseNetwork: "192.168.10.0/24"
    │
    ├── Branch(es)                    # 1 auto-creee pour LAN, N pour WAN
    │   ├── name: "Siege"
    │   ├── location: "Bamako"
    │   │
    │   └── Department(s)
    │       ├── name: "IT"
    │       ├── type: IT | SALES | HR | MANAGEMENT | SERVER_ROOM | ...
    │       ├── estimatedHosts: 30
    │       ├── vlan → Vlan
    │       ├── subnet → Subnet
    │       │
    │       └── Device(s)
    │           ├── name: "Switch principal"
    │           ├── type: CORE_ROUTER | SWITCH_L2 | SWITCH_L3 | AP | ENDPOINT | ...
    │           ├── hostname: "SW-HQ-ACCESS-01" (auto-genere)
    │           └── config → Config (contenu Cisco IOS)
    │
    ├── Subnet(s)                     # Generes par le moteur VLSM
    │   ├── networkAddress: "192.168.10.0"
    │   ├── subnetMask: "255.255.255.224"
    │   ├── cidr: 27
    │   ├── firstHost / lastHost / broadcastAddress / gatewayAddress
    │   ├── usableHosts: 30
    │   └── utilization: 100 (%)
    │
    └── Vlan(s)                       # Generes par le moteur VLAN
        ├── number: 20
        ├── name: "IT"
        └── departments[] (N:1)
```

---

## Les moteurs (engines)

Tous les moteurs sont des fonctions TypeScript pures, sans dependance externe, testables unitairement.

### VLSM (`src/lib/engines/vlsm.ts`)

Algorithme :
1. Recevoir le reseau de base et la liste des departements avec leur nombre d'hotes
2. Trier les departements par nombre d'hotes decroissant (allocation optimale)
3. Pour chaque departement, trouver le plus petit bloc en puissance de 2 >= (hotes + 2)
4. Aligner l'adresse de debut sur la frontiere du bloc
5. Verifier qu'on ne depasse pas l'espace disponible
6. Retourner les details complets de chaque sous-reseau

### VLAN (`src/lib/engines/vlan.ts`)

- Mappe chaque type de departement vers un numero de VLAN standard
- Gere les conflits si plusieurs departements du meme type existent (incremente)
- Ajoute toujours VLAN 99 (Native) et VLAN 999 (Blackhole)

### Hostname (`src/lib/engines/hostname.ts`)

- Format : `[PREFIXE_TYPE]-[CODE_SITE]-[ROLE]-[NUMERO]`
- Prefixes : RTR (routeur), SW (switch), AP (point d'acces)
- Incremente automatiquement le numero si le hostname existe deja

### Config Switch (`src/lib/engines/config-switch.ts`)

Genere une configuration complete Cisco IOS incluant :
- `hostname`, `service password-encryption`, `enable secret`
- Declaration de tous les VLANs
- Ports d'acces avec `switchport mode access` et VLAN correct
- Port trunk avec `switchport trunk allowed vlan`
- Ports inutilises : `switchport access vlan 999` + `shutdown`
- `spanning-tree mode rapid-pvst`
- Interface VLAN management avec IP

### Config Router (`src/lib/engines/config-router.ts`)

Genere :
- Sous-interfaces sur GigabitEthernet0/0 pour chaque VLAN (router-on-a-stick)
- Pools DHCP avec `network`, `default-router`, `dns-server`
- Adresses exclues (`ip dhcp excluded-address`)
- SSH v2 avec `crypto key generate rsa modulus 2048`
- `ip route 0.0.0.0 0.0.0.0 [next-hop]`
- Banniere et securite des lignes

### Config AP (`src/lib/engines/config-ap.ts`)

Genere :
- SSID et `authentication open`
- `encryption mode ciphers aes-ccm`
- WPA2-PSK
- Radios `dot11radio 0` (2.4 GHz) et `dot11radio 1` (5 GHz)
- Interface BVI pour management

### Validation (`src/lib/engines/validate.ts`)

16 regles organisees en 3 niveaux de severite :
- **Erreurs** : problemes bloquants (pas de reseau, debordement, chevauchements)
- **Avertissements** : risques de securite (VLAN 1, pas de secret, pas de gateway)
- **Recommandations** : bonnes pratiques (SSH, timeouts, banniere, ports inutilises)

---

## Installation locale

### Prerequis

- **Node.js 18+**
- Un projet **[Supabase](https://supabase.com)** (le tier gratuit suffit)
- Des credentials **Google OAuth** depuis [Google Cloud Console](https://console.cloud.google.com)

### 1. Cloner le repo

```bash
git clone https://github.com/MakanTraore/netcraft-ai.git
cd netcraft-ai
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir `.env.local` :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.VOTRE_PROJET.supabase.co:5432/postgres"
AUTH_SECRET="generer-avec: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="votre-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-votre-secret"
```

### 3. Configurer Google OAuth

1. Aller sur Google Cloud Console > APIs & Services > Credentials
2. Creer un **OAuth 2.0 Client ID** (type: Application Web)
3. Ajouter l'URI de redirection : `http://localhost:3000/api/auth/callback/google`
4. Copier le Client ID et le Client Secret dans `.env.local`

### 4. Initialiser la base de donnees

```bash
npx prisma db push
```

### 5. Lancer le serveur

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) et se connecter avec Google.

---

## Deploiement

L'application est prete pour **Vercel** :

1. Connecter le repo GitHub a Vercel
2. Ajouter les variables d'environnement dans les settings Vercel
3. Ajouter l'URI de redirection de production dans Google Cloud Console :
   `https://votre-domaine.vercel.app/api/auth/callback/google`
4. Deployer

---

## Securite

- Tous les secrets sont dans `.env.local` qui est **git-ignore** — jamais commite
- Seul `.env.example` (avec des placeholders) est dans le repo
- Authentification via Google OAuth (NextAuth v5, strategie JWT)
- Toutes les routes API verifient la session et l'ownership des ressources
- Validation Zod sur toutes les entrees utilisateur
- Aucun credential n'est expose dans le code source

---

## Auteur

**Makan Traore**
- Email : traoremakan483@gmail.com
- GitHub : [@MakanTraore](https://github.com/MakanTraore)

---

## Licence

MIT — Libre d'utilisation, modification et distribution.
