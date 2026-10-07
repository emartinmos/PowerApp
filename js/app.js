/* ========================================
   PowerLifting Tracker - App.js
   PARTE 1: Estado, localStorage, Catálogo,
   Navegación SPA, Steppers, Tabs, Toast, 1RM
   ======================================== */

'use strict';

// ============================================================
// 0. CONTROL DE VERSIONES Y NOTAS DE PARCHE (CHANGELOG)
// ============================================================

const APP_VERSION = '1.3.0';
const STORAGE_VERSION_LEIDA = 'ultimaVersionLeida';

const NOTAS_DE_PARCHE = [
    {
        version: 'v1.3.0',
        fecha: '06/10/2026',
        titulo: 'Pantalla Encendida (Wake Lock), Alertas Acústicas y Micro-Notas Técnicas',
        cambios: [
            'Integración de Screen Wake Lock API para mantener la pantalla encendida durante el entrenamiento activo y reenganche automático al volver a la app.',
            'Alertas acústicas sintetizadas en tiempo real con Web Audio API al llegar el descanso a 00:00 (secuencia deportiva de 3 beeps a 880 Hz y tono final a 1046.5 Hz).',
            'Control de silencio y activación sonora con persistencia local en la barra flotante del cronómetro.',
            'Registro de micro-notas y etiquetas técnicas rápidas por serie (Pausa limpia, Sticking point, Pérdida de línea, Grip al límite, Sin cinto, Muñequeras/Rodilleras).',
            'Visualización de etiquetas e insignias técnicas en el historial de sesiones y soporte completo para editarlas en el editor retrospectivo.'
        ]
    },
    {
        version: 'v1.2.0',
        fecha: '06/10/2026',
        titulo: 'Edición de Historial, Competición IPF y Modo Offline Blindado',
        cambios: [
            'Soporte completo para editar y corregir sesiones pasadas en el Historial con recálculo automático de marcas 1RM y e1RM.',
            'Expansión de la base de datos técnica a más de 250 variantes de sentadilla, banca, peso muerto y accesorios de hipertrofia.',
            'Calculadora visual de carga de barra por lado con especificaciones oficiales IPF (discos de 25 kg a 0.25 kg y collarines calibrados).',
            'Cálculo automático de coeficientes de competición IPF GL Points (Classic 3-Lift) y Puntos DOTS según peso corporal y sexo.',
            'Clonación rápida de plantillas de entrenamiento con avance automático de semanas y microciclos.',
            'Cronómetro de descanso manual flotante accesible desde la cabecera con temporizadores preconfigurados.',
            'Instalador PWA nativo y Service Worker con estrategia Network-First para entrenamiento 100% offline sin cobertura.'
        ]
    },
    {
        version: 'v1.1.0',
        fecha: '04/10/2026',
        titulo: 'Sistema Dinámico 1RM y Rediseño Industrial Dark',
        cambios: [
            'Automatización de marcas personales (PR Real) y 1RM estimado (e1RM mediante fórmula de Epley ajustada por RIR/RPE) comenzando desde 0 kg.',
            'Rediseño visual completo hacia estética técnica "Industrial Dark" en negro puro (#000000) y acentos carmesí (#E50914).',
            'Iconografía vectorial SVG técnica en todos los controles y eliminación de emojis.',
            'Optimización responsive adaptada a zonas seguras (safe-area) y pantalla táctil de 393px (iPhone 16).'
        ]
    },
    {
        version: 'v1.0.0',
        fecha: '01/10/2026',
        titulo: 'Lanzamiento Inicial de PowerLifting Tracker',
        cambios: [
            'Constructor de protocolos con esquemas Top Set + Back-off y Series Planas.',
            'Registro de sesiones en vivo con controles táctiles Stepper (+/-) para peso, repeticiones y RPE.',
            'Cálculo de porcentaje de carga en tiempo real sobre 1RM.',
            'Persistencia local íntegra mediante localStorage sin dependencias externas ni conexión requerida.'
        ]
    }
];

/**
 * Renderiza el historial de versiones en el modal de Notas de Parche.
 */
function renderizarNotasParche() {
    const contenedor = document.getElementById('contenido-changelog');
    if (!contenedor) return;

    contenedor.innerHTML = NOTAS_DE_PARCHE.map((n, idx) => {
        const esActual = idx === 0 || n.version === `v${APP_VERSION}`;
        return `
            <article class="changelog-version-card ${esActual ? 'version-actual' : ''}">
                <header class="changelog-version-header">
                    <div class="changelog-badge-grupo">
                        <span class="changelog-badge-version">${n.version}</span>
                        ${esActual ? '<span class="changelog-badge-actual">ACTUAL</span>' : ''}
                    </div>
                    <time class="changelog-fecha">${n.fecha}</time>
                </header>
                <h3 class="changelog-version-titulo">${n.titulo}</h3>
                <ul class="changelog-lista-cambios">
                    ${n.cambios.map(c => `
                        <li class="changelog-item-cambio">
                            <span class="changelog-item-bullet" aria-hidden="true"></span>
                            <span class="changelog-item-texto">${c}</span>
                        </li>
                    `).join('')}
                </ul>
            </article>
        `;
    }).join('');
}

/**
 * Comprueba si hay una nueva versión no leída por el usuario
 * y muestra u oculta el punto rojo en el botón de la cabecera.
 */
function verificarNuevasVersionesChangelog() {
    const punto = document.getElementById('punto-version-nueva');
    if (!punto) return;

    const versionLeida = localStorage.getItem(STORAGE_VERSION_LEIDA);
    if (versionLeida !== APP_VERSION) {
        punto.classList.remove('oculto');
    } else {
        punto.classList.add('oculto');
    }
}

/**
 * Abre el modal de notas de parche, renderiza los cambios y marca
 * la versión actual como leída en localStorage.
 */
function abrirModalChangelog() {
    const modal = document.getElementById('modal-changelog');
    const punto = document.getElementById('punto-version-nueva');
    if (!modal) return;

    renderizarNotasParche();

    // Guardar versión actual como leída y apagar indicador rojo
    try {
        localStorage.setItem(STORAGE_VERSION_LEIDA, APP_VERSION);
    } catch (e) {
        console.warn('No se pudo guardar la versión leída en localStorage:', e);
    }

    if (punto) {
        punto.classList.add('oculto');
    }

    modal.classList.add('activo');
}

/**
 * Cierra el modal de notas de parche.
 */
function cerrarModalChangelog() {
    const modal = document.getElementById('modal-changelog');
    if (modal) {
        modal.classList.remove('activo');
    }
}

/**
 * Inicializa los eventos del botón y modal del Changelog.
 */
let _changelogInicializado = false;
function inicializarChangelog() {
    if (_changelogInicializado) return;
    _changelogInicializado = true;

    const btnAbrir = document.getElementById('btn-notas-parche');
    const btnCerrarHeader = document.getElementById('btn-cerrar-modal-changelog');
    const btnCerrarFooter = document.getElementById('btn-cerrar-changelog');

    if (btnAbrir) {
        btnAbrir.addEventListener('click', abrirModalChangelog);
    }

    if (btnCerrarHeader) {
        btnCerrarHeader.addEventListener('click', cerrarModalChangelog);
    }

    if (btnCerrarFooter) {
        btnCerrarFooter.addEventListener('click', cerrarModalChangelog);
    }

    // Verificar indicador rojo en el arranque
    verificarNuevasVersionesChangelog();
}

// ============================================================
// 1. ESTADO GLOBAL DE LA APLICACIÓN
// ============================================================

const APP = {
    // Catálogo de ejercicios cargado desde JSON + personalizados
    catalogoEjercicios: [],
    catalogoCategorias: [],

    // Estado del editor de rutina actual
    editorRutina: {
        id: null,           // null = nueva rutina, string = editando existente
        ejercicios: []      // ejercicios añadidos temporalmente al editor
    },

    // Estado del entrenamiento activo
    entrenamientoActivo: {
        rutinaId: null,
        rutinaNombre: '',
        fechaInicio: null,
        ejercicios: []      // con datos reales de cada serie
    },

    // Cronómetro de descanso
    cronometro: {
        intervalo: null,
        segundosRestantes: 0,
        segundosTotales: 300,   // 5 min por defecto
        activo: false,
        pausado: false
    },

    // Modal de confirmación - callback
    confirmarCallback: null,

    // Sesión seleccionada en historial para detalle/eliminar
    sesionSeleccionadaId: null,

    // Sesión cargada en modo edición
    sesionEnEdicion: null
};


// ============================================================
// 2. CLAVES Y FUNCIONES DE localStorage
// ============================================================

const LS_KEYS = {
    RUTINAS: 'pl_rutinas',
    HISTORIAL: 'pl_historial',
    EJERCICIOS_CUSTOM: 'pl_ejercicios_custom',
    MARCAS_1RM: 'pl_marcas_1rm',
    CRONO_SONIDO: 'pl_crono_sonido'
};

// Etiquetas técnicas rápidas disponibles para micro-notas por serie
const CHIPS_TECNICOS_DISPONIBLES = [
    'Pausa limpia',
    'Sticking point',
    'Pérdida de línea',
    'Grip al límite',
    'Sin cinto',
    'Muñequeras/Rodilleras'
];

// Valores iniciales limpios para las marcas 1RM (iniciadas estrictamente en 0 kg)
const MARCAS_1RM_DEFECTO = {
    squat: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null },
    bench: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null },
    deadlift: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null }
};

/**
 * Lee un valor de localStorage y lo parsea como JSON.
 * Si no existe o hay error de parseo, devuelve el valorDefecto.
 */
function leerLocalStorage(clave, valorDefecto) {
    try {
        const datos = localStorage.getItem(clave);
        if (datos === null) {
            return valorDefecto;
        }
        return JSON.parse(datos);
    } catch (error) {
        console.warn(`Error leyendo localStorage[${clave}]:`, error);
        return valorDefecto;
    }
}

/**
 * Guarda un valor en localStorage serializado como JSON.
 */
function guardarLocalStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
        console.error(`Error guardando en localStorage[${clave}]:`, error);
        mostrarToast('Error al guardar datos');
    }
}

/**
 * Obtiene las rutinas guardadas.
 * @returns {Array} Array de objetos rutina
 */
function obtenerRutinas() {
    return leerLocalStorage(LS_KEYS.RUTINAS, []);
}

/**
 * Guarda el array completo de rutinas.
 */
function guardarRutinas(rutinas) {
    guardarLocalStorage(LS_KEYS.RUTINAS, rutinas);
}

/**
 * Obtiene el historial de sesiones completadas.
 * @returns {Array} Array de sesiones
 */
function obtenerHistorial() {
    return leerLocalStorage(LS_KEYS.HISTORIAL, []);
}

/**
 * Guarda el historial completo.
 */
function guardarHistorial(historial) {
    guardarLocalStorage(LS_KEYS.HISTORIAL, historial);
}

/**
 * Obtiene los ejercicios personalizados del usuario.
 * @returns {Array} Array de ejercicios custom
 */
function obtenerEjerciciosCustom() {
    return leerLocalStorage(LS_KEYS.EJERCICIOS_CUSTOM, []);
}

/**
 * Guarda los ejercicios personalizados.
 */
function guardarEjerciciosCustom(ejercicios) {
    guardarLocalStorage(LS_KEYS.EJERCICIOS_CUSTOM, ejercicios);
}

/**
 * Normaliza el objeto de marcas 1RM garantizando su esquema dual (PR y e1RM).
 */
function normalizarMarcas1RM(marcasRaw) {
    const base = {
        squat: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null },
        bench: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null },
        deadlift: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null }
    };
    if (!marcasRaw || typeof marcasRaw !== 'object') return base;

    ['squat', 'bench', 'deadlift'].forEach(k => {
        if (typeof marcasRaw[k] === 'number') {
            base[k].pr = marcasRaw[k] || 0;
            base[k].e1rm = marcasRaw[k] || 0;
        } else if (marcasRaw[k] && typeof marcasRaw[k] === 'object') {
            base[k].pr = parseFloat(marcasRaw[k].pr) || 0;
            base[k].e1rm = parseFloat(marcasRaw[k].e1rm) || 0;
            base[k].fechaPR = marcasRaw[k].fechaPR || null;
            base[k].fechaE1RM = marcasRaw[k].fechaE1RM || null;
        }
    });
    return base;
}

/**
 * Obtiene las marcas 1RM del usuario normalizadas en 0 si no existen.
 * @returns {Object} { squat: { pr, e1rm, fechaPR, fechaE1RM }, ... }
 */
function obtenerMarcas1RM() {
    const raw = leerLocalStorage(LS_KEYS.MARCAS_1RM, null);
    return normalizarMarcas1RM(raw);
}

/**
 * Devuelve el valor numérico representativo de 1RM para un movimiento.
 */
function obtenerRMNumero(marcas, tipo) {
    if (!marcas || !marcas[tipo]) return 0;
    if (typeof marcas[tipo] === 'number') return marcas[tipo];
    return Math.max(marcas[tipo].pr || 0, marcas[tipo].e1rm || 0);
}

/**
 * Guarda las marcas 1RM.
 */
function guardarMarcas1RM(marcas) {
    guardarLocalStorage(LS_KEYS.MARCAS_1RM, marcas);
}

/**
 * Genera un ID único basado en timestamp + random.
 */
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}


// ============================================================
// 3. CARGA DEL CATÁLOGO DE EJERCICIOS (fetch + fallback)
// ============================================================

// Fallback mínimo por si falla el fetch (los 3 básicos + algunos accesorios)
const EJERCICIOS_FALLBACK = [
    {
        id: 'sq_low_bar',
        nombre: 'Sentadilla Barra Baja (Low Bar)',
        categoria: 'squat',
        musculosPrincipales: ['glúteos', 'isquiotibiales', 'cuádriceps'],
        musculosSecundarios: ['erectores espinales', 'core'],
        equipamiento: 'barra',
        esBasico: true,
        notas: 'Barra apoyada sobre deltoides posteriores. Variante más común en competición.'
    },
    {
        id: 'sq_high_bar',
        nombre: 'Sentadilla Barra Alta (High Bar)',
        categoria: 'squat',
        musculosPrincipales: ['cuádriceps', 'glúteos'],
        musculosSecundarios: ['isquiotibiales', 'erectores espinales', 'core'],
        equipamiento: 'barra',
        esBasico: true,
        notas: 'Barra apoyada sobre trapecios superiores.'
    },
    {
        id: 'sq_pausa',
        nombre: 'Sentadilla con Pausa (Paused Squat)',
        categoria: 'squat',
        musculosPrincipales: ['cuádriceps', 'glúteos'],
        musculosSecundarios: ['isquiotibiales', 'erectores espinales', 'core'],
        equipamiento: 'barra',
        esBasico: false,
        notas: 'Pausa de 2-3 segundos en el punto más bajo.'
    },
    {
        id: 'bp_competicion',
        nombre: 'Press de Banca Competición (Pausa)',
        categoria: 'bench',
        musculosPrincipales: ['pectoral mayor', 'tríceps'],
        musculosSecundarios: ['deltoides anterior', 'dorsal ancho'],
        equipamiento: 'barra, banco plano',
        esBasico: true,
        notas: 'Barra desciende al pecho con pausa completa. Estándar IPF.'
    },
    {
        id: 'bp_tng',
        nombre: 'Press de Banca Touch and Go (TNG)',
        categoria: 'bench',
        musculosPrincipales: ['pectoral mayor', 'tríceps'],
        musculosSecundarios: ['deltoides anterior', 'dorsal ancho'],
        equipamiento: 'barra, banco plano',
        esBasico: true,
        notas: 'Sin pausa en el pecho: se toca y se empuja directamente.'
    },
    {
        id: 'bp_close_grip',
        nombre: 'Press de Banca Agarre Cerrado (Close Grip)',
        categoria: 'bench',
        musculosPrincipales: ['tríceps', 'pectoral mayor'],
        musculosSecundarios: ['deltoides anterior'],
        equipamiento: 'barra, banco plano',
        esBasico: false,
        notas: 'Mayor énfasis en tríceps. Excelente para lockout.'
    },
    {
        id: 'dl_convencional',
        nombre: 'Peso Muerto Convencional',
        categoria: 'deadlift',
        musculosPrincipales: ['erectores espinales', 'glúteos', 'isquiotibiales'],
        musculosSecundarios: ['cuádriceps', 'trapecios', 'antebrazos', 'core'],
        equipamiento: 'barra',
        esBasico: true,
        notas: 'Pies a la anchura de los hombros, manos por fuera.'
    },
    {
        id: 'dl_sumo',
        nombre: 'Peso Muerto Sumo',
        categoria: 'deadlift',
        musculosPrincipales: ['glúteos', 'cuádriceps', 'aductores'],
        musculosSecundarios: ['isquiotibiales', 'erectores espinales', 'trapecios'],
        equipamiento: 'barra',
        esBasico: true,
        notas: 'Piernas muy abiertas, manos entre las rodillas. Muy usado en competición.'
    },
    {
        id: 'dl_rdl',
        nombre: 'Peso Muerto Rumano (RDL)',
        categoria: 'deadlift',
        musculosPrincipales: ['isquiotibiales', 'glúteos'],
        musculosSecundarios: ['erectores espinales', 'core'],
        equipamiento: 'barra',
        esBasico: false,
        notas: 'Se baja la barra con piernas casi extendidas mediante hip hinge.'
    },
    {
        id: 'acc_prensa',
        nombre: 'Prensa de Piernas (Leg Press)',
        categoria: 'accesorio_pierna',
        musculosPrincipales: ['cuádriceps', 'glúteos'],
        musculosSecundarios: ['isquiotibiales'],
        equipamiento: 'máquina prensa',
        esBasico: false,
        notas: 'Excelente para acumular volumen de piernas sin estrés axial.'
    },
    {
        id: 'acc_dominadas',
        nombre: 'Dominadas (Pull-Ups)',
        categoria: 'accesorio_espalda',
        musculosPrincipales: ['dorsal ancho', 'redondo mayor'],
        musculosSecundarios: ['bíceps', 'romboides', 'core'],
        equipamiento: 'barra de dominadas',
        esBasico: false,
        notas: 'Ejercicio rey de espalda con peso corporal.'
    },
    {
        id: 'acc_press_militar',
        nombre: 'Press Militar (OHP)',
        categoria: 'accesorio_hombro',
        musculosPrincipales: ['deltoides anterior', 'deltoides medial'],
        musculosSecundarios: ['tríceps', 'trapecios', 'core'],
        equipamiento: 'barra',
        esBasico: false,
        notas: 'Press estricto de pie con barra sobre la cabeza.'
    }
];

const CATEGORIAS_FALLBACK = [
    { id: 'squat', nombre: 'Sentadilla (Squat)', icono: 'SQ' },
    { id: 'bench', nombre: 'Press de Banca (Bench Press)', icono: 'BP' },
    { id: 'deadlift', nombre: 'Peso Muerto (Deadlift)', icono: 'DL' },
    { id: 'accesorio_pierna', nombre: 'Accesorios - Pierna', icono: 'LEG' },
    { id: 'accesorio_espalda', nombre: 'Accesorios - Espalda', icono: 'BACK' },
    { id: 'accesorio_pecho', nombre: 'Accesorios - Pecho', icono: 'CHEST' },
    { id: 'accesorio_hombro', nombre: 'Accesorios - Hombro', icono: 'SHLD' },
    { id: 'accesorio_brazo', nombre: 'Accesorios - Brazo', icono: 'ARM' },
    { id: 'accesorio_core', nombre: 'Accesorios - Core', icono: 'CORE' },
    { id: 'accesorio_gluteo', nombre: 'Accesorios - Glúteo', icono: 'GLUTE' }
];

/**
 * Carga el catálogo de ejercicios desde el JSON externo.
 * Si falla, usa el fallback mínimo.
 * Combina los ejercicios del JSON con los personalizados del usuario.
 */
async function cargarCatalogoEjercicios() {
    let datosJSON = null;

    try {
        const respuesta = await fetch('data/ejercicios.json');
        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }
        datosJSON = await respuesta.json();
        console.log(`[OK] Catálogo cargado: ${datosJSON.ejercicios.length} ejercicios`);
    } catch (error) {
        console.warn('[WARN] No se pudo cargar ejercicios.json, usando fallback:', error.message);
        datosJSON = {
            categorias: CATEGORIAS_FALLBACK,
            ejercicios: EJERCICIOS_FALLBACK
        };
    }

    // Guardar categorías
    APP.catalogoCategorias = datosJSON.categorias || CATEGORIAS_FALLBACK;

    // Combinar ejercicios del JSON con los personalizados del usuario
    const ejerciciosCustom = obtenerEjerciciosCustom();
    APP.catalogoEjercicios = [...datosJSON.ejercicios, ...ejerciciosCustom];

    console.log(`[DATA] Total ejercicios disponibles: ${APP.catalogoEjercicios.length} (${ejerciciosCustom.length} personalizados)`);
}

