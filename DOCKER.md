# Dockerización del proyecto Ingenierías

Este proyecto es una aplicación **Next.js** que corre en el puerto **6001**.

## Archivos agregados

- `Dockerfile`: build multi-stage para producción.
- `.dockerignore`: evita copiar dependencias, builds y archivos locales al contexto Docker.
- `docker-compose.yml`: levanta la app con Docker Compose.
- `.env.docker`: variables de entorno para el contenedor.
- `next.config.ts`: se agregó `output: 'standalone'` para generar un runtime más ligero.

## Levantar con Docker Compose

Desde la raíz del proyecto:

```bash
docker compose up --build
```

La aplicación quedará disponible en:

```text
http://localhost:6001
```

## Detener el contenedor

```bash
docker compose down
```

## Construir imagen manualmente

```bash
docker build -t ingenierias-app .
```

## Ejecutar imagen manualmente

```bash
docker run --rm -p 6001:6001 --env-file .env.docker ingenierias-app
```

## Variables de entorno

Edita `.env.docker` cuando necesites conectar servicios externos:

```env
NEXT_PUBLIC_API_URL=
DATABASE_URL=
DISCOVERY_BASE_URL=
DISCOVERY_API_KEY=
CMDB_BASE_URL=
CMDB_API_KEY=
LDAP_URL=
LDAP_BASE_DN=
LDAP_BIND_USER=
LDAP_BIND_PASSWORD=
```

Actualmente el proyecto funciona en modo mock/memoria, por lo que no necesita base de datos para arrancar.
