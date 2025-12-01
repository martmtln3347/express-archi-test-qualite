import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'float' })
    public totalPrice: number;

    @Column("simple-array")
    public productIds: string[];

    @Column({ type: 'varchar', default: 'PENDING' })
    public status: string;

    @CreateDateColumn()
    public creationDate: Date;

    constructor(props?: { totalPrice: number; productIds: string[] }) {
        if (props) {
            this.validateTotalPrice(props.totalPrice);
            this.validateProductIds(props.productIds);
            this.totalPrice = props.totalPrice;
            this.productIds = props.productIds;
            this.status = 'PENDING';
        }
    }

    private validateTotalPrice(price: number) {
        if (price < 2) {
            throw new Error('Le prix total doit être au minimum de 2€');
        }
        if (price > 500) {
            throw new Error('Le prix total doit être au maximum de 500€');
        }
    }

    private validateProductIds(ids: string[]) {
        if (!ids || ids.length < 1) {
            throw new Error('La commande doit contenir au moins 1 produit');
        }
        if (ids.length > 5) {
            throw new Error('La commande ne peut pas contenir plus de 5 produits');
        }
    }
}