/**
 * Busca un ejercicio por su ID en el catálogo completo.
 * @param {string} id - ID del ejercicio
 * @returns {Object|null} Ejercicio encontrado o null
 */
function buscarEjercicioPorId(id) {
    return APP.catalogoEjercicios.find(ej => ej.id === id) || null;
}

/**
 * Obtiene el icono de una categoría por su ID.
 * @param {string} categoriaId
 * @returns {string} Emoji icono
 */
function obtenerIconoCategoria(categoriaId) {
    const cat = APP.catalogoCategorias.find(c => c.id === categoriaId);
    return cat ? cat.icono : 'ACC';
}

/**
 * Obtiene el nombre de una categoría por su ID.
 * @param {string} categoriaId
 * @returns {string}
 */
function obtenerNombreCategoria(categoriaId) {
    const cat = APP.catalogoCategorias.find(c => c.id === categoriaId);
    return cat ? cat.nombre : categoriaId;
}


// ============================================================
// 4. SISTEMA DE NAVEGACIÓN SPA
// ============================================================

// IDs de las vistas principales accesibles desde el bottom nav
const VISTAS_NAV = ['vista-entrenar', 'vista-constructor', 'vista-historial'];

// Todas las vistas (incluidas las que no están en el nav)
const TODAS_LAS_VISTAS = [
    'vista-entrenar',
    'vista-entrenamiento',
    'vista-constructor',
    'vista-editor-rutina',
    'vista-historial'
];

/**
 * Navega a una vista específica ocultando todas las demás.
 * @param {string} vistaId - ID de la sección a mostrar
 * @param {Object} opciones - { actualizarNav: bool, scrollTop: bool }
 */
function navegarA(vistaId, opciones = {}) {
    const { actualizarNav = true, scrollTop = true } = opciones;

    // Ocultar todas las vistas
    TODAS_LAS_VISTAS.forEach(id => {
        const seccion = document.getElementById(id);
        if (seccion) {
            seccion.classList.remove('activa');
        }
    });

    // Mostrar la vista seleccionada
    const vistaDestino = document.getElementById(vistaId);
    if (vistaDestino) {
        vistaDestino.classList.add('activa');
    }

    // Actualizar el bottom nav si la vista es una de las principales
    if (actualizarNav && VISTAS_NAV.includes(vistaId)) {
        actualizarNavActivo(vistaId);
    }

    // Scroll al top de la vista
    if (scrollTop) {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Mostrar/ocultar el bottom nav según la vista
    const navBottom = document.getElementById('nav-bottom');
    if (navBottom) {
        if (vistaId === 'vista-entrenamiento' || vistaId === 'vista-editor-rutina') {
            navBottom.style.display = 'none';
        } else {
            navBottom.style.display = 'flex';
        }
    }
}

/**
 * Actualiza la clase 'activo' en los botones del bottom nav.
 * @param {string} vistaId - ID de la vista activa
 */
function actualizarNavActivo(vistaId) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.dataset.vista === vistaId) {
            item.classList.add('activo');
        } else {
            item.classList.remove('activo');
        }
    });
}

/**
 * Inicializa los event listeners del bottom nav.
 */
let _navegacionInicializada = false;
function inicializarNavegacion() {
    if (_navegacionInicializada) return;
    _navegacionInicializada = true;

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const vistaId = item.dataset.vista;
            if (vistaId) {
                navegarA(vistaId);

                // Actualizar contenido al entrar en cada vista
                if (vistaId === 'vista-entrenar') {
                    renderizarRutinasEntrenar();
                } else if (vistaId === 'vista-constructor') {
                    renderizarRutinasConstructor();
                } else if (vistaId === 'vista-historial') {
                    renderizarHistorial();
                    actualizarTabla1RM();
                }
            }
        });
    });

    // Botón "Crear Rutina" desde el empty state de Entrenar
    const btnIrConstructor = document.getElementById('btn-ir-constructor');
    if (btnIrConstructor) {
        btnIrConstructor.addEventListener('click', () => {
            navegarA('vista-constructor');
        });
    }
}


// ============================================================
// 5. SISTEMA DE TABS (Historial / 1RM)
// ============================================================

/**
 * Inicializa la lógica de tabs en la vista de historial.
 */
let _tabsInicializadas = false;
function inicializarTabs() {
    if (_tabsInicializadas) return;
    _tabsInicializadas = true;

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;

            // Desactivar todos los tabs
            tabs.forEach(t => t.classList.remove('activo'));

            // Desactivar todos los contenidos de tab
            document.querySelectorAll('.tab-contenido').forEach(tc => {
                tc.classList.remove('activo');
            });

            // Activar el tab clicado y su contenido
            tab.classList.add('activo');
            const contenido = document.getElementById(targetId);
            if (contenido) {
                contenido.classList.add('activo');
            }
        });
    });
}


// ============================================================
// 6. SISTEMA DE TOAST (NOTIFICACIONES)
// ============================================================

let toastTimeout = null;

/**
 * Muestra un toast/notificación temporal.
 * @param {string} mensaje - Texto a mostrar
 * @param {number} duracion - Milisegundos (por defecto 2500)
 */
function mostrarToast(mensaje, duracion = 2500) {
    const toast = document.getElementById('toast');
    const toastMensaje = document.getElementById('toast-mensaje');
    if (!toast || !toastMensaje) return;

    // Limpiar toast anterior
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toast.classList.remove('saliendo');
    }

    toastMensaje.textContent = mensaje;
    toast.classList.remove('oculto', 'saliendo');

    toastTimeout = setTimeout(() => {
        toast.classList.add('saliendo');
        setTimeout(() => {
            toast.classList.add('oculto');
            toast.classList.remove('saliendo');
        }, 250); // Duración de la animación toastOut
    }, duracion);
}


// ============================================================
// 7. MODAL DE CONFIRMACIÓN GENÉRICO
// ============================================================

/**
 * Muestra el modal de confirmación con un texto y un callback.
 * @param {string} texto - Pregunta a mostrar
 * @param {Function} onConfirmar - Función a ejecutar si el usuario acepta
 * @param {string} textoBoton - Texto del botón de acción (por defecto "Eliminar")
 * @param {string} claseBoton - Clase de estilo para el botón (por defecto "btn-danger")
 */
function mostrarConfirmacion(texto, onConfirmar, textoBoton = 'Eliminar', claseBoton = 'btn-danger') {
    const modal = document.getElementById('modal-confirmar');
    const textoEl = document.getElementById('texto-confirmar');
    const btnAceptar = document.getElementById('btn-aceptar-confirmar');

    if (!modal || !textoEl || !btnAceptar) return;

    textoEl.textContent = texto;
    btnAceptar.textContent = textoBoton;
    btnAceptar.className = `btn ${claseBoton}`;
    APP.confirmarCallback = onConfirmar;
    modal.classList.add('activo');
}

/**
 * Inicializa los botones del modal de confirmación.
 */
let _modalConfirmarInicializado = false;
function inicializarModalConfirmar() {
    if (_modalConfirmarInicializado) return;
    _modalConfirmarInicializado = true;

    const btnCancelar = document.getElementById('btn-cancelar-confirmar');
    const btnAceptar = document.getElementById('btn-aceptar-confirmar');
    const modal = document.getElementById('modal-confirmar');

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            if (modal) modal.classList.remove('activo');
            APP.confirmarCallback = null;
        });
    }

    if (btnAceptar) {
        btnAceptar.addEventListener('click', () => {
            if (typeof APP.confirmarCallback === 'function') {
                APP.confirmarCallback();
            }
            if (modal) modal.classList.remove('activo');
            APP.confirmarCallback = null;
        });
    }
}


// ============================================================
// 8. STEPPER CONTROLS (DELEGACIÓN DE EVENTOS)
// ============================================================

/**
 * Inicializa los controles stepper (botones +/-) globalmente
 * mediante delegación de eventos en el document.
 * Funciona tanto para steppers estáticos del HTML como los
 * generados dinámicamente por JS.
 */
let _steppersInicializados = false;
function inicializarSteppers() {
    if (_steppersInicializados) return;
    _steppersInicializados = true;

    document.addEventListener('click', (e) => {
        const boton = e.target.closest('.stepper-btn');
        if (!boton) return;

        const step = parseFloat(boton.dataset.step);
        if (isNaN(step)) return;

        let input = null;

        // Si el botón tiene data-target, buscar el input por ID
        if (boton.dataset.target) {
            input = document.getElementById(boton.dataset.target);
        }

        // Si no, buscar el input hermano dentro del mismo stepper
        if (!input) {
            const stepper = boton.closest('.stepper');
            if (stepper) {
                input = stepper.querySelector('input');
            }
        }

        if (!input) return;

        const valorActual = parseFloat(input.value) || 0;
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        let nuevoValor = valorActual + step;

        // Respetar min/max si están definidos
        if (!isNaN(min) && nuevoValor < min) nuevoValor = min;
        if (!isNaN(max) && nuevoValor > max) nuevoValor = max;

        // Redondear para evitar errores de punto flotante
        nuevoValor = Math.round(nuevoValor * 100) / 100;

        input.value = nuevoValor;

        // Disparar evento 'input' para que otros listeners lo detecten
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}


// ============================================================
// 9. GESTIÓN DE 1RM, e1RM Y CALCULADORA DE INTENSIDAD
// ============================================================

/**
 * Calcula el 1RM estimado (e1RM) a partir de peso, repeticiones y RPE
 * utilizando la fórmula de Epley combinada con Reps en Recámara (RIR).
 * @param {number} peso - Peso movido en kg
 * @param {number} reps - Repeticiones completadas
 * @param {number} rpe - Índice de esfuerzo percibido (5-10)
 * @returns {number} e1RM redondeado al múltiplo más cercano de 0.5 kg
 */
function calcularE1RM(peso, reps, rpe) {
    if (!peso || peso <= 0 || !reps || reps <= 0) return 0;
    const rpeVal = Math.min(10, Math.max(5, parseFloat(rpe) || 10));

    // Si es 1 repetición a RPE 10 exacto, el e1RM es la carga levantada
    if (reps === 1 && rpeVal === 10) return Math.round(peso * 2) / 2;

    const repsEnRecamara = Math.max(0, 10 - rpeVal);
    const repsTotalesPotenciales = reps + repsEnRecamara;
    const e1rm = peso * (1 + repsTotalesPotenciales / 30);
    return Math.round(e1rm * 2) / 2; // Múltiplo de 0.5 kg
}

/**
 * Recorre todas las series completadas de una sesión finalizada,
 * identifica si pertenecen a los 3 básicos y actualiza automáticamente
 * el PR Real y el e1RM si superan los valores guardados.
 * @param {Object} sesion - Objeto de la sesión recién completada
 * @returns {Array<string>} Nombres de los básicos con nuevo récord alcanzado
 */
function calcularYActualizar1RM(sesion) {
    if (!sesion || !Array.isArray(sesion.ejercicios)) return [];

    const marcas = obtenerMarcas1RM();
    const nuevosRecords = [];
    const fechaSesion = sesion.fecha || new Date().toISOString();

    sesion.ejercicios.forEach(ej => {
        let tipo = obtenerTipo1RM(ej.categoria);
        if (!tipo && ej.ejercicioId) {
            const info = buscarEjercicioPorId(ej.ejercicioId);
            if (info) tipo = obtenerTipo1RM(info.categoria);
        }
        if (!tipo) return; // Solo procesa básico squat, bench o deadlift

        (ej.series || []).forEach(serie => {
            if (!serie.completada) return;

            const peso = parseFloat(serie.peso) || 0;
            const reps = parseInt(serie.reps, 10) || 0;
            const rpe = parseFloat(serie.rpe) || 10;
            if (peso <= 0 || reps <= 0) return;

            const e1rmCalc = calcularE1RM(peso, reps, rpe);
            let recordDetectado = false;

            // 1. Verificación de PR Real (peso absoluto levantado)
            if (peso > (marcas[tipo].pr || 0)) {
                marcas[tipo].pr = peso;
                marcas[tipo].fechaPR = fechaSesion;
                recordDetectado = true;
            }

            // 2. Verificación de e1RM Estimado (según Epley y RPE)
            if (e1rmCalc > (marcas[tipo].e1rm || 0)) {
                marcas[tipo].e1rm = e1rmCalc;
                marcas[tipo].fechaE1RM = fechaSesion;
                recordDetectado = true;
            }

            if (recordDetectado) {
                const nombresMap = { squat: 'SENTADILLA', bench: 'PRESS DE BANCA', deadlift: 'PESO MUERTO' };
                if (!nuevosRecords.includes(nombresMap[tipo])) {
                    nuevosRecords.push(nombresMap[tipo]);
                }
            }
        });
    });

    if (nuevosRecords.length > 0) {
        guardarMarcas1RM(marcas);
        renderizar1RM();
        actualizarTabla1RM();
    }

    return nuevosRecords;
}

/**
 * Recalcula desde cero todos los 1RM y e1RM recorriendo todo el historial.
 * Vital cuando se edita un peso erróneo a la baja o se elimina una sesión.
 * @returns {Object} Marcas 1RM actualizadas
 */
function recalcularTodosLos1RM() {
    const historial = obtenerHistorial();
    const nuevasMarcas = {
        squat: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null },
        bench: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null },
        deadlift: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null }
    };

    // Ordenar cronológicamente para que las fechas de récord reflejen el orden temporal
    const historialCronologico = [...historial].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    historialCronologico.forEach(sesion => {
        const fechaSesion = sesion.fecha || new Date().toISOString();
        (sesion.ejercicios || []).forEach(ej => {
            let tipo = obtenerTipo1RM(ej.categoria);
            if (!tipo && ej.ejercicioId) {
                const info = buscarEjercicioPorId(ej.ejercicioId);
                if (info) tipo = obtenerTipo1RM(info.categoria);
            }
            if (!tipo || !nuevasMarcas[tipo]) return;

            (ej.series || []).forEach(serie => {
                if (!serie.completada) return;

                const peso = parseFloat(serie.peso) || 0;
                const reps = parseInt(serie.reps, 10) || 0;
                const rpe = parseFloat(serie.rpe) || 10;
                if (peso <= 0 || reps <= 0) return;

                const e1rmCalc = calcularE1RM(peso, reps, rpe);

                // PR Real
                if (peso > (nuevasMarcas[tipo].pr || 0)) {
                    nuevasMarcas[tipo].pr = peso;
                    nuevasMarcas[tipo].fechaPR = fechaSesion;
                }

                // e1RM Estimado
                if (e1rmCalc > (nuevasMarcas[tipo].e1rm || 0)) {
                    nuevasMarcas[tipo].e1rm = e1rmCalc;
                    nuevasMarcas[tipo].fechaE1RM = fechaSesion;
                }
            });
        });
    });

    guardarMarcas1RM(nuevasMarcas);
    renderizar1RM();
    actualizarTabla1RM();
    return nuevasMarcas;
}

/**
 * Pinta en el DOM las tarjetas de 1RM con PR Real, e1RM y el TOTAL de Powerlifting.
 */
