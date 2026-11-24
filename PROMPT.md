# Prompt maestro — Web de ASFRA SERVICES LLC

Versión 1 · 2026-11-24 · Para usar con Claude Code (o cualquier agente de código) dentro de `C:\Users\info\Documents\asfra-web`.

---

## 0. Referencia de estilo (qué tomar y qué NO)

**Referencia principal:** DeepBook, Site of the Day de Awwwards (3 nov 2026), sitio en vivo: https://deepbook-v2-wip.webflow.io/ · ficha: https://www.awwwards.com/sites/deepbook
Se eligió porque: es fintech (confianza), usa casi el mismo azul royal que ASFRA sobre fondo oscuro, habla a **dos públicos** desde el hero (igual que ASFRA: clientes y agencias) y está hecho con el mismo stack de animación (GSAP + ScrollTrigger + Lenis).

**Referencia secundaria (solo para el ritmo del scroll narrativo):** ZIRKA Interceptor, Site of the Day (9 nov 2026), la mejor puntuación del mes (7.73/10): https://www.awwwards.com/sites/zirka-interceptor — titulares cortos que se revelan por líneas, etiquetas en tipografía mono, una idea por pantalla.

**Tomar (principios):**
- Fondo oscuro, un solo color de acento (azul royal) y blanco. Nada de degradados arcoíris.
- Barra fina de aviso arriba que corre en marquesina.
- Navegación flotante en forma de cápsula, con un botón principal azul y un botón de menú.
- Hero centrado con titular enorme y **dos botones, uno por público**.
- Una sección **fijada (pinned)** con un panel azul enmarcado con cruces "+" en las esquinas, donde las frases cambian al hacer scroll y un indicador de progreso en cápsula muestra en qué paso vas; debajo, una ilustración que se transforma con cada paso.
- Secciones por público con lista de beneficios en filas con borde y un cuadrado azul como viñeta.
- Mucho aire, tipografía grande, pocas palabras por pantalla.

**NO tomar:** textos, logotipos, ilustraciones isométricas de bloques tipo LEGO, el efecto de "lluvia de líneas" del hero ni ningún asset de DeepBook o ZIRKA. ASFRA tiene su propia metáfora (ver §3). El resultado debe ser reconocible como ASFRA, no como un clon.

---

## 1. Rol y objetivo

Eres un equipo senior de diseño y desarrollo front-end de nivel Awwwards. Construye el sitio de **ASFRA SERVICES LLC** (asfraservices.com): una empresa de servicios para la comunidad latina en EE. UU. y de captación de clientes para agencias de seguros.

Objetivo del sitio, en orden:
1. Que un cliente desde el celular entienda en 5 segundos qué ofrece ASFRA y pida cotización o escriba por WhatsApp.
2. Que una agencia de seguros se registre para recibir clientes.
3. Que la marca se vea premium, moderna y confiable.

---

## 2. Marca (no negociable)

- **Nombre:** ASFRA SERVICES LLC
- **Subtítulo:** Marketing & Customer Acquisition Solutions
- **Eslogan:** We connect. You grow.
- **Colores:** azul royal `#005DFF` (acento y botones), azul oscuro `#0A2F87` (paneles y profundidad), navy `#0E1A3D` (fondo base), blanco `#FFFFFF` (texto).
  - Derivados permitidos solo por opacidad del blanco o del navy (bordes `rgba(255,255,255,.10)`, textos secundarios `rgba(255,255,255,.70)`). Verificar contraste AA (4.5:1) en todo texto.
- **Tipografía:** títulos **Space Grotesk Bold**, texto **Inter Medium**. Etiquetas pequeñas y numeración en Space Grotesk Medium con `letter-spacing` amplio y mayúsculas (rol que en la referencia hace la mono). Cargar con `next/font/google`.
- **Logo:** usar **solo** el archivo original que entregue el Director (ponerlo en `public/brand/`). Nunca redibujarlo, regenerarlo, recolorearlo ni modificarlo con IA. Hasta que llegue, usar un recuadro punteado con el texto "LOGO".
- **Íconos:** una sola familia (Lucide). Logo de WhatsApp e Instagram oficiales (Simple Icons). Sin emojis como íconos.

