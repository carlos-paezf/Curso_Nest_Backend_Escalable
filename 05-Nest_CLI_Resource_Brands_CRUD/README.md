# Sección 05: Nest CLI Resource - Brands CRUD

Esta sección es básicamente un reforzamiento de lo aprendido hasta el momento, pero le adicionamos la comunicación entre módulos y servicios.

Puntualmente:

- SEED Endpoint
  - Llenar data de Carros y Marcas
  - Comunicar módulo seed, con los otros módulos de nuestra aplicación
- Errores comunes a la hora de utilizar módulos enlazados
- Problemas con inyección de dependencias de módulos externos
- Brands CRUD completo
  - Endpoints
  - DTOs
  - Servicios
  - Controladores

## Continuación del proyecto

Vamos a usar el proyecto de la sección pasada, por lo que para reconstruir los `node_modules` usamos el comando de `pnpm install` o `pnpm i`, y para levantar el proyecto usamos el comando `pnpm start:dev`. Podemos copiar el proyecto a través de consola con el comando:

```txt
$: cp -r 04-DTOs_Validacion_informacion/car-dealership/ 05-Nest_CLI_Resource_Brands_CRUD
```

## Nest CLI Resource - Brands

Vamos a crear un nuevo CRUD relacionados a las marcas o brands en inglés. Podríamos crear todo manualmente como en la sección pasada, pero Nest se dió cuenta que es una tarea común por lo que añadió una funcionalidad llamada `resource`, el cual para usarlo ejecutamos el siguiente comando:

```txt
$: nest g resource brands --no-spec
```

Una vez ejecutado el comando, debemos seleccionar la capa de transporte que estamos usando, en este caso será REST API. Lo siguiente es seleccionar si queremos generar los puntos de entrada del CRUD, y le decimos que si. Lo que veremos de la ejecución del comando será lo siguiente:

```txt
$: nest g resource brands --no-spec
? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? Yes
CREATE src/brands/brands.controller.ts (915 bytes)
CREATE src/brands/brands.module.ts (254 bytes)
CREATE src/brands/brands.service.ts (623 bytes)
CREATE src/brands/dto/create-brand.dto.ts (31 bytes)
CREATE src/brands/dto/update-brand.dto.ts (173 bytes)
CREATE src/brands/entities/brand.entity.ts (22 bytes)
UPDATE src/app.module.ts (297 bytes)
```

## Crear CRUD completo de Brands

Vamos a crear el CRUD completo para el módulo de Brands. Lo primero es definir la entidad:

```ts
export class Brand {
    id: string
    name: string

    createdAt: number
    updatedAt?: number
}
```