function renderizar1RM() {
    const contenedor = document.getElementById('grid-tarjetas-1rm');
    if (!contenedor) return;

    const marcas = obtenerMarcas1RM();
    const basicos = [
        { id: 'squat', tag: 'SQ', nombre: 'SENTADILLA (SQUAT)' },
        { id: 'bench', tag: 'BP', nombre: 'PRESS DE BANCA (BENCH)' },
        { id: 'deadlift', tag: 'DL', nombre: 'PESO MUERTO (DEADLIFT)' }
    ];

    let totalPR = 0;
    let totalE1RM = 0;

    let html = basicos.map(item => {
        const datos = marcas[item.id] || { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null };
        totalPR += (datos.pr || 0);
        totalE1RM += (datos.e1rm || 0);

        const fechaPRTxt = datos.fechaPR ? formatearFecha(datos.fechaPR).corta : '--';
        const fechaE1RMTxt = datos.fechaE1RM ? formatearFecha(datos.fechaE1RM).corta : '--';

        return `
            <div class="tarjeta-1rm-pro">
                <div class="tarjeta-1rm-top">
                    <span class="badge-cat ${item.tag.toLowerCase()}">${item.tag}</span>
                    <span class="tarjeta-1rm-titulo">${item.nombre}</span>
                </div>
                <div class="tarjeta-1rm-stats">
                    <div class="stat-item">
                        <span class="stat-label">PR REAL</span>
                        <span class="stat-valor">${datos.pr || 0} <span style="font-size: 0.75rem; color: var(--gris-medio);">KG</span></span>
                        <span class="stat-fecha">${fechaPRTxt}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">e1RM (RPE)</span>
                        <span class="stat-valor e1rm">${datos.e1rm || 0} <span style="font-size: 0.75rem; color: var(--gris-medio);">KG</span></span>
                        <span class="stat-fecha">${fechaE1RMTxt}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Tarjeta del TOTAL Powerlifting
    html += `
        <div class="tarjeta-1rm-pro total">
            <div class="tarjeta-1rm-top">
                <span class="badge-cat tot">TOT</span>
                <span class="tarjeta-1rm-titulo" style="color: var(--rojo);">TOTAL POWERLIFTING</span>
            </div>
            <div class="tarjeta-1rm-stats">
                <div class="stat-item">
                    <span class="stat-label">TOTAL PR</span>
                    <span class="stat-valor">${Math.round(totalPR * 10) / 10} <span style="font-size: 0.75rem; color: var(--gris-medio);">KG</span></span>
                    <span class="stat-fecha">SUMA REAL</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">TOTAL e1RM</span>
                    <span class="stat-valor e1rm">${Math.round(totalE1RM * 10) / 10} <span style="font-size: 0.75rem; color: var(--gris-medio);">KG</span></span>
                    <span class="stat-fecha">SUMA ESTIMADA</span>
                </div>
            </div>
        </div>
    `;

    contenedor.innerHTML = html;
    actualizarCoeficientesCompeticion(totalPR > 0 ? totalPR : totalE1RM);
}

/**
 * Calcula el porcentaje de un peso respecto al 1RM (evitando divisiones por cero).
 * @param {number} peso - Peso en kg
 * @param {number} rm - 1RM en kg
 * @returns {number} Porcentaje (0-100+)
 */
function calcularPorcentaje1RM(peso, rm) {
    if (!rm || rm <= 0) return 0;
    return Math.round((peso / rm) * 1000) / 10;
}

/**
 * Determina la categoría de 1RM de un ejercicio.
 * @param {string} categoriaId - Categoría del ejercicio
 * @returns {string|null}
 */
function obtenerTipo1RM(categoriaId) {
    if (categoriaId === 'squat') return 'squat';
    if (categoriaId === 'bench') return 'bench';
    if (categoriaId === 'deadlift') return 'deadlift';
    return null;
}

/**
 * Genera y muestra la tabla de porcentajes en la calculadora.
 */
function actualizarTabla1RM() {
    const selectEjercicio = document.getElementById('calc-ejercicio');
    const tablaPorcentajes = document.getElementById('tabla-porcentajes');
    if (!selectEjercicio || !tablaPorcentajes) return;

    const tipo = selectEjercicio.value; // 'squat', 'bench' o 'deadlift'
    const marcas = obtenerMarcas1RM();
    const rm = obtenerRMNumero(marcas, tipo);

    if (rm <= 0) {
        tablaPorcentajes.innerHTML = `
            <div class="empty-state-mini">
                <p>SIN REGISTRO DE 1RM EN ESTE BÁSICO (0 KG)</p>
            </div>
        `;
        return;
    }

    const porcentajes = [100, 97.5, 95, 92.5, 90, 87.5, 85, 82.5, 80, 77.5, 75, 72.5, 70, 67.5, 65, 62.5, 60, 57.5, 55, 52.5, 50];

    let html = `
        <div class="tabla-fila tabla-fila-header">
            <span class="tabla-col">% 1RM</span>
            <span class="tabla-col">CARGA EXACTA</span>
            <span class="tabla-col">REDONDEO 2.5 KG</span>
        </div>
    `;

    porcentajes.forEach(pct => {
        const peso = Math.round((rm * pct / 100) * 10) / 10;
        const pesoRedondeado = Math.round(peso / 2.5) * 2.5;

        html += `
            <div class="tabla-fila">
                <span class="tabla-col">${pct}%</span>
                <span class="tabla-col">${peso} KG</span>
                <span class="tabla-col">${pesoRedondeado} KG</span>
            </div>
        `;
    });

    tablaPorcentajes.innerHTML = html;
}

// ============================================================
// COEFICIENTES OFICIALES DE COMPETICIÓN (IPF GL & DOTS)
// ============================================================

const STORAGE_ATLETA_PESO = 'pl_atleta_peso';
const STORAGE_ATLETA_SEXO = 'pl_atleta_sexo';

function obtenerPesoAtleta() {
    const val = localStorage.getItem(STORAGE_ATLETA_PESO);
    return val ? parseFloat(val) : 83;
}

function guardarPesoAtleta(peso) {
    localStorage.setItem(STORAGE_ATLETA_PESO, peso);
}

function obtenerSexoAtleta() {
    return localStorage.getItem(STORAGE_ATLETA_SEXO) || 'M';
}

function guardarSexoAtleta(sexo) {
    localStorage.setItem(STORAGE_ATLETA_SEXO, sexo);
}

/**
 * Calcula IPF GL Points (Fórmula oficial IPF Classic 3-Lift).
 * @param {number} total - Total de powerlifting en kg
 * @param {number} bw - Peso corporal en kg
 * @param {'M'|'F'} sexo - Sexo biológico del atleta
 * @returns {number} Puntos IPF GL
 */
function calcularPuntosIPFGL(total, bw, sexo = 'M') {
    if (!total || total <= 0 || !bw || bw <= 0) return 0;
    const esMasculino = sexo === 'M';
    const a = esMasculino ? 1199.72839 : 610.32796;
    const b = esMasculino ? 1025.18162 : 1045.59282;
    const c = esMasculino ? 0.00921 : 0.03048;

    const denom = a - b * Math.exp(-c * bw);
    if (denom <= 0) return 0;
    return (total / denom) * 100;
}

/**
 * Calcula puntos de la fórmula DOTS.
 * @param {number} total - Total en kg
 * @param {number} bw - Peso corporal en kg
 * @param {'M'|'F'} sexo - Sexo biológico ('M' o 'F')
 * @returns {number} Puntos DOTS
 */
function calcularPuntosDOTS(total, bw, sexo = 'M') {
    if (!total || total <= 0 || !bw || bw <= 0) return 0;
    const esMasculino = sexo === 'M';
    const a = esMasculino ? -0.0000010930 : -0.0000010706;
    const b = esMasculino ? 0.0007391293 : 0.0005158568;
    const c = esMasculino ? -0.1918759221 : -0.1126655495;
    const d = esMasculino ? 24.0900756 : 13.6175032;
    const e = esMasculino ? -307.75076 : -57.96288;

    const denom = a * Math.pow(bw, 4) + b * Math.pow(bw, 3) + c * Math.pow(bw, 2) + d * bw + e;
    if (denom <= 0) return 0;
    return total * (500 / denom);
}

/**
 * Actualiza los paneles visuales de IPF GL y DOTS en la vista de 1RM.
 */
function actualizarCoeficientesCompeticion(totalPowerlifting = null) {
    const elIpfGL = document.getElementById('valor-puntos-ipfgl');
    const elDots = document.getElementById('valor-puntos-dots');
    const inputPeso = document.getElementById('input-atleta-peso');
    if (!elIpfGL || !elDots) return;

    let total = totalPowerlifting;
    if (total === null || total === undefined) {
        const marcas = obtenerMarcas1RM();
        const prTotal = (marcas.squat?.pr || 0) + (marcas.bench?.pr || 0) + (marcas.deadlift?.pr || 0);
        const e1rmTotal = (marcas.squat?.e1rm || 0) + (marcas.bench?.e1rm || 0) + (marcas.deadlift?.e1rm || 0);
        total = prTotal > 0 ? prTotal : e1rmTotal;
    }

    const pesoAtleta = inputPeso && parseFloat(inputPeso.value) > 0 ? parseFloat(inputPeso.value) : obtenerPesoAtleta();
    const sexoAtleta = obtenerSexoAtleta();

    if (total > 0 && pesoAtleta > 0) {
        const ipfPoints = calcularPuntosIPFGL(total, pesoAtleta, sexoAtleta);
        const dotsPoints = calcularPuntosDOTS(total, pesoAtleta, sexoAtleta);
        elIpfGL.textContent = ipfPoints > 0 ? (Math.round(ipfPoints * 100) / 100).toFixed(2) : '--';
        elDots.textContent = dotsPoints > 0 ? (Math.round(dotsPoints * 100) / 100).toFixed(2) : '--';
    } else {
        elIpfGL.textContent = '--';
        elDots.textContent = '--';
    }
}

/**
 * Inicializa los eventos de la sección 1RM (automático + reset a 0 + coeficientes).
 */
let _1rmInicializado = false;
function inicializar1RM() {
    if (_1rmInicializado) return;
    _1rmInicializado = true;

    // Botón resetear a 0 con confirmación
    const btnReset = document.getElementById('btn-reset-1rm');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            mostrarConfirmacion('¿Seguro que deseas reiniciar todos tus registros de 1RM a 0 kg?', () => {
                const marcasCero = {
                    squat: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null },
                    bench: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null },
                    deadlift: { pr: 0, e1rm: 0, fechaPR: null, fechaE1RM: null }
                };
                guardarMarcas1RM(marcasCero);
                renderizar1RM();
                actualizarTabla1RM();
                actualizarCoeficientesCompeticion(0);
                mostrarToast('MARCAS REINICIADAS A 0 KG');
            }, 'REINICIAR');
        });
    }

    // Selector calculadora
    const selectCalc = document.getElementById('calc-ejercicio');
    if (selectCalc) {
        selectCalc.addEventListener('change', actualizarTabla1RM);
    }

    // Configuración de Atleta para Coeficientes (IPF GL & DOTS)
    const inputPesoAtleta = document.getElementById('input-atleta-peso');
    const switchSexo = document.getElementById('switch-sexo-atleta');

    if (inputPesoAtleta) {
        inputPesoAtleta.value = obtenerPesoAtleta();
        inputPesoAtleta.addEventListener('input', () => {
            const peso = parseFloat(inputPesoAtleta.value);
            if (!isNaN(peso) && peso > 0) {
                guardarPesoAtleta(peso);
                actualizarCoeficientesCompeticion();
            }
        });
    }

    if (switchSexo) {
        const sexoGuardado = obtenerSexoAtleta();
        switchSexo.querySelectorAll('.btn-sexo').forEach(btn => {
            if (btn.dataset.sexo === sexoGuardado) {
                btn.classList.add('activo');
            } else {
                btn.classList.remove('activo');
            }

            btn.addEventListener('click', () => {
                switchSexo.querySelectorAll('.btn-sexo').forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
                guardarSexoAtleta(btn.dataset.sexo);
                actualizarCoeficientesCompeticion();
            });
        });
    }

    renderizar1RM();
    actualizarTabla1RM();
}

// ============================================================
// CALCULADORA VISUAL DE CARGA DE BARRA (COMPETICIÓN IPF)
// ============================================================

const DISCOS_COMPETICION = [
    { peso: 25, clase: 'd25', color: '#E50914', texto: '25' },
    { peso: 20, clase: 'd20', color: '#1D4ED8', texto: '20' },
    { peso: 15, clase: 'd15', color: '#EAB308', texto: '15' },
    { peso: 10, clase: 'd10', color: '#15803D', texto: '10' },
    { peso: 5, clase: 'd5', color: '#F5F5F5', texto: '5' },
    { peso: 2.5, clase: 'd2_5', color: '#212121', texto: '2.5' },
    { peso: 1.25, clase: 'd1_25', color: '#737373', texto: '1.25' },
    { peso: 0.5, clase: 'd0_5', color: '#525252', texto: '0.5' },
    { peso: 0.25, clase: 'd0_25', color: '#383838', texto: '0.25' }
];

/**
 * Calcula el desglose voraz de discos para UN LADO de la barra.
 * @param {number} pesoObjetivo
 * @param {number} pesoBarra
 * @param {number} pesoCollarines
 * @returns {Object} { porLado, pesoBase, pesoTotalEfectivo, discosPorLado: Array }
 */
function calcularCargaDiscos(pesoObjetivo, pesoBarra = 20, pesoCollarines = 5) {
    const pesoBase = pesoBarra + pesoCollarines;
    const pesoExcedente = Math.max(0, pesoObjetivo - pesoBase);
    let porLado = pesoExcedente / 2;
    let resto = porLado;

    const discosPorLado = [];
    DISCOS_COMPETICION.forEach(d => {
        const count = Math.floor(resto / d.peso);
        if (count > 0) {
            discosPorLado.push({
                ...d,
                cantidad: count
            });
            resto = Math.round((resto - count * d.peso) * 1000) / 1000;
        }
    });

    const sumaDiscosPorLado = discosPorLado.reduce((acc, cur) => acc + (cur.peso * cur.cantidad), 0);
    const pesoTotalEfectivo = pesoBase + (sumaDiscosPorLado * 2);

    return {
        pesoObjetivo,
        pesoBase,
        porLado: Math.round(sumaDiscosPorLado * 100) / 100,
        pesoTotalEfectivo: Math.round(pesoTotalEfectivo * 100) / 100,
        discosPorLado
    };
}

/**
 * Actualiza la interfaz del modal de carga de discos (sleeve, badges, métricas).
 */
function actualizarVistaCalculadoraDiscos() {
    const inputPeso = document.getElementById('calc-peso-objetivo');
    const selectBarra = document.getElementById('calc-select-barra');
    const selectCollarines = document.getElementById('calc-select-collarines');
    const manguitoEl = document.getElementById('calc-manguito-barra');
    const chipsEl = document.getElementById('calc-desglose-chips');
    const valPorLado = document.getElementById('calc-valor-por-lado');
    const valBase = document.getElementById('calc-valor-base');
    const valTotal = document.getElementById('calc-valor-total');

    if (!inputPeso || !selectBarra || !selectCollarines || !manguitoEl || !chipsEl) return;

    const pesoObjetivo = parseFloat(inputPeso.value) || 0;
    const pesoBarra = parseFloat(selectBarra.value) || 20;
    const pesoCollarines = parseFloat(selectCollarines.value) || 0;

    const resultado = calcularCargaDiscos(pesoObjetivo, pesoBarra, pesoCollarines);

    // Actualizar métricas numéricas
    if (valPorLado) valPorLado.innerHTML = `${resultado.porLado} <small>kg</small>`;
    if (valBase) valBase.innerHTML = `${resultado.pesoBase} <small>kg</small>`;
    if (valTotal) valTotal.innerHTML = `${resultado.pesoTotalEfectivo} <small>kg</small>`;

    // Dibujar el Manguito de la barra (Sleeve)
    let sleeveHtml = `
        <div class="calc-tope-interior" title="Tope interior de la barra"></div>
        <div class="calc-eje-manguito"></div>
    `;

    if (resultado.discosPorLado.length === 0) {
        sleeveHtml += `<span class="calc-vacio-aviso">BARRA VACÍA (SIN DISCOS)</span>`;
    } else {
        sleeveHtml += `<div class="calc-discos-lista">`;
        resultado.discosPorLado.forEach(d => {
            for (let i = 0; i < d.cantidad; i++) {
                sleeveHtml += `<div class="calc-disco-visual ${d.clase}" title="Disco ${d.peso} kg">${d.texto}</div>`;
            }
        });
        sleeveHtml += `</div>`;
    }

    if (pesoCollarines > 0) {
        sleeveHtml += `<div class="calc-collarin-visual" title="Collarín competición (+2.5 kg por lado)"></div>`;
    }

    manguitoEl.innerHTML = sleeveHtml;

    // Dibujar Desglose en Badges / Chips
    if (resultado.discosPorLado.length === 0) {
        chipsEl.innerHTML = `<span style="font-size: 0.72rem; color: var(--gris-medio); font-family: var(--font-mono);">0 DISCOS A CARGAR</span>`;
    } else {
        chipsEl.innerHTML = resultado.discosPorLado.map(d => `
            <div class="calc-chip-disco">
                <span class="calc-chip-color" style="background-color: ${d.color};"></span>
                <span>${d.cantidad}x ${d.peso} kg</span>
            </div>
        `).join('');
    }
}

/**
 * Abre el modal de la calculadora de carga de barra pre-llenándolo opcionalmente.
 * @param {number|null} pesoInicial
 */
function abrirModalCalculadoraDiscos(pesoInicial = null) {
    const modal = document.getElementById('modal-calculadora-discos');
    const inputPeso = document.getElementById('calc-peso-objetivo');
    if (!modal) return;

    if (pesoInicial !== null && !isNaN(pesoInicial) && pesoInicial > 0) {
        if (inputPeso) inputPeso.value = pesoInicial;
    }

    actualizarVistaCalculadoraDiscos();
    modal.classList.add('activo');
}

/**
 * Cierra el modal de la calculadora de carga de barra.
 */
function cerrarModalCalculadoraDiscos() {
    const modal = document.getElementById('modal-calculadora-discos');
    if (modal) {
        modal.classList.remove('activo');
    }
}

let _calcDiscosInicializada = false;
function inicializarCalculadoraDiscos() {
    if (_calcDiscosInicializada) return;
    _calcDiscosInicializada = true;

    const inputPeso = document.getElementById('calc-peso-objetivo');
    const selectBarra = document.getElementById('calc-select-barra');
    const selectCollarines = document.getElementById('calc-select-collarines');
    const btnMenos = document.getElementById('btn-calc-peso-menos');
    const btnMas = document.getElementById('btn-calc-peso-mas');
    const btnCerrarHeader = document.getElementById('btn-cerrar-modal-calc-discos');
    const btnCerrarFooter = document.getElementById('btn-cerrar-calc-discos');

    // Botones de apertura en diferentes vistas
    const btnAbrirActivo = document.getElementById('btn-abrir-calc-discos-activo');
    const btnAbrir1RM = document.getElementById('btn-abrir-calc-discos-1rm');

    if (btnAbrirActivo) {
        btnAbrirActivo.addEventListener('click', () => {
            let pesoSugerido = null;
            if (APP.sesionActiva && APP.sesionActiva.ejercicios && APP.sesionActiva.ejercicios.length > 0) {
                const primerEj = APP.sesionActiva.ejercicios[0];
                if (primerEj.series && primerEj.series.length > 0) {
                    pesoSugerido = parseFloat(primerEj.series[0].peso) || null;
                }
            }
            abrirModalCalculadoraDiscos(pesoSugerido);
        });
    }
    if (btnAbrir1RM) btnAbrir1RM.addEventListener('click', () => abrirModalCalculadoraDiscos());

    // Cierre
    if (btnCerrarHeader) btnCerrarHeader.addEventListener('click', cerrarModalCalculadoraDiscos);
    if (btnCerrarFooter) btnCerrarFooter.addEventListener('click', cerrarModalCalculadoraDiscos);

    // Cambios dinámicos en los controles
    if (inputPeso) {
        inputPeso.addEventListener('input', actualizarVistaCalculadoraDiscos);
    }
    if (selectBarra) {
        selectBarra.addEventListener('change', actualizarVistaCalculadoraDiscos);
    }
    if (selectCollarines) {
        selectCollarines.addEventListener('change', actualizarVistaCalculadoraDiscos);
    }

    if (btnMenos) {
        btnMenos.addEventListener('click', () => {
            if (inputPeso) {
                const actual = parseFloat(inputPeso.value) || 0;
                inputPeso.value = Math.max(0, actual - 2.5);
                actualizarVistaCalculadoraDiscos();
            }
        });
    }

    if (btnMas) {
        btnMas.addEventListener('click', () => {
            if (inputPeso) {
                const actual = parseFloat(inputPeso.value) || 0;
                inputPeso.value = actual + 2.5;
                actualizarVistaCalculadoraDiscos();
            }
        });
    }
}


// ============================================================
// 10. FUNCIONES AUXILIARES DE FORMATO
// ============================================================

/**
 * Formatea una fecha ISO a un formato legible en español.
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {Object} { dia, mes, diaSemana, completa }
 */
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesesLargo = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return {
        dia: fecha.getDate(),
        mes: meses[fecha.getMonth()],
        mesLargo: mesesLargo[fecha.getMonth()],
        diaSemana: dias[fecha.getDay()],
        anio: fecha.getFullYear(),
        completa: `${dias[fecha.getDay()]} ${fecha.getDate()} de ${mesesLargo[fecha.getMonth()]} ${fecha.getFullYear()}`,
        corta: `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`
    };
}

/**
 * Obtiene la fecha actual formateada.
 * @returns {string} Fecha legible
 */
function fechaHoy() {
    return formatearFecha(new Date().toISOString()).completa;
}


// ============================================================
// 11. FUNCIONES PLACEHOLDER PARA PARTES 2 Y 3
//     (Se definirán completas en las siguientes partes)
// ============================================================

// Estas funciones se invocan desde la navegación y el DOMContentLoaded.
// Se definen aquí vacías para evitar errores de referencia y se
// sobreescribirán en las Partes 2 y 3 del JS.

function renderizarRutinasEntrenar() {
    // PARTE 2: Renderiza las tarjetas de rutinas en la vista Entrenar
    const contenedor = document.getElementById('lista-rutinas-entrenar');
    const emptyState = document.getElementById('empty-entrenar');
    const rutinas = obtenerRutinas();

    if (!contenedor || !emptyState) return;

    if (rutinas.length === 0) {
        contenedor.innerHTML = '';
        emptyState.classList.remove('oculto');
        emptyState.style.display = '';
        return;
    }

    emptyState.classList.add('oculto');
    emptyState.style.display = 'none';

    contenedor.innerHTML = rutinas.map(rutina => {
        const numEjercicios = rutina.ejercicios ? rutina.ejercicios.length : 0;
        const badges = (rutina.ejercicios || []).map(ej => {
            const ejercicio = buscarEjercicioPorId(ej.ejercicioId);
            const nombre = ejercicio ? ejercicio.nombre : ej.ejercicioId;
            // Nombre corto: solo la primera parte significativa
            const nombreCorto = nombre.length > 20 ? nombre.substring(0, 20) + '…' : nombre;
            return `<span class="tarjeta-badge">${nombreCorto}</span>`;
        }).join('');

        return `
            <div class="tarjeta" data-rutina-id="${rutina.id}">
                <div class="tarjeta-header">
                    <h3 class="tarjeta-titulo">${rutina.nombre}</h3>
                </div>
                <p class="tarjeta-subtitulo">${numEjercicios} ejercicio${numEjercicios !== 1 ? 's' : ''}</p>
                <div class="tarjeta-ejercicios">${badges}</div>
                <div class="tarjeta-acciones">
                    <button class="btn btn-primary btn-empezar" data-rutina-id="${rutina.id}">
                        INICIAR PROTOCOLO
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Event listeners para los botones "Empezar"
    contenedor.querySelectorAll('.btn-empezar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rutinaId = btn.dataset.rutinaId;
            iniciarEntrenamiento(rutinaId); // Se define en PARTE 3
        });
    });
}

/**
 * Genera el nombre para una plantilla clonada con progresión inteligente de semanas o numeración de copias.
 * @param {string} nombreOriginal
 * @returns {string}
 */
function generarNombreDuplicado(nombreOriginal) {
    if (!nombreOriginal) return 'Plantilla (Copia)';

    // Patrón 1: Detectar "Semana X" / "Week X" / "Microciclo X" / "Bloque X" / "S X" / "W X"
    const regexSemana = /^(.*?\b(?:Semana|Week|Microciclo|Bloque|S|W)\s*)(\d+)(\b.*)$/i;
    const matchSemana = nombreOriginal.match(regexSemana);
    if (matchSemana) {
        const prefijo = matchSemana[1];
        const num = parseInt(matchSemana[2], 10) + 1;
        const sufijo = matchSemana[3];
        return `${prefijo}${num}${sufijo}`;
    }

    // Patrón 2: Detectar sufijo "(Copia X)"
    const regexCopiaNum = /^(.*?)\s*\(Copia\s*(\d+)\)$/i;
    const matchCopiaNum = nombreOriginal.match(regexCopiaNum);
    if (matchCopiaNum) {
        const base = matchCopiaNum[1];
        const num = parseInt(matchCopiaNum[2], 10) + 1;
        return `${base} (Copia ${num})`;
    }

    // Patrón 3: Detectar sufijo "(Copia)"
    const regexCopiaSimple = /^(.*?)\s*\(Copia\)$/i;
    const matchCopiaSimple = nombreOriginal.match(regexCopiaSimple);
    if (matchCopiaSimple) {
        return `${matchCopiaSimple[1]} (Copia 2)`;
    }

    // Por defecto: añadir " (Copia)"
    return `${nombreOriginal} (Copia)`;
}

