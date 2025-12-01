import { CreateOrderRepository } from './createOrderRepository';
import { Order } from '../Order';

export class CreateOrderUseCase {
    private orderRepository: CreateOrderRepository;

    constructor(orderRepository: CreateOrderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute({
        totalPrice,
        productIds
    }: {
        totalPrice: number;
        productIds: string[];
    }): Promise<void> {
        const order = new Order({ totalPrice, productIds });

        try {
            await this.orderRepository.save(order);
        } catch (error) {
            throw new Error('erreur lors de la création de la commande');
        }
    }
}
