import axios from "axios"
import { PokeApiAdapter } from "../api/pokeApi.adapter"
import { IPokeAPI, Move } from "../interfaces/pokeapi-response.interface"

export class Pokemon {

    get imageUrl (): string {
        return `https://image/${ this.id }.jpg`
    }

    constructor (
        public readonly id: number,
        public name: string,
        private readonly _http: PokeApiAdapter
    ) { }


    scream () {
        console.log( `${ this.name.toUpperCase() }!!!` )
    }

    speak () {
        console.log( `${ this.name }, ${ this.name }` )
    }

    async getMoves (): Promise<Move[]> {
        const data = await this._http.get( `https://pokeapi.co/api/v2/pokemon/${ this.id }` )
        const { moves } = data
        return moves
    }
}

const pokeApi = new PokeApiAdapter()

export const bulbasaur = new Pokemon( 1, 'Bulbasaur', pokeApi )