/**
 * Clona profundamente una rutina y la persiste en localStorage.
 * @param {string} rutinaId
 */
function duplicarRutina(rutinaId) {
    const rutinas = obtenerRutinas();
    const rutinaOriginal = rutinas.find(r => r.id === rutinaId);

    if (!rutinaOriginal) {
        mostrarToast('Error al localizar la plantilla');
        return;
    }

    const nuevoNombre = generarNombreDuplicado(rutinaOriginal.nombre);
    const ejerciciosClonados = JSON.parse(JSON.stringify(rutinaOriginal.ejercicios || []));

    const nuevaRutina = {
        id: generarId(),
        nombre: nuevoNombre,
        ejercicios: ejerciciosClonados,
        fechaCreacion: new Date().toISOString()
    };

    rutinas.push(nuevaRutina);
    guardarRutinas(rutinas);

    renderizarRutinasConstructor();
    renderizarRutinasEntrenar();

    mostrarToast(`PLANTILLA CLONADA: ${nuevoNombre}`);
}

function renderizarRutinasConstructor() {
    // PARTE 2: Renderiza las tarjetas de rutinas en el Constructor
    const contenedor = document.getElementById('lista-rutinas-constructor');
    const emptyState = document.getElementById('empty-constructor');
    const rutinas = obtenerRutinas();

    if (!contenedor || !emptyState) return;

    if (rutinas.length === 0) {
        contenedor.innerHTML = '';
        emptyState.classList.remove('oculto');
        emptyState.style.display = '';
        return;
    }

    emptyState.classList.add('oculto');
    emptyState.style.display = 'none';

    contenedor.innerHTML = rutinas.map(rutina => {
        const numEjercicios = rutina.ejercicios ? rutina.ejercicios.length : 0;
        const detalles = (rutina.ejercicios || []).map(ej => {
            const ejercicio = buscarEjercicioPorId(ej.ejercicioId);
            const nombre = ejercicio ? ejercicio.nombre : ej.ejercicioId;
            const nombreCorto = nombre.length > 25 ? nombre.substring(0, 25) + '…' : nombre;
            return `<span class="tarjeta-badge">${nombreCorto}</span>`;
        }).join('');

        return `
            <div class="tarjeta" data-rutina-id="${rutina.id}">
                <div class="tarjeta-header">
                    <h3 class="tarjeta-titulo">${rutina.nombre}</h3>
                </div>
                <p class="tarjeta-subtitulo">${numEjercicios} ejercicio${numEjercicios !== 1 ? 's' : ''}</p>
                <div class="tarjeta-ejercicios">${detalles}</div>
                <div class="tarjeta-acciones">
                    <button class="btn btn-secondary btn-editar-rutina" data-rutina-id="${rutina.id}">
                        EDITAR
                    </button>
                    <button class="btn btn-secondary btn-duplicar-rutina" data-rutina-id="${rutina.id}" title="Duplicar plantilla">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        CLONAR
                    </button>
                    <button class="btn btn-danger btn-eliminar-rutina" data-rutina-id="${rutina.id}">
                        ELIMINAR
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Event listeners para editar
    contenedor.querySelectorAll('.btn-editar-rutina').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rutinaId = btn.dataset.rutinaId;
            abrirEditorRutina(rutinaId); // Se define en PARTE 2
        });
    });

    // Event listeners para duplicar
    contenedor.querySelectorAll('.btn-duplicar-rutina').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rutinaId = btn.dataset.rutinaId;
            duplicarRutina(rutinaId);
        });
    });

    // Event listeners para eliminar
    contenedor.querySelectorAll('.btn-eliminar-rutina').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rutinaId = btn.dataset.rutinaId;
            mostrarConfirmacion('¿Eliminar esta rutina?', () => {
                let rutinas = obtenerRutinas();
                rutinas = rutinas.filter(r => r.id !== rutinaId);
                guardarRutinas(rutinas);
                renderizarRutinasConstructor();
                renderizarRutinasEntrenar();
                mostrarToast('Rutina eliminada');
            });
        });
    });
}

function renderizarHistorial() {
    // PARTE 3: Renderiza el historial de sesiones completadas
    const contenedor = document.getElementById('lista-historial');
    const emptyState = document.getElementById('empty-historial');
    const historial = obtenerHistorial();

    if (!contenedor || !emptyState) return;

    if (historial.length === 0) {
        contenedor.innerHTML = '';
        emptyState.classList.remove('oculto');
        emptyState.style.display = '';
        return;
    }

    emptyState.classList.add('oculto');
    emptyState.style.display = 'none';

    // Ordenar por fecha descendente (más reciente primero)
    const historialOrdenado = [...historial].sort((a, b) => {
        return new Date(b.fecha) - new Date(a.fecha);
    });

    contenedor.innerHTML = historialOrdenado.map(sesion => {
        const fecha = formatearFecha(sesion.fecha);
        const numEjercicios = sesion.ejercicios ? sesion.ejercicios.length : 0;
        let totalSeries = 0;
        if (sesion.ejercicios) {
            sesion.ejercicios.forEach(ej => {
                if (ej.series) totalSeries += ej.series.length;
            });
        }

        return `
            <div class="historial-card" data-sesion-id="${sesion.id}">
                <div class="historial-fecha">
                    <span class="historial-fecha-dia">${fecha.dia}</span>
                    <span class="historial-fecha-mes">${fecha.mes}</span>
                </div>
                <div class="historial-info">
                    <p class="historial-nombre">${sesion.rutinaNombre || 'Entrenamiento'}</p>
                    <p class="historial-resumen">${numEjercicios} ejercicio${numEjercicios !== 1 ? 's' : ''} · ${totalSeries} series · ${sesion.volumenTotalKg || 0} kg</p>
                </div>
                <span class="historial-flecha">›</span>
            </div>
        `;
    }).join('');

    // Event listeners para ver detalle (preview de la sesión)
    contenedor.querySelectorAll('.historial-card').forEach(card => {
        card.addEventListener('click', () => {
            const sesionId = card.dataset.sesionId;
            abrirDetalleSesion(sesionId);
        });
    });
}

// Placeholder para funciones que se definirán en PARTE 2 y PARTE 3
function iniciarEntrenamiento(rutinaId) {
    console.log('iniciarEntrenamiento() se definirá en PARTE 3. rutinaId:', rutinaId);
}

function abrirEditorRutina(rutinaId) {
    console.log('abrirEditorRutina() se definirá en PARTE 2. rutinaId:', rutinaId);
}

function abrirDetalleSesion(sesionId) {
    console.log('abrirDetalleSesion() se definirá en PARTE 3. sesionId:', sesionId);
}


// ============================================================
// 12. INICIALIZACIÓN DE LA APP
// Nota: La inicialización unificada de todas las partes se ejecuta
// al final del archivo mediante initApp().
// ============================================================


// ============================================================
// PARTE 2: BUSCADOR DE EJERCICIOS, CONSTRUCTOR DE RUTINAS
//          Y GESTIÓN DE PLANTILLAS
// ============================================================

// Variables de estado local para el buscador y configuración de series
let categoriaFiltroModal = 'todos';
let busquedaFiltroModal = '';
let ejercicioSeleccionadoParaConfig = null;
let indexEjercicioEnEdicion = null; // null si es nuevo, número si se edita serie en borrador

// ------------------------------------------------------------
// A. SELECTOR Y BUSCADOR DE EJERCICIOS (MODAL)
// ------------------------------------------------------------

/**
 * Renderiza los botones (chips) de categorías en el modal de ejercicios.
 */
function renderizarFiltrosCategorias() {
    const contenedor = document.getElementById('filtros-categoria');
    if (!contenedor) return;

    // Chip 'Todos' inicial
    let html = `<button class="filtro-chip ${categoriaFiltroModal === 'todos' ? 'activo' : ''}" data-filtro="todos">Todos</button>`;

    // Chips dinámicos desde APP.catalogoCategorias
    APP.catalogoCategorias.forEach(cat => {
        const estaActivo = categoriaFiltroModal === cat.id ? 'activo' : '';
        html += `<button class="filtro-chip ${estaActivo}" data-filtro="${cat.id}">${cat.icono} ${cat.nombre}</button>`;
    });

    contenedor.innerHTML = html;

    // Event listeners para los chips
    contenedor.querySelectorAll('.filtro-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            categoriaFiltroModal = chip.dataset.filtro;
            contenedor.querySelectorAll('.filtro-chip').forEach(c => c.classList.remove('activo'));
            chip.classList.add('activo');
            renderizarCatalogoModal();
        });
    });
}

/**
 * Normaliza cadenas para búsqueda insensible a acentos y mayúsculas.
 */
function normalizarTexto(texto) {
    return (texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Renderiza la lista filtrada de ejercicios dentro del modal de selección.
 */
function renderizarCatalogoModal() {
    const contenedor = document.getElementById('lista-catalogo-ejercicios');
    if (!contenedor) return;

    const query = normalizarTexto(busquedaFiltroModal);

    // Filtrar catálogo según categoría y búsqueda
    const ejerciciosFiltrados = APP.catalogoEjercicios.filter(ej => {
        const coincideCat = (categoriaFiltroModal === 'todos') || (ej.categoria === categoriaFiltroModal);
        if (!coincideCat) return false;

        if (!query) return true;

        const nombreNorm = normalizarTexto(ej.nombre);
        const equipNorm = normalizarTexto(ej.equipamiento);
        const musculosNorm = normalizarTexto((ej.musculosPrincipales || []).join(' '));

        return nombreNorm.includes(query) || equipNorm.includes(query) || musculosNorm.includes(query);
    });

    if (ejerciciosFiltrados.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-state-mini">
                <p>No se encontraron ejercicios que coincidan con la búsqueda.</p>
            </div>
        `;
        return;
    }

    // Generar items del catálogo
    contenedor.innerHTML = ejerciciosFiltrados.map(ej => {
        const icono = obtenerIconoCategoria(ej.categoria);
        const nombreCat = obtenerNombreCategoria(ej.categoria);
        const etiquetaBasico = ej.esBasico ? ' • IPF COMP' : '';
        const etiquetaCustom = ej.esPersonalizado ? ' • PERSONALIZADO' : '';

        return `
            <div class="catalogo-item" data-id="${ej.id}">
                <div class="catalogo-item-icono">${icono}</div>
                <div class="catalogo-item-info">
                    <div class="catalogo-item-nombre">${ej.nombre}</div>
                    <div class="catalogo-item-cat">${nombreCat}${etiquetaBasico}${etiquetaCustom}</div>
                </div>
                <div class="catalogo-item-add">+</div>
            </div>
        `;
    }).join('');

    // Listener al pulsar un ejercicio del catálogo
    contenedor.querySelectorAll('.catalogo-item').forEach(item => {
        item.addEventListener('click', () => {
            const ejId = item.dataset.id;
            cerrarModalSelectorEjercicios();
            abrirModalConfigSeries(ejId);
        });
    });
}

/**
 * Abre el modal de búsqueda y selección de ejercicios.
 */
function abrirModalSelectorEjercicios() {
    const modal = document.getElementById('modal-ejercicios');
    const inputBuscar = document.getElementById('input-buscar-ejercicio');

    categoriaFiltroModal = 'todos';
    busquedaFiltroModal = '';

    if (inputBuscar) {
        inputBuscar.value = '';
    }

    renderizarFiltrosCategorias();
    renderizarCatalogoModal();

    if (modal) {
        modal.classList.add('activo');
        if (inputBuscar) {
            setTimeout(() => inputBuscar.focus(), 150);
        }
    }
}

/**
 * Cierra el modal de selección de ejercicios.
 */
function cerrarModalSelectorEjercicios() {
    const modal = document.getElementById('modal-ejercicios');
    if (modal) {
        modal.classList.remove('activo');
    }
}

// ------------------------------------------------------------
// B. CREACIÓN DE EJERCICIOS PERSONALIZADOS
// ------------------------------------------------------------

/**
 * Abre el modal para añadir un nuevo ejercicio personalizado.
 */
function abrirModalCustomEjercicio() {
    const modal = document.getElementById('modal-ejercicio-custom');
    const inputNombre = document.getElementById('input-custom-nombre');
    const selectCat = document.getElementById('select-custom-categoria');
    const inputNotas = document.getElementById('input-custom-notas');

    if (inputNombre) inputNombre.value = '';
    if (inputNotas) inputNotas.value = '';
    if (selectCat) selectCat.value = 'squat';

    if (modal) {
        modal.classList.add('activo');
        if (inputNombre) setTimeout(() => inputNombre.focus(), 150);
    }
}

/**
 * Cierra el modal de ejercicio personalizado.
 */
function cerrarModalCustomEjercicio() {
    const modal = document.getElementById('modal-ejercicio-custom');
    if (modal) {
        modal.classList.remove('activo');
    }
}

/**
 * Valida y guarda un nuevo ejercicio en localStorage y en la lista en memoria.
 */
function guardarNuevoEjercicioCustom() {
    const inputNombre = document.getElementById('input-custom-nombre');
    const selectCat = document.getElementById('select-custom-categoria');
    const inputNotas = document.getElementById('input-custom-notas');

    const nombre = inputNombre ? inputNombre.value.trim() : '';
    const categoria = selectCat ? selectCat.value : 'squat';
    const notas = inputNotas ? inputNotas.value.trim() : '';

    if (!nombre) {
        mostrarToast('NOMBRE DE EJERCICIO REQUERIDO');
        if (inputNombre) inputNombre.focus();
        return;
    }

    const nuevoEjercicio = {
        id: `custom_${generarId()}`,
        nombre: nombre,
        categoria: categoria,
        musculosPrincipales: [],
        musculosSecundarios: [],
        equipamiento: 'personalizado',
        esBasico: false,
        notas: notas,
        esPersonalizado: true
    };

    // Guardar en localStorage
    const ejerciciosCustom = obtenerEjerciciosCustom();
    ejerciciosCustom.push(nuevoEjercicio);
    guardarEjerciciosCustom(ejerciciosCustom);

    // Agregar al catálogo en memoria
    APP.catalogoEjercicios.push(nuevoEjercicio);

    mostrarToast('EJERCICIO REGISTRADO EN CATÁLOGO');
    cerrarModalCustomEjercicio();

    // Actualizar catálogo modal y pasar directo a configurar series para la rutina
    renderizarCatalogoModal();
    abrirModalConfigSeries(nuevoEjercicio.id);
}

// ------------------------------------------------------------
// C. CONFIGURADOR DE SERIES DINÁMICAS (WARM-UP / TOP SET / BACK-OFF / PLANAS)
// ------------------------------------------------------------

/**
 * Alterna el modo del modal de configuración entre "topset" y "planas".
 * @param {'topset'|'planas'} formato
 */
function cambiarFormatoSeriesModal(formato) {
    const btnTopset = document.querySelector('#selector-formato-series .btn-formato[data-formato="topset"]');
    const btnPlanas = document.querySelector('#selector-formato-series .btn-formato[data-formato="planas"]');
    const panelTopset = document.getElementById('panel-formato-topset');
    const panelPlanas = document.getElementById('panel-formato-planas');

    if (formato === 'planas') {
        if (btnTopset) btnTopset.classList.remove('activo');
        if (btnPlanas) btnPlanas.classList.add('activo');
        if (panelTopset) panelTopset.classList.add('oculto');
        if (panelPlanas) panelPlanas.classList.remove('oculto');
    } else {
        if (btnPlanas) btnPlanas.classList.remove('activo');
        if (btnTopset) btnTopset.classList.add('activo');
        if (panelPlanas) panelPlanas.classList.add('oculto');
        if (panelTopset) panelTopset.classList.remove('oculto');
    }
}

/**
 * Abre el modal para definir series, reps y RPE de un ejercicio.
 * @param {string} ejercicioId
 * @param {number|null} indexEditar - Índice en APP.editorRutina.ejercicios si se está editando
 */
function abrirModalConfigSeries(ejercicioId, indexEditar = null) {
    ejercicioSeleccionadoParaConfig = ejercicioId;
    indexEjercicioEnEdicion = indexEditar;

    const modal = document.getElementById('modal-config-series');
    const titulo = document.getElementById('titulo-config-series');
    const inputWarmup = document.getElementById('input-warmup-series');
    const inputTop = document.getElementById('input-top-series');
    const inputBackoff = document.getElementById('input-backoff-series');
    const inputRepsTop = document.getElementById('input-reps-objetivo');
    const inputRpeTop = document.getElementById('input-rpe-objetivo');
    const inputRepsBackoff = document.getElementById('input-reps-backoff');

    const inputPlanasWarmup = document.getElementById('input-planas-warmup');
    const inputPlanasSeries = document.getElementById('input-planas-series');
    const inputPlanasReps = document.getElementById('input-planas-reps');
    const inputPlanasRpe = document.getElementById('input-planas-rpe');

    const ej = buscarEjercicioPorId(ejercicioId);
    if (titulo) {
        titulo.textContent = ej ? ej.nombre : 'Configurar Series';
    }

    if (indexEditar !== null && APP.editorRutina.ejercicios[indexEditar]) {
        const item = APP.editorRutina.ejercicios[indexEditar];
        const configExistente = item.resumenConfig || {};
        const esPlanas = item.formato === 'planas' || configExistente.formato === 'planas' || (configExistente.planas !== undefined);

        if (esPlanas) {
            cambiarFormatoSeriesModal('planas');
            if (inputPlanasWarmup) inputPlanasWarmup.value = configExistente.warmup ?? 1;
            if (inputPlanasSeries) inputPlanasSeries.value = configExistente.planas ?? 3;
            if (inputPlanasReps) inputPlanasReps.value = configExistente.repsPlanas ?? 8;
            if (inputPlanasRpe) inputPlanasRpe.value = configExistente.rpePlanas ?? 8;

            if (inputWarmup) inputWarmup.value = 2;
            if (inputTop) inputTop.value = 1;
            if (inputBackoff) inputBackoff.value = 3;
            if (inputRepsTop) inputRepsTop.value = 3;
            if (inputRpeTop) inputRpeTop.value = 8;
            if (inputRepsBackoff) inputRepsBackoff.value = 5;
        } else {
            cambiarFormatoSeriesModal('topset');
            if (inputWarmup) inputWarmup.value = configExistente.warmup ?? 2;
            if (inputTop) inputTop.value = configExistente.topset ?? 1;
            if (inputBackoff) inputBackoff.value = configExistente.backoff ?? 3;
            if (inputRepsTop) inputRepsTop.value = configExistente.repsTop ?? 3;
            if (inputRpeTop) inputRpeTop.value = configExistente.rpeTop ?? 8;
            if (inputRepsBackoff) inputRepsBackoff.value = configExistente.repsBackoff ?? 5;

            if (inputPlanasWarmup) inputPlanasWarmup.value = 1;
            if (inputPlanasSeries) inputPlanasSeries.value = 3;
            if (inputPlanasReps) inputPlanasReps.value = 8;
            if (inputPlanasRpe) inputPlanasRpe.value = 8;
        }
    } else {
        // Por defecto arranca en Top Set + Back-off con valores estándar
        cambiarFormatoSeriesModal('topset');
        if (inputWarmup) inputWarmup.value = 2;
        if (inputTop) inputTop.value = 1;
        if (inputBackoff) inputBackoff.value = 3;
        if (inputRepsTop) inputRepsTop.value = 3;
        if (inputRpeTop) inputRpeTop.value = 8;
        if (inputRepsBackoff) inputRepsBackoff.value = 5;

        if (inputPlanasWarmup) inputPlanasWarmup.value = 1;
        if (inputPlanasSeries) inputPlanasSeries.value = 3;
        if (inputPlanasReps) inputPlanasReps.value = 8;
        if (inputPlanasRpe) inputPlanasRpe.value = 8;
    }

    if (modal) modal.classList.add('activo');
}

/**
 * Cierra el modal de configuración de series.
 */
function cerrarModalConfigSeries() {
    const modal = document.getElementById('modal-config-series');
    if (modal) modal.classList.remove('activo');
    ejercicioSeleccionadoParaConfig = null;
    indexEjercicioEnEdicion = null;
}

/**
 * Construye la lista de series dinámicas y la incorpora a la rutina actual.
 */
function confirmarConfigSeries() {
    if (!ejercicioSeleccionadoParaConfig) return;

    const btnPlanas = document.querySelector('#selector-formato-series .btn-formato[data-formato="planas"]');
    const esFormatoPlanas = btnPlanas && btnPlanas.classList.contains('activo');

    const seriesConstruidas = [];
    let itemEjercicio = null;

    if (esFormatoPlanas) {
        const warmupCount = Math.max(0, parseInt(document.getElementById('input-planas-warmup')?.value) || 0);
        const seriesPlanasCount = Math.max(0, parseInt(document.getElementById('input-planas-series')?.value) || 0);
        const repsPlanas = Math.max(1, parseInt(document.getElementById('input-planas-reps')?.value) || 8);
        const rpePlanas = Math.min(10, Math.max(5, parseFloat(document.getElementById('input-planas-rpe')?.value) || 8));

        if (warmupCount + seriesPlanasCount === 0) {
            mostrarToast('CONFIGURA AL MENOS 1 SERIE');
            return;
        }

        // 1. Series de aproximación (Warm-up)
        for (let i = 1; i <= warmupCount; i++) {
            seriesConstruidas.push({
                tipo: 'warmup',
                etiqueta: 'Warm-up',
                repsObjetivo: repsPlanas,
                rpeObjetivo: 6,
                pesoSugerido: 0
            });
        }

        // 2. Series efectivas planas
        for (let i = 1; i <= seriesPlanasCount; i++) {
            seriesConstruidas.push({
                tipo: 'plana',
                etiqueta: 'Plana',
                repsObjetivo: repsPlanas,
                rpeObjetivo: rpePlanas,
                pesoSugerido: 0
            });
        }

        itemEjercicio = {
            ejercicioId: ejercicioSeleccionadoParaConfig,
            formato: 'planas',
            resumenConfig: {
                formato: 'planas',
                warmup: warmupCount,
                planas: seriesPlanasCount,
                repsPlanas: repsPlanas,
                rpePlanas: rpePlanas
            },
            series: seriesConstruidas
        };
    } else {
        const warmupCount = Math.max(0, parseInt(document.getElementById('input-warmup-series')?.value) || 0);
        const topCount = Math.max(0, parseInt(document.getElementById('input-top-series')?.value) || 0);
        const backoffCount = Math.max(0, parseInt(document.getElementById('input-backoff-series')?.value) || 0);

        const repsTop = Math.max(1, parseInt(document.getElementById('input-reps-objetivo')?.value) || 1);
        const rpeTop = Math.min(10, Math.max(5, parseFloat(document.getElementById('input-rpe-objetivo')?.value) || 8));
        const repsBackoff = Math.max(1, parseInt(document.getElementById('input-reps-backoff')?.value) || 1);

        if (warmupCount + topCount + backoffCount === 0) {
            mostrarToast('CONFIGURA AL MENOS 1 SERIE');
            return;
        }

        // 1. Series de aproximación (Warm-up)
        for (let i = 1; i <= warmupCount; i++) {
            seriesConstruidas.push({
                tipo: 'warmup',
                etiqueta: 'Warm-up',
                repsObjetivo: repsTop + 2,
                rpeObjetivo: 6,
                pesoSugerido: 0
            });
        }

        // 2. Series principales / pico (Top Set)
        for (let i = 1; i <= topCount; i++) {
            seriesConstruidas.push({
                tipo: 'topset',
                etiqueta: 'Top Set',
                repsObjetivo: repsTop,
                rpeObjetivo: rpeTop,
                pesoSugerido: 0
            });
        }

        // 3. Series efectivas de bajada (Back-off Sets)
        for (let i = 1; i <= backoffCount; i++) {
            seriesConstruidas.push({
                tipo: 'backoff',
                etiqueta: 'Back-off',
                repsObjetivo: repsBackoff,
                rpeObjetivo: Math.max(5, rpeTop - 1),
                pesoSugerido: 0
            });
        }

        itemEjercicio = {
            ejercicioId: ejercicioSeleccionadoParaConfig,
            formato: 'topset',
            resumenConfig: {
                formato: 'topset',
                warmup: warmupCount,
                topset: topCount,
                backoff: backoffCount,
                repsTop: repsTop,
                rpeTop: rpeTop,
                repsBackoff: repsBackoff
            },
            series: seriesConstruidas
        };
    }

    if (indexEjercicioEnEdicion !== null && indexEjercicioEnEdicion >= 0) {
        APP.editorRutina.ejercicios[indexEjercicioEnEdicion] = itemEjercicio;
        mostrarToast('Series actualizadas');
    } else {
        APP.editorRutina.ejercicios.push(itemEjercicio);
        mostrarToast('Ejercicio añadido a la rutina');
    }

    cerrarModalConfigSeries();
    renderizarEjerciciosEditor();
}

// ------------------------------------------------------------
// D. RENDERIZADO DEL BORRADOR DE EJERCICIOS EN EL EDITOR
// ------------------------------------------------------------

/**
 * Pinta la lista de ejercicios añadidos a la rutina en edición.
 */
function renderizarEjerciciosEditor() {
    const contenedor = document.getElementById('lista-ejercicios-rutina');
    const emptyState = document.getElementById('empty-editor');
    if (!contenedor || !emptyState) return;

    if (APP.editorRutina.ejercicios.length === 0) {
        contenedor.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    contenedor.innerHTML = APP.editorRutina.ejercicios.map((item, index) => {
        const ejInfo = buscarEjercicioPorId(item.ejercicioId);
        const nombre = ejInfo ? ejInfo.nombre : 'Ejercicio';
        const cfg = item.resumenConfig || {};

        const partesResumen = [];
        if (item.formato === 'planas' || cfg.formato === 'planas' || cfg.planas !== undefined) {
            if (cfg.warmup > 0) partesResumen.push(`${cfg.warmup} Warm-up`);
            if (cfg.planas > 0) partesResumen.push(`${cfg.planas} Planas (${cfg.repsPlanas} reps @ RPE ${cfg.rpePlanas})`);
        } else {
            if (cfg.warmup > 0) partesResumen.push(`${cfg.warmup} Warm-up`);
            if (cfg.topset > 0) partesResumen.push(`${cfg.topset} Top Set (${cfg.repsTop} reps @ RPE ${cfg.rpeTop})`);
            if (cfg.backoff > 0) partesResumen.push(`${cfg.backoff} Back-off (${cfg.repsBackoff} reps)`);
        }

        return `
            <div class="ejercicio-rutina-card" data-index="${index}">
                <div class="ejercicio-rutina-info">
                    <div class="ejercicio-rutina-nombre">${index + 1}. ${nombre}</div>
                    <div class="ejercicio-rutina-detalles">
                        <span>${partesResumen.join(' · ')}</span>
                    </div>
                </div>
                <div class="ejercicio-rutina-acciones">
                    ${index > 0 ? `<button class="btn-mini btn-subir-ej" data-index="${index}" title="Subir">▲</button>` : ''}
                    ${index < APP.editorRutina.ejercicios.length - 1 ? `<button class="btn-mini btn-bajar-ej" data-index="${index}" title="Bajar">▼</button>` : ''}
                    <button class="btn-mini btn-config-ej" data-index="${index}" title="Configurar series">CFG</button>
                    <button class="btn-mini btn-eliminar-ej" data-index="${index}" title="Eliminar">DEL</button>
                </div>
            </div>
        `;
    }).join('');

    // Listeners para subir posición
    contenedor.querySelectorAll('.btn-subir-ej').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index, 10);
            if (idx > 0) {
                const temp = APP.editorRutina.ejercicios[idx];
                APP.editorRutina.ejercicios[idx] = APP.editorRutina.ejercicios[idx - 1];
                APP.editorRutina.ejercicios[idx - 1] = temp;
                renderizarEjerciciosEditor();
            }
        });
    });

    // Listeners para bajar posición
    contenedor.querySelectorAll('.btn-bajar-ej').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index, 10);
            if (idx < APP.editorRutina.ejercicios.length - 1) {
                const temp = APP.editorRutina.ejercicios[idx];
                APP.editorRutina.ejercicios[idx] = APP.editorRutina.ejercicios[idx + 1];
                APP.editorRutina.ejercicios[idx + 1] = temp;
                renderizarEjerciciosEditor();
            }
        });
    });

    // Listeners para reconfigurar series
    contenedor.querySelectorAll('.btn-config-ej').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index, 10);
            const item = APP.editorRutina.ejercicios[idx];
            if (item) {
                abrirModalConfigSeries(item.ejercicioId, idx);
            }
        });
    });

    // Listeners para eliminar ejercicio del borrador
    contenedor.querySelectorAll('.btn-eliminar-ej').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index, 10);
            APP.editorRutina.ejercicios.splice(idx, 1);
            renderizarEjerciciosEditor();
            mostrarToast('Ejercicio quitado');
        });
    });
}

