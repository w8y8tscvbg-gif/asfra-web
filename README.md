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

## Pendientes de ASFRA

1. **Logo original.** Copiar el archivo a `public/brand/` y completar `LOGO` en `src/components/ui/Logo.tsx` (ruta, ancho y alto). No se redibuja ni se modifica.
2. **Destino de los formularios.** Definir la variable `LEAD_WEBHOOK_URL` (ver `.env.example`). Sin ella, en producción los formularios muestran un error y mandan al visitante a WhatsApp; no se pierde ningún lead en silencio.
3. **Textos de detalle por servicio** (requisitos, documentos, tiempos), si se quieren publicar.
4. **Revisión del inglés** por parte de ASFRA.

## Publicar en Vercel con asfraservices.com

1. En [vercel.com/new](https://vercel.com/new), importar este repositorio de GitHub. Vercel detecta Next.js; no hace falta cambiar nada del build.
2. En *Settings → Environment Variables*, añadir `LEAD_WEBHOOK_URL` (y `LEAD_WEBHOOK_SECRET` si aplica) para *Production*.
3. En *Settings → Domains*, añadir `asfraservices.com` y `www.asfraservices.com`.
4. En el proveedor del dominio, crear los registros DNS **exactamente como los muestre Vercel** en esa pantalla (normalmente un registro `A` para `asfraservices.com` y un `CNAME` para `www`).
5. Esperar a que Vercel marque el dominio como válido y emita el certificado HTTPS.
