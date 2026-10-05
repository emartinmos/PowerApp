# PowerLifting Tracker (PLTracker)

Progressive Web App (PWA) de alto rendimiento para el seguimiento, control y periodización de entrenamientos de fuerza y Powerlifting. Diseñada bajo una arquitectura SPA (Single Page Application) en Vanilla Web Standards, con estética industrial técnica ("Industrial Dark") y funcionamiento autónomo sin dependencias externas ni frameworks pesados.

---

## 1. Características Principales

### Constructor de Protocolos y Rutinas
- Configuración de estructuras específicas de Powerlifting: esquemas combinados `Top Set + Back-off` y `Series Planas`.
- Segmentación por series de aproximación (`Warm-up`), series efectivas pesadas (`Top Set`) y volumen de descarga (`Back-off`).
- Definición de objetivos de repeticiones y esfuerzo percibido mediante escala RPE (Rating of Perceived Exertion) con granularidad de 0.5 puntos.

### Catálogo de Ejercicios Extenso y Modular
- Base de datos local en JSON con más de 250 variantes técnicas de movimientos de competición de IPF (Sentadilla, Press de Banca y Peso Muerto) y accesorios específicos de hipertrofia muscular.
- Clasificación técnica por categorías y etiquetas abreviadas (`SQ`, `BP`, `DL`, `BACK`, `LEG`, `CHEST`, `ARM`, `SHLD`, `CORE`, `GLUTE`).
- Módulo de creación y persistencia de ejercicios personalizados gestionados dinámicamente.

### Registro de Sesión en Vivo (Live Tracker)
- Controles táctiles optimizados (Steppers `+` / `-`) con incrementos técnicos calibrados: saltos de 2.5 kg en peso, 1 unidad en repeticiones y 0.5 en RPE.
- Cálculo dinámico e instantáneo del porcentaje sobre el 1RM (`% 1RM`) por cada bloque de ejercicio.
- Cronómetro de descanso manual flotante con temporizadores preconfigurados (3:00, 5:00, 8:00 min) y alertas hápticas/visuales de fin de pausa.

### Gestión Automatizada de 1RM y e1RM
- Actualización automática de récords personales al finalizar cualquier entrenamiento:
  - **PR Real:** Carga máxima absoluta superada a 1 o más repeticiones.
  - **e1RM Estimado:** Repetición máxima teórica calculada mediante la fórmula de Epley ajustada por RIR (Reps in Reserve / RPE):
    $$\text{e1RM} = \text{Peso} \times \left(1 + \frac{\text{Reps} + (10 - \text{RPE})}{30}\right)$$
- Recálculo dinámico de marcas históricas tras la edición o eliminación retrospectiva de sesiones.
- Calculadora técnica de porcentajes de carga (del 50% al 100% del 1RM).

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

La aplicación puede ser instalada como una app nativa independiente sin pasar por tiendas comerciales:

### En Android (Google Chrome)
1. Abrir la URL de la aplicación en el navegador.
2. Hacer clic en el botón técnico `INSTALAR APP` visible en la cabecera superior, o bien abrir el menú del navegador (tres puntos verticales) y seleccionar **Instalar aplicación**.
3. Confirmar la instalación para crear el acceso directo en la pantalla de inicio con su icono dedicado.

### En iOS / iPhone (Apple Safari)
1. Abrir la URL de la aplicación en Safari.
2. Pulsar el botón **Compartir** (icono de cuadrado con flecha hacia arriba) en la barra de navegación inferior.
3. Desplazarse por las opciones y seleccionar **Añadir a la pantalla de inicio**.
4. Confirmar el nombre y pulsar **Añadir**. La aplicación se ejecutará a pantalla completa en modo independiente (*standalone*), adaptándose a la Dynamic Island y notch.

---

## 4. Propiedad Intelectual y Licencia

Este software, su código fuente, arquitectura, diseño de interfaz y base de datos técnica son **obras protegidas por la legislación de propiedad intelectual**.

- **Régimen de Licencia:** Propietario (Todos los derechos reservados / All Rights Reserved).
- **Titular de los Derechos:** Eder Martin Mosquera.
- **Año de Registro:** 2026.

Queda estrictamente prohibida la copia, clonación, redistribución, modificación, descompilación, sublicenciamiento o explotación comercial total o parcial de este repositorio o de su código fuente sin el consentimiento previo, expreso y por escrito del autor. Para más información, consulte el archivo `LICENSE` ubicado en la raíz de este proyecto.
