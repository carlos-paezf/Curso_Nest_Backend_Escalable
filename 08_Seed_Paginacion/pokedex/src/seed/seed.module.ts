import { Module } from '@nestjs/common'
import { PokemonModule } from '../pokemon/pokemon.module'
import { SeedController } from './seed.controller'
import { SeedService } from './seed.service'

@Module( {
    controllers: [ SeedController ],
    providers: [ SeedService ],
    imports: [ PokemonModule ]
} )
export class SeedModule { }
