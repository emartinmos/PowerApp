# Informe de Análisis y Propuesta de Funcionalidades Técnicas

Tras la inspección analítica de la base de código actual (`index.html`, `css/styles.css`, `js/app.js`, `data/ejercicios.json`, `manifest.json` y `sw.js`), se presenta el siguiente informe estructurado de mejoras técnicas y de producto. Las propuestas están orientadas a consolidar la herramienta como una solución de referencia para levantadores de fuerza competitivos y elevar el estándar de ingeniería para un perfil profesional o académico (DAW).

---

## 1. Funcionalidades Específicas de Powerlifting y Competición

### 1.1 Calculadora Visual de Carga de Barra (Plate Calculator)
- **Para qué sirve:** Calcula y representa esquemáticamente la distribución exacta de discos reglamentarios por cada lado de la barra para alcanzar un peso objetivo. Permite configurar barra estándar de 20 kg, barra de squat de 25 kg o barra técnica de 15 kg, así como la inclusión de collarines de competición de 2.5 kg cada uno, optimizando el tiempo y reduciendo errores de cálculo bajo fatiga.
- **Nivel de dificultad:** Bajo.

### 1.2 Calculadora de Puntos Oficiales IPF GL y DOTS
- **Para qué sirve:** Permite introducir el peso corporal y sexo del levantador para calcular automáticamente los puntos relativos de competición (fórmulas oficiales IPF GL Points y DOTS) a partir del total acumulado o proyectado. Facilita la comparación objetiva del rendimiento entre atletas de diferentes categorías de peso corporal.
- **Nivel de dificultad:** Bajo.

### 1.3 Automatización de Carga para Back-Offs basada en Porcentaje o RPE
- **Para qué sirve:** En la actualidad, las series de Back-off requieren introducir los valores de carga manualmente o basados en un cálculo estático. Esta mejora permite definir una regla de autorregulación (por ejemplo, `-10%` o `RPE 7` respecto al Top Set completado) para que, al marcar la serie pesada, los Back-offs calculen sus kilos de forma automática sin intervención manual.
- **Nivel de dificultad:** Medio.

### 1.4 Planificador de Intentos de Tarima (Meet Day Attempt Selector)
- **Para qué sirve:** Herramienta diseñada para el día de competición o simulacro de toma de marcas (*Mock Meet*). Permite predefinir los 3 intentos reglamentarios por movimiento (Apertura al 90-92%, 2º Intento al 96-98% y 3º Intento al 100-102%+), registrar la validez técnica (luces blancas y rojas) y calcular en tiempo real el Total oficial en kilogramos.
- **Nivel de dificultad:** Medio.

### 1.5 Registro de Micro-Notas y Etiquetas Técnicas por Serie
- **Para qué sirve:** Habilita un campo rápido o chips técnicos en cada serie completada para documentar factores biomecánicos y de ejecución (*Fallo en sticking point*, *Pérdida de trayectoria*, *Agarre resbalado*, *Poco arco*, *Pausa corta*), aportando contexto cualitativo al análisis cuantitativo de kilos y RPE.
- **Nivel de dificultad:** Bajo.

---

## 2. Analítica, Progreso y Gestión de Datos (Seguridad de Almacenamiento)

### 2.1 Sistema de Copia de Seguridad Integral (Exportación e Importación JSON/CSV)
- **Para qué sirve:** Elimina el riesgo crítico de pérdida de datos ante limpiezas de caché de iOS Safari o formateos del dispositivo. Permite descargar un archivo `pl_backup_YYYY-MM-DD.json` con todas las rutinas, historial de entrenamientos, 1RM y ejercicios personalizados, con validación de esquema al importar, así como exportar el historial a `.csv` para análisis en hojas de cálculo.
- **Nivel de dificultad:** Bajo.

### 2.2 Gráficas Vectoriales Nativas de Tendencia de Fuerza (SVG Sparklines)
- **Para qué sirve:** Visualizar la evolución temporal del 1RM Estimado (e1RM) y del tonelaje acumulado ($\sum \text{peso} \times \text{reps}$) en los tres básicos a lo largo del tiempo. Se implementa mediante generación pura de elementos `<svg>` nativos en el DOM, sin necesidad de librerías externas pesadas (Chart.js u otras dependencias).
- **Nivel de dificultad:** Medio.

### 2.3 Capa de Persistencia Asíncrona con IndexedDB
- **Para qué sirve:** `localStorage` es síncrono y está limitado a aproximadamente 5 MB, lo que puede provocar microbloqueos de la interfaz si el historial acumula cientos de sesiones con decenas de series. La transición a IndexedDB (manteniendo compatibilidad de lectura previa) garantiza almacenamiento virtualmente ilimitado y operaciones asíncronas no bloqueantes.
- **Nivel de dificultad:** Medio.

