# Module Order

Ce module gère la logique liée aux commandes (Orders).

## Architecture

Le module suit l'architecture "Vertical Slices" définie dans le projet.

### Structure

```
src/module/order/
├── Order.ts                  # Entité du Domaine Order
├── createOrder/              # Feature "Créer une commande"
│   ├── createOrderController.ts       # Point d'entrée HTTP
│   ├── createOrderUseCase.ts          # Logique Métier
│   ├── createOrderRepository.ts       # Interface du Repository
│   ├── createOrderTypeOrmRepository.ts # Implémentation TypeORM
│   └── test/
│       └── createOrderUseCase.spec.ts # Tests Unitaires
```

## Conventions de Code

- **Entité (`Order.ts`)** :
  - Contient la validation métier (prix min/max, nombre de produits).
  - Utilise TypeORM pour la persistance.
  - Constructeur sécurisé pour garantir la validité de l'objet à l'instanciation.
  - Initialise automatiquement `status` à `PENDING` et `creationDate` en appelant `new Date()` afin d'assurer l'encapsulation des règles de création.

- **Use Case (`createOrderUseCase.ts`)** :
  - Orchestre la création.
  - Ne dépend que de l'interface `CreateOrderRepository`.
  - Gère les erreurs techniques.

- **Repository** :
  - Séparation Interface / Implémentation pour respecter le DIP (Dependency Inversion Principle).

- **Controller** :
  - Point d'entrée HTTP (`POST /orders`) qui instancie le use case.
  - Centralise la capture des erreurs fonctionnelles (400) vs techniques (500).

## Qualité & Tests

- **Qualité de code** :
  - ESLint + Prettier appliqués sur l'ensemble du module (mêmes règles que le reste du projet).
  - Respect des messages d'erreur en français côté métier pour rester cohérent avec le reste de l'API.
- **Tests** :
  - Tests unitaires (`createOrderUseCase.spec.ts`) couvrant chaque règle métier (bornes prix + bornes nombre de produits).
  - Utilisation d'un Dummy Repository pour isoler la logique métier et accélérer l'exécution.

## Règles Métier

- **Prix Total** :
  - Minimum : 2€
  - Maximum : 500€
- **Produits** :
  - Minimum : 1 produit
  - Maximum : 5 produits
- **Champs Automatiques** :
  - `status` : "PENDING" par défaut.
  - `creationDate` : Date actuelle.

## Tests

Les tests unitaires (`.spec.ts`) valident les règles métier en isolant le repository via un Dummy.
