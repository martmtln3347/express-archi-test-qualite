# 📘 Documentation Technique de Référence : API E-commerce

Ce document définit les standards d'ingénierie, l'architecture logicielle et les processus de développement pour l'API E-commerce. Il a pour but de garantir la maintenabilité, la testabilité et la qualité du code à long terme.

-----

## 1. Philosophie & Architecture

Le projet repose sur trois piliers fondamentaux : **Domain-Driven Design (DDD)**, **Clean Architecture** et **Vertical Slices**.

### 1.1 Architecture en "Vertical Slices" (Tranches Verticales)

Contrairement à une architecture en couches traditionnelle (où tout est groupé par type technique : `controllers/`, `services/`, `models/`), nous groupons le code par **fonctionnalité métier**.

  * **Avantage** : Tout le code nécessaire à une fonctionnalité (ex: "Créer un Produit") se trouve au même endroit.
  * **Structure** : `src/module/{Domaine}/{CasDusage}/`

<!-- end list -->

```text
src/
└── module/
    └── product/                 # Domaine "Produit"
        ├── createProduct/       # Feature "Créer un produit"
        │   ├── createProductController.ts       # Entrée HTTP
        │   ├── createProductUseCase.ts          # Cœur métier
        │   ├── createProductRepository.ts       # Interface (Port)
        │   ├── createProductTypeOrmRepository.ts # Implémentation DB (Adapter)
        │   └── test/
        │       ├── createProductUseCase.spec.ts # Tests Unitaires
        │       └── createProduct.e2e.spec.ts    # Tests E2E
        └── Product.ts           # Entité partagée du domaine
```

### 1.2 Clean Architecture & Inversion de Dépendance (DIP)

La règle d'or est que **le code métier ne doit jamais dépendre de la technique**.

  * **Le Use Case (Cœur)** ne connaît pas la base de données. Il dépend d'une **interface** (`Repository Interface`).
  * **L'Implémentation (Infra)** dépend de l'interface définie par le métier.
  * **L'Injection** se fait manuellement dans le contrôleur ou via un conteneur (actuellement manuel).

-----

## 2. Standards de Développement (Components)

### 2.1 Les Entités de Domaine (Domain Entities)

Les entités ne sont pas de simples structures de données (DTO). Elles sont **riches** et garantes de la cohérence des données.

  * **Responsabilité** : Encapsuler les règles métier et la validation.
  * **Règle d'Or** : Une entité ne doit jamais être instanciée dans un état invalide.
  * **Pattern** : Validation dans le constructeur ou via des Factory Methods.

**Exemple (Product.ts) :**

```typescript
export class Product {
    // ... propriétés

    constructor(props: { title: string, price: number }) {
        this.validateTitle(props.title); // Validation immédiate
        this.validatePrice(props.price);
        this.title = props.title;
        // ...
    }

    private validatePrice(price: number): void {
        if (price < 0) throw new Error("Le prix doit être positif");
    }
}
```

### 2.2 Les Cas d'Utilisation (Use Cases)

