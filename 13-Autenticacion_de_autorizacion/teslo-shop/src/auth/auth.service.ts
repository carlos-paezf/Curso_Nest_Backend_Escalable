import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DBExceptionService } from 'src/commons/services/db-exception.service'
import { Repository } from 'typeorm'
import { CreateUserDTO } from './dto/create-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class AuthService {

    constructor ( @InjectRepository( User ) private readonly _userRepository: Repository<User> ) { }

    async create ( createUserDto: CreateUserDTO ) {
        try {
            const user = this._userRepository.create( createUserDto )
            await this._userRepository.save( user )
            return user
        } catch ( error ) {
            DBExceptionService.handleDBException( error )
        }
    }
}
