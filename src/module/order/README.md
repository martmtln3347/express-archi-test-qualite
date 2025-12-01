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

- **Use Case (`createOrderUseCase.ts`)** :
  - Orchestre la création.
  - Ne dépend que de l'interface `CreateOrderRepository`.
  - Gère les erreurs techniques.

- **Repository** :
  - Séparation Interface / Implémentation pour respecter le DIP (Dependency Inversion Principle).

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
