import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';

@WebSocketGateway( { cors: true } )
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() wss: Server;

    constructor ( private readonly messagesWsService: MessagesWsService ) { }

    handleConnection ( client: Socket ) {
        const token = client.handshake.headers.authentication as string;

        console.log( { token } );

        this.messagesWsService.registerClient( client );

        this.wss.emit( 'clients-updated', this.messagesWsService.getConnectedClients() );
    }

    handleDisconnect ( client: Socket ) {
        this.messagesWsService.removeClient( client.id );

        this.wss.emit( 'clients-updated', this.messagesWsService.getConnectedClients() );
    }

    @SubscribeMessage( 'message-client' )
    onMessageFromClient ( client: Socket, payload: NewMessageDto ) {
        /* 
            client.emit( 'message-server', {
                fullName: 'Private!!!',
                message: payload.message || 'no-message!!!'
            } );
          

            client.broadcast.emit( 'message-server', {
                fullName: 'Another!!!',
                message: payload.message || 'no-message°°°'
            } ); 
          */

        this.wss.emit( 'message-server', {
            fullName: 'Public!!!',
            message: payload.message || 'no-message!!!'
        } );
    }
}
