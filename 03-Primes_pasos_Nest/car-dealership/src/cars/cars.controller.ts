import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { CarsService } from './cars.service'


@Controller( 'cars' )
export class CarsController {

    constructor ( private readonly _carsService: CarsService ) { }

    @Get()
    getAllCars () {
        return this._carsService.findAll()
    }

    @Get( ':id' )
    getCarById ( @Param( 'id', ParseIntPipe ) id: number ) {
        return {
            id,
            data: this._carsService.findOneById( id )
        }
    }
}
