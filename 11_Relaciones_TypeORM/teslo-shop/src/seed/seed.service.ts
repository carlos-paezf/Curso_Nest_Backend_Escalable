import { Injectable } from '@nestjs/common'
import { ProductsService } from './../products/products.service'

@Injectable()
export class SeedService {
    constructor ( private readonly _productsService: ProductsService ) { }

    async runSeed () {
        await this._insertNewProducts()
        return 'Seed Executed'
    }

    private async _insertNewProducts () {
        await this._productsService.deleteAllProducts()
        return
    }
}
