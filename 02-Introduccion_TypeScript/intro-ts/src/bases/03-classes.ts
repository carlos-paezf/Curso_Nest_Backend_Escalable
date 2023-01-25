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
}


export const saurio = new Pokemon( 1, 'saurio' )