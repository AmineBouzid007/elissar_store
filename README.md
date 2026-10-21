# Elissar — boutique en ligne

Next.js 16 + Tailwind 4 + Postgres. Thème clair, tailles XS–XL, 5 couleurs, paiement à la livraison (TND), administration complète sur `/admin`.
Construit sur la même base que le projet NOCT : mêmes pages admin, même gestion du stock, mêmes variables d'environnement.

## Déployer sur Vercel (5 minutes)

1. Poussez ce dossier sur un dépôt GitHub puis **Import** dans Vercel (framework : Next.js, rien à changer).
2. **Storage → Create Database → Neon** → connectez-la au projet (ajoute `DATABASE_URL`).
3. **Settings → Environment Variables** :
   - `ADMIN_EMAIL` : votre identifiant admin
   - `ADMIN_PASSWORD` : un mot de passe long
   - `AUTH_SECRET` : 32+ caractères aléatoires (`openssl rand -base64 32`)
   - `NEXT_PUBLIC_SITE_URL` : votre domaine, ex. `https://www.elissar.tn`
4. *(Optionnel, pour téléverser des photos depuis l'admin)* **Storage → Create → Blob** → connecter (ajoute `BLOB_READ_WRITE_TOKEN`).
5. Déployez. Au premier chargement, les tables et les 8 produits Elissar sont créés automatiquement.
6. Allez sur `/admin`, connectez-vous, puis **remplacez les prix et les stocks** (voir ci-dessous).

## À faire avant la mise en ligne
- **Prix et stock = valeurs provisoires.** Le site actuel affiche « Pré-commander » sans prix : les prix (120 à 690 TND) et un stock de 5 par taille sont des exemples. Modifiez-les dans Admin → Produits.
- **Photos.** Les photos de départ pointent vers elissar.tn (même images). Pour ne plus dépendre de l'ancien site, téléversez-les depuis l'admin (Blob) ou placez-les dans `public/products/` et collez `/products/nom.jpg`.
- **Réglages** (Admin → Réglages) : WhatsApp, Instagram, téléphone, frais de livraison (0 par défaut), seuil de livraison gratuite, tableau des tailles, image d'accueil.
- Tableau des tailles : une ligne par taille, ex. `M,92,76,100` (taille, poitrine, taille, hanches en cm).

## Fonctionnement
- Le stock est suivi par **produit × couleur × taille**. Une commande réduit le stock ; une annulation le remet. Les prix viennent toujours de la base, jamais du navigateur.
- **Sur mesure** : la cliente indique ses mensurations dans les « Notes » du paiement (visibles dans la commande en admin) ou via WhatsApp.
- Suivi de commande sur `/track` (numéro + téléphone).
- Sans base de données connectée, la boutique affiche quand même les produits de démonstration ; commande et admin demandent de connecter la base.
- Couleurs : modifiables dans `lib/constants.ts` (`COLORS`, `COLOR_LABEL`, `COLOR_HEX`).

## Développement local
```
npm install
cp .env.example .env.local   # renseignez DATABASE_URL, etc.
npm run dev
```
