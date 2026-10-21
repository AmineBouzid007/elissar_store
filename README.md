# Elissar — boutique en ligne

Next.js 16 + Tailwind 4 + Postgres. Thème clair, tailles XS–XL, 5 couleurs, paiement à la livraison et par carte (TND), administration complète sur `/admin`.
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

## Paiement en ligne par carte (ClicToPay)

Le site propose le **paiement à la livraison** et, quand il est activé, le **paiement par carte** (la cliente est redirigée vers la page sécurisée de la banque : ni le site ni la base de données ne voient jamais les données de carte).

**Réglage : `PAYMENT_PROVIDER`**
- `none` (défaut) : seulement le paiement à la livraison.
- `mock` : fausse page de paiement avec deux boutons (réussi / refusé) pour tester tout le parcours. Elle est **refusée sur un déploiement Vercel de production** ; pour faire une démo au client sur le site en ligne, ajoutez `ALLOW_MOCK_PAYMENTS=true`, et retirez-le ensuite.
- `clictopay` : la vraie passerelle. Renseignez `CLICTOPAY_USERNAME`, `CLICTOPAY_PASSWORD` et `CLICTOPAY_BASE_URL` fournis par la banque.

**Avant d'activer ClicToPay** : l'adaptateur (`lib/payments/gateways/clictopay.ts`) est écrit d'après la forme habituelle de l'API mais **n'a pas été vérifié avec la documentation de la banque**. Les points à confirmer sont marqués `TODO(bank)` (noms des appels et des champs, codes de statut, paramètres ajoutés à l'adresse de retour). Testez d'abord avec le compte de test de la banque.

**Comment ça marche**
1. La commande est créée avec `payment_method = card`, `payment_status = unpaid`, et le stock est réservé.
2. Une session de paiement est ouverte chez la passerelle ; la cliente est redirigée vers la page de la banque.
3. Au retour (`/api/payments/return`), le site **demande à la passerelle** ce qui s'est passé, il ne croit jamais l'adresse de retour : payé → `paid` ; refusé → commande annulée et stock remis ; pas de réponse → « paiement en cours de vérification ».
4. Une commande carte restée en attente (navigateur fermé…) est revérifiée puis annulée après `CARD_ORDER_EXPIRY_MINUTES` (45 par défaut) : à l'ouverture de la page Admin → Commandes, ou en appelant `/api/payments/reconcile` avec `Authorization: Bearer <CRON_SECRET>` (par exemple depuis une tâche cron Vercel).
5. Si le montant payé ne correspond pas au montant de la commande, elle n'est pas marquée payée et est signalée pour vérification manuelle.

Dans l'admin, chaque commande affiche son mode de paiement, son statut et l'identifiant de la session chez la banque. Une commande « Annulée mais payée » (annulée à la main pendant que la cliente payait) est signalée : remboursez-la ou remettez-la en statut normal.

**Tester en local** : `PAYMENT_PROVIDER=mock npm run dev`, ajoutez un article au panier, choisissez « Carte bancaire » au paiement.

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
