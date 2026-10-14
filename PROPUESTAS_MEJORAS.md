# Informe de Análisis y Propuesta de Funcionalidades Técnicas

Tras la inspección analítica de la base de código actual (`index.html`, `css/styles.css`, `js/app.js`, `data/ejercicios.json`, `manifest.json` y `sw.js`), se presenta el siguiente informe estructurado de mejoras técnicas y de producto pendientes de implementación. Las propuestas están orientadas a consolidar la herramienta como una solución de referencia para levantadores de fuerza competitivos y elevar el estándar de ingeniería para un perfil profesional o académico (DAW).

---

## 1. Analítica, Progreso y Gestión de Datos (Seguridad de Almacenamiento)

### 1.1 Sistema de Copia de Seguridad Integral (Exportación e Importación JSON/CSV)
- **Para qué sirve:** Elimina el riesgo crítico de pérdida de datos ante limpiezas de caché de iOS Safari o formateos del dispositivo. Permite descargar un archivo `pl_backup_YYYY-MM-DD.json` con todas las rutinas, historial de entrenamientos, 1RM y ejercicios personalizados, con validación de esquema al importar, así como exportar el historial a `.csv` para análisis en hojas de cálculo.
- **Nivel de dificultad:** Bajo.

### 1.2 Capa de Persistencia Asíncrona con IndexedDB
- **Para qué sirve:** `localStorage` es síncrono y está limitado a aproximadamente 5 MB, lo que puede provocar microbloqueos de la interfaz si el historial acumula cientos de sesiones con decenas de series. La transición a IndexedDB (manteniendo compatibilidad de lectura previa) garantiza almacenamiento virtualmente ilimitado y operaciones asíncronas no bloqueantes.
- **Nivel de dificultad:** Medio.

### 1.3 Control de Fatiga y Volumen Efectivo Semanal (MEV / MRV)
- **Para qué sirve:** Computa semanalmente el recuento de series efectivas realizadas (filtradas por $\text{RPE} \ge 6.5$) agrupadas por movimiento principal y grupo muscular. Informa al levantador si su volumen se encuentra dentro del rango de estímulo efectivo o en riesgo de sobreentrenamiento.
- **Nivel de dificultad:** Medio.

---

## 2. Experiencia de Usuario (UX) en el Gimnasio (Mobile / PWA)

### 2.1 Modo de Visualización Compacto (Vista de Tabla Condensada)
- **Para qué sirve:** En entrenamientos con alto número de series, las tarjetas verticales actuales ocupan bastante espacio vertical. Esta opción añade un selector para alternar a una visualización matricial densa en una sola fila (`SERIE | KG | REPS | RPE | CHECK`), optimizando la ergonomía en pantallas de 393 px (iPhone 16).
- **Nivel de dificultad:** Medio.

---

## 3. Nivel Técnico y Arquitectura (Valor Curricular DAW)

### 3.1 Modularización de Código mediante ES Modules (ESM)
- **Para qué sirve:** Descomponer el archivo monolítico `js/app.js` en submódulos especializados e independientes (`state.js`, `storage.js`, `formulas.js`, `workout-engine.js`, `pwa.js`, `ui-renderer.js`). Facilita el mantenimiento, evita acoplamientos, permite pruebas unitarias aisladas y demuestra aplicación rigurosa de principios de arquitectura de software.
- **Nivel de dificultad:** Medio.

### 3.2 Patrón Repositorio y Validación Estricta de Esquemas
- **Para qué sirve:** Aislar la lógica de negocio de la implementación del motor de persistencia. Define interfaces formales para operaciones CRUD sobre sesiones, rutinas y marcas, validando la integridad de los datos mediante esquemas antes de confirmar cualquier escritura en el almacenamiento local.
- **Nivel de dificultad:** Medio.

### 3.3 Procesamiento Fuera del Hilo Principal con Web Workers
- **Para qué sirve:** Desplazar cálculos matemáticos de gran escala (como el recálculo retroactivo de todos los récords de un historial de varios años o la agregación de métricas de fatiga) a un hilo secundario en segundo plano (`worker.js`). Garantiza que las animaciones y la navegación se mantengan a 60/120 FPS sin caídas de cuadros (*frame drops*).
- **Nivel de dificultad:** Medio.

### 4.4 Gestor de Estado Unidireccional con Patrón Pub/Sub y Soporte Deshacer (Undo)
- **Para qué sirve:** Reemplazar las mutaciones directas sobre el objeto global `APP` por un gestor de eventos (`dispatch -> reducer -> state -> notify`), aportando trazabilidad total de eventos en consola y facilitando la implementación de acciones de recuperación inmediata (por ejemplo, deshacer un borrado accidental de serie o serie desmarcada por error).
- **Nivel de dificultad:** Alto.
