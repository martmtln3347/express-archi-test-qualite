import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { Order } from '../../Order';
import { buildApp } from '../../../../config/app';
import request from 'supertest';
import { Express } from 'express';

/**
 * Tests e2e de la création de commande.
 * On redémarre une base Postgres éphémère via Testcontainers pour couvrir tout le flux HTTP → DB.
 */
describe('US-2 : Créer une commande - E2E', () => {
    let container: StartedPostgreSqlContainer;
    let dataSource: DataSource;
    let app: Express;

    beforeAll(async () => {
        container = await new PostgreSqlContainer('postgres:16').withExposedPorts(5432).start();

        dataSource = new DataSource({
            type: 'postgres',
            host: container.getHost(),
            port: container.getPort(),
            username: container.getUsername(),
            password: container.getPassword(),
            database: container.getDatabase(),
            logging: false,
            entities: [Order],
            synchronize: true,
            entitySkipConstructor: true
        });

        await dataSource.initialize();

        const AppDataSource = require('../../../../config/db.config').default;
        Object.assign(AppDataSource, dataSource);

        app = buildApp();
    });

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
        if (container) {
            await container.stop();
        }
    });

    test('Scénario 1 : création réussie', async () => {
        // Étant donné qu'il n'y a pas de commande enregistrée
        await dataSource.getRepository(Order).clear();

        // Quand je créé une commande valide
        const response = await request(app)
            .post('/api/orders')
            .send({
                totalPrice: 120,
                productIds: ['1', '2']
            })
            .set('Content-Type', 'application/json');

        // Alors la commande doit être créée
        expect(response.status).toBe(201);
        const orders = await dataSource.getRepository(Order).find();
        expect(orders).toHaveLength(1);
        expect(orders[0].totalPrice).toBe(120);
        expect(orders[0].productIds).toEqual(['1', '2']);
        expect(orders[0].status).toBe('PENDING');
        expect(orders[0].creationDate).toBeInstanceOf(Date);
    });

    test('Scénario 2 : échec, trop de produits', async () => {
        // Étant donné qu'il n'y a pas de commande enregistrée
        await dataSource.getRepository(Order).clear();

        // Quand j'essaie de créer une commande avec 6 produits
        const response = await request(app)
            .post('/api/orders')
            .send({
                totalPrice: 150,
                productIds: ['1', '2', '3', '4', '5', '6']
            })
            .set('Content-Type', 'application/json');

        // Alors une erreur doit être envoyée
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('La commande ne peut pas contenir plus de 5 produits');

        const orders = await dataSource.getRepository(Order).find();
        expect(orders).toHaveLength(0);
    });
});
