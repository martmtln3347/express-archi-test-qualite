# Explication des Tests `createOrderUseCase`

Ce document détaille le rôle du "mock repository" (ici un **dummy repository**) et la raison d'être des différents scénarios présents dans `createOrderUseCase.spec.ts`.

## Pourquoi un « mock repository » ?

Dans les tests unitaires du use case `CreateOrderUseCase`, on ne veut pas toucher à la base de données réelle. On remplace donc l'implémentation TypeORM par une **double de test** qui implémente simplement l'interface `CreateOrderRepository` sans rien faire dans sa méthode `save`.

```typescript
class CreateOrderDummyRepository implements CreateOrderRepository {
    async save(): Promise<void> {
        // Ne fait rien : aucun accès disque ou réseau
    }
}
```

- **But** : isoler la logique métier (validation des produits, du prix) pour obtenir un test rapide et déterministe.
- **Avantage** : on peut forcer le use case à se concentrer sur les règles métier sans se soucier de l'infrastructure.

## Pourquoi plusieurs scénarios ?

Chaque scénario reflète une règle métier décrite dans le cahier des charges. Comme pour les tests de création de produit, on adopte une approche **BDD (Given / When / Then)** afin de rendre le comportement explicite.

| Scénario | Objectif | Détail |
| --- | --- | --- |
| 1. Création réussie | Vérifier le chemin nominal. | `totalPrice` dans les bornes + 2 produits → aucune erreur.
| 2. Prix trop bas | Protéger la borne min de 2 €.
| 3. Prix trop haut | Protéger la borne max de 500 €.
| 4. Zéro produit | S'assurer qu'au moins un produit est envoyé.
| 5. Trop de produits | Empêcher l'utilisateur de dépasser 5 produits.
| 6. Liste à 6 IDs | Cas spécifique demandé : tente d'envoyer 6 identifiants, l'exception « La commande ne peut pas contenir plus de 5 produits » est attendue.

Chaque scénario suit la même structure :
1. **Given** : on instancie le use case avec le dummy repository.
2. **When** : on appelle `execute` avec un jeu de données précis.
3. **Then** : on vérifie soit que l'appel réussit (`resolves.not.toThrow()`), soit qu'une erreur fonctionnelle est levée (`rejects.toThrow(...)`).

Cette granularité permet de documenter clairement le comportement attendu de la création de commande et de garantir que toute régression sur ces règles métier sera détectée rapidement.

## Tests End-to-End (`createOrder.e2e.spec.ts`)

- **Objectif** : Valider le flux complet HTTP → Use Case → Repository → PostgreSQL via une base éphémère gérée par Testcontainers.
- **Setup** :
    - Démarre un container `postgres:16` par test suite.
    - Initialise un `DataSource` TypeORM dédié avec l'entité `Order` et synchronisation auto.
    - Remplace la configuration globale (`AppDataSource`) par cette datasource de test avant de construire l'app Express.
- **Scénarios couverts** :
    1. Création réussie (`201`) et vérification des données persistées (prix, produits, statut `PENDING`, `creationDate`).
    2. Échec quand 6 produits sont envoyés (`400` + message métier) et absence d'insertion en BDD.

## Lancer les tests

Tous les tests (unitaires + e2e) s'exécutent via la même commande :

```bash
npm run test
```

> Les tests e2e utilisent Docker (Testcontainers). Assurez-vous que Docker Desktop est ouvert avant d'exécuter la commande.
