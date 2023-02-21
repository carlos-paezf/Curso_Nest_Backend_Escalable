import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule } from '@nestjs/typeorm'

import { join } from 'path'

import { CommonsModule } from './commons/commons.module'
import { JoiValidationSchema } from './config/joi.validation'
import { FilesModule } from './files/files.module'
import { ProductsModule } from './products/products.module'
import { SeedModule } from './seed/seed.module'

@Module( {
    imports: [
        ConfigModule.forRoot( {
            validationSchema: JoiValidationSchema
        } ),

        TypeOrmModule.forRoot( {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number( process.env.DB_PORT ),
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            autoLoadEntities: true,
            synchronize: true,
        } ),

        ServeStaticModule.forRoot( {
            rootPath: join( __dirname, '..', 'public' )
        } ),

        ProductsModule,

        CommonsModule,

        SeedModule,

        FilesModule
    ],
} )
export class AppModule { }
