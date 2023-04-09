import { Controller, Get } from '@nestjs/common';
import { ValidRoles } from '../auth/constants';
import { Auth } from '../auth/decorators';
import { SeedService } from './seed.service';

@Controller( 'seed' )
export class SeedController {
    constructor ( private readonly seedService: SeedService ) { }

    @Get()
    @Auth( ValidRoles.ADMIN )
    executeSeed () {
        return this.seedService.runSeed();
    }
}
