# IngeNet — Estimación de Esfuerzo

> **Importante:** Este documento es una estimación preliminar basada en el relevamiento inicial. Los valores deben ser revisados y ajustados por el equipo técnico una vez que se tenga acceso al aplicativo y la base de datos actual. Los ítems marcados con ⚠ tienen alta variabilidad según lo que se encuentre en el relevamiento.

## Equipo

| Rol | Perfil | Dedicación estimada |
|-----|--------|-------------------|
| Líder técnico / Arquitecto | Diseño de arquitectura, revisión de código, decisiones técnicas, integración de sistemas | Tiempo completo |
| Analista / Programador full stack | Desarrollo frontend y backend, pruebas, documentación técnica | Tiempo completo |

---

## Fases del proyecto

### Fase 1 — Relevamiento y arquitectura
*Prerequisito para todo lo demás. No se puede saltear.*

| Tarea | Responsable | Días estimados |
|-------|-------------|---------------|
| Relevamiento del aplicativo actual (código) | Líder + Analista | ⚠ 5–15 |
| Relevamiento del esquema de BD existente | Líder | ⚠ 3–8 |
| Relevamiento del servicio de descubrimiento | Líder | ⚠ 3–5 |
| Relevamiento de integración CMDB | Líder | 2–4 |
| Relevamiento de integración sistema de proyectos/CRM | Líder | 2–4 |
| Definición de arquitectura de la solución | Líder | 3–5 |
| Validación de arquitectura con el cliente | Líder | 1–2 |
| Definición de flujo de autorizaciones con el cliente | Líder + Analista | 2–3 |
| **Subtotal Fase 1** | | **⚠ 21–46 días** |

> El rango amplio en el relevamiento del aplicativo y BD refleja la incertidumbre típica de sistemas legacy sin documentación. Es el ítem de mayor riesgo del proyecto.

---

### Fase 2 — Base técnica y seguridad
*Cimientos del nuevo aplicativo.*

| Tarea | Responsable | Días estimados |
|-------|-------------|---------------|
| Setup del proyecto Next.js + estructura base | Analista | 2 |
| Integración con sistema de autenticación corporativo (SSO/LDAP) | Líder + Analista | ⚠ 5–10 |
| Modelo de datos y esquema de BD (nuevo o adaptado) | Líder | 3–5 |
| API base (CRUD de topologías) | Analista | 4–6 |
| Audit log y trazabilidad | Analista | 2–3 |
| Pruebas de seguridad básicas | Líder | 2–3 |
| **Subtotal Fase 2** | | **⚠ 18–29 días** |

---

### Fase 3 — Editor de topologías (core del sistema)
*Ya tiene una base desarrollada en el mockup. Se estima sobre lo que falta.*

| Tarea | Responsable | Días estimados |
|-------|-------------|---------------|
| Canvas React Flow con íconos y tipos de enlace | Analista | 3 |
| Drag & drop de dispositivos | Analista | 2 |
| Panel de propiedades con campos estándar | Analista | 2 |
| Campos personalizados (custom fields) | Analista | 2 |
| Integración CMDB en panel de propiedades | Analista | 3–5 |
| Indicadores visuales (sin CMDB, descubierto, verificado) | Analista | 1 |
| Toggle de tema claro/oscuro | Analista | 1 |
| Guardar y cargar topología desde BD | Analista | 3–4 |
| Persistencia de posición de nodos | Analista | 1 |
| Pantalla completa | Analista | 1 |
| Pruebas del editor | Líder + Analista | 3–4 |
| **Subtotal Fase 3** | | **22–29 días** |

---

### Fase 4 — Flujo de autorizaciones
*Depende de la definición del cliente (ítem 5 del backlog).*

| Tarea | Responsable | Días estimados |
|-------|-------------|---------------|
| Modelo de estados y transiciones | Líder | 2–3 |
| Perfiles y permisos por estado | Analista | 3–5 |
| Interfaz de revisión (arquitectos de soluciones) | Analista | 3–4 |
| Interfaz de validación (personal de campo) | Analista | 3–4 |
| Notificaciones por cambio de estado | Analista | ⚠ 2–5 |
| Historial de versiones | Analista | 3–5 |
| Pruebas del flujo completo | Líder + Analista | 3–4 |
| **Subtotal Fase 4** | | **⚠ 19–30 días** |

---

### Fase 5 — Integraciones externas
*Cada integración tiene su propia complejidad según lo que se encuentre en el relevamiento.*