// ------------------------------------------------------------
// E. GUARDADO Y GESTIÓN DE PLANTILLAS DE RUTINAS
// ------------------------------------------------------------

/**
 * Abre la pantalla del editor para crear o modificar una rutina.
 * (Sobrescribe limpiamente el placeholder de la Parte 1)
 */
abrirEditorRutina = function(rutinaId = null) {
    const inputNombre = document.getElementById('input-nombre-rutina');
    const tituloHeader = document.getElementById('titulo-editor-rutina');

    if (rutinaId) {
        // Cargar rutina existente para editar
        const rutinas = obtenerRutinas();
        const rutina = rutinas.find(r => r.id === rutinaId);

        if (!rutina) {
            mostrarToast('Error al cargar la rutina');
            return;
        }

        APP.editorRutina.id = rutina.id;
        // Clonar array de ejercicios para no mutar hasta guardar
        APP.editorRutina.ejercicios = JSON.parse(JSON.stringify(rutina.ejercicios || []));

        if (tituloHeader) tituloHeader.textContent = 'Editar Rutina';
        if (inputNombre) inputNombre.value = rutina.nombre || '';
    } else {
        // Nueva rutina en blanco
        APP.editorRutina.id = null;
        APP.editorRutina.ejercicios = [];

        if (tituloHeader) tituloHeader.textContent = 'Nueva Rutina';
        if (inputNombre) inputNombre.value = '';
    }

    renderizarEjerciciosEditor();
    navegarA('vista-editor-rutina');
};

/**
 * Valida los datos y guarda la rutina completa en localStorage.
 */
function guardarRutina() {
    const inputNombre = document.getElementById('input-nombre-rutina');
    const nombre = inputNombre ? inputNombre.value.trim() : '';

    if (!nombre) {
        mostrarToast('NOMBRE DE PLANTILLA REQUERIDO');
        if (inputNombre) inputNombre.focus();
        return;
    }

    if (APP.editorRutina.ejercicios.length === 0) {
        mostrarToast('AÑADE AL MENOS 1 EJERCICIO');
        return;
    }

    const rutinas = obtenerRutinas();

    if (APP.editorRutina.id) {
        // Actualizar rutina existente
        const index = rutinas.findIndex(r => r.id === APP.editorRutina.id);
        if (index !== -1) {
            rutinas[index].nombre = nombre;
            rutinas[index].ejercicios = APP.editorRutina.ejercicios;
            rutinas[index].ultimaActualizacion = new Date().toISOString();
        } else {
            rutinas.push({
                id: APP.editorRutina.id,
                nombre: nombre,
                ejercicios: APP.editorRutina.ejercicios,
                fechaCreacion: new Date().toISOString()
            });
        }
    } else {
        // Crear nueva rutina
        const nuevaRutina = {
            id: generarId(),
            nombre: nombre,
            ejercicios: APP.editorRutina.ejercicios,
            fechaCreacion: new Date().toISOString()
        };
        rutinas.push(nuevaRutina);
    }

    guardarRutinas(rutinas);
    mostrarToast('PLANTILLA GUARDADA');

    // Refrescar ambas listas en el DOM
    renderizarRutinasConstructor();
    renderizarRutinasEntrenar();

    // Regresar al listado de Mis Rutinas
    navegarA('vista-constructor');
}

/**
 * Gestiona la salida del editor comprobando si hay cambios pendientes.
 */
function salirDelEditorRutina() {
    const inputNombre = document.getElementById('input-nombre-rutina');
    const nombreActual = inputNombre ? inputNombre.value.trim() : '';

    const tieneCambios = nombreActual.length > 0 || APP.editorRutina.ejercicios.length > 0;

    if (tieneCambios) {
        mostrarConfirmacion('¿Descartar los cambios de esta rutina?', () => {
            navegarA('vista-constructor');
        }, 'Descartar');
    } else {
        navegarA('vista-constructor');
    }
}

// ------------------------------------------------------------
// F. INICIALIZACIÓN DE EVENTOS DEL CONSTRUCTOR (PARTE 2)
// ------------------------------------------------------------

let _constructorInicializado = false;
function inicializarConstructor() {
    if (_constructorInicializado) return;
    _constructorInicializado = true;

    // 1. Botón "Nueva" en el constructor
    const btnNuevaRutina = document.getElementById('btn-nueva-rutina');
    if (btnNuevaRutina) {
        btnNuevaRutina.addEventListener('click', () => abrirEditorRutina(null));
    }

    // 2. Botón volver en la barra superior del editor
    const btnVolver = document.getElementById('btn-volver-constructor');
    if (btnVolver) {
        btnVolver.addEventListener('click', salirDelEditorRutina);
    }

    // 3. Botón guardar rutina
    const btnGuardarRutina = document.getElementById('btn-guardar-rutina');
    if (btnGuardarRutina) {
        btnGuardarRutina.addEventListener('click', guardarRutina);
    }

    // 4. Botón "Añadir" ejercicio en el editor
    const btnAddEjercicio = document.getElementById('btn-añadir-ejercicio');
    if (btnAddEjercicio) {
        btnAddEjercicio.addEventListener('click', abrirModalSelectorEjercicios);
    }

    // 5. Controles del modal de ejercicios
    const btnCerrarModalEjercicios = document.getElementById('btn-cerrar-modal-ejercicios');
    if (btnCerrarModalEjercicios) {
        btnCerrarModalEjercicios.addEventListener('click', cerrarModalSelectorEjercicios);
    }

    const inputBuscar = document.getElementById('input-buscar-ejercicio');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            busquedaFiltroModal = e.target.value;
            renderizarCatalogoModal();
        });
    }

    // 6. Modal de ejercicio personalizado
    const btnCustomModal = document.getElementById('btn-ejercicio-personalizado');
    if (btnCustomModal) {
        btnCustomModal.addEventListener('click', () => {
            cerrarModalSelectorEjercicios();
            abrirModalCustomEjercicio();
        });
    }

    const btnCerrarCustom = document.getElementById('btn-cerrar-modal-custom');
    if (btnCerrarCustom) {
        btnCerrarCustom.addEventListener('click', cerrarModalCustomEjercicio);
    }

    const btnGuardarCustom = document.getElementById('btn-guardar-custom');
    if (btnGuardarCustom) {
        btnGuardarCustom.addEventListener('click', guardarNuevoEjercicioCustom);
    }

    // 7. Modal de configuración de series
    const btnCerrarConfig = document.getElementById('btn-cerrar-modal-config');
    if (btnCerrarConfig) {
        btnCerrarConfig.addEventListener('click', cerrarModalConfigSeries);
    }

    const btnConfirmarConfig = document.getElementById('btn-confirmar-config-series');
    if (btnConfirmarConfig) {
        btnConfirmarConfig.addEventListener('click', confirmarConfigSeries);
    }

    // 8. Switch de formato de series (Top Set vs Planas)
    const botonesFormato = document.querySelectorAll('#selector-formato-series .btn-formato');
    botonesFormato.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const formato = e.currentTarget.dataset.formato;
            if (formato) {
                cambiarFormatoSeriesModal(formato);
            }
        });
    });
}


// ============================================================
// PARTE 3: ENTRENAMIENTO ACTIVO, CRONÓMETRO DE DESCANSO FLOTANTE,
//          FINALIZACIÓN Y GESTIÓN DEL HISTORIAL
// ============================================================

// ------------------------------------------------------------
// A. CRONÓMETRO DE DESCANSO INTEGRADO (FLOTANTE)
// ------------------------------------------------------------

let audioCtxGlobal = null;

/**
 * Obtiene o crea la instancia global de AudioContext, asegurando su reanudación.
 * @returns {AudioContext|null}
 */
function obtenerAudioContext() {
    try {
        if (!audioCtxGlobal) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                audioCtxGlobal = new AudioCtx();
            }
        }
        if (audioCtxGlobal && audioCtxGlobal.state === 'suspended') {
            audioCtxGlobal.resume().catch(() => {});
        }
        return audioCtxGlobal;
    } catch (e) {
        return null;
    }
}

/**
 * Desbloquea el AudioContext en la primera interacción del usuario.
 */
function desbloquearAudioContext() {
    obtenerAudioContext();
}

/**
 * Comprueba si el sonido del cronómetro está activo según localStorage.
 * @returns {boolean}
 */
function cronometroSonidoHabilitado() {
    return localStorage.getItem(LS_KEYS.CRONO_SONIDO) !== 'false';
}

/**
 * Alterna el estado de silencio/sonido del cronómetro flotante.
 */
function alternarSonidoCronometro() {
    desbloquearAudioContext();
    const habilitado = cronometroSonidoHabilitado();
    const nuevo = !habilitado;
    try {
        localStorage.setItem(LS_KEYS.CRONO_SONIDO, nuevo ? 'true' : 'false');
    } catch (e) {}
    actualizarBotonSonidoCronometro();
    mostrarToast(nuevo ? 'SONIDO DE CRONÓMETRO ACTIVADO' : 'SONIDO DE CRONÓMETRO SILENCIADO');
}

/**
 * Actualiza los iconos SVG y atributos del botón de sonido del cronómetro.
 */
function actualizarBotonSonidoCronometro() {
    const btn = document.getElementById('btn-cronometro-sonido');
    if (!btn) return;
    const habilitado = cronometroSonidoHabilitado();
    const iconOn = btn.querySelector('.icono-sonido-on');
    const iconOff = btn.querySelector('.icono-sonido-off');
    if (iconOn && iconOff) {
        if (habilitado) {
            iconOn.classList.remove('oculto');
            iconOff.classList.add('oculto');
            btn.setAttribute('aria-label', 'Silenciar sonido del cronómetro');
            btn.title = 'Silenciar cronómetro';
        } else {
            iconOn.classList.add('oculto');
            iconOff.classList.remove('oculto');
            btn.setAttribute('aria-label', 'Activar sonido del cronómetro');
            btn.title = 'Activar sonido cronómetro';
        }
    }
}

/**
 * Emite una alerta acústica técnica de cronómetro deportivo mediante Web Audio API:
 * 3 beeps cortos (880 Hz / La5, 80ms) + 1 beep final sostenido (1046.5 Hz / Do6, 350ms).
 */
function emitirAlertaAcusticaFinDescanso() {
    if (!cronometroSonidoHabilitado()) return;

    try {
        const ctx = obtenerAudioContext();
        if (!ctx) return;

        const ahora = ctx.currentTime;

        // Secuencia de 3 beeps cortos: t0, t0 + 0.15s, t0 + 0.30s (880 Hz, duración 80ms)
        const beepsCortos = [0, 0.15, 0.30];
        beepsCortos.forEach(offset => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const tInicio = ahora + offset;
            const tFin = tInicio + 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, tInicio);

            gain.gain.setValueAtTime(0.0001, tInicio);
            gain.gain.exponentialRampToValueAtTime(0.28, tInicio + 0.01);
            gain.gain.setValueAtTime(0.28, tFin - 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, tFin);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(tInicio);
            osc.stop(tFin);
        });

        // 1 beep final sostenido: t0 + 0.45s (1046.5 Hz / Do6, duración 350ms)
        const oscFinal = ctx.createOscillator();
        const gainFinal = ctx.createGain();
        const tInicioFinal = ahora + 0.45;
        const tFinFinal = tInicioFinal + 0.35;

        oscFinal.type = 'sine';
        oscFinal.frequency.setValueAtTime(1046.5, tInicioFinal);

        gainFinal.gain.setValueAtTime(0.0001, tInicioFinal);
        gainFinal.gain.exponentialRampToValueAtTime(0.32, tInicioFinal + 0.02);
        gainFinal.gain.setValueAtTime(0.32, tFinFinal - 0.05);
        gainFinal.gain.exponentialRampToValueAtTime(0.0001, tFinFinal);

        oscFinal.connect(gainFinal);
        gainFinal.connect(ctx.destination);

        oscFinal.start(tInicioFinal);
        oscFinal.stop(tFinFinal);
    } catch (e) {
        console.warn('Audio no permitido o bloqueado por el navegador:', e);
    }
}

// Alias retrocompatible
const emitirBipFinDescanso = emitirAlertaAcusticaFinDescanso;

// ------------------------------------------------------------
// A2. SCREEN WAKE LOCK API (PANTALLA SIEMPRE ENCENDIDA)
// ------------------------------------------------------------

