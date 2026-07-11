# Ingenierías de Red — Matriz de Riesgos

> Documento de gestión de riesgos para la reingeniería del aplicativo de Ingeniería de Red de Totalplay.

## Escala de referencia

| Nivel | Probabilidad | Impacto |
|-------|-------------|---------|
| Alto | > 60% de ocurrencia | Afecta plazo o costo en más de un 30% |
| Medio | 30–60% | Afecta plazo o costo entre 10–30% |
| Bajo | < 30% | Afecta plazo o costo menos de un 10% |

---

## Riesgos técnicos

### R01 — Código del aplicativo actual en mal estado
**Probabilidad:** Alta | **Impacto:** Alto | **Prioridad:** 🔴 Crítico

El aplicativo productivo puede tener código sin estándares, lógica de negocio embebida en queries SQL, o sin separación de responsabilidades. Esto dificulta el relevamiento y puede requerir trabajo no previsto.

**Mitigación:**
- La Fase 1 incluye un relevamiento formal con entregable explícito antes de comprometer plazos definitivos
- Cotizar con rango de esfuerzo (mínimo/máximo) hasta completar el relevamiento
- Acordar con el cliente un mecanismo de ajuste de scope si el relevamiento revela complejidad mayor a la estimada

---

### R02 — Esquema de BD difícil de mapear o con integridad débil
**Probabilidad:** Alta | **Impacto:** Alto | **Prioridad:** 🔴 Crítico

Bases de datos legacy frecuentemente tienen nombres crípticos, falta de foreign keys, datos inconsistentes, o lógica en triggers no documentados.

**Mitigación:**
- Solicitar acceso a la BD desde el inicio del proyecto
- Hacer análisis de calidad de datos antes de comprometer la migración
- Si la integridad es muy baja, proponer limpieza de datos como tarea cotizada por separado
- El ORM elegido (Prisma) soporta tanto PostgreSQL como MariaDB con un cambio de una línea, lo que protege ante la indecisión del cliente sobre el motor

---

### R03 — Servicio de Discovery sin API limpia
**Probabilidad:** Media | **Impacto:** Alto | **Prioridad:** 🟠 Alto

El servicio de Discovery puede estar implementado como un script, escribir directo a la BD, o exponer datos en formato no estándar. La integración está contemplada en `src/app/api/ingenierias/[id]/discovery/route.ts` pero depende completamente del relevamiento.

**Mitigación:**
- Incluir el relevamiento del servicio en la Fase 1
- Si no tiene API: cotizar el desarrollo de un adaptador como ítem separado
- Plan B: integración vía polling a la BD del servicio en lugar de API

---

### R04 — Conector CMDB sin API de escritura o con acceso restringido
**Probabilidad:** Media | **Impacto:** Medio | **Prioridad:** 🟠 Alto

El código ya contempla lectura (`cmdbApi.verificar`) y escritura (`cmdbApi.actualizar`) en `src/lib/api.ts`, pero ambas son placeholders hasta confirmar las capacidades del Conector.

**Mitigación:**
- Relevar las capacidades del Conector CMDB en la Fase 1 con foco específico en escritura
- Si no hay escritura: proponer exportación manual como alternativa degradada
- Incluir en la propuesta que la habilitación de acceso a la CMDB es responsabilidad del cliente

---

### R05 — Autenticación corporativa compleja de integrar
**Probabilidad:** Media | **Impacto:** Medio | **Prioridad:** 🟠 Alto

El SSO corporativo puede tener versiones antiguas de protocolos, requerir certificados específicos, o tener un proceso de onboarding burocráticamente largo. El placeholder está en `src/app/api/auth/me/route.ts`.

**Mitigación:**
- Solicitar desde el inicio el contacto del área de IT/Seguridad del cliente
- Preguntar si hay otras aplicaciones ya integradas al SSO para usarlas de referencia
- Contemplar en el plan de proyecto el tiempo de proceso de aprobación (puede ser semanas)

---

### R06 — Indecisión sobre el motor de base de datos
**Probabilidad:** Media | **Impacto:** Bajo | **Prioridad:** 🟡 Medio

El cliente aún no confirma si usará PostgreSQL o MariaDB. Esto no bloquea el desarrollo del mockup, pero sí bloquea la implementación de las queries reales.

**Mitigación (ya implementada):**
- El proyecto usa Prisma como ORM. Cambiar de PostgreSQL a MariaDB es una sola línea en `prisma/schema.prisma` (`provider = "postgresql"` → `"mysql"`). No afecta el código de la aplicación.
- Se puede avanzar con el mockup funcional (`MOCK_MODE = true`) hasta que se defina el motor

---

### R07 — Performance del canvas con topologías grandes
**Probabilidad:** Baja | **Impacto:** Medio | **Prioridad:** 🟡 Medio

React Flow tiene buen rendimiento hasta ~500 nodos. Topologías más grandes pueden tener degradación visual.

**Mitigación:**
- Definir en la propuesta el límite de nodos soportado (se propone hasta 200 como scope inicial)
- React Flow tiene virtualización de nodos disponible si se necesita escalar

---

## Riesgos de proyecto

