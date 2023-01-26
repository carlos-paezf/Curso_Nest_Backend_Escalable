import { bulbasaur, charmander } from './bases/04-injection'
import './style.css'


const numberMovesBulbasur = ( await bulbasaur.getMoves() ).length
const numberMovesCharmander = ( await charmander.getMoves() ).length


document.querySelector<HTMLDivElement>( '#app' )!.innerHTML = `
    <div>
        <h1>Hello Vite!!!<h1>
        <pre>Number of moves of ${ bulbasaur.name }: ${ numberMovesBulbasur }</pre>
        <pre>Number of moves of ${ charmander.name }: ${ numberMovesCharmander }</pre>
    </div>
`