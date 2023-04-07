import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class UserRoleGuard implements CanActivate {
    constructor ( private readonly _reflector: Reflector ) { }

    canActivate (
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const validRoles: string[] = this._reflector.get( 'roles', context.getHandler() );

        return true;
    }
}
