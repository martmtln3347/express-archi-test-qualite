import { CreateOrderTypeOrmRepository } from './createOrderTypeOrmRepository';
import { CreateOrderUseCase } from './createOrderUseCase';
import { Request, Response } from 'express';
const express = require('express');
const router = express.Router();

router.post('/orders', async (request: Request, response: Response) => {
    const { totalPrice, productIds } = request.body;

    const createOrderTypeOrmRepository = new CreateOrderTypeOrmRepository();
    const createOrderUseCase = new CreateOrderUseCase(createOrderTypeOrmRepository);

    try {
        await createOrderUseCase.execute({ totalPrice, productIds });
    } catch (error) {
        if (error instanceof Error) {
            return response.status(400).json({ message: error.message });
        }

        return response.status(500).json({ message: 'Internal server error' });
    }

    return response.status(201).json();
});

module.exports = router;
