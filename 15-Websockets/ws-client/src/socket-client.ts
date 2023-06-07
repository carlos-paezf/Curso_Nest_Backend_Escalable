import { Manager, Socket } from 'socket.io-client';


export const connectToServer = () => {
    const manager = new Manager( 'http://localhost:3000/socket.io/socket.io.js' );

    const socket = manager.socket( '/' );

    addListeners( socket );
};


const addListeners = ( socket: Socket ) => {
    const serverStatusSpan = document.querySelector( '#server-status' )!;
    const clientsUl = document.querySelector( '#clients-ul' )!;
    const msgForm = document.querySelector( '#message-form' )! as HTMLFormElement;
    const msgInput = document.querySelector( '#message-input' )! as HTMLInputElement;

    socket.on( 'connect', () => {
        serverStatusSpan.innerHTML = 'connected';
    } );

    socket.on( 'disconnect', () => {
        serverStatusSpan.innerHTML = 'disconnected';
    } );

    socket.on( 'clients-updated', ( clients: string[] ) => {
        let clientsHtml = '';

        clients.forEach( id => {
            clientsHtml += `<li>${ id }</li>`;
        } );

        clientsUl.innerHTML = clientsHtml;
    } );

    msgForm.addEventListener( 'submit', ( event ) => {
        event.preventDefault();

        if ( !msgInput.value.trim().length ) return;

        socket.emit( 'message-client', { id: socket.id, message: msgInput.value } );

        msgInput.value = '';
    } );
};