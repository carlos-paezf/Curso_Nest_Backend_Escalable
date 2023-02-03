import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { PokemonService } from 'src/pokemon/pokemon.service'
import { IPokeResponse } from './interfaces/poke-res.interface'

@Injectable()
export class SeedService {
    private readonly _axios: AxiosInstance = axios

    constructor ( private readonly _pokemonService: PokemonService ) { }

    async populateDB () {
        const { data: { results } } = await this._axios.get<IPokeResponse>( `https://pokeapi.co/api/v2/pokemon?limit=2000` )
        results.forEach( ( { name, url } ) => {
            const segments = url.split( '/' )
            const number: number = +segments.at( -2 )
            this._pokemonService.create( { name: name.toLocaleLowerCase(), number } )
        } )
        return
    }
}
