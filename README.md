# PowerLifting Tracker (PLTracker)

Progressive Web App (PWA) de alto rendimiento para el seguimiento, control y periodización de entrenamientos de fuerza y Powerlifting. Diseñada bajo una arquitectura SPA (Single Page Application) en Vanilla Web Standards, con estética industrial técnica ("Industrial Dark") y funcionamiento autónomo sin dependencias externas ni frameworks pesados.

---

## 1. Características Principales

### Constructor de Protocolos y Rutinas
- Configuración de estructuras específicas de Powerlifting: esquemas combinados `Top Set + Back-off` y `Series Planas`.
- Segmentación por series de aproximación (`Warm-up`), series efectivas pesadas (`Top Set`) y volumen de descarga (`Back-off`).
- Definición de objetivos de repeticiones y esfuerzo percibido mediante escala RPE (Rating of Perceived Exertion) con granularidad de 0.5 puntos.
- **Autorregulación de Carga para Back-Offs:** Vinculación algorítmica entre el `Top Set` y las series de `Back-off` del mismo ejercicio con caída porcentual configurable (`-5%`, `-10%`, `-15%`, `-20%` o `Manual`) definida en la configuración de la plantilla. Al completar o editar la carga del Top Set, la aplicación inyecta en vivo los kilos calculados en las cajas de texto de los Back-offs correspondientes, redondeados a múltiplos de 2.5 kg ($\ge 20\text{ kg}$). **Simplificación UI:** Eliminado el selector/desplegable de porcentaje en la vista de entrenamiento activo para liberar espacio horizontal en viewports móviles de 393px (iPhone 16); la columna OBJETIVO muestra exclusivamente el texto estático `[KG] x [REPS]` (ej. `245 x 5`) con su acento carmesí `#E50914`.
- **Peso Fijo Opcional por Serie:** Soporte para definir cargas objetivo fijas (ej. `195 kg`) en Top Sets, Back-offs y Series Planas durante la configuración de la rutina. Si se deja vacío, el sistema calcula dinámicamente la sugerencia desde el 1RM de sesión o muestra guión (`−`) si no hay marcas. El auto-cálculo de Back-offs respeta los pesos fijos definidos y no los sobrescribe.
- **Clonación y Duplicación Rápida:** Botón de duplicación directa en un solo toque que clona toda la estructura de series y ejercicios con nomenclatura inteligente de progresión (incremento automático de `Semana X` a `Semana X+1`, `Microciclo X`, o sufijo incremental de copia).

### Planificador de Intentos de Tarima y Competición (Meet Day)
- Nueva vista principal dedicada (`TARIMA`) accesible permanentemente desde el bottom nav para el control del día de competición.
- Tarjetas técnicas para los 3 movimientos reglamentarios: Sentadilla (`01 SENTADILLA`), Press de Banca (`02 PRESS BANCA`) y Peso Muerto (`03 PESO MUERTO`), con 3 intentos planificados por movimiento y controles Stepper rápidos.
- **Simulación Visual de Luces de Arbitraje IPF:** Sistema de validación de intentos con ciclo interactivo `PENDIENTE` $\to$ `3 BLANCAS (VÁLIDO)` $\to$ `NULO`. Representación gráfica de las 3 luces arbitrales (blancas con borde verde `#15803D` o rojas `#E50914`).
- **Cálculo de Total Oficial en Tiempo Real:** Detección automática del mejor intento válido completado en cada movimiento y cálculo del Total Oficial de competición.
- **Proyección de Coeficientes de Tarima:** Cálculo dinámico de Puntos IPF GL y Puntos DOTS calculados directamente sobre el Total Oficial y el peso corporal registrado.
- **Carga Predictiva desde 1RM:** Botón `CARGAR 1RM` que calcula y distribuye automáticamente una apertura al 91%, segundo intento al 96% y tercer intento al 100% del 1RM registrado en cada básico.

### Catálogo de Ejercicios Extenso y Modular
- Base de datos local en JSON con más de 250 variantes técnicas de movimientos de competición de IPF (Sentadilla, Press de Banca y Peso Muerto) y accesorios específicos de hipertrofia muscular.
- Clasificación técnica por categorías y etiquetas abreviadas (`SQ`, `BP`, `DL`, `BACK`, `LEG`, `CHEST`, `ARM`, `SHLD`, `CORE`, `GLUTE`).
- Módulo de creación y persistencia de ejercicios personalizados gestionados dinámicamente.

