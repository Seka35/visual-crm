# Configuration Supabase pour le CRM

Ce document explique comment configurer Supabase pour votre application CRM.

## Étape 1: Exécuter le schéma SQL

1. Ouvrez votre projet Supabase dans le navigateur
2. Allez dans **SQL Editor** (dans la barre latérale)
3. Cliquez sur **New query**
4. Copiez tout le contenu du fichier `supabase/schema.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run** pour exécuter le script

Le script va créer:
- ✅ 5 tables (users, contacts, deals, tasks, calendar_events)
- ✅ Les politiques RLS (Row Level Security) pour sécuriser vos données
- ✅ Les indexes pour optimiser les performances
- ✅ Les triggers pour la mise à jour automatique des timestamps
- ✅ Un trigger pour créer automatiquement un profil utilisateur lors de l'inscription

## Étape 2: Vérifier la configuration

### Vérifier les tables

1. Allez dans **Table Editor** (dans la barre latérale)
2. Vous devriez voir 5 tables:
   - `users`
   - `contacts`
   - `deals`
   - `tasks`
   - `calendar_events`

### Vérifier les politiques RLS

1. Allez dans **Authentication** → **Policies**
2. Vérifiez que chaque table a 4 politiques (SELECT, INSERT, UPDATE, DELETE)
3. Toutes les politiques doivent vérifier que `auth.uid() = user_id`

## Étape 3: Tester l'application

1. Redémarrez votre serveur de développement si nécessaire:
   ```bash
   npm run dev
   ```

2. Ouvrez l'application dans votre navigateur

3. Vous serez redirigé vers la page de connexion

4. **Créez un compte**:
   - Cliquez sur "Sign Up"
   - Entrez votre email et mot de passe (minimum 6 caractères)
   - Cliquez sur "Create Account"
   - Vérifiez votre email pour confirmer votre compte

5. **Connectez-vous**:
   - Utilisez vos identifiants pour vous connecter
   - Vous serez redirigé vers le dashboard

## Étape 4: Tester les fonctionnalités

### Contacts
- ✅ Ajouter un contact
- ✅ Modifier un contact
- ✅ Supprimer un contact
- ✅ Vérifier que les données persistent après rafraîchissement

### Deals
- ✅ Ajouter un deal
- ✅ Déplacer un deal entre les colonnes (drag & drop)
- ✅ Modifier un deal
- ✅ Supprimer un deal

### Tasks
- ✅ Ajouter une tâche
- ✅ Marquer comme complétée
- ✅ Modifier une tâche
- ✅ Supprimer une tâche

### Calendar
- ✅ Ajouter un événement
- ✅ Modifier un événement
- ✅ Supprimer un événement

## Vérification dans Supabase

Après avoir ajouté des données dans l'application:

1. Allez dans **Table Editor** dans Supabase
2. Sélectionnez une table (ex: contacts)
3. Vous devriez voir vos données
4. Vérifiez que le `user_id` correspond à votre ID utilisateur

## Sécurité (RLS)

Les politiques RLS garantissent que:
- ✅ Chaque utilisateur ne voit que ses propres données
- ✅ Un utilisateur ne peut pas modifier les données d'un autre utilisateur
- ✅ Les données sont automatiquement filtrées par `user_id`

Pour tester:
1. Créez un deuxième compte utilisateur
2. Ajoutez des données avec ce compte
3. Déconnectez-vous et reconnectez-vous avec le premier compte
4. Vous ne devriez voir que vos propres données

## Dépannage

### Erreur: "Missing Supabase environment variables"
- Vérifiez que le fichier `.env` contient bien `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
- Redémarrez le serveur de développement

### Erreur lors de l'exécution du SQL
- Vérifiez que vous avez copié tout le contenu du fichier `schema.sql`
- Assurez-vous que l'extension UUID est activée

### Les données ne se chargent pas
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Vérifiez que vous êtes bien connecté
- Vérifiez les politiques RLS dans Supabase

### Erreur "User not authenticated"
- Déconnectez-vous et reconnectez-vous
- Vérifiez que votre session est valide dans Supabase → Authentication → Users

## Support

Si vous rencontrez des problèmes:
1. Consultez la documentation Supabase: https://supabase.com/docs
2. Vérifiez les logs dans la console du navigateur
3. Vérifiez les logs dans Supabase → Logs