let wakeLockSentinel = null;

/**
 * Solicita el bloqueo de pantalla encendida (Screen Wake Lock API)
 * para evitar que el dispositivo suspenda la pantalla durante el entrenamiento activo.
 */
async function solicitarWakeLock() {
    if ('wakeLock' in navigator && (!wakeLockSentinel || wakeLockSentinel.released)) {
        try {
            wakeLockSentinel = await navigator.wakeLock.request('screen');
            wakeLockSentinel.addEventListener('release', () => {
                wakeLockSentinel = null;
            });
        } catch (e) {
            wakeLockSentinel = null;
        }
    }
}

/**
 * Libera el bloqueo de pantalla encendida cuando finaliza o se cancela la sesión.
 */
async function liberarWakeLock() {
    if (wakeLockSentinel) {
        try {
            await wakeLockSentinel.release();
        } catch (e) {
            // Manejo silencioso
        }
        wakeLockSentinel = null;
    }
}

// Reactivar automáticamente el Wake Lock al regresar si hay entrenamiento en marcha
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (APP.entrenamientoActivo && APP.entrenamientoActivo.rutinaId) {
            solicitarWakeLock();
        }
    }
});

// ------------------------------------------------------------
// A3. GESTIÓN DE MICRO-NOTAS Y ETIQUETAS TÉCNICAS POR SERIE
// ------------------------------------------------------------

/**
 * Actualiza en tiempo real los badges de resumen y el estado del botón NOTA en una tarjeta de serie.
 * @param {HTMLElement} card - Elemento .serie-card o .serie-card-edicion
 */
function actualizarBadgesResumenSerie(card) {
    if (!card) return;
    const btnToggle = card.querySelector('.btn-toggle-nota');
    const contenedorResumen = card.querySelector('.serie-badges-resumen');
    const chipsActivos = Array.from(card.querySelectorAll('.chip-tag.activo')).map(c => c.dataset.tag || c.textContent.trim());
    const inputNota = card.querySelector('.input-micro-nota');
    const textoNota = inputNota ? inputNota.value.trim() : '';

    const tieneDatos = chipsActivos.length > 0 || textoNota.length > 0;

    if (btnToggle) {
        if (tieneDatos) btnToggle.classList.add('tiene-datos');
        else btnToggle.classList.remove('tiene-datos');
    }

    if (contenedorResumen) {
        if (!tieneDatos) {
            contenedorResumen.innerHTML = '';
            contenedorResumen.classList.add('oculto');
        } else {
            let html = chipsActivos.map(tag => `<span class="badge-tag-resumen">${tag}</span>`).join('');
            if (textoNota) {
                html += `<span class="badge-nota-resumen">"${textoNota}"</span>`;
            }
            contenedorResumen.innerHTML = html;
            contenedorResumen.classList.remove('oculto');
        }
    }
}

/**
 * Formatea segundos a formato MM:SS.
 */
function formatearMinutosSegundos(totalSegundos) {
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
}

/**
 * Actualiza el texto y la barra de progreso del cronómetro en pantalla.
 */
function actualizarVistaCronometro() {
    const elTiempo = document.getElementById('cronometro-tiempo');
    const elBarra = document.getElementById('cronometro-barra-progreso');

    if (elTiempo) {
        elTiempo.textContent = formatearMinutosSegundos(APP.cronometro.segundosRestantes);
    }

    if (elBarra && APP.cronometro.segundosTotales > 0) {
        const porcentaje = Math.max(0, Math.min(100, (APP.cronometro.segundosRestantes / APP.cronometro.segundosTotales) * 100));
        elBarra.style.width = `${porcentaje}%`;
    }
}

/**
 * Ejecuta cada tick de 1 segundo del cronómetro.
 */
function tickCronometro() {
    if (APP.cronometro.pausado) return;

    APP.cronometro.segundosRestantes--;

    if (APP.cronometro.segundosRestantes <= 0) {
        APP.cronometro.segundosRestantes = 0;
        clearInterval(APP.cronometro.intervalo);
        APP.cronometro.intervalo = null;
        APP.cronometro.activo = false;

        actualizarVistaCronometro();

        // Alerta visual y auditiva
        const elFlotante = document.getElementById('cronometro-flotante');
        if (elFlotante) {
            elFlotante.classList.add('alerta');
        }

        const btnPausar = document.getElementById('btn-cronometro-pausar');
        if (btnPausar) {
            btnPausar.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        }

        // Vibración háptica en móvil (si el navegador lo permite)
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate([250, 100, 250, 100, 400]);
            } catch (e) {}
        }

        emitirAlertaAcusticaFinDescanso();
        mostrarToast('INTERVALO DE DESCANSO FINALIZADO');
    } else {
        actualizarVistaCronometro();
    }
}

/**
 * Inicia o reinicia el cronómetro de descanso flotante.
 * @param {number|null} segundos - Duración opcional en segundos
 */
function iniciarCronometro(segundos = null) {
    desbloquearAudioContext();
    if (APP.cronometro.intervalo) {
        clearInterval(APP.cronometro.intervalo);
        APP.cronometro.intervalo = null;
    }

    if (segundos && segundos > 0) {
        APP.cronometro.segundosTotales = segundos;
        APP.cronometro.segundosRestantes = segundos;
    } else if (APP.cronometro.segundosRestantes <= 0) {
        APP.cronometro.segundosRestantes = APP.cronometro.segundosTotales;
    }

    APP.cronometro.activo = true;
    APP.cronometro.pausado = false;

    const elFlotante = document.getElementById('cronometro-flotante');
    if (elFlotante) {
        elFlotante.classList.remove('oculto', 'alerta');
    }

    const btnPausar = document.getElementById('btn-cronometro-pausar');
    if (btnPausar) {
        btnPausar.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/></svg>';
        btnPausar.setAttribute('aria-label', 'Pausar cronómetro');
    }

    actualizarVistaCronometro();
    APP.cronometro.intervalo = setInterval(tickCronometro, 1000);
}

/**
 * Pausa o reanuda el cronómetro.
 */
function alternarPausaCronometro() {
    desbloquearAudioContext();
    const btnPausar = document.getElementById('btn-cronometro-pausar');
    const elFlotante = document.getElementById('cronometro-flotante');

    // Si el cronómetro no está en marcha, arrancarlo
    if (!APP.cronometro.activo) {
        if (elFlotante) elFlotante.classList.remove('alerta');
        const seg = (APP.cronometro.segundosRestantes > 0)
            ? APP.cronometro.segundosRestantes
            : APP.cronometro.segundosTotales;
        iniciarCronometro(seg);
        return;
    }

    // Si ya está activo, alternar pausa/reanudación
    APP.cronometro.pausado = !APP.cronometro.pausado;

    if (btnPausar) {
        btnPausar.innerHTML = APP.cronometro.pausado
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/></svg>';
        btnPausar.setAttribute('aria-label', APP.cronometro.pausado ? 'Reanudar cronómetro' : 'Pausar cronómetro');
    }
}

/**
 * Reinicia el cronómetro al tiempo configurado actualmente.
 */
function reiniciarCronometro() {
    desbloquearAudioContext();
    const elFlotante = document.getElementById('cronometro-flotante');
    if (elFlotante) elFlotante.classList.remove('alerta');
    if (APP.cronometro.activo) {
        iniciarCronometro(APP.cronometro.segundosTotales);
    } else {
        APP.cronometro.segundosRestantes = APP.cronometro.segundosTotales;
        actualizarVistaCronometro();
    }
}

/**
 * Cierra y detiene el cronómetro flotante.
 */
function cerrarCronometro() {
    if (APP.cronometro.intervalo) {
        clearInterval(APP.cronometro.intervalo);
        APP.cronometro.intervalo = null;
    }

    APP.cronometro.activo = false;
    APP.cronometro.pausado = false;

    const elFlotante = document.getElementById('cronometro-flotante');
    if (elFlotante) {
        elFlotante.classList.add('oculto');
        elFlotante.classList.remove('alerta');
    }

    const btnPausar = document.getElementById('btn-cronometro-pausar');
    if (btnPausar) {
        btnPausar.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        btnPausar.setAttribute('aria-label', 'Iniciar cronómetro');
    }
}

/**
 * Inicializa todos los eventos del cronómetro flotante.
 */
let _cronometroInicializado = false;
function inicializarCronometro() {
    if (_cronometroInicializado) return;
    _cronometroInicializado = true;

    const btnPausar = document.getElementById('btn-cronometro-pausar');
    if (btnPausar) btnPausar.addEventListener('click', alternarPausaCronometro);

    const btnReset = document.getElementById('btn-cronometro-reset');
    if (btnReset) btnReset.addEventListener('click', reiniciarCronometro);

    const btnCerrar = document.getElementById('btn-cronometro-cerrar');
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarCronometro);

    const btnSonido = document.getElementById('btn-cronometro-sonido');
    if (btnSonido) btnSonido.addEventListener('click', alternarSonidoCronometro);
    actualizarBotonSonidoCronometro();

    // Botones rápidos de selección de tiempo (3 min, 5 min, 8 min)
    const botonesTiempo = document.querySelectorAll('.btn-tiempo');
    botonesTiempo.forEach(btn => {
        btn.addEventListener('click', () => {
            desbloquearAudioContext();
            const seg = parseInt(btn.dataset.tiempo, 10);
            if (!isNaN(seg)) {
                APP.cronometro.segundosTotales = seg;
                botonesTiempo.forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
                iniciarCronometro(seg);
            }
        });
    });
}

// ------------------------------------------------------------
// B. INICIAR ENTRENAMIENTO ACTIVO Y CÁLCULO DE % 1RM
// ------------------------------------------------------------

/**
 * Calcula el peso estimado por defecto para una serie según el 1RM o el ejercicio.
 */
function obtenerPesoInicialSugerido(ejercicio, tipoSerie, marcas1RM) {
    const tipo1rm = obtenerTipo1RM(ejercicio.categoria);
    const rm = tipo1rm ? obtenerRMNumero(marcas1RM, tipo1rm) : 0;

    if (rm > 0) {
        if (tipoSerie === 'warmup') {
            return Math.max(20, Math.round((rm * 0.5) / 2.5) * 2.5);
        } else if (tipoSerie === 'topset') {
            return Math.max(20, Math.round((rm * 0.8) / 2.5) * 2.5);
        } else if (tipoSerie === 'plana') {
            return Math.max(20, Math.round((rm * 0.75) / 2.5) * 2.5);
        } else if (tipoSerie === 'backoff') {
            return Math.max(20, Math.round((rm * 0.7) / 2.5) * 2.5);
        }
    }

    // Si el usuario aún no tiene marcas o es un accesorio: barra olímpica estándar (20 kg)
    return 20;
}

/**
 * Actualiza la etiqueta de porcentaje de 1RM en la cabecera de un bloque de ejercicio.
 */
function actualizarPorcentajeBloque(bloqueElemento, ejercicioCategoria, marcas1RM) {
    const tipo1rm = obtenerTipo1RM(ejercicioCategoria);
    const etiquetaPct = bloqueElemento.querySelector('.ejercicio-porcentaje');
    if (!etiquetaPct || !tipo1rm) return;

    const rm = obtenerRMNumero(marcas1RM, tipo1rm);
    if (rm <= 0) {
        etiquetaPct.textContent = '--%';
        return;
    }

    // Encontrar el peso más alto entre las series del bloque (priorizando el Top Set)
    const inputsPeso = bloqueElemento.querySelectorAll('.input-peso');
    let maxPeso = 0;
    inputsPeso.forEach(input => {
        const p = parseFloat(input.value) || 0;
        if (p > maxPeso) maxPeso = p;
    });

    if (maxPeso > 0) {
        const pct = calcularPorcentaje1RM(maxPeso, rm);
        etiquetaPct.textContent = `@ ${pct}% de 1RM (${maxPeso} kg)`;
    } else {
        etiquetaPct.textContent = `@ 1RM: ${rm} kg`;
    }
}

/**
 * Arranca la pantalla de entrenamiento activo a partir de una rutina guardada.
 * (Sobrescribe limpiamente el placeholder de la Parte 1)
 */
iniciarEntrenamiento = function(rutinaId) {
    const rutinas = obtenerRutinas();
    const rutina = rutinas.find(r => r.id === rutinaId);

    if (!rutina) {
        mostrarToast('Error: No se encontró la rutina seleccionada');
        return;
    }

    if (!rutina.ejercicios || rutina.ejercicios.length === 0) {
        mostrarToast('Esta rutina no tiene ejercicios configurados');
        return;
    }

    const marcas1RM = obtenerMarcas1RM();

    // Guardar estado del entrenamiento activo
    APP.entrenamientoActivo = {
        rutinaId: rutina.id,
        rutinaNombre: rutina.nombre,
        fechaInicio: new Date().toISOString(),
        ejercicios: []
    };

    // Solicitar pantalla siempre encendida (Screen Wake Lock API)
    solicitarWakeLock();

    // Actualizar encabezados
    const elTitulo = document.getElementById('titulo-entrenamiento');
    const elFecha = document.getElementById('fecha-entrenamiento');
    if (elTitulo) elTitulo.textContent = rutina.nombre;
    if (elFecha) elFecha.textContent = fechaHoy();

    const contenedor = document.getElementById('contenido-entrenamiento');
    if (!contenedor) return;

    // Generar la hoja completa de entrenamiento
    contenedor.innerHTML = rutina.ejercicios.map((ejConfig, indexEj) => {
        const ejInfo = buscarEjercicioPorId(ejConfig.ejercicioId) || {
            nombre: ejConfig.ejercicioId,
            categoria: 'accesorio_pierna'
        };

        const tipo1rm = obtenerTipo1RM(ejInfo.categoria);
        const rmVal = tipo1rm ? obtenerRMNumero(marcas1RM, tipo1rm) : 0;
        const texto1RMInicial = rmVal > 0 ? `@ 1RM: ${rmVal} kg` : (tipo1rm ? '--%' : '');

        // Construir tarjetas para cada serie
        const seriesHtml = (ejConfig.series || []).map((serie, indexSerie) => {
            const esTopSet = serie.tipo === 'topset';
            const esWarmup = serie.tipo === 'warmup';
            const esPlana = serie.tipo === 'plana';
            const claseCard = esTopSet ? 'serie-topset' : (esWarmup ? 'serie-warmup' : (esPlana ? 'serie-plana' : 'serie-backoff'));
            const etiquetaTipo = esTopSet ? 'Top Set' : (esWarmup ? 'Warm-up' : (esPlana ? 'Plana' : 'Back-off'));

            const pesoSugerido = obtenerPesoInicialSugerido(ejInfo, serie.tipo, marcas1RM);
            const repsSugeridas = serie.repsObjetivo || (esTopSet ? 3 : (esPlana ? 8 : 5));
            const rpeSugerido = serie.rpeObjetivo || (esTopSet ? 8 : (esPlana ? 8 : 6));

            return `
                <div class="serie-card ${claseCard}" data-ej-index="${indexEj}" data-serie-index="${indexSerie}" data-tipo="${serie.tipo}">
                    <div class="serie-header">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="serie-tipo">${etiquetaTipo}</span>
                            <span class="serie-numero">Serie ${indexSerie + 1}</span>
                        </div>
                        <button type="button" class="btn-toggle-nota" aria-label="Notas y sensaciones de la serie" title="Añadir notas técnicas">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                            </svg>
                            <span>NOTA</span>
                        </button>
                    </div>
                    <div class="serie-badges-resumen oculto"></div>
                    <div class="serie-inputs">
                        <div class="campo-grupo">
                            <label>Peso (kg)</label>
                            <div class="stepper">
                                <button type="button" class="stepper-btn stepper-menos" data-step="-2.5">−</button>
                                <input type="number" class="input-peso" value="${pesoSugerido}" step="2.5" min="0" inputmode="decimal">
                                <button type="button" class="stepper-btn stepper-mas" data-step="2.5">+</button>
                            </div>
                        </div>
                        <div class="campo-grupo">
                            <label>Reps</label>
                            <div class="stepper">
                                <button type="button" class="stepper-btn stepper-menos" data-step="-1">−</button>
                                <input type="number" class="input-reps" value="${repsSugeridas}" step="1" min="1" max="50" inputmode="numeric">
                                <button type="button" class="stepper-btn stepper-mas" data-step="1">+</button>
                            </div>
                        </div>
                        <div class="campo-grupo">
                            <label>RPE</label>
                            <div class="stepper stepper-rpe">
                                <button type="button" class="stepper-btn stepper-menos" data-step="-0.5">−</button>
                                <input type="number" class="input-rpe" value="${rpeSugerido}" step="0.5" min="5" max="10" inputmode="decimal">
                                <button type="button" class="stepper-btn stepper-mas" data-step="0.5">+</button>
                            </div>
                        </div>
                    </div>
                    <div class="serie-panel-nota oculto">
                        <div class="chips-tags-tecnicos">
                            ${CHIPS_TECNICOS_DISPONIBLES.map(chip => `
                                <button type="button" class="chip-tag" data-tag="${chip}">${chip}</button>
                            `).join('')}
                        </div>
                        <div class="campo-micro-nota">
                            <input type="text" class="input-micro-nota" maxlength="60" placeholder="Sensaciones técnicas (máx. 60 caracteres)...">
                        </div>
                    </div>
                    <button type="button" class="btn-check" aria-label="Completar serie"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> COMPLETAR</button>
                </div>
            `;
        }).join('');

        return `
            <div class="bloque-ejercicio" data-ej-id="${ejInfo.id}" data-categoria="${ejInfo.categoria}">
                <div class="bloque-ejercicio-header">
                    <h2 class="ejercicio-nombre">${indexEj + 1}. ${ejInfo.nombre}</h2>
                    <span class="ejercicio-porcentaje">${texto1RMInicial}</span>
                </div>
                <div class="series-lista">
                    ${seriesHtml}
                </div>
            </div>
        `;
    }).join('');

    // Calcular porcentajes iniciales de los bloques
    contenedor.querySelectorAll('.bloque-ejercicio').forEach(bloque => {
        const cat = bloque.dataset.categoria;
        actualizarPorcentajeBloque(bloque, cat, marcas1RM);
    });

    navegarA('vista-entrenamiento');
    mostrarToast('SESIÓN INICIADA');
};

// ------------------------------------------------------------
// C. DELEGACIÓN DE EVENTOS EN EL ENTRENAMIENTO ACTIVO
// ------------------------------------------------------------

