# Instructions de configuration Supabase

Pour que l'application fonctionne parfaitement et stocke la liste des points de vente visités de manière globale, vous devez configurer un projet Supabase (gratuit).

## 1. Créer le projet et la table

1. Connectez-vous à [Supabase](https://supabase.com/) et créez un nouveau projet.
2. Allez dans l'onglet **SQL Editor** dans le menu de gauche.
3. Copiez-collez et exécutez le script SQL suivant pour créer la table et autoriser l'accès public :

```sql
-- Création de la table pour stocker les IDs des points de vente visités
CREATE TABLE visited_stores (
  store_id BIGINT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de la Row Level Security (RLS)
ALTER TABLE visited_stores ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture pour tout le monde (accès public)
CREATE POLICY "Allow public read" ON visited_stores FOR SELECT USING (true);

-- Autoriser l'insertion pour tout le monde
CREATE POLICY "Allow public insert" ON visited_stores FOR INSERT WITH CHECK (true);

-- Autoriser la suppression pour tout le monde
CREATE POLICY "Allow public delete" ON visited_stores FOR DELETE USING (true);
```

## 2. Configurer les variables d'environnement

1. Dans Supabase, allez dans **Project Settings** (l'icône engrenage) > **API**.
2. Récupérez votre `Project URL` et votre `anon` `public` API Key.
3. À la racine du projet `fdj-map` (dans le dossier `/home/marius/projets/fdj-map`), créez un fichier `.env.local` et ajoutez ces valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

## 3. Lancer l'application

Démarrez le serveur de développement :

```bash
cd /home/marius/projets/fdj-map
npm run dev
```

L'application sera accessible sur `http://localhost:3000`. Elle demandera l'accès à votre géolocalisation pour afficher les points de vente autour de vous.
