import { CreateProductRepository } from './createProductRepository';
import { Product } from '../Product';

export class CreateProductUseCase {
    private productRepository: CreateProductRepository;

    constructor(productRepository: CreateProductRepository) {
        this.productRepository = productRepository;
    }

    async execute({
        title,
        description,
        price
    }: {
        title: string;
        description: string;
        price: number;
    }): Promise<void> {

        if (price < 0) {
            throw new Error('le prix doit être supérieur à 0');
        }

        if (price > 10000) {
            throw new Error('le prix doit être inférieur à 10000');
        }

        const product = new Product({ title, description, price });

        try {
            await this.productRepository.save(product);
        } catch (error) {
            throw new Error('erreur lors de la création du produit');
        }
    }
}