let _workoutEventsInicializados = false;
function inicializarEventosEntrenamientoActivo() {
    if (_workoutEventsInicializados) return;
    _workoutEventsInicializados = true;

    const contenedor = document.getElementById('contenido-entrenamiento');
    if (!contenedor) return;

    // 1. Escuchar cambios de peso para actualizar el % 1RM en vivo y notas
    contenedor.addEventListener('input', (e) => {
        if (e.target.classList.contains('input-peso')) {
            const bloque = e.target.closest('.bloque-ejercicio');
            if (bloque) {
                const cat = bloque.dataset.categoria;
                const marcas = obtenerMarcas1RM();
                actualizarPorcentajeBloque(bloque, cat, marcas);
            }
        } else if (e.target.classList.contains('input-micro-nota')) {
            const card = e.target.closest('.serie-card');
            if (card) {
                actualizarBadgesResumenSerie(card);
            }
        }
    });

    // 2. Click en botón "Check", panel de notas o chips técnicos
    contenedor.addEventListener('click', (e) => {
        // Toggle de panel de micro-notas
        const btnToggleNota = e.target.closest('.btn-toggle-nota');
        if (btnToggleNota) {
            const card = btnToggleNota.closest('.serie-card');
            if (card) {
                const panel = card.querySelector('.serie-panel-nota');
                if (panel) {
                    panel.classList.toggle('oculto');
                    btnToggleNota.classList.toggle('activo', !panel.classList.contains('oculto'));
                    if (!panel.classList.contains('oculto')) {
                        const inputNota = panel.querySelector('.input-micro-nota');
                        if (inputNota) inputNota.focus();
                    }
                }
            }
            return;
        }

        // Selección de chips de etiquetas técnicas
        const btnChip = e.target.closest('.chip-tag');
        if (btnChip) {
            const card = btnChip.closest('.serie-card');
            if (card) {
                btnChip.classList.toggle('activo');
                actualizarBadgesResumenSerie(card);
            }
            return;
        }

        const btnCheck = e.target.closest('.btn-check');
        if (!btnCheck) return;

        const card = btnCheck.closest('.serie-card');
        if (!card) return;

        const estaCompletada = card.classList.contains('completada');

        if (!estaCompletada) {
            // Marcar completada
            card.classList.add('completada');
            btnCheck.classList.add('checked');
            btnCheck.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> COMPLETADA';

            // Comprobar si todas las series del entrenamiento están completadas
            const todasLasSeries = contenedor.querySelectorAll('.serie-card');
            const completadas = contenedor.querySelectorAll('.serie-card.completada');

            if (todasLasSeries.length === completadas.length) {
                mostrarToast('TODAS LAS SERIES COMPLETADAS');
            } else {
                mostrarToast('SERIE REGISTRADA');
            }
        } else {
            // Desmarcar si el usuario pulsó por error
            card.classList.remove('completada');
            btnCheck.classList.remove('checked');
            btnCheck.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> COMPLETAR';
        }
    });

    // 3. Botón "Volver" en la cabecera del entrenamiento activo
    const btnVolver = document.getElementById('btn-volver-entrenar');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            mostrarConfirmacion('¿Salir del entrenamiento? Los datos de la sesión actual no se guardarán.', () => {
                liberarWakeLock();
                APP.entrenamientoActivo = {
                    rutinaId: null,
                    rutinaNombre: '',
                    fechaInicio: null,
                    ejercicios: []
                };
                cerrarCronometro();
                navegarA('vista-entrenar');
            }, 'Salir');
        });
    }

    // 4. Botón "Finalizar" entrenamiento
    const btnFinalizar = document.getElementById('btn-finalizar-entrenamiento');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', finalizarEntrenamiento);
    }

    // 5. Botón para abrir / cerrar cronómetro desde la cabecera
    const btnToggleCrono = document.getElementById('btn-toggle-crono');
    if (btnToggleCrono) {
        btnToggleCrono.addEventListener('click', () => {
            desbloquearAudioContext();
            const elFlotante = document.getElementById('cronometro-flotante');
            if (!elFlotante) return;

            const estaOculto = elFlotante.classList.contains('oculto');
            if (estaOculto) {
                if (APP.cronometro.segundosRestantes === 0) {
                    APP.cronometro.segundosRestantes = APP.cronometro.segundosTotales;
                }
                if (!APP.cronometro.activo) {
                    const btnPausar = document.getElementById('btn-cronometro-pausar');
                    if (btnPausar) {
                        btnPausar.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                        btnPausar.setAttribute('aria-label', 'Iniciar cronómetro');
                    }
                }
                actualizarVistaCronometro();
                elFlotante.classList.remove('oculto');
            } else {
                elFlotante.classList.add('oculto');
            }
        });
    }
}

// ------------------------------------------------------------
// D. FINALIZACIÓN DE SESIÓN Y PERSISTENCIA EN HISTORIAL
// ------------------------------------------------------------

/**
 * Recopila todos los datos de la sesión activa, los guarda en el historial y redirige.
 */
function finalizarEntrenamiento() {
    const contenedor = document.getElementById('contenido-entrenamiento');
    if (!contenedor) return;

    const bloques = contenedor.querySelectorAll('.bloque-ejercicio');
    const ejerciciosResultado = [];
    let totalSeriesCompletadas = 0;
    let volumenTotalKg = 0;

    bloques.forEach(bloque => {
        const ejId = bloque.dataset.ejId;
        const ejInfo = buscarEjercicioPorId(ejId);
        const seriesCards = bloque.querySelectorAll('.serie-card');
        const seriesData = [];

        seriesCards.forEach(card => {
            const inputPeso = card.querySelector('.input-peso');
            const inputReps = card.querySelector('.input-reps');
            const inputRpe = card.querySelector('.input-rpe');

            const peso = parseFloat(inputPeso?.value) || 0;
            const reps = parseInt(inputReps?.value, 10) || 0;
            const rpe = parseFloat(inputRpe?.value) || 0;
            const completada = card.classList.contains('completada');
            const tipo = card.dataset.tipo || 'warmup';

            const tags = Array.from(card.querySelectorAll('.chip-tag.activo')).map(c => c.dataset.tag || c.textContent.trim());
            const inputNota = card.querySelector('.input-micro-nota');
            const nota = inputNota ? inputNota.value.trim() : '';

            if (completada) {
                totalSeriesCompletadas++;
                volumenTotalKg += (peso * reps);
            }

            seriesData.push({
                tipo: tipo,
                peso: peso,
                reps: reps,
                rpe: rpe,
                completada: completada,
                tags: tags,
                nota: nota
            });
        });

        ejerciciosResultado.push({
            ejercicioId: ejId,
            nombre: ejInfo ? ejInfo.nombre : ejId,
            categoria: ejInfo ? ejInfo.categoria : 'accesorio_pierna',
            series: seriesData
        });
    });

    if (totalSeriesCompletadas === 0) {
        mostrarConfirmacion('No has marcado ninguna serie como completada. ¿Finalizar y guardar de todos modos?', () => {
            guardarSesionEnHistorial(ejerciciosResultado, 0, 0);
        }, 'Finalizar', 'btn-primary');
        return;
    }

    mostrarConfirmacion('¿Deseas finalizar el entrenamiento y guardar la sesión?', () => {
        guardarSesionEnHistorial(ejerciciosResultado, totalSeriesCompletadas, volumenTotalKg);
    }, 'Finalizar', 'btn-primary');
}

/**
 * Guarda el objeto de sesión formateado en localStorage y navega al historial.
 */
function guardarSesionEnHistorial(ejercicios, seriesCompletadas, volumenKg) {
    const ahora = new Date();
    const fechaInicio = APP.entrenamientoActivo.fechaInicio ? new Date(APP.entrenamientoActivo.fechaInicio) : ahora;
    const duracionMinutos = Math.max(1, Math.round((ahora - fechaInicio) / 60000));

    const nuevaSesion = {
        id: generarId(),
        rutinaId: APP.entrenamientoActivo.rutinaId,
        rutinaNombre: APP.entrenamientoActivo.rutinaNombre || 'Entrenamiento Libre',
        fecha: ahora.toISOString(),
        duracionMinutos: duracionMinutos,
        totalSeriesCompletadas: seriesCompletadas,
        volumenTotalKg: Math.round(volumenKg * 10) / 10,
        ejercicios: ejercicios
    };

    const historial = obtenerHistorial();
    historial.unshift(nuevaSesion); // Sesión más reciente al principio
    guardarHistorial(historial);

    // Liberar Screen Wake Lock y resetear estado del entrenamiento activo
    liberarWakeLock();
    APP.entrenamientoActivo = {
        rutinaId: null,
        rutinaNombre: '',
        fechaInicio: null,
        ejercicios: []
    };

    // Calcular y actualizar marcas 1RM automáticamente a partir de la sesión
    const nuevosRecords = calcularYActualizar1RM(nuevaSesion);

    cerrarCronometro();

    if (nuevosRecords && nuevosRecords.length > 0) {
        mostrarToast(`NUEVO RÉCORD EN ${nuevosRecords.join(' · ')}`);
    } else {
        mostrarToast(`SESIÓN FINALIZADA · VOLUMEN: ${nuevaSesion.volumenTotalKg} KG`);
    }

    // Actualizar vistas
    renderizarHistorial();
    renderizar1RM();
    actualizarTabla1RM();

    // Activar pestaña Historial dentro de la vista Historial
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => {
        if (t.dataset.tab === 'tab-historial') t.classList.add('activo');
        else t.classList.remove('activo');
    });
    const contHistorial = document.getElementById('tab-historial');
    const cont1rm = document.getElementById('tab-1rm');
    if (contHistorial) contHistorial.classList.add('activo');
    if (cont1rm) cont1rm.classList.remove('activo');

    navegarA('vista-historial');
}

// ------------------------------------------------------------
// E. MODAL DE DETALLE DE SESIÓN Y ELIMINACIÓN DE HISTORIAL
// ------------------------------------------------------------

/**
 * Abre el modal con el detalle completo de un entrenamiento realizado.
 * (Sobrescribe limpiamente el placeholder de la Parte 1)
 */
abrirDetalleSesion = function(sesionId) {
    const historial = obtenerHistorial();
    const sesion = historial.find(s => s.id === sesionId);
    if (!sesion) {
        mostrarToast('Error al abrir la sesión');
        return;
    }

    APP.sesionSeleccionadaId = sesionId;

    const modal = document.getElementById('modal-detalle-sesion');
    const titulo = document.getElementById('titulo-detalle-sesion');
    const contenedor = document.getElementById('contenido-detalle-sesion');

    const f = formatearFecha(sesion.fecha);

    if (titulo) {
        titulo.textContent = sesion.rutinaNombre || 'Detalle de Sesión';
    }

    if (contenedor) {
        let ejerciciosHtml = '';

        (sesion.ejercicios || []).forEach(ej => {
            const seriesHtml = (ej.series || []).map((serie, idx) => {
                const tipoClase = serie.tipo === 'topset' ? 'serie-topset' : (serie.tipo === 'warmup' ? 'serie-warmup' : (serie.tipo === 'plana' ? 'serie-plana' : 'serie-backoff'));
                const tipoTexto = serie.tipo === 'topset' ? 'Top Set' : (serie.tipo === 'warmup' ? 'Warm-up' : (serie.tipo === 'plana' ? 'Plana' : 'Back-off'));
                const estadoIcono = serie.completada ? 'OK' : '--';
                const estadoColor = serie.completada ? 'var(--verde)' : 'var(--gris-medio)';

                const tags = Array.isArray(serie.tags) ? serie.tags : [];
                const tieneNota = Boolean(serie.nota && serie.nota.trim());
                const tieneMeta = tags.length > 0 || tieneNota;

                const metaHtml = tieneMeta ? `
                    <div class="detalle-serie-meta">
                        ${tags.map(t => `<span class="badge-micro-tag">${t}</span>`).join('')}
                        ${tieneNota ? `<span class="detalle-serie-nota">"${serie.nota.trim()}"</span>` : ''}
                    </div>
                ` : '';

                return `
                    <div class="detalle-serie">
                        <span class="tarjeta-badge ${tipoClase} detalle-serie-tipo">${tipoTexto}</span>
                        <div class="detalle-serie-datos">
                            <span class="detalle-serie-valor"><strong>${serie.peso}</strong> <span>kg</span></span>
                            <span class="detalle-serie-valor"><strong>${serie.reps}</strong> <span>reps</span></span>
                            <span class="detalle-serie-valor"><strong>@${serie.rpe}</strong> <span>RPE</span></span>
                        </div>
                        <span style="color: ${estadoColor}; font-weight: bold; font-size: 1.1rem;">${estadoIcono}</span>
                        ${metaHtml}
                    </div>
                `;
            }).join('');

            ejerciciosHtml += `
                <div class="detalle-ejercicio">
                    <h3 class="detalle-ejercicio-nombre">${ej.nombre}</h3>
                    <div class="detalle-ejercicio-series">
                        ${seriesHtml}
                    </div>
                </div>
            `;
        });

        contenedor.innerHTML = `
            <div style="background-color: var(--superficie); border-radius: var(--radio-md); padding: var(--espacio-md); margin-bottom: var(--espacio-lg); border: 1px solid var(--borde);">
                <p style="font-size: 0.85rem; color: var(--gris-claro); margin-bottom: 4px;">FECHA: ${f.completa.toUpperCase()}</p>
                <p style="font-size: 0.85rem; color: var(--blanco);">DURACIÓN: <strong>${sesion.duracionMinutos || 0} min</strong> · Series: <strong>${sesion.totalSeriesCompletadas || 0}</strong> · Volumen: <strong>${sesion.volumenTotalKg || 0} kg</strong></p>
            </div>
            ${ejerciciosHtml}
        `;
    }

    if (modal) {
        modal.classList.add('activo');
    }
};

/**
 * Inicializa los eventos del modal de detalle de sesión.
 */
let _detalleSesionInicializado = false;
function inicializarModalDetalleSesion() {
    if (_detalleSesionInicializado) return;
    _detalleSesionInicializado = true;

    const modal = document.getElementById('modal-detalle-sesion');
    const btnCerrar = document.getElementById('btn-cerrar-modal-detalle');
    const btnEditarModal = document.getElementById('btn-editar-sesion-modal');
    const btnEliminar = document.getElementById('btn-eliminar-sesion');

    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            if (modal) modal.classList.remove('activo');
            APP.sesionSeleccionadaId = null;
        });
    }

    if (btnEditarModal) {
        btnEditarModal.addEventListener('click', () => {
            if (!APP.sesionSeleccionadaId) return;
            const sesionId = APP.sesionSeleccionadaId;
            if (modal) modal.classList.remove('activo');
            APP.sesionSeleccionadaId = null;
            abrirEditorSesion(sesionId);
        });
    }

    if (btnEliminar) {
        btnEliminar.addEventListener('click', () => {
            if (!APP.sesionSeleccionadaId) return;

            mostrarConfirmacion('¿Seguro que deseas eliminar esta sesión del historial?', () => {
                let historial = obtenerHistorial();
                historial = historial.filter(s => s.id !== APP.sesionSeleccionadaId);
                guardarHistorial(historial);

                // Recalcular 1RM tras eliminar la sesión
                recalcularTodosLos1RM();

                if (modal) modal.classList.remove('activo');
                APP.sesionSeleccionadaId = null;

                renderizarHistorial();
                mostrarToast('Sesión eliminada del historial');
            }, 'Eliminar');
        });
    }
}

// ------------------------------------------------------------
// G. MÓDULO DE EDICIÓN DE SESIÓN DEL HISTORIAL
// ------------------------------------------------------------

/**
 * Asigna automáticamente los tipos de serie de un ejercicio según su formato
 * (TOP SET / PLANAS) y si cada serie está marcada como calentamiento (Warm-up).
 * @param {Object} ej - Objeto de ejercicio con array de series y formato
 */
function actualizarTiposSeriesEjercicio(ej) {
    if (!ej || !ej.series) return;
    const formato = ej.formato || 'planas';
    let primeraEfectivaEncontrada = false;

    ej.series.forEach(serie => {
        if (serie.esWarmup) {
            serie.tipo = 'warmup';
        } else {
            if (formato === 'topset') {
                if (!primeraEfectivaEncontrada) {
                    serie.tipo = 'topset';
                    primeraEfectivaEncontrada = true;
                } else {
                    serie.tipo = 'backoff';
                }
            } else {
                serie.tipo = 'plana';
            }
        }
    });
}

/**
 * Abre el modal de edición cargando todos los ejercicios y series de la sesión.
 * @param {string} sesionId - ID de la sesión a editar
 */
function abrirEditorSesion(sesionId) {
    const historial = obtenerHistorial();
    const sesion = historial.find(s => s.id === sesionId);

    if (!sesion) {
        mostrarToast('Error: no se encontró la sesión');
        return;
    }

    // Copia profunda para editar sin alterar hasta pulsar Guardar
    APP.sesionEnEdicion = JSON.parse(JSON.stringify(sesion));

    // Inicializar formato y estado de calentamiento de cada ejercicio
    (APP.sesionEnEdicion.ejercicios || []).forEach(ej => {
        const tieneTopSetOBackoff = (ej.series || []).some(s => s.tipo === 'topset' || s.tipo === 'backoff');
        ej.formato = tieneTopSetOBackoff ? 'topset' : 'planas';

        (ej.series || []).forEach(serie => {
            serie.esWarmup = (serie.tipo === 'warmup');
        });

        actualizarTiposSeriesEjercicio(ej);
    });

    const modal = document.getElementById('modal-editar-sesion');
    const titulo = document.getElementById('titulo-editar-sesion');
    const subtitulo = document.getElementById('subtitulo-editar-sesion');

    if (titulo) {
        titulo.textContent = APP.sesionEnEdicion.rutinaNombre || 'EDITAR SESIÓN';
    }

    if (subtitulo) {
        const f = formatearFecha(APP.sesionEnEdicion.fecha);
        subtitulo.textContent = `${f.completa.toUpperCase()} · ${APP.sesionEnEdicion.duracionMinutos || 0} MIN`;
    }

    renderizarCuerpoEditorSesion();

    if (modal) {
        modal.classList.add('activo');
    }
}

/**
 * Renderiza los bloques de ejercicios y series editables dentro del modal.
 */