### Registro de Sesión en Vivo (Live Tracker)
- Controles táctiles optimizados (Steppers `+` / `-`) con incrementos técnicos calibrados: saltos de 2.5 kg en peso, 1 unidad en repeticiones y 0.5 en RPE.
- Cálculo dinámico e instantáneo del porcentaje sobre el 1RM (`% 1RM`) por cada bloque de ejercicio.
- **Pantalla Siempre Encendida (Screen Wake Lock API):** Bloqueo automático de suspensión del panel durante toda la sesión activa de entrenamiento, con reenganche automático al volver a la PWA tras minimizarla o cambiar de app.
- **Alertas Acústicas Sintetizadas (Web Audio API):** Señalización sonora de cronómetro deportivo al expirar el tiempo de descanso (patrón de 3 pitidos cortos de 880 Hz / La5 seguidos de 1 pitido final sostenido de 1046.5 Hz / Do6), sintetizada en tiempo real sin cargar ficheros de audio externos, con desbloqueo para navegadores móviles y botón de silencio persistido (`pl_crono_sonido`).
- **Vista Condensada de Series en Tabla Industrial:** Nueva representación tabular ultra-compacta por ejercicio con cabecera fija técnica (`OBJETIVO | PESO | REPS | RPE`), filas de serie alineadas a grid de 5 columnas, inputs numéricos minimalistas con placeholder `−`, botón de completado circular solo SVG, y footer dinámico por ejercicio con **1RME** (e1RM máximo de series completadas, fórmula Epley ajustada por RPE) y **Tonelaje** acumulado (Σ peso × reps). Distinción visual por tipo de serie: Top Set (borde y fondo carmesí `#E50914`), Warm-up (borde gris neutró), Back-off (borde amarillo `#EAB308`), Plana (borde gris medio). Optimizado estricto para viewport 393px (iPhone 16). **Simplificación UI:** Eliminado el selector/desplegable de porcentaje de caída en las filas de Back-off; la columna OBJETIVO renderiza exclusivamente el texto estático `[KG] x [REPS]` (ej. `245 x 5`) con su acento carmesí, liberando espacio horizontal para inputs de PESO, REPS y RPE.
- **Micro-Notas y Etiquetas Técnicas por Serie:** Panel técnico desplegable por serie para registrar sensaciones inmediatas mediante chips rápidos (`Pausa limpia`, `Sticking point`, `Pérdida de línea`, `Grip al límite`, `Sin cinto`, `Muñequeras/Rodilleras`) y micro-nota escrita libre (máx. 60 caracteres), visibles en el entrenamiento activo y persistidas como insignias tanto en el visor de historial como en el editor retrospectivo.
- Cronómetro de descanso manual flotante con temporizadores preconfigurados (3:00, 5:00, 8:00 min) y alertas hápticas/visuales de fin de pausa.

### Calculadora Visual de Carga de Barra (Competición IPF)
- Acceso directo instantáneo desde la cabecera superior y desde la sección de marcas 1RM.
- Algoritmo de desglose voraz por lateral de barra utilizando la gama cromática y especificaciones oficiales de la International Powerlifting Federation (IPF):
  - 25 kg Carmesí (`#E50914`), 20 kg Azul (`#1D4ED8`), 15 kg Amarillo (`#EAB308`), 10 kg Verde (`#15803D`), 5 kg Blanco (`#F5F5F5`), 2.5 kg Negro Carbón (`#262626`), 1.25 kg Plata (`#737373`), 0.5 kg y 0.25 kg microdiscos.
- Selección configurable de tipo de barra (`20 kg` estándar, `25 kg` squat bar, `15 kg` barra corta) y collarines de competición (`+5 kg` total / `2.5 kg` por lado) o levantamiento sin collarines.
- Renderizado gráfico dimensional del manguito (*sleeve*), tope interior y collarín de bloqueo de seguridad con chips de desglose numérico.

### Gestión de 1RM, Coeficientes y Tendencia de Fuerza
- Actualización automática de récords personales al finalizar cualquier entrenamiento:
  - **PR Real:** Carga máxima absoluta superada a 1 o más repeticiones.
  - **e1RM Estimado:** Repetición máxima teórica calculada mediante la fórmula de Epley ajustada por RIR (Reps in Reserve / RPE):
    $$\text{e1RM} = \text{Peso} \times \left(1 + \frac{\text{Reps} + (10 - \text{RPE})}{30}\right)$$
- Recálculo dinámico de marcas históricas tras la edición o eliminación retrospectiva de sesiones.
- **Gráficas Vectoriales Nativas de Tendencia (Sparklines SVG):** Visualización interactiva desplegable de la evolución temporal del e1RM por básico (Sentadilla, Banca o Peso Muerto) renderizada al vuelo mediante SVG puro sin bibliotecas externas pesadas. Incluye gradiente sombreado, cuadrícula técnica de cargas, línea temporal de fechas y resalte luminoso del PR histórico absoluto.
- Calculadora técnica de porcentajes de carga (del 50% al 100% del 1RM).
- **Calculadora Automática de Coeficientes de Competición:**
  - Panel integrado en la vista de 1RM con configuración persistida de Peso Corporal (kg) y Sexo biológico (M / F).
  - Cálculo instantáneo de **IPF GL Points** según la fórmula oficial de 3 movimientos Raw:
    $$\text{IPF GL} = \frac{\text{Total}}{A - B \cdot e^{-C \cdot \text{BW}}} \times 100$$
  - Cálculo instantáneo de **Puntos DOTS** mediante polinomio de 4º grado para comparación normalizada entre categorías de peso.

