import { saurio } from './bases/03-classes'
import './style.css'


document.querySelector<HTMLDivElement>( '#app' )!.innerHTML = `
    <div>
        <h1>Hello Vite!!!<h1>
        <pre>${ JSON.stringify( await saurio.getMoves(), null, 4 ) }</pre>
    </div>
`