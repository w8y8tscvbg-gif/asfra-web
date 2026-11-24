# ASFRA SERVICES LLC — asfraservices.com

Sitio web de ASFRA SERVICES LLC. *Marketing & Customer Acquisition Solutions — We connect. You grow.*

El diseño sigue [PROMPT.md](PROMPT.md) (referencia de estilo: DeepBook, Site of the Day de Awwwards, nov 2026).

## Stack

- Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind CSS 4
- GSAP (ScrollTrigger, SplitText, DrawSVG) + Lenis para el scroll suave
- Motion para el menú móvil
- React Hook Form + Zod para los formularios
- Mapa de EE. UU. generado en el build con `us-atlas` + `d3-geo` (sin imágenes externas)

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # compilación de producción
npm run lint
```

## Estructura

| Ruta | Página |
|---|---|
| `/` · `/en` | Inicio |
| `/servicios/<slug>` · `/en/servicios/<slug>` | Una página por servicio (6) |
| `/agencias` · `/en/agencias` | Para agencias de seguros + registro |
| `/contacto` · `/en/contacto` | Contacto + cotización |
| `POST /api/lead` | Recibe los formularios |

- Español no lleva prefijo; inglés vive en `/en`. Lo resuelve `src/proxy.ts`.
- Textos: `src/i18n/dictionaries/es.ts` y `en.ts`.
- Datos de contacto, estados y servicios: `src/lib/site.ts`.

## Formularios → GoHighLevel

Los dos formularios (cotización y registro de agencias) envían un JSON a `POST /api/lead`, que lo reenvía a `LEAD_WEBHOOK_URL`: el *Inbound Webhook* del workflow **"Web asfraservices.com - Formularios"** (carpeta *01 - Master*) de la subcuenta Asfra Services LLC.

- El workflow crea o actualiza el contacto con nombre, teléfono (+1…), correo, estado, *Requested Service*, *Business Name* (agencias) y *Contact source* = `asfraservices.com`.
- Etiquetas: `sitio-web` siempre, más `web-cotizacion` o `web-agencia` según el formulario.
- El valor de *Requested Service* sale de `GHL_REQUESTED_SERVICE` en `src/lib/submitLead.ts` (ITIN → "Other", porque el CRM no tiene opción propia).
- La URL del webhook **no está en el repositorio** (es público): vive solo en las variables de entorno de Vercel.
- Sin `LEAD_WEBHOOK_URL`, en producción los formularios muestran un error y mandan al visitante a WhatsApp; no se pierde ningún lead en silencio.

## Pendientes

1. **Textos de detalle por servicio** (requisitos, documentos, tiempos), si se quieren publicar.
2. **Revisión del inglés** por parte de ASFRA.

## Publicar en Vercel con asfraservices.com

1. En [vercel.com/new](https://vercel.com/new), importar este repositorio de GitHub. Vercel detecta Next.js; no hace falta cambiar nada del build.
2. En *Settings → Environment Variables*, añadir `LEAD_WEBHOOK_URL` (y `LEAD_WEBHOOK_SECRET` si aplica) para *Production*.
3. En *Settings → Domains*, añadir `asfraservices.com` y `www.asfraservices.com`.
4. En el proveedor del dominio, crear los registros DNS **exactamente como los muestre Vercel** en esa pantalla (normalmente un registro `A` para `asfraservices.com` y un `CNAME` para `www`).
5. Esperar a que Vercel marque el dominio como válido y emita el certificado HTTPS.
