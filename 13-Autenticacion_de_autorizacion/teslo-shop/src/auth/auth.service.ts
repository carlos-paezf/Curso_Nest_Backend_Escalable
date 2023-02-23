import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DBExceptionService } from 'src/commons/services/db-exception.service'
import { Repository } from 'typeorm'
import { CreateUserDTO } from './dto/create-user.dto'
import { User } from './entities/user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {

    constructor ( @InjectRepository( User ) private readonly _userRepository: Repository<User> ) { }

    async create ( createUserDto: CreateUserDTO ) {
        try {
            const { password, ...userData } = createUserDto

            const user = this._userRepository.create( {
                ...userData,
                password: bcrypt.hashSync( password, 10 )
            } )

            await this._userRepository.save( user )

            delete user.password

            return user
        } catch ( error ) {
            DBExceptionService.handleDBException( error )
        }
    }
}
