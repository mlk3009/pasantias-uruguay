# Docker

## Init Docker

Primera instalacion, no hay que realizar estos pasos, bajar hasta "INICIAR DOCKER"

El root no tiene contraseña, esto se va a corregir en otra entrega.

`cp .env.example .env`

`docker-compose build`

`docker-compose up -d`

`docker exec -t -i PasantiasUY_backend /bin/bash`

`composer install`


backend: `localhost:8000`

frontend: `localhost:4200`

phpmyadmin: `localhost:7000`


## INICIAR DOCKER

`cp .env.example .env`
Si necesitas iniciar nuevamente los contenedores de Docker, puedes usar el comando que usaste al principio:

`docker-compose up -d`

Este comando creará e iniciará todos los contenedores, redes y volúmenes definidos en tu archivo `docker-compose.yml`, y los ejecutará en segundo plano (debido a la opción `-d`).

Luego de eso hay que usar el comando:

`docker exec -t -i PasantiasUY_backend /bin/bash`

Este paso solo se hace en caso de que no se levante la pagina o el phpmyadmin, dentro de la maquina del backend, hay que usar:

`composer update`

Con esto ya se inicia tanto el backend como el frontend, luego de esto solo queda utilizar:

`php artisan migrate`


## DETENER DOCKER

Para detener todos los contenedores de Docker, puedes usar el siguiente comando:

`docker-compose down`

Este comando detendrá y eliminará todos los contenedores, así como las redes, volúmenes y imágenes definidas en tu archivo `docker-compose.yml`.