Ils représentent les actions réalisables par un utilisateur. Ils orchestrent le flux mais ne contiennent pas de règles métier pures (qui sont dans l'entité).

  * **Responsabilité** : Récupérer les données, appeler l'entité, sauvegarder via le repository.
  * **Gestion d'erreur** : Ils capturent les erreurs techniques et les transforment en messages compréhensibles.

### 2.3 Les Repositories

Nous utilisons le pattern **Repository** pour abstraire l'accès aux données.

1.  **L'Interface** (`CreateProductRepository`) : Définie dans le dossier de la feature. Contient uniquement les méthodes nécessaires (ex: `save`).
2.  **L'Implémentation** (`TypeOrmRepository`) : Utilise l'ORM (TypeORM) pour interagir avec la DB.

### 2.4 Les Contrôleurs (Controllers)

Ils sont des adaptateurs HTTP. Ils ne contiennent **aucune logique métier**.

  * **Responsabilité** : Parser la requête HTTP, instancier le Use Case, retourner la réponse JSON.
  * **Codes HTTP** :
      * `201 Created` : Succès création.
      * `200 OK` : Succès lecture/modif.
      * `400 Bad Request` : Erreur de validation (message renvoyé par le Use Case/Entity).
      * `500 Internal Server Error` : Crash inattendu.

-----

## 3. Stratégie de Test & Qualité

La qualité est assurée par deux niveaux de tests stricts, utilisant **Jest**.

### 3.1 Tests Unitaires (Business Logic)

Ils valident les règles métier en isolation totale (sans base de données).

  * **Fichiers** : `*.spec.ts`
  * **Technique** : Utilisation de **Test Doubles** (Dummies ou Mocks) pour simuler le Repository.
  * **Langage** : Description des tests en français (Pattern *Given-When-Then*).
  * **Convention** : Tester tous les cas d'erreur ("titre trop court", "prix négatif").

### 3.2 Tests End-to-End (E2E)

Ils valident le système complet, de l'appel HTTP jusqu'à la base de données réelle.

  * **Fichiers** : `*.e2e.spec.ts`
  * **Outils** : `Supertest` (HTTP) + `Testcontainers` (Docker PostgreSQL).
  * **Workflow** :
    1.  Démarrage d'un conteneur PostgreSQL éphémère.
    2.  Remplacement de la `DataSource` de prod par celle de test.
    3.  Nettoyage de la DB avant chaque test (`DELETE FROM ...`).
    4.  Vérification de la réponse HTTP **ET** de la présence des données en base.

-----

## 4. Stack Technique & Configuration

  * **Runtime** : Node.js 20
  * **Langage** : TypeScript 5.x (Mode Strict activé pour la sécurité du typage).
  * **Framework** : Express.js 4.x.
  * **Base de données** : PostgreSQL.
  * **ORM** : TypeORM 0.3.x.
      * *Configuration* : `synchronize: true` en dev (création auto des tables), `logging: false`.
      * *Entités* : Utilise les décorateurs `@Entity`, `@Column`.

-----

## 5. Conventions & "Code Style"

### 5.1 Nommage

  * **Code (Classes, Vars)** : Anglais (`CreateProduct`, `save`, `isValid`).
  * **Logs / Erreurs / Tests** : Français ("Le prix doit être positif", "Scénario : création réussie").
  * **Fichiers** : CamelCase correspondant au contenu (ex: `createProductUseCase.ts`).

### 5.2 Gestion des Erreurs

L'application doit toujours renvoyer des erreurs structurées au client.

  * Format JSON : `{ "message": "Description de l'erreur" }`.
  * Le Use Case ne doit pas "leaker" des erreurs techniques (ex: erreur SQL brute) mais renvoyer une erreur fonctionnelle ("Erreur lors de la création").

-----

## 6. Guide de Démarrage & Commandes

### Pré-requis

  * Node.js 20+
  * Docker (pour la base de données et les tests E2E)

### Commandes Clés

| Action | Commande | Description |
| :--- | :--- | :--- |
| **Install** | `npm install` | Installe les dépendances. |
| **Dev** | `npm run dev` | Lance le serveur avec rechargement à chaud (nodemon). |
| **DB Local** | `docker compose --env-file .env.local up` | Lance PostgreSQL en local. |
| **Tests** | `npm test` | Lance tous les tests en mode "watch". |
| **Test CI** | `jest --config ./jest.config.js` | Lance les tests une seule fois (pour CI/CD). |

### Setup Initial

1.  Dupliquer `.env` en `.env.local`.
2.  Remplir les infos DB (`DB_HOST`, `DB_USER`...).
3.  Lancer le docker compose.
4.  Lancer `npm run dev`.
5.  Vérifier via `GET http://localhost:3000/api/health`.

-----

## 7. Règles Métier Actuelles (Documentation Vivante)

Cette section résume les règles implémentées, extraites des specs et du code.

### Domaine : Produit (Product)

  * **Création / Modification** :
      * Le titre doit avoir plus de 2 caractères.
      * Le prix doit être strictement positif (> 0).
      * Le prix doit être inférieur à 10 000.
      * *Erreur* : Si validation échoue, renvoyer une 400 avec message explicite.

### Domaine : Commande (Order)

  * **Ajout de produit** :
      * Si le produit est déjà dans la commande : incrémenter la quantité.
      * Sinon : ajouter ligne avec quantité 1.
      * Max 5 produits différents par commande.
      * Montant total max de la commande : 2000€.
