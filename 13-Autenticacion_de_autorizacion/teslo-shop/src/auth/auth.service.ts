import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { DBExceptionService } from 'src/commons/services/db-exception.service';
import { CreateUserDTO, LoginUserDTO } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {

    constructor ( @InjectRepository( User ) private readonly _userRepository: Repository<User> ) { }

    async create ( createUserDto: CreateUserDTO ) {
        try {
            const { password, ...userData } = createUserDto;

            const user = this._userRepository.create( {
                ...userData,
                password: bcrypt.hashSync( password, 10 )
            } );

            await this._userRepository.save( user );

            delete user.password;

            return user;
        } catch ( error ) {
            DBExceptionService.handleDBException( error );
        }
    }

    async login ( loginUserDto: LoginUserDTO ) {
        const { email, password } = loginUserDto;

        const user = await this._userRepository.findOne( {
            where: { email },
            select: { email: true, password: true }
        } );

        if ( !user || !bcrypt.compareSync( password, user.password ) )
            throw new UnauthorizedException( 'Invalid credentials' );

        return user;
    }
}
