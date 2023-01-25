export class Pokemon {
    constructor (
        public readonly id: number,
        public name: string
    ) { }
}


export const saurio = new Pokemon( 1, 'saurio' )

// saurio.id = 10
saurio.name = 'saurio-evo'