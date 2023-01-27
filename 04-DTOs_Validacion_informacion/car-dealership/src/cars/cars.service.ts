import { Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { ICar } from './interfaces/cars.interface'


@Injectable()
export class CarsService {
    private _cars: ICar[] = [
        {
            id: uuid(),
            brand: 'Toyota',
            model: 'Corolla'
        },
        {
            id: uuid(),
            brand: 'Honda',
            model: 'Civic'
        },
        {
            id: uuid(),
            brand: 'Jeep',
            model: 'Cherokee'
        }
    ]

    public findAll () {
        return [ ...this._cars ]
    }

    public findOneById ( id: string ) {
        return { ...this._cars.find( car => car.id === id ) }
    }
}
