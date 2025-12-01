import { describe, expect, test } from '@jest/globals';
import { CreateOrderUseCase } from '../createOrderUseCase';
import { CreateOrderRepository } from '../createOrderRepository';
import { Order } from '../../Order';

class CreateOrderDummyRepository implements CreateOrderRepository {
    async save(order: Order): Promise<void> {
        // Ne fait rien, c'est un dummy
    }
}

describe('US-2 : Créer une commande', () => {
    test('Scénario 1 : création réussie', async () => {
        // Étant donné qu'il n'y a pas de commande enregistrée
        const createOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(createOrderRepository);

        await expect(
            // Quand je créé une commande valide
            createOrderUseCase.execute({
                totalPrice: 100,
                productIds: ['1', '2']
            })
            // Alors la commande doit être créée
        ).resolves.not.toThrow();
    });

    test('Scénario 2 : echec, prix total trop bas', async () => {
        const createOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(createOrderRepository);

        await expect(
            createOrderUseCase.execute({
                totalPrice: 1,
                productIds: ['1']
            })
        ).rejects.toThrow('Le prix total doit être au minimum de 2€');
    });

    test('Scénario 3 : echec, prix total trop haut', async () => {
        const createOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(createOrderRepository);

        await expect(
            createOrderUseCase.execute({
                totalPrice: 501,
                productIds: ['1']
            })
        ).rejects.toThrow('Le prix total doit être au maximum de 500€');
    });

    test('Scénario 4 : echec, pas assez de produits', async () => {
        const createOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(createOrderRepository);

        await expect(
            createOrderUseCase.execute({
                totalPrice: 100,
                productIds: []
            })
        ).rejects.toThrow('La commande doit contenir au moins 1 produit');
    });

    test('Scénario 5 : echec, trop de produits', async () => {
        const createOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(createOrderRepository);

        await expect(
            createOrderUseCase.execute({
                totalPrice: 100,
                productIds: ['1', '2', '3', '4', '5', '6']
            })
        ).rejects.toThrow('La commande ne peut pas contenir plus de 5 produits');
    });
});
