import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Module( {
    imports: [
        TypeOrmModule.forFeature( [
            User
        ] ),
        PassportModule.register( { defaultStrategy: 'jwt' } ),
        JwtModule.register( {
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '2h'
            }
        } )
    ],
    controllers: [ AuthController ],
    providers: [ AuthService ],
    exports: [ TypeOrmModule ]
} )
export class AuthModule { }
