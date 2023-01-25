import axios from "axios"

export class Pokemon {

    get imageUrl (): string {
        return `https://image/${ this.id }.jpg`
    }

    constructor (
        public readonly id: number,
        public name: string
    ) { }


    scream () {
        console.log( `${ this.name.toUpperCase() }!!!` )
    }

    speak () {
        console.log( `${ this.name }, ${ this.name }` )
    }

    async getMoves () {
        const response = await axios.get( `https://pokeapi.co/api/v2/pokemon/${ this.id }` )
        const { data } = response
        return data
    }
}


export const saurio = new Pokemon( 1, 'Bulbasaur' )

console.log( await saurio.getMoves() )