### Control de Versiones y Notas de Parche (Changelog)
- Botón tipo badge técnico integrado en la cabecera principal (`NOTAS v1.6.0`) con tipografía en números tabulares e icono vectorial.
- Indicador luminoso en rojo carmesí de versión no leída, sincronizado automáticamente contra `localStorage` (`ultimaVersionLeida` vs `APP_VERSION`).
- Modal técnico de lectura con desglose cronológico de versiones, fechas y cambios detallados (v1.4.1 actual, v1.4.0, v1.3.0, v1.2.0, v1.1.0 y v1.0.0 inicial).

### Operación 100% Offline y Persistencia Local
- Almacenamiento local persistente sin necesidad de backend o bases de datos remotas mediante `localStorage`.
- Service Worker (`sw.js`) con estrategia `Network-First, falling back to Cache` para garantizar funcionamiento en recintos cerrados o sótanos sin conectividad móvil y sincronización automática de nuevas versiones.

---

## 2. Stack Tecnológico y Arquitectura

El núcleo del software está construido siguiendo principios de bajo acoplamiento, alta cohesión y cero dependencias de terceros (Zero-Dependency Architecture):

- **HTML5 Semántico:** Estructura documental accesible, optimizada para lectores de pantalla y etiquetas meta PWA para entornos móviles.
- **CSS3 Moderno:** Variables CSS nativas, maquetación flexible (Flexbox y CSS Grid), tipografía numérica de ancho fijo (`tabular-nums`) y adaptación completa a zonas seguras de hardware móvil (`safe-area-inset` para iPhone y Dynamic Island).
- **JavaScript Vanilla (ES6+):** Programación modular sin frameworks intermedios (sin React, sin Vue, sin transpiladores), manipulación directa del DOM y persistencia sincronizada.
- **PWA (Progressive Web App):** Manifiesto estandarizado (`manifest.json`), icono vectorial SVG escalable y Service Worker de ciclo de vida completo con recarga automática (`controllerchange`).

### Estructura del Proyecto

```
PowerApp/
├── css/
│   └── styles.css             # Sistema de diseño Industrial Dark y maquetación responsive
├── data/
│   └── ejercicios.json        # Base de datos de más de 250 variantes de competición y accesorios
├── icons/
│   └── icon.svg               # Icono vectorial escalable oficial (disco calibrado de 25 kg)
├── js/
│   └── app.js                 # Lógica de negocio, state machine, cálculos 1RM y control de UI
├── index.html                 # Estructura documental SPA y contenedores modales
├── manifest.json              # Configuración PWA standalone para Android e iOS
├── sw.js                      # Service Worker con estrategia Network-First y fallback offline
├── LICENSE                    # Términos de propiedad intelectual y licencia propietaria
└── README.md                  # Documentación técnica del proyecto
```

---

## 3. Instalación como Aplicación Nativa (PWA)

La aplicación puede ser instalada como una app nativa independiente sin pasar por tiendas comerciales, con soporte completo tanto para Android como para iOS:

### En Android (Google Chrome / Chromium)
1. Abrir la URL de la aplicación en el navegador.
2. Hacer clic en el botón técnico `INSTALAR APP` visible en la cabecera superior (activado mediante el evento nativo `beforeinstallprompt`), o bien abrir el menú del navegador (tres puntos verticales) y seleccionar **Instalar aplicación**.
3. Confirmar la instalación en el diálogo del sistema operativo para crear el acceso directo en la pantalla de inicio con su icono dedicado.

### En iOS / iPhone / iPad (Apple Safari)
1. Abrir la URL de la aplicación en Safari.
2. Hacer clic en el botón técnico `INSTALAR APP` presente en la cabecera superior, el cual detecta automáticamente el entorno iOS y abre un modal interactivo con instrucciones gráficas paso a paso.
3. Pulsar el botón **Compartir** (icono de cuadrado con flecha hacia arriba) en la barra de navegación de Safari.
4. Desplazarse por las opciones del menú y pulsar **Añadir a la pantalla de inicio** (icono con el símbolo `+`).
5. Confirmar para añadir. Al iniciar desde el icono de inicio, la aplicación se ejecutará a pantalla completa en modo independiente (*standalone*), ocultando automáticamente las barras de navegación de Safari y adaptándose a la Dynamic Island y notch del dispositivo.

---

## 4. Propiedad Intelectual y Licencia

Este software, su código fuente, arquitectura, diseño de interfaz y base de datos técnica son **obras protegidas por la legislación de propiedad intelectual**.

- **Régimen de Licencia:** Propietario (Todos los derechos reservados / All Rights Reserved).
- **Titular de los Derechos:** Eder Martin Mosquera.
- **Año de Registro:** 2026.

Queda estrictamente prohibida la copia, clonación, redistribución, modificación, descompilación, sublicenciamiento o explotación comercial total o parcial de este repositorio o de su código fuente sin el consentimiento previo, expreso y por escrito del autor. Para más información, consulte el archivo `LICENSE` ubicado en la raíz de este proyecto.
