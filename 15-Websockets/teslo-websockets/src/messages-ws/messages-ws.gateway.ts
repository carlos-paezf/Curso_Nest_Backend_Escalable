import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';
import { IJwtPayload } from '../auth/interfaces';

@WebSocketGateway( { cors: true } )
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() wss: Server;

    constructor (
        private readonly messagesWsService: MessagesWsService,
        private readonly _jwtService: JwtService
    ) { }

    handleConnection ( client: Socket ) {
        const token = client.handshake.headers.authentication as string;
        let payload: IJwtPayload;

        try {
            payload = this._jwtService.verify( token );
        } catch ( error ) {
            console.error( error );
            client.disconnect();
            return;
        }

        console.log( { payload } );

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
