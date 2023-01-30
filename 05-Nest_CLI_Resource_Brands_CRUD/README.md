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
