# Informe de Análisis y Propuestas Técnicas Pendientes

---

## 1. Experiencia de Usuario (UX) y Funcionalidades en el Gimnasio

### 1.1 Generador Automático de Rampas de Calentamiento (Ramping Sets)
- **Para qué sirve:** Al definir la carga objetivo de una serie pesada (`Top Set`), calcula e inyecta automáticamente una progresión de aproximación sugerida (Barra sola, 50%, 70%, 85% y single del 95%) para optimizar la preparación neuromuscular previa al esfuerzo máximo.
- **Nivel de dificultad:** Bajo.

### 1.2 Exportador de Resumen de Sesión a Imagen (Social Share Card)
- **Para qué sirve:** Genera dinámicamente mediante un elemento `<canvas>` nativo una tarjeta gráfica resumen de la sesión completada (Top Sets, tonelaje total, PRs superados y marca de la app) con la estética *Industrial Dark*, descargable en `.png` para compartir.
- **Nivel de dificultad:** Medio.

### 1.3 Control de Fatiga y Volumen Efectivo Semanal (MEV / MRV)
- **Para qué sirve:** Computa semanalmente el recuento de series efectivas realizadas (filtradas por RPE >= 6.5) agrupadas por movimiento principal (Sentadilla, Banca, Peso Muerto) y grupo muscular accesorio. Informa al levantador si su volumen se encuentra dentro del rango de estímulo efectivo o en riesgo de sobreentrenamiento.
- **Nivel de dificultad:** Medio.

---

## 2. Nivel Técnico y Arquitectura (Valor Curricular DAW)

### 2.1 Capa de Persistencia Asíncrona con IndexedDB
- **Para qué sirve:** `localStorage` es síncrono y está limitado a aproximadamente 5 MB. La transición a IndexedDB (como paso intermedio o previo a la migración a SQL) garantiza almacenamiento virtualmente ilimitado y operaciones asíncronas no bloqueantes.
- **Nivel de dificultad:** Medio.

### 2.2 Modularización de Código mediante ES Modules (ESM)
- **Para qué sirve:** Descomponer el archivo monolítico `js/app.js` en submódulos especializados e independientes (`state.js`, `storage.js`, `formulas.js`, `workout-engine.js`, `pwa.js`, `ui-renderer.js`). Facilita el mantenimiento, evita acoplamientos y demuestra aplicación rigurosa de principios de arquitectura de software.
- **Nivel de dificultad:** Medio.

### 2.3 Patrón Repositorio y Validación Estricta de Esquemas
- **Para qué sirve:** Aislar la lógica de negocio de la implementación del motor de persistencia. Define interfaces formales para operaciones CRUD sobre sesiones, rutinas y marcas, validando la integridad de los datos mediante esquemas antes de confirmar cualquier escritura.
- **Nivel de dificultad:** Medio.

### 2.4 Procesamiento Fuera del Hilo Principal con Web Workers
- **Para qué sirve:** Desplazar cálculos matemáticos de gran escala (como el recálculo retroactivo de todos los récords de un historial o la agregación de métricas de fatiga) a un hilo secundario en segundo plano (`worker.js`) para garantizar que las animaciones y la navegación se mantengan a 60/120 FPS sin caídas de cuadros.
- **Nivel de dificultad:** Medio.

### 2.5 Gestor de Estado Unidireccional con Patrón Pub/Sub y Soporte Deshacer (Undo)
- **Para qué sirve:** Reemplazar las mutaciones directas sobre el objeto global por un gestor de eventos (`dispatch -> reducer -> state -> notify`), aportando trazabilidad total de eventos en consola y facilitando acciones de recuperación inmediata (por ejemplo, deshacer un borrado accidental de serie).
- **Nivel de dificultad:** Alto.