| Tarea | Responsable | Días estimados |
|-------|-------------|---------------|
| Integración con servicio de descubrimiento de red | Líder + Analista | ⚠ 5–12 |
| Integración lectura CMDB | Líder + Analista | ⚠ 5–10 |
| Integración escritura CMDB (nuevos activos) | Líder + Analista | ⚠ 3–8 |
| Integración sistema de proyectos/CRM (lectura) | Analista | ⚠ 4–8 |
| Pruebas de integraciones | Líder + Analista | 4–6 |
| **Subtotal Fase 5** | | **⚠ 21–44 días** |

---

### Fase 6 — Exportaciones
*Parcialmente implementado en el mockup.*

| Tarea | Responsable | Días estimados |
|-------|-------------|---------------|
| Exportación Excel (formato definitivo validado) | Analista | 2–4 |
| Exportación PDF (layout definitivo validado) | Analista | 3–5 |
| Exportación imagen (PNG/SVG) | Analista | 1–2 |
| Pruebas de exportación en distintos browsers | Analista | 1–2 |
| **Subtotal Fase 6** | | **7–13 días** |

---

### Fase 7 — Tableros de control
*Depende de la definición de KPIs con el cliente.*

| Tarea | Responsable | Días estimados |
|-------|-------------|---------------|
| Definición final de KPIs con el cliente | Líder | 2–3 |
| Desarrollo de tableros en el aplicativo | Analista | ⚠ 5–10 |
| Integración con herramienta BI (si aplica) | Líder + Analista | ⚠ 0–15 |
| Pruebas de tableros | Analista | 2–3 |
| **Subtotal Fase 7** | | **⚠ 9–31 días** |

---

### Fase 8 — Migración, QA y pase a producción

| Tarea | Responsable | Días estimados |
|-------|-------------|---------------|
| Estrategia y plan de migración de datos | Líder | 2–3 |
| Migración de datos históricos (si aplica) | Líder + Analista | ⚠ 0–10 |
| QA funcional completo | Líder + Analista | 5–8 |
| Pruebas de performance y carga | Líder | 2–3 |
| Pruebas de seguridad finales | Líder | 2–3 |
| Capacitación a usuarios | Analista | 2–4 |
| Documentación de usuario final | Analista | 2–3 |
| Pase a producción y soporte inicial | Líder + Analista | 3–5 |
| **Subtotal Fase 8** | | **⚠ 18–39 días** |

---

## Resumen total

| Fase | Días mínimos | Días máximos |
|------|-------------|-------------|
| Fase 1 — Relevamiento y arquitectura | 21 | 46 |
| Fase 2 — Base técnica y seguridad | 18 | 29 |
| Fase 3 — Editor de topologías | 22 | 29 |
| Fase 4 — Flujo de autorizaciones | 19 | 30 |
| Fase 5 — Integraciones externas | 21 | 44 |
| Fase 6 — Exportaciones | 7 | 13 |
| Fase 7 — Tableros de control | 9 | 31 |
| Fase 8 — Migración, QA y producción | 18 | 39 |
| **TOTAL** | **135 días** | **261 días** |

> Considerando el equipo de 2 personas trabajando en paralelo (no todas las tareas son secuenciales), el plazo calendario estimado es de **3 a 6 meses** dependiendo del resultado del relevamiento inicial y la velocidad de respuesta del cliente en las definiciones pendientes.

---

## Variables que más impactan el esfuerzo

1. **Estado del código del aplicativo actual** — si está bien estructurado el relevamiento es rápido; si es código legacy sin estándares puede duplicar los tiempos de las fases 1 y 5
2. **Disponibilidad de APIs en sistemas externos** — CMDB, CRM y descubrimiento pueden tener APIs REST limpias o requerir integración directa a BD, lo cual es más complejo
3. **Velocidad de definición del cliente** — cada ítem del backlog sin definir bloquea una fase. Los retrasos del cliente no se absorben en el plazo del proyecto
4. **Scope del flujo de autorizaciones** — si hay aprobaciones múltiples, devoluciones, notificaciones por mail y versionado completo, esta fase puede crecer significativamente
5. **Migración de datos históricos** — si el cliente quiere migrar topologías existentes al nuevo sistema, requiere análisis y desarrollo adicional

---

## Supuestos para esta estimación

- El cliente provee acceso al código fuente del aplicativo actual y a la base de datos en los primeros días del proyecto
- Hay un interlocutor técnico del cliente disponible para responder consultas durante el relevamiento
- Las definiciones pendientes del backlog se resuelven antes de comenzar la fase correspondiente
- No se contemplan cambios de scope una vez iniciada una fase
- Los tiempos de aprobación interna del cliente (revisiones, firmas) no están incluidos

---

*Estimación preliminar sujeta a revisión tras completar la Fase 1.*