### 2.4 Control de Fatiga y Volumen Efectivo Semanal (MEV / MRV)
- **Para qué sirve:** Computa semanalmente el recuento de series efectivas realizadas (filtradas por $\text{RPE} \ge 6.5$) agrupadas por movimiento principal y grupo muscular. Informa al levantador si su volumen se encuentra dentro del rango de estímulo efectivo o en riesgo de sobreentrenamiento.
- **Nivel de dificultad:** Medio.

---

## 3. Experiencia de Usuario (UX) en el Gimnasio (Mobile / PWA)

### 3.1 Integración de Screen Wake Lock API
- **Para qué sirve:** Impide que la pantalla del iPhone o dispositivo Android se apague o entre en reposo mientras haya una sesión de entrenamiento activa. Evita tener que tocar o desbloquear el terminal repetidamente con magnesio en las manos durante series pesadas o descansos.
- **Nivel de dificultad:** Bajo.

### 3.2 Alertas Acústicas Sintetizadas mediante Web Audio API
- **Para qué sirve:** El cronómetro actual depende exclusivamente de alertas visuales y vibración (`navigator.vibrate`, con soporte limitado en Safari iOS). La generación de tonos técnicos audibles mediante `AudioContext` nativo (sin archivos de audio externos) garantiza una señal clara de fin de descanso, incluso con la pantalla bloqueada o música de fondo.
- **Nivel de dificultad:** Bajo.

### 3.3 Acción Rápida de Duplicación y Progresión de Rutinas
- **Para qué sirve:** Añade una acción en un toque para clonar una plantilla existente (por ejemplo, *Semana 1* a *Semana 2*) y aplicar un factor de sobrecarga programada (incremento porcentual o lineal en kilogramos a todas las series de trabajo) sin tener que reescribir la rutina manualmente.
- **Nivel de dificultad:** Bajo.

### 3.4 Modo de Visualización Compacto (Vista de Tabla Condensada)
- **Para qué sirve:** En entrenamientos con alto número de series, las tarjetas verticales actuales ocupan bastante espacio vertical. Esta opción añade un selector para alternar a una visualización matricial densa en una sola fila (`SERIE | KG | REPS | RPE | CHECK`), optimizando la ergonomía en pantallas de 393 px (iPhone 16).
- **Nivel de dificultad:** Medio.

---

## 4. Nivel Técnico y Arquitectura (Valor Curricular DAW)

### 4.1 Modularización de Código mediante ES Modules (ESM)
- **Para qué sirve:** Descomponer el archivo monolítico `js/app.js` (más de 3.400 líneas) en submódulos especializados e independientes (`state.js`, `storage.js`, `formulas.js`, `workout-engine.js`, `pwa.js`, `ui-renderer.js`). Facilita el mantenimiento, evita acoplamientos, permite pruebas unitarias aisladas y demuestra aplicación rigurosa de principios de arquitectura de software.
- **Nivel de dificultad:** Medio.

### 4.2 Patrón Repositorio y Validación Estricta de Esquemas
- **Para qué sirve:** Aislar la lógica de negocio de la implementación del motor de persistencia. Define interfaces formales para operaciones CRUD sobre sesiones, rutinas y marcas, validando la integridad de los datos mediante esquemas antes de confirmar cualquier escritura en el almacenamiento local.
- **Nivel de dificultad:** Medio.

### 4.3 Procesamiento Fuera del Hilo Principal con Web Workers
- **Para qué sirve:** Desplazar cálculos matemáticos de gran escala (como el recálculo retroactivo de todos los récords de un historial de varios años o la agregación de métricas de fatiga) a un hilo secundario en segundo plano (`worker.js`). Garantiza que las animaciones y la navegación se mantengan a 60/120 FPS sin caídas de cuadros (*frame drops*).
- **Nivel de dificultad:** Medio.

### 4.4 Gestor de Estado Unidireccional con Patrón Pub/Sub y Soporte Deshacer (Undo)
- **Para qué sirve:** Reemplazar las mutaciones directas sobre el objeto global `APP` por un gestor de eventos (`dispatch -> reducer -> state -> notify`), aportando trazabilidad total de eventos en consola y facilitando la implementación de acciones de recuperación inmediata (por ejemplo, deshacer un borrado accidental de serie o serie desmarcada por error).
- **Nivel de dificultad:** Alto.

