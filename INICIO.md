# Cómo iniciar el aplicativo

## Requisitos previos

| Herramienta | Versión mínima | Verificar con         |
|-------------|----------------|-----------------------|
| Node.js     | 24 LTS         | `node --version`      |
| npm         | 10+            | `npm --version`       |

---

## Primera vez

### 1. Clonar o copiar el proyecto

El proyecto está en `C:\wamp64\www\inge`. Si se trabaja en otra máquina, copiar la carpeta completa (sin `node_modules`).

### 2. Crear el archivo de variables de entorno

```bash
cp .env.example .env.local
```

En modo mockup no es necesario modificar nada dentro de `.env.local`. Todas las variables pueden quedar vacías.

### 3. Instalar dependencias

```bash
npm install
```

---

## Iniciar el servidor de desarrollo

```bash
npm run dev
```

El servidor arranca en **http://localhost:6001**

La primera compilación tarda unos segundos (Turbopack). Las siguientes son casi instantáneas.

---

## Detener el servidor

Presionar `Ctrl + C` en la terminal donde corre `npm run dev`.

---

## Flujo básico de uso

1. **Lista de ingenierías** — pantalla inicial. Muestra todas las ingenierías mock.
2. **Crear ingeniería** — botón "+ Nueva ingeniería". Pide nombre, cliente y cuenta.
3. **Editor de topología** — se abre al hacer click en una ingeniería.
   - Arrastrar dispositivos desde la barra izquierda al canvas.
   - Conectar dispositivos arrastrando desde un handle gris hacia otro nodo.
   - Seleccionar el tipo de enlace en la barra izquierda antes de conectar.
   - Click sobre un nodo o enlace para ver sus propiedades en el panel derecho.
4. **Guardar** — botón FAB rojo (esquina inferior derecha) → ícono 💾, o el botón "Guardar" en la barra superior.

---

## Cambiar perfil de usuario (para probar distintos roles)

El selector de perfil está en la **lista de ingenierías**, arriba a la derecha de la tabla. Cambiar entre:

- **Operativo** — puede crear y editar topologías, enviar a revisión
- **Supervisor** — todo lo anterior + aprobar o rechazar
- **Consulta** — solo lectura, sin edición

---

## Cambiar tema claro / oscuro

El switch de tema está en la barra superior del editor (ícono sol / luna), extremo derecho.

---

## Comandos disponibles

| Comando           | Descripción                                  |
|-------------------|----------------------------------------------|
| `npm run dev`     | Servidor de desarrollo en puerto 6001        |
| `npm run build`   | Compilación de producción                    |
| `npm run start`   | Servidor de producción (requiere build previo)|
| `npm run lint`    | Linter ESLint                                |

---

## Solución de problemas comunes

### "Puerto 6001 en uso"

Verificar qué proceso lo usa y detenerlo, o cambiar el puerto en `package.json`:

```json
"dev": "next dev --turbopack --port 6001"
```

### "Error: Cannot find module" tras actualizar ramas

Borrar la carpeta `node_modules` y volver a instalar:

```bash
rm -rf node_modules
npm install
```

### La página muestra error de compilación TypeScript

El terminal donde corre `npm run dev` muestra el error con archivo y línea exacta. Corregir el error; Turbopack recompila automáticamente al guardar.

### Los cambios en el canvas no persisten al recargar

Esperado: `MOCK_MODE = true` guarda en memoria. Al recargar el browser, el estado vuelve a los datos mock de `src/data/mock.ts`. Para persistir, usar el botón Guardar (FAB → 💾) antes de cerrar — en modo mock esto actualiza el estado Zustand en memoria hasta el siguiente reload.
