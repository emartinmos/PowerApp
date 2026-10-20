# Guía del Proyecto y Reglas de Ejecución

## 1. Arquitectura y Stack
- **Tecnología:** Vanilla JavaScript (ES6+), CSS3 nativo y HTML5 semántico. Sin frameworks ni dependencias externas.
- **Tipo de App:** Single Page Application (SPA) PWA de Powerlifting.
- **Entorno de Despliegue:** Vercel.

## 2. REGLAS ESTRICTAS DE CONSUMO DE TOKENS (OBLIGATORIO)
- **Lectura Acotada:** Lee ÚNICAMENTE los archivos especificados de forma explícita en el prompt del usuario. Queda prohibido ejecutar búsquedas globales, escaneos de directorio o inspecciones recursivas por iniciativa propia.
- **Edición Quirúrgica:** Utiliza exclusivamente herramientas de reemplazo parcial (diff / search-and-replace). NUNCA reescribas archivos enteros ni emitas bloques de código no modificados de `js/app.js`.
- **Cero Bucles de Herramientas:** Aplica las modificaciones solicitadas directamente en el primer intento sin entrar en ciclos de inspección o prueba automatizada.

## 3. Sistema de Diseño y UI/UX
- **Estética:** Industrial Dark (fondo `#0A0A0A` / `#111111`, acentos en rojo `#E50914`, bordes `#262626`).
- **Iconografía:** Usa exclusivamente vectores `<svg>` limpios. **PROHIBIDO EL USO DE EMOJIS.**
- **Tipografía:** Usa `tabular-nums` para valores numéricos y marcas.
- **Responsive:** Layouts optimizados de forma estricta para el viewport de `393px` (iPhone 16).

## 4. Flujo de Trabajo e Interacción
- Al finalizar cualquier modificación de código, NO actualices `APP_VERSION`, `NOTAS_DE_PARCHE` ni `sw.js` de forma automática.
- **Pausa Obligatoria:** Detente y pregunta explícitamente al usuario: "¿Quieres que redacte las nuevas features añadidas y las insertes en el apartado de Notas de Parche?". No toches los archivos de versión hasta recibir confirmación afirmativa.