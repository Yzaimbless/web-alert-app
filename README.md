# Web Alert App - Darty

Une application web d'alertes avec système d'envoi d'emails via EmailJS, bannière animée Darty, et import de fichiers Excel.

## Fonctionnalités

### 🎨 Interface Utilisateur
- **Bannière animée rouge et blanc** avec logo Darty animé
- **Affichage date/heure en temps réel** avec période du jour (Matin/Midi/Soir)
- **Design responsive** adapté aux mobiles et desktop
- **Animations CSS** fluides et attractives

### 📊 Gestion des Alertes
- **Onglet Statut 30** : Affichage de 30 alertes avec statuts colorés
- **Système de priorité** : Alertes haute (rouge), moyenne (jaune), basse (verte)
- **Statuts en temps réel** : En attente, Envoyé, Erreur
- **Sauvegarde automatique** des alertes dans le localStorage

### 📧 Système d'Email
- **Intégration EmailJS** pour l'envoi d'emails
- **Configuration modale** des paramètres email
- **Envoi par lots** (5 alertes à la fois) pour éviter la surcharge
- **Simulation de 90% de taux de succès** d'envoi

### 📁 Import Excel
- **Upload de fichiers** Excel (.xlsx, .xls) et CSV
- **Lecture complète** de toutes les feuilles, lignes et colonnes
- **Détection automatique** des mots-clés importants (Urgent, Critique, Important, Alerte)
- **Génération d'alertes** basée sur le contenu du fichier
- **Support CSV** pour les tests et démonstrations

## Installation et Utilisation

1. **Cloner le repository**
```bash
git clone https://github.com/Yzaimbless/web-alert-app.git
cd web-alert-app
```

2. **Lancer un serveur web local**
```bash
# Avec Python
python3 -m http.server 8000

# Avec Node.js
npx http-server

# Ou ouvrir directement index.html dans le navigateur
```

3. **Accéder à l'application**
```
http://localhost:8000
```

## Configuration EmailJS

Pour utiliser la fonctionnalité d'envoi d'emails :

1. Créer un compte sur [EmailJS](https://www.emailjs.com/)
2. Configurer un service email
3. Créer un template d'email
4. Dans l'application, cliquer sur "Envoyer Alertes Email"
5. Remplir la configuration avec vos identifiants EmailJS

## Structure du Projet

```
web-alert-app/
├── index.html          # Page principale
├── style.css           # Styles et animations
├── script.js           # Logique JavaScript
├── README.md           # Documentation
└── LICENSE             # Licence
```

## Technologies Utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Animations et design responsive
- **JavaScript ES6** : Logique métier et interactions
- **EmailJS** : Envoi d'emails côté client
- **FileReader API** : Lecture des fichiers Excel/CSV

## Fonctionnalités Techniques

### Animations CSS
- Dégradé animé pour la bannière
- Effet de brillance (shine effect)
- Animations de logo pulsantes
- Transitions fluides

### Gestion des Fichiers
- Support des formats Excel (.xlsx, .xls)
- Parsing CSV automatique
- Extraction de données par cellule avec position (A1, B2, etc.)
- Détection intelligente des priorités

### Performance
- Sauvegarde automatique toutes les 30 secondes
- Envoi d'emails par lots pour éviter les limitations
- Interface non-bloquante avec feedback utilisateur

## Screenshots

![Application principale](https://github.com/user-attachments/assets/a4718d7d-a2ee-4681-a241-4f02596c080e)
*Vue principale avec bannière animée et alertes*

![Import Excel](https://github.com/user-attachments/assets/877de256-5135-4c0c-97f5-8e0415efa5a7)
*Interface d'import de fichiers Excel*

![Configuration Email](https://github.com/user-attachments/assets/3ec04440-f0aa-44f7-8bfe-fde250319275)
*Modal de configuration EmailJS*

![Alertes envoyées](https://github.com/user-attachments/assets/39c32324-51cc-44ad-be60-68a1d39a3e99)
*Statut des alertes après envoi*

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.