### R08 — Disponibilidad limitada de interlocutores del cliente
**Probabilidad:** Alta | **Impacto:** Alto | **Prioridad:** 🔴 Crítico

El `BACKLOG.md` lista 9 ítems que requieren definición del cliente. Si los responsables no tienen tiempo asignado, las definiciones se demoran y bloquean el desarrollo. El item más crítico es la decisión sobre la BD.

**Mitigación:**
- Incluir en el contrato una cláusula de bloqueo: si el cliente no responde una definición en X días hábiles, el plazo del proyecto se extiende proporcionalmente
- Solicitar un sponsor con autoridad para tomar decisiones o escalar
- Reuniones semanales de seguimiento como obligatorias

---

### R09 — Expansión de scope durante el desarrollo
**Probabilidad:** Alta | **Impacto:** Alto | **Prioridad:** 🔴 Crítico

Es muy común que durante el desarrollo el cliente agregue funcionalidades no contempladas, especialmente al ver el nuevo sistema funcionando.

**Mitigación:**
- El alcance está documentado en detalle en la propuesta — hacer que el cliente lo firme
- Establecer un proceso formal de gestión de cambios: cualquier funcionalidad nueva se cotiza por separado
- Hacer demos parciales tempranas para que el cliente valide antes de que el scope se expanda tarde

---

### R10 — Retrasos en el pase a producción
**Probabilidad:** Media | **Impacto:** Medio | **Prioridad:** 🟠 Alto

El ambiente de producción del cliente puede tener restricciones de seguridad, procesos de aprobación de cambios, o requerir pruebas de penetración antes de habilitar la aplicación.

**Mitigación:**
- Relevar el proceso de pase a producción del cliente en la Fase 1
- Incluir ese proceso como ítem explícito en el plan de proyecto
- Hacer un deploy a staging del cliente lo antes posible para detectar problemas de infraestructura temprano

---

### R11 — Rotación de personal en el equipo de desarrollo
**Probabilidad:** Baja | **Impacto:** Alto | **Prioridad:** 🟡 Medio

Si algún integrante del equipo sale del proyecto, el conocimiento acumulado puede perderse.

**Mitigación:**
- Mantener `TECHNICAL.md`, `BACKLOG.md` y `RIESGOS.md` siempre actualizados como documentación viva
- Las decisiones de arquitectura están documentadas con sus fundamentos en `TECHNICAL.md`
- El código tiene `TODO` explícitos en cada API Route para facilitar el re-onboarding

---

## Riesgos de negocio

### R12 — El cliente posterga o cancela el proyecto
**Probabilidad:** Baja | **Impacto:** Alto | **Prioridad:** 🟡 Medio

**Mitigación:**
- Proponer facturación por fases completadas, no al final del proyecto
- Incluir cláusula de cancelación con compensación proporcional al trabajo realizado
- El entregable de la Fase 1 (relevamiento + mockup funcional) tiene valor independiente

---

### R13 — El aplicativo actual no puede darse de baja fácilmente
**Probabilidad:** Media | **Impacto:** Medio | **Prioridad:** 🟠 Alto

Pueden existir dependencias no descubiertas del sistema viejo: otros sistemas que lo consumen, usuarios no relevados, datos que se generan ahí y se usan en otro lado.

**Mitigación:**
- Incluir en el relevamiento inicial un mapeo de todos los sistemas que interactúan con el aplicativo actual
- Proponer un período de convivencia donde ambos sistemas corren en paralelo antes de dar de baja el viejo
- No dar de baja el aplicativo viejo hasta tener al menos 30 días de operación estable del nuevo

---

## Resumen ejecutivo

| ID | Riesgo | Prob. | Impacto | Prioridad |
|----|--------|-------|---------|-----------|
| R01 | Código actual en mal estado | Alta | Alto | 🔴 Crítico |
| R02 | BD difícil de mapear | Alta | Alto | 🔴 Crítico |
| R08 | Disponibilidad limitada del cliente | Alta | Alto | 🔴 Crítico |
| R09 | Expansión de scope | Alta | Alto | 🔴 Crítico |
| R03 | Servicio Discovery sin API | Media | Alto | 🟠 Alto |
| R04 | Conector CMDB sin escritura | Media | Medio | 🟠 Alto |
| R05 | Autenticación compleja | Media | Medio | 🟠 Alto |
| R10 | Retrasos en producción | Media | Medio | 🟠 Alto |
| R13 | Dependencias del sistema viejo | Media | Medio | 🟠 Alto |
| R06 | Indecisión sobre motor de BD | Media | Bajo | 🟡 Medio |
| R07 | Performance con topologías grandes | Baja | Medio | 🟡 Medio |
| R11 | Rotación de equipo | Baja | Alto | 🟡 Medio |
| R12 | Cancelación del proyecto | Baja | Alto | 🟡 Medio |

---

*Los riesgos críticos R01, R02, R08 y R09 son los que más frecuentemente generan conflictos en proyectos de reingeniería. Se recomienda abordarlos explícitamente en la negociación de la propuesta.*
*R06 (indecisión sobre motor de BD) está mitigado por el uso de Prisma — no bloquea el desarrollo del mockup funcional.*
