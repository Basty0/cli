# Magique CLI

CLI IA moderne pour discuter avec plusieurs fournisseurs directement depuis le terminal.

## Installation

Installer globalement :

```bash
npm install -g magique-cli
```

Lancer :

```bash
magique-cli
```

## Premier lancement

Au premier démarrage, `magique-cli` demande :

1. le fournisseur IA
2. le modèle
3. la clé API

La configuration est ensuite sauvegardée automatiquement.

## Commandes utiles

Lancer le chat interactif :

```bash
magique-cli
```

Afficher l'aide :

```bash
magique-cli --help
```

Poser une question directe :

```bash
magique-cli ask "Explique Docker simplement"
```

Changer de fournisseur :

```bash
magique-cli provider
```

Changer de modèle :

```bash
magique-cli model
```

Mettre à jour la clé API :

```bash
magique-cli login
```

Afficher la configuration :

```bash
magique-cli config
```

Effacer la configuration :

```bash
magique-cli logout
```

Nettoyer les données locales :

```bash
magique-cli uninstall
```

## Développement local

Installer les dépendances :

```bash
npm install
```

Build :

```bash
npm run build
```

Lancer en local :

```bash
node dist/index.js
```

Créer la commande globale locale :

```bash
npm link
magique-cli
```

## Publier sur npm

### Première publication

1. Se connecter à npm :

```bash
npm login
npm whoami
```

2. Vérifier que le projet build :

```bash
npm run build
```

3. Vérifier le contenu publié :

```bash
npm pack --dry-run
```

4. Publier :

```bash
npm publish
```

Si npm refuse avec une erreur `403` liée à la sécurité, active la 2FA sur ton compte npm, puis relance `npm publish`.

### Publier une mise à jour

À chaque nouvelle publication, il faut changer la version avant de republier.

Patch :

```bash
npm version patch
npm publish
```

Minor :

```bash
npm version minor
npm publish
```

Major :

```bash
npm version major
npm publish
```

Exemples :

- `0.1.0` -> `0.1.1` avec `patch`
- `0.1.0` -> `0.2.0` avec `minor`
- `0.1.0` -> `1.0.0` avec `major`

## Installer depuis npm sur une autre machine

```bash
npm install -g magique-cli
magique-cli
```
