import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'


@Controller( 'cars' )
export class CarsController {

    private _cars = [ 'Toyota', 'Honda', 'Jeep' ]

    @Get()
    getAllCars () {
        return this._cars
    }

    @Get( ':id' )
    getCarById ( @Param( 'id', ParseIntPipe ) id: number ) {
        return {
            id,
            data: this._cars.at( id )
        }
    }
}