---

## 3. Concepto creativo propio: "We connect"

La metáfora de ASFRA es la **conexión**: puntos que se unen con líneas.

- **Hero:** sobre el navy, una retícula de puntos con la silueta de EE. UU. Al cargar, los **13 estados** donde trabaja ASFRA se encienden en azul uno a uno y se dibujan líneas finas que los conectan entre sí (trazo animado). El resto del mapa queda en puntos tenues. En móvil el mapa queda detrás del titular con opacidad baja; en escritorio, a la derecha o a pantalla completa detrás.
- Esa misma red reaparece más abajo como el mapa grande de la sección de estados y de agencias: es un hilo visual que recorre todo el sitio.
- **Transformación en la sección fijada:** un ícono grande lineal (trazo, no relleno) que se transforma de un servicio al siguiente (auto → salvavidas → edificio → # → credencial → recibo) con morph de SVG o cruce de trazos.

Estados (exactos, sin agregar ni quitar): **FL, GA, TX, NC, SC, VA, MD, CA, NJ, PA, CT, AL, MS**. Usar geometría real de EE. UU. (`us-atlas` TopoJSON + `d3-geo`, proyección `geoAlbersUsa`), convertida a puntos o paths.

---

## 4. Stack

- Next.js (App Router, última estable) + TypeScript estricto + Tailwind CSS.
- **Motion** (`motion/react`) para microinteracciones y entradas de componentes.
- **GSAP + ScrollTrigger** para todo lo ligado al scroll (pin, scrub, revelados).
- **Lenis** para scroll suave, sincronizado con ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` y `gsap.ticker`).
- **next-intl** para español (por defecto, `/`) e inglés (`/en`).
- Componentes de terceros solo si aportan y con licencia compatible (21st.dev, React Bits, Aceternity, Magic UI). Copiar el código al repo, no depender de CDN.
- Formularios: React Hook Form + Zod, enviados a un Route Handler de Next.js. **El destino de los envíos (correo, CRM o hoja) está pendiente de decisión del Director**: dejarlo detrás de una sola función `submitLead()` fácil de conectar.
- Despliegue: Vercel, dominio asfraservices.com.

---

## 5. Mapa del sitio

```
/                      Inicio
/servicios/seguros-de-auto
/servicios/asistencia-en-accidentes
/servicios/creacion-de-llc
/servicios/numero-ein
/servicios/tramite-de-itin
/servicios/taxes
/agencias              Para agencias de seguros
/contacto              Contacto y cotización
/en/...                Mismas rutas en inglés
```

Elementos globales en todas las páginas:
- **Barra de aviso** superior, azul royal, marquesina lenta: "Cotiza por WhatsApp · 650-460-3470 · Atendemos en 13 estados" (no decir "gratis" hasta que el Director lo confirme). Se puede cerrar.
- **Navegación flotante** (cápsula navy con borde sutil, separada de los bordes): logo · enlaces (Servicios, Agencias, Contacto) · selector ES/EN · botón azul "Cotizar". En móvil: logo + "Cotizar" + botón de menú que abre un panel a pantalla completa con los enlaces grandes revelándose en cascada.
- **Botón flotante de WhatsApp** (abajo a la derecha, 56 px, verde WhatsApp `#25D366`, con un pulso suave) → `https://wa.me/16504603470`. No debe tapar los botones de los formularios en móvil.
- **Footer:** logo, eslogan grande "We connect. You grow." que se revela al llegar, enlaces, teléfono `650-460-3470` (`tel:+16504603470`), correo `info@asfraservices.com`, Instagram `@asfraservices` (https://instagram.com/asfraservices), selector de idioma y © con el año actual.

---

## 6. Inicio, sección por sección

### 6.1 Hero
- Etiqueta pequeña: "MARKETING & CUSTOMER ACQUISITION SOLUTIONS".
- Titular H1: **"Soluciones para ti y tu negocio"** (Space Grotesk Bold, 44–56 px en móvil, hasta ~120 px en escritorio, interlineado 0.95, tracking −0.03em).
- Subtítulo: "Todos los servicios que necesitas, en un solo lugar."
- Dos botones, uno por público:
  - Primario azul: **"Cotizar ahora"** → formulario de cotización.
  - Secundario blanco: **"Soy agencia de seguros"** → `/agencias`.
- Fondo: la red "We connect" del §3.
- Entrada cinematográfica (≈1.6 s en total): fundido del navy → se dibujan los puntos → se encienden los 13 estados y se trazan las conexiones → el titular sube por líneas con máscara (split por líneas y palabras) → aparecen subtítulo y botones.
- Botones magnéticos en dispositivos con puntero.

### 6.2 Sección fijada "Todo en un solo lugar"
- Al llegar, la sección se fija (pin) durante ~6 pantallas de scroll.
- Panel azul royal enmarcado, con cruces "+" finas en las cuatro esquinas.
- Arriba, etiqueta: "ASFRA · TODO EN UN SOLO LUGAR".
- En el centro, una frase grande que cambia con el scroll (scrub), una por servicio:
  1. "Seguros de auto, personal y comercial."
  2. "Asistencia en accidentes: orientación y conexión con proveedores."
  3. "Creación de tu LLC."
  4. "Tu número EIN, gestionado."
  5. "Trámite de ITIN, con asistencia en la solicitud."
  6. "Taxes: asistencia con la preparación de tus impuestos."
- Indicador de progreso en cápsula con 6 marcas; la marca activa se estira.
- Debajo del panel, el ícono lineal grande que se transforma de un servicio al siguiente (§3).
- En móvil la misma mecánica, más corta (~4 pantallas). Con movimiento reducido: sin pin; se muestran las 6 frases como lista estática.

### 6.3 Servicios (tarjetas)
- Título: "Servicios". 6 tarjetas, cada una con ícono, nombre, línea corta y enlace "Ver servicio →" a su página.
- Tarjeta: fondo `#0A2F87` al 40% sobre navy, borde 1 px blanco al 10%, radio 20 px.
- Hover en escritorio: **brillo que sigue al cursor** (gradiente radial azul en el borde y el fondo) y la flecha avanza. En móvil, el brillo recorre la tarjeta una vez cuando entra en pantalla.
- Entrada en cascada con ScrollTrigger (y +24 px → 0, opacidad 0 → 1, desfase 80 ms).
- Grid: 1 columna en móvil, 2 en tablet, 3 en escritorio.

### 6.4 Dos públicos: "Para ti" y "Para agencias"
Dos bloques grandes uno tras otro, al estilo de los bloques por público de la referencia:
- **Para ti:** "¿Necesitas un seguro, abrir tu empresa o hacer tus taxes?" + lista en filas con borde y un cuadrado azul como viñeta (los 6 servicios en una línea cada uno) + botón "Cotizar ahora".
- **Para agencias de seguros:** "Clientes latinos listos para asegurar, en tu estado." + "Leads exclusivos con licencia, VIN y documentos." + filas: "Licencia de conducir", "VIN del vehículo", "Documentos", cada una con una marca de verificación que se dibuja al entrar + botón "Registrar mi agencia".
- Los títulos se revelan por líneas con el scroll.

### 6.5 Estados
- Título: "Dónde trabajamos".
- Mapa grande de EE. UU. con la red de puntos; los 13 estados en azul, con un pulso suave escalonado.
- Lista accesible debajo con los nombres completos (Florida, Georgia, Texas, North Carolina, South Carolina, Virginia, Maryland, California, New Jersey, Pennsylvania, Connecticut, Alabama, Mississippi) para lectores de pantalla y SEO.
- Contador animado solo con cifras reales: **13 estados**, **6 servicios**, **2 idiomas**. No agregar ninguna otra cifra.

### 6.6 Cotización
- Título: "Pide tu cotización".
- Formulario corto: **nombre, teléfono, estado (selector con los 13), servicio que necesita (selector con los 6)**.
- Botón "Enviar" con estado de carga, mensaje de éxito y errores junto al campo.
- Alternativa visible: "¿Prefieres WhatsApp? Escríbenos" → wa.me con texto prellenado.

### 6.7 Footer
Ver §5. El eslogan "We connect. You grow." ocupa todo el ancho y se revela con una máscara al llegar.

---

## 7. Páginas de servicio (`/servicios/[slug]`)
Plantilla común:
- Hero corto con ícono grande, nombre del servicio y su línea descriptiva.
- Bloque "Cómo te ayudamos" con 3–4 pasos genéricos del proceso (contacto → revisión de tus datos → gestión → seguimiento). **No prometer plazos, precios ni resultados** que el Director no haya confirmado; dejar `TODO` donde falte información real.
- Formulario de cotización con el servicio ya seleccionado.
- Enlaces "Otros servicios" al final.
- Metadatos SEO propios por página y por idioma.

## 8. Página de agencias (`/agencias`)
- Hero: "Clientes latinos listos para asegurar, en tu estado." + "Leads exclusivos con licencia, VIN y documentos."
- Pasos (deslizables con el dedo en móvil): 01 Registra tu agencia · 02 Indica tu capacidad semanal · 03 Recibe leads exclusivos.
- Mapa con los 13 estados; al elegir un estado en el formulario, ese estado se ilumina en el mapa.
- **Formulario de registro** (en 2 pasos en móvil): nombre de la agencia, estado, número de licencia, WhatsApp, correo, cuántos clientes por semana puede atender.

## 9. Contacto (`/contacto`)
Teléfono y WhatsApp `650-460-3470`, correo `info@asfraservices.com`, Instagram `@asfraservices`, y el formulario de cotización.

---

## 10. Movimiento: reglas

- Curva base: `cubic-bezier(.2,.8,.2,1)`. Microinteracciones de 150–300 ms; revelados de 600–900 ms.
- Solo animar `transform` y `opacity` (y `clip-path` en máscaras). Nada de animar `width`, `height` o `top`.
- Lenis activo en escritorio y móvil; desactivarlo con movimiento reducido.
- Un solo `ScrollTrigger.refresh()` tras cargar fuentes e imágenes.
- **`prefers-reduced-motion: reduce`:** sin Lenis, sin pin, sin scrub, sin efecto magnético ni marquesinas; todo el contenido visible de inmediato, con fundidos de máximo 150 ms.
- Nada debe depender del hover para funcionar en móvil.

## 11. Rendimiento, accesibilidad y SEO

- Mobile-first. Probar en 375, 768, 1024 y 1440 px. Sin scroll horizontal.
- Objetivo Lighthouse móvil ≥ 90 en rendimiento, accesibilidad, buenas prácticas y SEO.
- El mapa y las animaciones pesadas se cargan de forma diferida (`dynamic import`), sin bloquear el titular.
- Contraste AA, foco visible, áreas táctiles de 44 px o más, `label` en cada campo, `alt` en imágenes, `aria-label` en botones que solo tienen ícono, idioma correcto en `<html lang>`.
- Metadatos por página, Open Graph, `sitemap.xml`, `robots.txt`, `hreflang` es/en y datos estructurados `LocalBusiness` con el teléfono, el correo y el área de servicio (los 13 estados).

## 12. Prohibido

- Inventar testimonios, reseñas, logos de clientes, cifras, porcentajes, años de experiencia, precios o plazos.
- Modificar o recrear el logo.
- Copiar textos, ilustraciones o assets de los sitios de referencia.
- Texto en inglés en la versión en español o al revés.

## 13. Entregables y verificación

1. Proyecto Next.js funcionando en local (`npm run dev`) y compilando sin errores (`npm run build`, `tsc --noEmit`, lint limpio).
2. Revisión visual en el navegador en escritorio y en móvil (375 px), con capturas de cada sección.
3. Prueba de los dos formularios: validación, error y éxito.
4. Comprobación con movimiento reducido activado.
5. Repositorio en GitHub y proyecto listo para importar en Vercel con el dominio asfraservices.com (instrucciones de DNS en el README).

## 14. Pendientes que debe aportar el Director

- Archivo original del logo.
- Destino de los formularios (correo, CRM o Google Sheets).
- Textos reales de detalle por servicio (requisitos, documentos, tiempos), si los hay.
- Traducción al inglés: el agente la propone; el Director la aprueba.