function renderizarCuerpoEditorSesion() {
    const contenedor = document.getElementById('contenido-editar-sesion');
    if (!contenedor || !APP.sesionEnEdicion) return;

    const scrollActual = contenedor.scrollTop;

    if (!APP.sesionEnEdicion.ejercicios || APP.sesionEnEdicion.ejercicios.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-state-mini">
                <p>No hay ejercicios en esta sesión.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = APP.sesionEnEdicion.ejercicios.map((ej, ejIdx) => {
        const cat = ej.categoria || '';
        const badgeCat = cat.includes('squat') ? 'sq' : (cat.includes('bench') ? 'bp' : (cat.includes('deadlift') ? 'dl' : 'tot'));
        const badgeTexto = cat ? cat.replace('accesorio_', '').toUpperCase() : 'EJ';
        const formatoActual = ej.formato || 'planas';

        const seriesHtml = (ej.series || []).map((serie, serieIdx) => {
            const esTopSet = serie.tipo === 'topset';
            const esWarmup = serie.tipo === 'warmup';
            const esPlana = serie.tipo === 'plana';
            const claseCard = esTopSet ? 'serie-topset' : (esWarmup ? 'serie-warmup' : (esPlana ? 'serie-plana' : 'serie-backoff'));
            const etiquetaBadge = esTopSet ? 'TOP SET' : (esWarmup ? 'WARM-UP' : (esPlana ? 'PLANA' : 'BACK-OFF'));

            const pesoVal = serie.peso !== undefined ? serie.peso : 20;
            const repsVal = serie.reps !== undefined ? serie.reps : 5;
            const rpeVal = serie.rpe !== undefined ? serie.rpe : 8;
            const completada = serie.completada !== false;

            const tagsActuales = Array.isArray(serie.tags) ? serie.tags : [];
            const notaActual = (typeof serie.nota === 'string') ? serie.nota.trim() : '';
            const tieneDatosNota = tagsActuales.length > 0 || notaActual.length > 0;
            const notaEscapada = notaActual.replace(/"/g, '&quot;');

            return `
                <div class="serie-card serie-card-edicion ${claseCard}" data-ej-idx="${ejIdx}" data-serie-idx="${serieIdx}">
                    <div class="serie-header-edicion">
                        <div class="serie-info-tipo">
                            <span class="serie-numero">Serie ${serieIdx + 1}</span>
                            <span class="serie-tipo">${etiquetaBadge}</span>
                        </div>
                        <div class="serie-acciones-header">
                            <button type="button" class="btn-toggle-nota ${tieneDatosNota ? 'tiene-datos' : ''}" data-ej-idx="${ejIdx}" data-serie-idx="${serieIdx}" aria-label="Notas y sensaciones técnicas" title="Añadir notas técnicas">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                </svg>
                                <span>NOTA</span>
                            </button>
                            <label class="switch-calentamiento" title="Marcar como serie de calentamiento">
                                <input type="checkbox" class="check-warmup-serie" data-ej-idx="${ejIdx}" data-serie-idx="${serieIdx}" ${serie.esWarmup ? 'checked' : ''}>
                                <span class="switch-slider"></span>
                                <span class="switch-texto">WARM-UP</span>
                            </label>
                            <button type="button" class="btn-eliminar-serie-edicion" data-ej-idx="${ejIdx}" data-serie-idx="${serieIdx}" aria-label="Eliminar serie" title="Eliminar serie">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="serie-badges-resumen ${tieneDatosNota ? '' : 'oculto'}">
                        ${tagsActuales.map(t => `<span class="badge-tag-resumen">${t}</span>`).join('')}
                        ${notaActual ? `<span class="badge-nota-resumen">"${notaActual}"</span>` : ''}
                    </div>
                    <div class="serie-inputs">
                        <div class="campo-grupo">
                            <label>Peso (kg)</label>
                            <div class="stepper">
                                <button type="button" class="stepper-btn stepper-menos" data-step="-2.5">−</button>
                                <input type="number" class="input-peso-edicion" value="${pesoVal}" step="2.5" min="0" inputmode="decimal">
                                <button type="button" class="stepper-btn stepper-mas" data-step="2.5">+</button>
                            </div>
                        </div>
                        <div class="campo-grupo">
                            <label>Reps</label>
                            <div class="stepper">
                                <button type="button" class="stepper-btn stepper-menos" data-step="-1">−</button>
                                <input type="number" class="input-reps-edicion" value="${repsVal}" step="1" min="1" max="50" inputmode="numeric">
                                <button type="button" class="stepper-btn stepper-mas" data-step="1">+</button>
                            </div>
                        </div>
                        <div class="campo-grupo">
                            <label>RPE</label>
                            <div class="stepper stepper-rpe">
                                <button type="button" class="stepper-btn stepper-menos" data-step="-0.5">−</button>
                                <input type="number" class="input-rpe-edicion" value="${rpeVal}" step="0.5" min="5" max="10" inputmode="decimal">
                                <button type="button" class="stepper-btn stepper-mas" data-step="0.5">+</button>
                            </div>
                        </div>
                    </div>
                    <div class="serie-panel-nota oculto">
                        <div class="chips-tags-tecnicos">
                            ${CHIPS_TECNICOS_DISPONIBLES.map(chip => {
                                const activo = tagsActuales.includes(chip);
                                return `<button type="button" class="chip-tag ${activo ? 'activo' : ''}" data-tag="${chip}">${chip}</button>`;
                            }).join('')}
                        </div>
                        <div class="campo-micro-nota">
                            <input type="text" class="input-micro-nota" maxlength="60" value="${notaEscapada}" placeholder="Sensaciones técnicas (máx. 60 caracteres)...">
                        </div>
                    </div>
                    <button type="button" class="btn-check btn-check-edicion ${completada ? 'checked' : ''}" data-ej-idx="${ejIdx}" data-serie-idx="${serieIdx}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>${completada ? 'SERIE REALIZADA' : 'NO REALIZADA'}</span>
                    </button>
                </div>
            `;
        }).join('');

        return `
            <div class="bloque-ejercicio-edicion" data-ej-idx="${ejIdx}">
                <div class="ejercicio-header-edicion">
                    <h3 class="ejercicio-nombre-edicion">${ejIdx + 1}. ${ej.nombre}</h3>
                    <span class="badge-cat ${badgeCat}">${badgeTexto}</span>
                </div>
                <div class="ejercicio-controles-edicion">
                    <div class="switch-formato-ejercicio" data-ej-idx="${ejIdx}">
                        <button type="button" class="btn-formato ${formatoActual === 'topset' ? 'activo' : ''}" data-ej-idx="${ejIdx}" data-formato="topset">TOP SET</button>
                        <button type="button" class="btn-formato ${formatoActual === 'planas' ? 'activo' : ''}" data-ej-idx="${ejIdx}" data-formato="planas">PLANAS</button>
                    </div>
                    <button type="button" class="btn-nueva-serie-edicion" data-ej-idx="${ejIdx}">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span>AÑADIR SERIE</span>
                    </button>
                </div>
                <div class="series-lista">
                    ${seriesHtml || '<div class="empty-state-mini"><p>Sin series en este ejercicio</p></div>'}
                </div>
            </div>
        `;
    }).join('');

    contenedor.scrollTop = scrollActual;
}

/**
 * Lee los datos actuales de los inputs del DOM y los sincroniza en APP.sesionEnEdicion.
 */
function sincronizarDatosEditorSesionDesdeDOM() {
    const contenedor = document.getElementById('contenido-editar-sesion');
    if (!contenedor || !APP.sesionEnEdicion) return;

    const bloques = contenedor.querySelectorAll('.bloque-ejercicio-edicion');
    bloques.forEach(bloque => {
        const ejIdx = parseInt(bloque.dataset.ejIdx, 10);
        if (isNaN(ejIdx) || !APP.sesionEnEdicion.ejercicios[ejIdx]) return;

        const ej = APP.sesionEnEdicion.ejercicios[ejIdx];
        const seriesCards = bloque.querySelectorAll('.serie-card-edicion');
        const seriesData = [];

        seriesCards.forEach(card => {
            const inputPeso = card.querySelector('.input-peso-edicion');
            const inputReps = card.querySelector('.input-reps-edicion');
            const inputRpe = card.querySelector('.input-rpe-edicion');
            const checkWarmup = card.querySelector('.check-warmup-serie');
            const btnCheck = card.querySelector('.btn-check-edicion');

            const peso = parseFloat(inputPeso?.value) || 0;
            const reps = parseInt(inputReps?.value, 10) || 0;
            const rpe = parseFloat(inputRpe?.value) || 8;
            const esWarmup = checkWarmup ? checkWarmup.checked : false;
            const completada = btnCheck ? btnCheck.classList.contains('checked') : true;

            const tags = Array.from(card.querySelectorAll('.chip-tag.activo')).map(c => c.dataset.tag || c.textContent.trim());
            const inputNota = card.querySelector('.input-micro-nota');
            const nota = inputNota ? inputNota.value.trim() : '';

            seriesData.push({
                esWarmup: esWarmup,
                tipo: esWarmup ? 'warmup' : 'plana',
                peso: peso,
                reps: reps,
                rpe: rpe,
                completada: completada,
                tags: tags,
                nota: nota
            });
        });

        ej.series = seriesData;
        actualizarTiposSeriesEjercicio(ej);
    });
}

/**
 * Guarda los cambios efectuados en la sesión en localStorage y recalcula todo el 1RM.
 */
function guardarEdicionSesion() {
    if (!APP.sesionEnEdicion || !APP.sesionEnEdicion.id) return;

    sincronizarDatosEditorSesionDesdeDOM();

    let totalSeries = 0;
    let volumenKg = 0;

    (APP.sesionEnEdicion.ejercicios || []).forEach(ej => {
        (ej.series || []).forEach(s => {
            if (s.completada) {
                totalSeries++;
                volumenKg += ((parseFloat(s.peso) || 0) * (parseInt(s.reps, 10) || 0));
            }
        });
    });

    APP.sesionEnEdicion.totalSeriesCompletadas = totalSeries;
    APP.sesionEnEdicion.volumenTotalKg = Math.round(volumenKg * 10) / 10;

    let historial = obtenerHistorial();
    const idx = historial.findIndex(s => s.id === APP.sesionEnEdicion.id);

    if (idx !== -1) {
        historial[idx] = APP.sesionEnEdicion;
        guardarHistorial(historial);
    } else {
        mostrarToast('Error al actualizar la sesión');
        return;
    }

    // ¡CRÍTICO! Recalcular todos los 1RM y PRs desde cero
    recalcularTodosLos1RM();

    // Cerrar modales
    const modalEditar = document.getElementById('modal-editar-sesion');
    if (modalEditar) modalEditar.classList.remove('activo');

    const modalDetalle = document.getElementById('modal-detalle-sesion');
    if (modalDetalle) modalDetalle.classList.remove('activo');

    APP.sesionEnEdicion = null;
    APP.sesionSeleccionadaId = null;

    // Refrescar vistas inmediatamente
    renderizarHistorial();
    renderizar1RM();
    actualizarTabla1RM();

    mostrarToast('SESIÓN ACTUALIZADA Y 1RM RECÁLCULADO');
}

/**
 * Cierra el modal de edición de sesión descartando cambios temporales.
 */
function cerrarEditorSesion() {
    const modal = document.getElementById('modal-editar-sesion');
    if (modal) modal.classList.remove('activo');
    APP.sesionEnEdicion = null;
}

/**
 * Inicializa los event listeners del modal de edición de sesión.
 */
let _editorSesionInicializado = false;
function inicializarModalEditarSesion() {
    if (_editorSesionInicializado) return;
    _editorSesionInicializado = true;

    const modal = document.getElementById('modal-editar-sesion');
    const btnCerrar = document.getElementById('btn-cerrar-modal-editar-sesion');
    const btnCancelar = document.getElementById('btn-cancelar-editar-sesion');
    const btnGuardar = document.getElementById('btn-guardar-editar-sesion');
    const contenedor = document.getElementById('contenido-editar-sesion');

    if (btnCerrar) btnCerrar.addEventListener('click', cerrarEditorSesion);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarEditorSesion);
    if (btnGuardar) btnGuardar.addEventListener('click', guardarEdicionSesion);

    if (contenedor) {
        // Escucha cambios en inputs de texto de micro-notas para refrescar resumen
        contenedor.addEventListener('input', (e) => {
            if (e.target.classList.contains('input-micro-nota')) {
                const card = e.target.closest('.serie-card-edicion');
                if (card) {
                    actualizarBadgesResumenSerie(card);
                    sincronizarDatosEditorSesionDesdeDOM();
                }
            }
        });

        // Delegación de eventos para clicks: formato, notas, tags, añadir serie, eliminar serie y check
        contenedor.addEventListener('click', (e) => {
            // Toggle panel de micro-notas en modo edición
            const btnToggleNota = e.target.closest('.btn-toggle-nota');
            if (btnToggleNota) {
                const card = btnToggleNota.closest('.serie-card-edicion');
                if (card) {
                    const panel = card.querySelector('.serie-panel-nota');
                    if (panel) {
                        panel.classList.toggle('oculto');
                        btnToggleNota.classList.toggle('activo', !panel.classList.contains('oculto'));
                        if (!panel.classList.contains('oculto')) {
                            const inputNota = panel.querySelector('.input-micro-nota');
                            if (inputNota) inputNota.focus();
                        }
                    }
                }
                return;
            }

            // Selección de chips de etiquetas en modo edición
            const btnChip = e.target.closest('.chip-tag');
            if (btnChip) {
                const card = btnChip.closest('.serie-card-edicion');
                if (card) {
                    btnChip.classList.toggle('activo');
                    actualizarBadgesResumenSerie(card);
                    sincronizarDatosEditorSesionDesdeDOM();
                }
                return;
            }

            // 1. Alternar formato de ejercicio: TOP SET vs PLANAS
            const btnFormato = e.target.closest('.switch-formato-ejercicio .btn-formato');
            if (btnFormato) {
                const ejIdx = parseInt(btnFormato.dataset.ejIdx, 10);
                const nuevoFormato = btnFormato.dataset.formato;
                if (!isNaN(ejIdx) && APP.sesionEnEdicion && APP.sesionEnEdicion.ejercicios[ejIdx]) {
                    sincronizarDatosEditorSesionDesdeDOM();
                    const ej = APP.sesionEnEdicion.ejercicios[ejIdx];
                    if (ej.formato !== nuevoFormato) {
                        ej.formato = nuevoFormato;
                        actualizarTiposSeriesEjercicio(ej);
                        renderizarCuerpoEditorSesion();
                    }
                }
                return;
            }

            // 2. Añadir nueva serie al ejercicio
            const btnNuevaSerie = e.target.closest('.btn-nueva-serie-edicion');
            if (btnNuevaSerie) {
                sincronizarDatosEditorSesionDesdeDOM();
                const ejIdx = parseInt(btnNuevaSerie.dataset.ejIdx, 10);
                if (!isNaN(ejIdx) && APP.sesionEnEdicion && APP.sesionEnEdicion.ejercicios[ejIdx]) {
                    const ej = APP.sesionEnEdicion.ejercicios[ejIdx];
                    const series = ej.series;
                    const ultima = series[series.length - 1];
                    series.push({
                        esWarmup: false,
                        tipo: 'plana',
                        peso: ultima ? ultima.peso : 20,
                        reps: ultima ? ultima.reps : 5,
                        rpe: ultima ? ultima.rpe : 8,
                        completada: true,
                        tags: [],
                        nota: ''
                    });
                    actualizarTiposSeriesEjercicio(ej);
                    renderizarCuerpoEditorSesion();
                }
                return;
            }

            // 3. Eliminar serie
            const btnEliminar = e.target.closest('.btn-eliminar-serie-edicion');
            if (btnEliminar) {
                sincronizarDatosEditorSesionDesdeDOM();
                const ejIdx = parseInt(btnEliminar.dataset.ejIdx, 10);
                const serieIdx = parseInt(btnEliminar.dataset.serieIdx, 10);
                if (!isNaN(ejIdx) && !isNaN(serieIdx) && APP.sesionEnEdicion && APP.sesionEnEdicion.ejercicios[ejIdx]) {
                    const ej = APP.sesionEnEdicion.ejercicios[ejIdx];
                    ej.series.splice(serieIdx, 1);
                    actualizarTiposSeriesEjercicio(ej);
                    renderizarCuerpoEditorSesion();
                }
                return;
            }

            // 4. Toggle de serie realizada
            const btnCheck = e.target.closest('.btn-check-edicion');
            if (btnCheck) {
                btnCheck.classList.toggle('checked');
                const span = btnCheck.querySelector('span');
                if (span) {
                    span.textContent = btnCheck.classList.contains('checked') ? 'SERIE REALIZADA' : 'NO REALIZADA';
                }
                return;
            }
        });

        // Evento change para el switch de calentamiento (Warm-up)
        contenedor.addEventListener('change', (e) => {
            if (e.target.classList.contains('check-warmup-serie')) {
                sincronizarDatosEditorSesionDesdeDOM();
                const ejIdx = parseInt(e.target.dataset.ejIdx, 10);
                if (!isNaN(ejIdx) && APP.sesionEnEdicion && APP.sesionEnEdicion.ejercicios[ejIdx]) {
                    actualizarTiposSeriesEjercicio(APP.sesionEnEdicion.ejercicios[ejIdx]);
                    renderizarCuerpoEditorSesion();
                }
            }
        });
    }
}

// ------------------------------------------------------------
// H. INICIALIZACIÓN FINAL DEL BLOQUE 3 (UNIFICADA)
// ------------------------------------------------------------

function inicializarParte3() {
    inicializarCronometro();
    inicializarEventosEntrenamientoActivo();
    inicializarModalDetalleSesion();
    inicializarModalEditarSesion();
}


// ============================================================
// PARCHE DE AUDITORÍA QA: DELEGACIÓN GLOBAL DE EVENTOS
// Y ARRANQUE DEFINITIVO UNIFICADO (initApp)
// ============================================================

/**
 * Cierra cualquier modal al pulsar en el fondo oscuro exterior.
 */
function inicializarCierreModalesBackdrop() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('activo');
                if (modal.id === 'modal-confirmar') {
                    APP.confirmarCallback = null;
                }
                if (modal.id === 'modal-detalle-sesion') {
                    APP.sesionSeleccionadaId = null;
                }
                if (modal.id === 'modal-editar-sesion') {
                    APP.sesionEnEdicion = null;
                }
            }
        });
    });
}

/**
 * Delegación permanente para las tarjetas de rutinas en la vista Entrenar.
 */
function inicializarDelegacionRutinasEntrenar() {
    const contenedor = document.getElementById('lista-rutinas-entrenar');
    if (!contenedor) return;

    contenedor.addEventListener('click', (e) => {
        const tarjeta = e.target.closest('.tarjeta');
        if (!tarjeta) return;

        const rutinaId = tarjeta.dataset.rutinaId;
        if (rutinaId) {
            iniciarEntrenamiento(rutinaId);
        }
    });
}

/**
 * Delegación permanente para las tarjetas de rutinas en el Constructor.
 */
function inicializarDelegacionRutinasConstructor() {
    const contenedor = document.getElementById('lista-rutinas-constructor');
    if (!contenedor) return;

    contenedor.addEventListener('click', (e) => {
        const btnEditar = e.target.closest('.btn-editar-rutina');
        const btnDuplicar = e.target.closest('.btn-duplicar-rutina');
        const btnEliminar = e.target.closest('.btn-eliminar-rutina');

        if (btnEditar) {
            e.stopPropagation();
            abrirEditorRutina(btnEditar.dataset.rutinaId);
            return;
        }

        if (btnDuplicar) {
            e.stopPropagation();
            duplicarRutina(btnDuplicar.dataset.rutinaId);
            return;
        }

        if (btnEliminar) {
            e.stopPropagation();
            const rutinaId = btnEliminar.dataset.rutinaId;
            mostrarConfirmacion('¿Eliminar esta rutina?', () => {
                let rutinas = obtenerRutinas().filter(r => r.id !== rutinaId);
                guardarRutinas(rutinas);
                renderizarRutinasConstructor();
                renderizarRutinasEntrenar();
                mostrarToast('Rutina eliminada');
            });
        }
    });
}

/**
 * Delegación permanente para el listado de sesiones en Historial.
 */
function inicializarDelegacionHistorial() {
    const contenedor = document.getElementById('lista-historial');
    if (!contenedor) return;

    contenedor.addEventListener('click', (e) => {
        const card = e.target.closest('.historial-card');
        if (card && card.dataset.sesionId) {
            abrirDetalleSesion(card.dataset.sesionId);
        }
    });
}

/**
 * INICIALIZACIÓN DEFINITIVA Y UNIFICADA (initApp).
 * Se encarga de arrancar todos los módulos de las Partes 1, 2 y 3 sin condiciones de carrera.
 */
async function initApp() {
    console.log('[INIT] [QA Engine] Inicializando PowerLifting Tracker...');

    // 1. Cargar el catálogo JSON + personalizados
    await cargarCatalogoEjercicios();

    // 2. Sistemas base de interfaz
    inicializarNavegacion();
    inicializarTabs();
    inicializarSteppers();
    inicializarModalConfirmar();
    inicializarCierreModalesBackdrop();

    // 3. Módulo 1RM, Coeficientes, Calculadora de Carga y Changelog
    inicializar1RM();
    inicializarCalculadoraDiscos();
    inicializarChangelog();

    // 4. Módulo Constructor de Rutinas (Parte 2)
    if (typeof inicializarConstructor === 'function') {
        inicializarConstructor();
    }

    // 5. Módulo Entrenamiento Activo y Cronómetro (Parte 3)
    if (typeof inicializarCronometro === 'function') {
        inicializarCronometro();
    }
    if (typeof inicializarEventosEntrenamientoActivo === 'function') {
        inicializarEventosEntrenamientoActivo();
    }
    if (typeof inicializarModalDetalleSesion === 'function') {
        inicializarModalDetalleSesion();
    }
    if (typeof inicializarModalEditarSesion === 'function') {
        inicializarModalEditarSesion();
    }

    // 6. Delegaciones permanentes de eventos dinámicos
    inicializarDelegacionRutinasEntrenar();
    inicializarDelegacionRutinasConstructor();
    inicializarDelegacionHistorial();

    // 7. Renderizado inicial de vistas
    renderizarRutinasEntrenar();
    renderizarRutinasConstructor();
    renderizarHistorial();

    // 8. Inicializar instalador PWA
    inicializarInstalacionPWA();

    console.log('[OK] [QA Engine] Todos los botones y eventos quedaron conectados correctamente.');
}

// ============================================================
// 17. MÓDULO PROGRESSIVE WEB APP (PWA & OFFLINE)
// ============================================================

let eventoInstalacionPWA = null;

// Capturar el evento beforeinstallprompt de Chrome/Android de inmediato (sin race condition)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    eventoInstalacionPWA = e;
    const btnInstalar = document.getElementById('btn-instalar-app');
    if (btnInstalar) {
        btnInstalar.style.display = 'inline-flex';
    }
    console.log('[PWA] Evento beforeinstallprompt capturado.');
});

/**
 * Conecta los listeners del botón de instalación y appinstalled.
 */
function inicializarInstalacionPWA() {
    const btnInstalar = document.getElementById('btn-instalar-app');
    if (!btnInstalar) return;

    // Si el evento ya llegó antes de completar initApp, mostrar el botón
    if (eventoInstalacionPWA) {
        btnInstalar.style.display = 'inline-flex';
    }

    // Click en el botón INSTALAR APP
    btnInstalar.addEventListener('click', async () => {
        if (!eventoInstalacionPWA) return;

        eventoInstalacionPWA.prompt();

        try {
            const { outcome } = await eventoInstalacionPWA.userChoice;
            console.log(`[PWA] Respuesta del usuario a la instalación: ${outcome}`);

            if (outcome === 'accepted') {
                btnInstalar.style.display = 'none';
                eventoInstalacionPWA = null;
            }
        } catch (err) {
            console.warn('[PWA] Error al procesar prompt de instalación:', err);
        }
    });

    // Evento appinstalled cuando se finaliza la instalación
    window.addEventListener('appinstalled', () => {
        eventoInstalacionPWA = null;
        btnInstalar.style.display = 'none';
        console.log('[PWA] Aplicación instalada exitosamente.');
        if (typeof mostrarToast === 'function') {
            mostrarToast('APLICACIÓN INSTALADA');
        }
    });
}

// 4. Registro del Service Worker con rutas relativas y actualización automática
if ('serviceWorker' in navigator) {
    // Si se activa un nuevo Service Worker en segundo plano, recargar limpiamente sin reinstalar
    let recargando = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (recargando) return;
        recargando = true;
        window.location.reload();
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('[PWA] Service Worker registrado con éxito. Scope:', registration.scope);
                // Comprobar automáticamente si hay una nueva versión
                registration.update();
            })
            .catch((error) => {
                console.warn('[PWA] Error al registrar el Service Worker:', error);
            });
    });
}

// Disparo seguro e inmediato de la inicialización unificada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

