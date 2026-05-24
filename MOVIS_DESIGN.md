# MOVIS — Guía de Diseño "Pop Juguetón (Glow)"

> Documento maestro de implementación visual. Es la **única fuente de verdad** del nuevo look de Movis.
> El desarrollador frontend implementa a partir de aquí: todos los tokens, valores y estados están definidos.
> No hay que inventar nada. Stack: **React + Vite, CSS puro + variables** (sin librería de UI ni de iconos).
>
> Referencias fusionadas: **Lovable** (calidez, pill 9999px, sombras-glow suaves, grises por opacidad, washes de gradiente) + **Revolut** (pill-everything con padding generoso, display grande con tracking negativo, profundidad por contraste de color, cero sombras duras).

---

## 0. TL;DR para el dev (lee esto primero)

- **Fondo**: fiesta de cine de día — **gradiente vibrante claro** lavanda-luminosa con wash saturado morado→rosa→coral (`#F3E9FF` base → washes de `#8B5CF6`/`#FF3D9A`/`#FF6B5C`) y **blobs de gradiente** animados muy lentos + sparkles detrás de todo. Alegre y brillante, NO oscuro. Justificación en §1.
- **Superficies**: cards de "vidrio" claro translúcido (`rgba(255,255,255,0.72)` + blur), borde `1px rgba(42,27,61,0.08)`, glow de color suave. Cero bordes negros gruesos, cero box-shadow dura. Esto **reemplaza por completo** el neo-brutalismo actual.
- **Botones y chips**: TODO es pill (`border-radius: 9999px`), padding generoso, con **glow** en hover/focus en lugar de sombra dura.
- **Tipografía**: **Fredoka** (display redonda divertida) + **Plus Jakarta Sans** (texto legible). Sustituye Lilita One + Nunito.
- **Acento**: gradiente firma morado→rosa→coral (`--grad-primary`). Es la marca.
- **Tinta**: morado oscuro `#2A1B3D` para cuerpo sobre fondo claro; acentos (rosa-magenta, violeta, coral) para títulos/marca.
- **Animación**: omnipresente pero suave. Entrada de cards (fade+rise+scale), bounce de mascota, pulso-glow de CTA, baile del loader, confeti en el match. Todo respeta `prefers-reduced-motion`.

---

## 1. Filosofía y atmósfera

**Movis es la sala de cine de bolsillo de un grupo de amigos.** El objetivo emocional es la chispa de "¡vamos a ver algo juntos!": alegre, premium y muy llamativa, nunca clínica ni corporativa. El nuevo look se llama **"Pop Juguetón (Glow)"** y nace de fusionar dos sistemas opuestos en algo propio:

- De **Lovable** tomamos la **calidez y la suavidad**: todo redondeado, nada de aristas; las fronteras se sugieren con bordes finísimos en vez de líneas duras; la profundidad se consigue con **sombras-glow difusas y grandes** (su `rgba(0,0,0,0.1) 0 4px 12px` lo convertimos en glow de color), y los grises se derivan de **una sola tinta a distintas opacidades** para una unidad tonal total. También su idea del **wash de gradiente atmosférico detrás del hero**.
- De **Revolut** tomamos la **confianza y la disciplina**: **pill-everything** (cada botón y chip a 9999px con padding generoso y target táctil grande), **tipografía display grande con tracking negativo** que se lee de un vistazo, y la **profundidad por contraste de color** (cero sombras duras; el dark/light de las secciones hace el trabajo).

**Por qué fondo vibrante claro "fiesta de cine de día" y no el fondo oscuro.** "Pop juguetón glow" pide *alegría, brillo y energía pop*: un lienzo claro y saturado morado→rosa→coral transmite de inmediato una fiesta luminosa, optimista y juguetona — la emoción de "¡vamos a ver algo juntos!" en su versión más radiante. El glow sigue siendo la firma, pero aquí brilla como **luz de color sobre un día soleado**: halos saturados alrededor del póster, los botones y la mascota que tiñen el fondo claro de color, no como neón en la oscuridad. El póster de la película destaca como una postal vívida sobre el wash de color, y los gradientes morado→rosa→coral funcionan como confeti de luz. Mantenemos la vibra divertida (formas burbuja, mascota, colores vivos, micro-animaciones) y la subimos de nivel pasando de "neo-brutalismo plano" a "fiesta de color premium, brillante y alegre". El resultado se siente como Lovable (calidez clara) cruzado con la disciplina pill de Revolut, en clave de fiesta diurna.

**Principio rector:** *suave pero vibrante*. Saturación alta en acentos y gradientes, pero geometría blanda (radios enormes), tipografía redonda y movimiento orgánico. Nada pincha; todo brilla — y el brillo es luz de color sobre claro.

---

## 2. Tokens de color

> Todas las variables van en `:root` en `client/src/styles/global.css`, sustituyendo el bloque `:root` actual.
> Convención: `--c-*` color sólido, `--grad-*` gradiente, `--glow-*` sombra-glow, `--ink-*` texto.

### 2.1 Base / fondo (fiesta de cine de día — vibrante claro)

```css
:root {
  /* ---- FONDO VIBRANTE CLARO ---- */
  --c-bg:            #F3E9FF;   /* lavanda luminosa, base de página */
  --c-bg-2:          #FFE6F4;   /* rosa muy claro, segundo tono del degradado base */
  --c-bg-3:          #FFEDE6;   /* coral-melocotón claro, tercer tono cálido */

  /* ---- SUPERFICIES (vidrio claro translúcido) ---- */
  --c-surface:       rgba(255, 255, 255, 0.72);  /* card por defecto (blanco glassy) */
  --c-surface-2:     rgba(255, 255, 255, 0.88);  /* card elevada / hover, más opaca */
  --c-surface-solid: #FFFFFF;                    /* fallback opaco si no hay blur */
  --c-input-bg:      rgba(255, 255, 255, 0.78);  /* inputs y selects */

  /* ---- BORDES (finos, por opacidad de tinta morada) ---- */
  --c-border:        rgba(42, 27, 61, 0.08);     /* borde pasivo de card */
  --c-border-strong: rgba(42, 27, 61, 0.16);     /* borde interactivo / hover */
  --c-border-faint:  rgba(42, 27, 61, 0.05);     /* divisores sutiles */
}
```

### 2.2 Tinta / texto (derivada de morado oscuro por opacidad — unidad tonal estilo Lovable)

```css
  --ink:        #2A1B3D;                      /* texto principal (morado tinta oscuro) */
  --ink-90:     rgba(42, 27, 61, 0.90);      /* títulos sobre superficie */
  --ink-70:     rgba(42, 27, 61, 0.72);      /* cuerpo */
  --ink-55:     rgba(42, 27, 61, 0.58);      /* texto secundario / muted */
  --ink-40:     rgba(42, 27, 61, 0.42);      /* placeholder, captions, deshabilitado */
  --ink-on-dark: #FDFBFF;                    /* texto sobre superficies de acento saturado (botones, chips de color) */
```

> Contraste: `--ink` (#2A1B3D) sobre `--c-bg` (#F3E9FF) ≈ 13.5:1 (AAA). `--ink-55` sobre `--c-bg` ≈ 6.2:1 (AA grande/AAA pequeño según tamaño). Sobre las superficies blancas (`--c-surface`) el contraste es aún mayor. Ver §11.

### 2.3 Marca y acentos (máximo 3 acentos — regla del sistema)

```css
  /* ---- ACENTO 1: ROSA-MAGENTA (primario de marca) ---- */
  --c-primary:       #FF3D9A;   /* rosa neón, el color "Movis" */
  --c-primary-deep:  #D81B79;   /* presionado / activo + texto rosa accesible sobre claro */
  --c-primary-soft:  #FF7AC0;   /* highlights, fondos rosados muy suaves */

  /* ---- ACENTO 2: MORADO-VIOLETA (secundario) ---- */
  --c-violet:        #8B5CF6;   /* violeta brillante */
  --c-violet-deep:   #6D3FE0;   /* texto violeta accesible sobre claro */

  /* ---- ACENTO 3: CORAL/NARANJA (terciario, calidez) ---- */
  --c-coral:         #FF6B5C;   /* coral cálido (puente con la marca vieja) */
  --c-coral-deep:    #E84A3C;   /* texto coral accesible sobre claro */

  /* ---- DORADO (reservado: estrellas/rating, NO es 4º acento de UI) ---- */
  --c-gold:          #F5A623;   /* ámbar dorado, legible sobre claro; solo rating y sparkles */
  --c-gold-soft:     #FFC83D;   /* relleno de estrella/sparkle decorativo */
}
```

> Los 3 acentos de UI son **rosa, violeta y coral** (la tríada del gradiente firma). El **dorado** se restringe a rating y destellos decorativos, no compite como color de acción. Esto respeta "máximo 3 acentos". Nota: para *texto* de acento sobre fondo claro se usan las variantes `-deep` (más oscuras y legibles); los `-soft` y base se reservan para rellenos, glows y fondos.

### 2.4 Estados (éxito / error / aviso)

```css
  --c-success:      #16A98A;   /* verde menta intenso, legible sobre claro */
  --c-success-deep: #0E8A70;
  --c-success-soft: #2DD4A7;   /* relleno de chip/grad SÍ */
  --c-error:        #E0314F;   /* rojo-rosa, legible como texto sobre claro */
  --c-error-deep:   #C01E3C;
  --c-error-soft:   #FF4D6D;   /* relleno de chip/grad NO, borde */
  --c-warning:      #C77800;   /* ámbar legible sobre claro */
```

### 2.5 Gradientes con nombre (la firma visual)

```css
  /* HERO / fondo vibrante claro (base de página + blobs). Wash saturado sobre lavanda. */
  --grad-hero:    linear-gradient(160deg, #F3E9FF 0%, #FFE6F4 50%, #FFEDE6 100%);
  /* botón primario (mismo ADN, ángulo plano para legibilidad del texto blanco) */
  --grad-primary: linear-gradient(100deg, #C026D3 0%, #FF3D9A 55%, #FF6B5C 100%);
  /* glow radial (se usa como background de halos detrás de mascota/póster, saturado) */
  --grad-glow:    radial-gradient(circle at 50% 40%, rgba(255,61,154,0.45) 0%, rgba(139,92,246,0.22) 45%, transparent 70%);
  /* chip SÍ (verde/menta) */
  --grad-yes:     linear-gradient(120deg, #2DD4A7 0%, #22B8C4 100%);
  /* chip NO (rojo cálido) */
  --grad-no:      linear-gradient(120deg, #FF4D6D 0%, #FF6B5C 100%);
  /* texto con gradiente (brand wordmark, números grandes) — saturado para destacar sobre claro */
  --grad-text:    linear-gradient(100deg, #C026D3 0%, #FF3D9A 50%, #FF6B5C 100%);
  /* viñeta de fondo de página (overlay sutil que ilumina/aclara hacia el centro) */
  --grad-vignette: radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.45) 0%, transparent 55%);
```

> Nota sobre `--grad-text` en clave clara: la versión rosa→coral pura quedaría poco legible sobre lavanda; por eso arranca en magenta saturado `#C026D3` para asegurar contraste del wordmark sobre el fondo claro.

### 2.6 Glow y sombras (reemplazan la box-shadow dura `0 6px 0`)

> Lovable usa una sombra de foco difusa y grande; nosotros la coloreamos. **Nunca** sombras de offset duro tipo neo-brutalismo. Sobre fondo claro, los glows de color son ligeramente más translúcidos para no ensuciar el lienzo; la sombra de card aporta una pizca de morado en lugar de negro puro.

```css
  --glow-primary:   0 8px 32px rgba(255, 61, 154, 0.42);   /* CTA hover/focus */
  --glow-primary-sm:0 4px 16px rgba(255, 61, 154, 0.32);   /* CTA reposo */
  --glow-violet:    0 8px 32px rgba(139, 92, 246, 0.40);
  --glow-yes:       0 6px 24px rgba(45, 212, 167, 0.40);
  --glow-no:        0 6px 24px rgba(255, 77, 109, 0.40);
  --glow-card:      0 16px 40px rgba(120, 60, 160, 0.18);   /* profundidad de card (sombra morada suave, no negra) */
  --glow-card-rest: 0 8px 24px rgba(120, 60, 160, 0.12);    /* card en reposo, más sutil */
  --glow-poster:    0 24px 70px rgba(255, 61, 154, 0.42);   /* halo del póster héroe */
  --ring-focus:     0 0 0 3px rgba(255, 61, 154, 0.50);     /* focus-visible ring */
```

### 2.7 Radios, blur y capas

```css
  --r-sm:    10px;   /* elementos compactos, search-list items */
  --r-md:    16px;   /* inputs, selects, banners */
  --r-lg:    24px;   /* cards normales */
  --r-xl:    32px;   /* cards hero / scene de mascota */
  --r-pill:  9999px; /* TODOS los botones, chips, pills, rating */
  --blur:    16px;   /* backdrop-filter de las cards de vidrio */

  --z-bg: 0; --z-content: 10; --z-toast: 100; --z-confetti: 90;
```

### 2.8 Aplicación base (sustituye `body` actual)

```css
body {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: var(--ink);
  background:
    var(--grad-vignette),
    linear-gradient(160deg, var(--c-bg) 0%, var(--c-bg-2) 52%, var(--c-bg-3) 100%);
  background-attachment: fixed;
  -webkit-font-smoothing: antialiased;
  min-height: 100%;
}
```

Los **blobs de gradiente animados** (en clave clara/saturada) van en un pseudo-elemento de fondo (ver §7.7), no en el `body` directamente.

---

## 3. Tipografía

**Decisión: cambiar fuentes.** Lilita One es demasiado pesada/condensada y solo va en mayúsculas; choca con la calidez redonda que buscamos. Se sustituye por:

- **Display:** `Fredoka` — sans redonda, geométrica, amigable y "pop", con eje de peso (300–700). Es la personalidad de marca, equivalente al rol de Camera Plain en Lovable y Aeonik en Revolut, pero juguetona.
- **Texto/UI:** `Plus Jakarta Sans` — sans humanista muy legible con buen ritmo, sustituye a Nunito.

### 3.1 `<link>` exacto para `client/index.html` (reemplaza la línea 11)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

> También actualizar `<meta name="theme-color" content="#F3E9FF">` (línea 7).

### 3.2 Familias

```css
--font-display: 'Fredoka', system-ui, sans-serif;
--font-body:    'Plus Jakarta Sans', system-ui, sans-serif;
```

### 3.3 Jerarquía completa

| Rol | Fuente | Size (clamp) | Peso | Line-height | Tracking | Notas |
|-----|--------|--------------|------|-------------|----------|-------|
| **Brand (wordmark MOVIS)** | Fredoka | `clamp(2.8rem, 9vw, 5rem)` | 700 | 0.95 | `-0.04em` | Relleno con `--grad-text` (ver §3.4). NO mayúsculas forzadas. |
| **H1 / Display** | Fredoka | `clamp(2.2rem, 6vw, 3.6rem)` | 600 | 1.02 | `-0.035em` | Títulos de paso/pantalla, color `--ink` |
| **H2 / Sección** | Fredoka | `clamp(1.5rem, 4vw, 2.2rem)` | 600 | 1.08 | `-0.02em` | Títulos de card, color `--ink` |
| **H3 / Subtítulo card** | Fredoka | `clamp(1.15rem, 3vw, 1.4rem)` | 500 | 1.15 | `-0.01em` | color `--ink` |
| **Label** | Fredoka | `0.8rem` (12.8px) | 600 | 1.2 | `0.06em` | MAYÚSCULAS (`text-transform: uppercase`), color `--ink-55` |
| **Body** | Plus Jakarta Sans | `1rem` (16px) | 400 | 1.55 | `0` | Texto base, color `--ink` / `--ink-70` |
| **Body Large / Subtitle** | Plus Jakarta Sans | `clamp(1.05rem, 2.5vw, 1.2rem)` | 500 | 1.5 | `0` | Bajada del hero, color `--ink-70` |
| **Button** | Fredoka | `1.05rem` (16.8px) | 600 | 1 | `0.01em` | NO mayúsculas; capitalización normal |
| **Button small** | Fredoka | `0.9rem` | 600 | 1 | `0.01em` | |
| **Caption / muted** | Plus Jakarta Sans | `0.85rem` (13.6px) | 500 | 1.4 | `0` | color `--ink-55` |
| **Rating número** | Fredoka | `1rem` | 700 | 1 | `0` | dentro del badge |

### 3.4 Reglas y recetas

- **Tracking negativo a tamaño display** (regla universal de top-tier systems): de `-0.04em` (brand) a `-0.02em` (H2). El cuerpo va a `0`.
- **Sin mayúsculas forzadas en títulos** (a diferencia del CSS actual). Solo `.label` va en uppercase con tracking positivo `0.06em`.
- **Sin `text-shadow` de offset duro** (eliminar los `text-shadow: 0 4px 0 …` actuales). La profundidad del texto viene del gradiente y del color tinta sobre el lienzo claro.
- **Texto con relleno de gradiente** (brand y números grandes):
  ```css
  .grad-text {
    background: var(--grad-text);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  ```
- Encabezados (`h1,h2,h3`) por defecto: `font-family: var(--font-display); color: var(--ink); margin: 0 0 .4em;` Quitar el `color: var(--primary)` y el `text-transform: uppercase` globales actuales.

---

## 4. Radios, sombras y glow

### 4.1 Escala de border-radius (ver tokens §2.7)

| Token | Valor | Uso |
|-------|-------|-----|
| `--r-sm` | 10px | items de lista de búsqueda, mini-thumbs |
| `--r-md` | 16px | inputs, selects, error-banner, share-box |
| `--r-lg` | 24px | cards estándar |
| `--r-xl` | 32px | card hero, `.scene` de la mascota, póster del resultado |
| `--r-pill` | 9999px | **todos** los botones, chips, pills de participante, rating, toast |

> Regla Revolut: pill-everything en lo accionable. Regla Lovable: cards muy redondeadas. Nunca radios < 10px salvo thumbnails diminutos.

### 4.2 Sistema de elevación/glow (5 niveles)

| Nivel | Token / valor | Cuándo |
|-------|---------------|--------|
| 0 — Plano | sin sombra | fondo de página, texto |
| 1 — Borde + sombra suave | `1px solid var(--c-border)` + `--glow-card-rest` (+ `backdrop-filter: blur(var(--blur))`) | cards en reposo. La frontera es el borde fino; una sombra morada muy suave la despega del fondo claro. |
| 2 — Glow reposo | `--glow-primary-sm` o `--glow-card` | CTA en reposo, card destacada |
| 3 — Glow hover | `--glow-primary` / `--glow-violet` / `--glow-yes` / `--glow-no` | hover/activo de botones y chips seleccionados |
| 4 — Halo héroe | `--glow-poster` | póster del resultado, mascota en momentos clave |
| Focus | `--ring-focus` (`box-shadow: 0 0 0 3px rgba(255,61,154,.50)`) | `:focus-visible` en cualquier control |

**Filosofía:** cero sombras de offset duro (`0 6px 0`) — se eliminan del todo. La profundidad es **glow de color difuso** (Lovable difuso + Revolut contraste de color). Sobre fondo claro, las cards necesitan una sombra base suave (morada, no negra) para despegarse del lienzo; los acentos llevan glow de su propio color. El glow siempre comparte el color del elemento que rodea (un chip SÍ verde tiene glow verde, etc.).

---

## 5. Componentes (specs detalladas, todos los estados)

> Convención de estados para todos: **default · hover · active · focus-visible · disabled** (y los específicos: loading/error/empty/selected donde aplique).
> Transición base común: `transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease, background .2s ease, opacity .15s ease;`

### 5.1 Botón primario (CTA glow) — `button` / `.btn`

```
Forma:    pill (--r-pill)
Fuente:   Fredoka 600, 1.05rem, tracking .01em, capitalización normal
Padding:  16px 32px   (móvil mínimo: garantiza min-height 52px)
Min:      min-height 52px (≥44px táctil holgado)
```
- **Default:** `background: var(--grad-primary); color: var(--ink-on-dark); border: none; box-shadow: var(--glow-primary-sm);`
- **Hover:** `transform: translateY(-2px) scale(1.02); box-shadow: var(--glow-primary);` + animación `pulse-glow` opcional en CTAs principales (§7.3).
- **Active:** `transform: translateY(0) scale(.98); box-shadow: var(--glow-primary-sm); filter: brightness(.95);`
- **Focus-visible:** `outline: none; box-shadow: var(--glow-primary-sm), var(--ring-focus);`
- **Disabled:** `opacity: .45; filter: grayscale(.3); cursor: not-allowed; pointer-events: none; box-shadow: none; transform: none;`
- **Loading:** texto sustituido por spinner (§8.7) o puntos `…`; `pointer-events: none; opacity: .85;` Mantener ancho (no saltar).

### 5.2 Botón secundario (vidrio claro) — `.btn.secondary`

- **Default:** `background: var(--c-surface-2); color: var(--c-violet-deep); border: 1px solid var(--c-border-strong); backdrop-filter: blur(var(--blur)); box-shadow: var(--glow-card-rest);`
- **Hover:** `background: var(--c-surface-solid); border-color: var(--c-violet); color: var(--c-violet-deep); box-shadow: var(--glow-violet); transform: translateY(-2px);`
- **Active:** `transform: translateY(0) scale(.98);`
- **Focus-visible:** `box-shadow: var(--ring-focus);`
- **Disabled:** igual patrón que primario.
- Uso: "Otra recomendación", acciones de igual peso que el primario.

### 5.3 Botón ghost — `.btn.ghost`

- **Default:** `background: transparent; color: var(--ink-70); border: 1px solid var(--c-border-strong); box-shadow: none;`
- **Hover:** `color: var(--ink); border-color: var(--c-violet); background: var(--c-surface);`
- **Active:** `transform: scale(.98);`
- **Focus-visible:** `box-shadow: var(--ring-focus);`
- Uso: "Atrás", "Ya la vi", acciones terciarias.

### 5.4 Pill de icono (icon button) — `.btn-icon`

```
Forma:  círculo pill, 48×48px (mín 44)
```
- **Default:** `width:48px;height:48px;border-radius:var(--r-pill); display:grid;place-items:center; background:var(--c-surface-2); border:1px solid var(--c-border); color:var(--c-violet-deep); box-shadow: var(--glow-card-rest);`
- **Hover:** `background:var(--c-surface-solid); box-shadow:var(--glow-violet); transform: scale(1.06);`
- **Active:** `transform: scale(.94);`
- Icono interior: SVG 22px, `stroke: currentColor` (ver §8).

### 5.5 Input / Select — `input[type=text|number]`, `select`

```
Forma:  --r-md (16px)
Fuente: Plus Jakarta Sans 500, 1rem
Padding:14px 18px ; width:100% ; min-height 52px
```
- **Default:** `background: var(--c-input-bg); border: 1px solid var(--c-border-strong); color: var(--ink); backdrop-filter: blur(var(--blur)); outline: none;`
- **Placeholder:** `color: var(--ink-40);`
- **Hover:** `border-color: var(--c-violet);`
- **Focus:** `border-color: var(--c-primary); box-shadow: var(--ring-focus);`
- **Error:** `border-color: var(--c-error); box-shadow: 0 0 0 3px rgba(224,49,79,.25);`
- **Disabled:** `opacity:.5; cursor:not-allowed;`
- `select`: misma base + chevron SVG inline como `background-image` (ver §8), `appearance: none; padding-right: 42px;`.

### 5.6 Card burbuja — `.card`

```
Forma:  --r-lg (24px) ; --r-xl en hero
Padding:24px (móvil 20px)
```
- **Default:** `background: var(--c-surface); border: 1px solid var(--c-border); backdrop-filter: blur(var(--blur)); box-shadow: var(--glow-card-rest);`
- **Entrada:** animación `card-in` (§7.1) al montar.
- **Hover (solo cards interactivas, p.ej. resultado):** `background: var(--c-surface-2); border-color: var(--c-border-strong); box-shadow: var(--glow-card); transform: translateY(-3px);`
- No usar borde negro grueso (eliminar `border:3px solid var(--ink)`). No usar blanco puro opaco como fondo de card (usar `--c-surface` translúcido para que el wash de color se transparente).
- **Variante destacada `.card.glow`:** añade un halo de color: `box-shadow: var(--glow-card), 0 0 60px rgba(255,61,154,.20);`

### 5.7 Chip de género — `.chip`

```
Forma:  pill (--r-pill)
Fuente: Plus Jakarta Sans 700, .95rem
Padding:12px 18px ; min-height 44px ; gap 8px (para icono)
```
- **Neutro (default):** `background: var(--c-surface-2); color: var(--ink-90); border: 1px solid var(--c-border-strong); cursor: pointer;`
- **Hover (neutro):** `transform: translateY(-2px) scale(1.03); border-color: var(--c-violet); background: var(--c-surface-solid); box-shadow: var(--glow-card-rest);`
- **Seleccionado SÍ (`.chip.yes`):** `background: var(--grad-yes); color:#04241C; border-color: transparent; box-shadow: var(--glow-yes);` + icono check (§8) a la izquierda; micro-animación `chip-pop` (§7.6).
- **Seleccionado NO (`.chip.no`):** `background: var(--grad-no); color: var(--ink-on-dark); border-color: transparent; box-shadow: var(--glow-no); text-decoration: line-through; text-decoration-thickness: 2px;` + icono x (§8).
- **Disabled (límite 3 alcanzado):** `opacity: .4; cursor: not-allowed; transform: none; box-shadow: none; filter: grayscale(.4);`
- **Active (tap):** `transform: scale(.95);`
- **Focus-visible:** `box-shadow: var(--ring-focus);`

> Nota de implementación: el toggle ya quita el chip del set opuesto (lógica en `Wizard.jsx`); aquí solo definimos el aspecto por clase.

### 5.8 Pill de participante — `.pill`

```
Forma:  pill ; Plus Jakarta Sans 700, .9rem ; padding 8px 14px 8px 8px ; gap 8px ; min-height 40px
```
- **No listo (default):** `background: var(--c-surface-2); border: 1px solid var(--c-border-strong); color: var(--ink-70);` + avatar circular de inicial a la izquierda (24px, fondo `--grad-primary`, texto `var(--ink-on-dark)` Fredoka 600) + spinner mini o "…" al final.
- **Listo (`.pill.ready`):** `background: var(--grad-yes); color:#04241C; border-color: transparent; box-shadow: var(--glow-yes);` + icono check al final; animación `chip-pop` al pasar a ready.
- **"(tú)":** se renderiza el sufijo en `--ink-55`, peso 500.

### 5.9 Progress stepper — `.progress`

```
Layout: flex, gap 8px, justify center
```
- Cada paso: `span { width: 44px; height: 8px; border-radius: var(--r-pill); }`
  - **Pendiente:** `background: var(--c-border-strong);`
  - **Actual (`.on`):** `background: var(--grad-primary); box-shadow: var(--glow-primary-sm);` + animación `pulse-glow` lenta.
  - **Hecho (`.done`):** `background: var(--c-success);`
- Mejora: encima del stepper, mostrar `Paso X de 4 · <nombre del paso>` en `.label`. Transición entre pasos con `step-out`/`step-in` (§7.1).

### 5.10 Share-box — `.share-box`

```
Forma:  pill (--r-pill) contenedor ; padding 6px 6px 6px 18px
```
- **Contenedor:** `display:flex; align-items:center; gap:8px; background: var(--c-input-bg); border: 1px solid var(--c-border-strong); backdrop-filter: blur(var(--blur)); box-shadow: var(--glow-card-rest);`
- **Input interno:** `border:none; background:transparent; color:var(--ink-70); font-family: var(--font-body); font-weight:600;` (truncar con `text-overflow: ellipsis; overflow:hidden;`).
- **Botón copiar:** botón primario pequeño (pill) con icono "copiar" + texto.
  - **Default:** "Copiar".
  - **Copiado (feedback):** cambia a "¡Copiado!" con icono check, `background: var(--grad-yes); color:#04241C; box-shadow: var(--glow-yes);` durante 1.5s + dispara toast. Micro-animación `chip-pop`.

### 5.11 Search-list (favoritas) — `.search-list`

```
Lista: flex column, gap 8px, max-height 320px, overflow-y auto, scroll suave
```
- **Item (`li`):** `display:flex; gap:12px; align-items:center; padding:8px; border-radius: var(--r-sm); background: var(--c-surface); border: 1px solid var(--c-border-faint); cursor:pointer;`
- **Hover:** `background: var(--c-surface-2); border-color: var(--c-border-strong); transform: translateX(2px);`
- **Thumb póster:** `width:44px;height:66px;object-fit:cover;border-radius:8px; background: var(--c-surface-2);`
- **Texto:** título Plus Jakarta 700 `--ink`, año `--ink-55`.
- **Scrollbar:** estilizar `::-webkit-scrollbar { width:8px } ::-webkit-scrollbar-thumb { background: var(--c-border-strong); border-radius: 9999px }`.
- **Empty (sin resultados con query activa):** texto `--ink-55` centrado "Nada por aquí… prueba otro título".

### 5.12 Fav chips (favoritas seleccionadas) — `.fav`

```
Forma:  pill ; padding 6px 8px 6px 14px ; gap 8px ; Plus Jakarta 700 .9rem
```
- **Default:** `background: var(--grad-primary); color: var(--ink-on-dark); box-shadow: var(--glow-primary-sm);` (sin borde).
- **Botón quitar `.x`:** círculo 20px, `background: rgba(255,255,255,.28); color: var(--ink-on-dark); border-radius:50%; display:grid;place-items:center;` icono x 12px; hover `background: rgba(255,255,255,.45)`. Target táctil real ≥24px (usar padding invisible).
- **Entrada:** `chip-pop` al añadir; salida `chip-out` al quitar.

### 5.13 Rating badge — `.rating`

```
Forma:  pill ; padding 6px 14px ; gap 6px ; Fredoka 700 1rem
```
- **Default:** `background: rgba(245,166,35,.16); border: 1px solid rgba(245,166,35,.45); color: var(--c-warning);` + icono estrella (fill `--c-gold-soft`) a la izquierda.
- Voto count: `<small>` en `--ink-55`, peso 500.
- Es el **único** uso del dorado en superficie de UI. El número de rating usa el ámbar oscuro `--c-warning` (`#C77800`) para ser legible sobre el chip claro; la estrella sí va en dorado vivo.

### 5.14 Error-banner — `.error-banner`

```
Forma:  --r-md ; padding 14px 18px ; Plus Jakarta 700 ; gap 10px
```
- **Default:** `background: rgba(224,49,79,.10); border: 1px solid rgba(224,49,79,.45); color: var(--c-error-deep);` + icono alerta a la izquierda.
- **Entrada:** `shake` corto (§7) + `card-in`.

### 5.15 Toast — `.toast`

```
Forma:  pill ; padding 14px 22px ; Plus Jakarta 700 ; gap 10px
Posición: fixed; bottom: 24px; left:50%; translateX(-50%); z-index: var(--z-toast)
```
- **Default:** `background: rgba(255,255,255,.92); border: 1px solid var(--c-border-strong); color: var(--ink); backdrop-filter: blur(var(--blur)); box-shadow: var(--glow-card);` + icono contextual (check para "copiado", info para avisos).
- **Entrada/salida:** `toast-in` (slide-up + fade) / `toast-out`. TTL 2500ms (ya implementado en `Toast.jsx`).
- **Variantes:** `.toast.success` borde/icono verde `--c-success`; `.toast.error` rojo `--c-error`.

---

## 6. Vistas / flujos

Estructura común (`.app` / `.shell`): contenedor centrado, `max-width: 560px` para flujos de formulario, `max-width: 820px` para el resultado (póster + meta). Padding lateral 20px móvil, 24px desktop. Header simple: solo el `Brand` centrado arriba (no hay nav). Fondo de blobs claros §7.7 detrás de todo.

### 6.1 Landing

- **Hero:** `Brand` (wordmark con `--grad-text`) → `.scene` con la **mascota animada** (palomitas, §8.9) sobre un halo `--grad-glow` que respira (`breathe`, §7) → subtítulo en `--ink-70`.
- **`.scene`:** card hero `--r-xl`, fondo `--c-surface` (vidrio claro), con el halo radial de color detrás de la mascota. La mascota hace `bounce` suave en loop.
- **Card de formulario:** input de nombre + grupo "¿Cuántos sois?" (Yo solo / En pareja / En grupo) como **3 chips/segmented pills** (no botones rectangulares); el seleccionado usa `--grad-primary` + glow. CTA "¡Movis!" primario con `pulse-glow`.
- **Micro-UX:** al pulsar "¡Movis!" → estado loading en el botón (spinner) → transición a la sala. Si error, `error-banner` con `shake`.

### 6.2 Wizard (4 pasos)

- **Cabecera del wizard:** `ShareBox` (si no es solo) → stepper §5.9 con etiqueta "Paso X de 4 · Nombre".
- **Transición entre pasos:** el card del paso saliente hace `step-out` (fade + slide-left + ligero scale-down), el entrante `step-in` (slide-right→0 + fade-in). Duración 280ms, easing `cubic-bezier(.34,1.56,.64,1)`.
- **Paso 1 — NO géneros:** título H2 "¿Qué NO te apetece?", chips neutros; al seleccionar → `.chip.no` (rojo, tachado, glow rojo) con `chip-pop`. Contador `0/3` → al llegar a 3, los no seleccionados pasan a `disabled` y el botón Siguiente se activa con un `pulse-glow` de invitación.
- **Paso 2 — SÍ géneros:** idéntico patrón con `.chip.yes` (verde, glow verde). Mostrar de fondo, en `--ink-40`, los que se descartaron en el paso 1 ya no aparecen (lógica existente).
- **Paso 3 — Favoritas:** input de búsqueda + `search-list` con thumbs; al añadir, `fav` chips con `chip-pop`. Texto "Opcional, puedes saltar".
- **Paso 4 — Extras:** selects (idioma/región) + inputs numéricos (año/duración/nota) + chips de plataformas (logo + nombre, estado `yes` al activar). Layout de campos en grid 2–3 columnas que colapsa a 1 en móvil.
- **Footer de navegación:** "Atrás" (ghost) + "Siguiente"/"¡Listo!" (primario). Botón deshabilitado mientras no se cumple `canAdvance`.
- **Micro-UX:** confeti pequeño (3-4 partículas) al completar el conteo 3/3 de cada paso de géneros (opcional, muy sutil). Botón "¡Listo!" del paso 4 dispara la transición a Waiting.

### 6.3 Waiting / loader

- `Brand` + `.scene` con la **mascota bailando** (`bounce` más enérgico, palomitas saltando) sobre halo `--grad-glow` que pulsa.
- **Frase rotatoria** (ya existe el array) en H2 con `--grad-text`, cambia cada 1.8s con un `fade` cruzado.
- **Baile `.dance`:** sustituir los cuadrados con borde negro por **palomitas/puntos** redondos que rebotan; cada uno con un color de la tríada (rosa, violeta, coral, menta) y glow propio. `bounce` con delays escalonados (ya existe el patrón; actualizar colores y quitar bordes).
- **Barra de progreso de participantes:** además del texto "X de Y listos", añadir una **barra pill** con pista `--c-surface-2` (borde `--c-border`) que se llena (`width: ready/total %`) con `--grad-yes` y transición suave; debajo, las `pill` de participantes (ready/no-ready, §5.8).
- **Micro-UX:** cuando todos están listos, breve flash de glow en la barra antes de pasar a Result.

### 6.4 Result (la celebración)

- `Brand` pequeño arriba → H2 "¡Os toca ver!" con `--grad-text`.
- **Layout:** grid `minmax(0, 260px) 1fr` (póster | meta); colapsa a 1 columna centrada < 640px.
- **Póster héroe:** `--r-xl`, con **halo `--glow-poster`** detrás (el póster brilla con luz de color sobre el lienzo claro, como un foco). Entrada con `poster-reveal` (scale 0.9→1 + fade + glow que crece).
- **Meta:** título Fredoka 600 `--ink` + año en `--ink-55`; `rating` badge dorado; sinopsis en `--ink-70`; botones "Otra recomendación" (secundario) + "Ya la vi" (ghost); link "Más info en TMDB →" en `--c-violet-deep`.
- **CONFETI:** al aparecer una recomendación (match), lanzar confeti desde el centro-arriba con colores de la tríada + dorado (§7.5, §8). Es el momento de máxima celebración.
- **Estado sin match:** card centrada con icono "lupa triste"/mascota encogida, texto "Sin más coincidencias con vuestros filtros. Probad relajando alguno." + botón "Otra vuelta". Sin confeti.
- **Botones "otra"/"ya la vi":** al pulsar, transición de salida del póster (`poster-out`: fade + scale-down) y vuelta a Waiting con la mascota buscando.

### 6.5 Resumen de micro-mejoras de UX

1. Feedback de copiado de link (botón → "¡Copiado!" verde + toast).
2. Animación `chip-pop` al marcar cualquier chip/fav/participante-ready.
3. Confeti en match (Result) y mini-confeti al completar 3/3 (Wizard).
4. Botón primario con `pulse-glow` cuando es la acción esperada (invita a pulsar).
5. Halo de color que respira detrás de la mascota y del póster (vida sin ruido).
6. Barra de progreso de participantes en Waiting (sensación de "casi listos").
7. `shake` en error-banner para llamar la atención sin ser agresivo.

---

## 7. Animaciones (keyframes concretos)

> Variables de timing recomendadas:
> ```css
> --ease-bounce: cubic-bezier(.34, 1.56, .64, 1);   /* overshoot juguetón */
> --ease-smooth: cubic-bezier(.4, 0, .2, 1);
> ```
> **Todas** las animaciones se desactivan bajo `prefers-reduced-motion` (§11).

### 7.1 Entrada de cards y transición de pasos

```css
@keyframes card-in {
  from { opacity: 0; transform: translateY(16px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.card, .scene { animation: card-in .45s var(--ease-bounce) both; }

@keyframes step-in  { from { opacity:0; transform: translateX(28px); } to { opacity:1; transform: translateX(0); } }
@keyframes step-out { from { opacity:1; transform: translateX(0); }    to { opacity:0; transform: translateX(-28px); } }
/* aplicar .step-in / .step-out al wrapper del paso; 280ms var(--ease-bounce) */
```

### 7.2 Bounce de la mascota

```css
@keyframes mascot-bounce {
  0%,100% { transform: translateY(0) rotate(0); }
  30%     { transform: translateY(-10px) rotate(-2deg); }
  60%     { transform: translateY(-4px)  rotate(2deg); }
}
.mascot { animation: mascot-bounce 2.4s var(--ease-smooth) infinite; transform-origin: 50% 100%; }
/* En Waiting, versión enérgica: 1.2s y -16px */
```

### 7.3 Pulso/glow de botón primario (acción esperada)

```css
@keyframes pulse-glow {
  0%,100% { box-shadow: var(--glow-primary-sm); }
  50%     { box-shadow: var(--glow-primary); }
}
.btn.cta-attention { animation: pulse-glow 2s var(--ease-smooth) infinite; }
```

### 7.4 Baile del loader (.dance)

```css
@keyframes dance-bounce {
  0%,100% { transform: translateY(0)    scale(1); }
  50%     { transform: translateY(-22px) scale(1.15); }
}
.dance span { animation: dance-bounce .9s var(--ease-bounce) infinite; }
.dance span:nth-child(2){ animation-delay:.12s } .dance span:nth-child(3){ animation-delay:.24s }
.dance span:nth-child(4){ animation-delay:.36s } .dance span:nth-child(5){ animation-delay:.48s }
/* cada span: 16px círculo, color de la tríada, box-shadow glow del propio color, sin borde */
```

### 7.5 Aparición del resultado + confeti

```css
@keyframes poster-reveal {
  0%   { opacity:0; transform: scale(.9) translateY(12px); box-shadow: 0 0 0 rgba(255,61,154,0); }
  60%  { opacity:1; }
  100% { opacity:1; transform: scale(1) translateY(0); box-shadow: var(--glow-poster); }
}
.result .poster { animation: poster-reveal .6s var(--ease-bounce) both; }

@keyframes poster-out { to { opacity:0; transform: scale(.94); } }

/* Confeti: partículas absolutas que caen y giran */
@keyframes confetti-fall {
  0%   { opacity:1; transform: translateY(-20px) rotate(0deg); }
  100% { opacity:0; transform: translateY(60vh) rotate(720deg); }
}
/* cada partícula: 8–12px, color aleatorio de [rosa, violeta, coral, menta, dorado],
   border-radius variable (círculo o rectángulo), delay/duración 1.2–2s aleatorios.
   Generar 24–40 partículas. Ver §8.10 para implementación recomendada. */
```

### 7.6 Pop de chips / pills al seleccionar

```css
@keyframes chip-pop {
  0%   { transform: scale(1); }
  45%  { transform: scale(1.12); }
  100% { transform: scale(1); }
}
.chip.yes, .chip.no, .pill.ready, .fav { animation: chip-pop .3s var(--ease-bounce); }
```

### 7.7 Gradiente de fondo animado (blobs claros + sparkles)

```css
/* Pseudo-elemento de fondo a pantalla completa, detrás del contenido.
   Blobs saturados PERO suaves sobre el lienzo claro: tiñen sin oscurecer. */
.app::before {
  content: ""; position: fixed; inset: -20%; z-index: var(--z-bg); pointer-events: none;
  background:
    radial-gradient(40% 40% at 20% 25%, rgba(139,92,246,.35), transparent 60%),
    radial-gradient(45% 45% at 80% 20%, rgba(255,61,154,.30), transparent 60%),
    radial-gradient(40% 40% at 60% 85%, rgba(255,107,92,.28), transparent 60%);
  filter: blur(40px);
  animation: blob-drift 22s var(--ease-smooth) infinite alternate;
}
@keyframes blob-drift {
  0%   { transform: translate(0,0)      scale(1); }
  50%  { transform: translate(3%, -2%)  scale(1.08); }
  100% { transform: translate(-2%, 3%)  scale(1.04); }
}
```
Halo que respira detrás de mascota/póster:
```css
@keyframes breathe { 0%,100%{ opacity:.7; transform:scale(1);} 50%{ opacity:1; transform:scale(1.06);} }
.glow-halo { background: var(--grad-glow); filter: blur(8px); animation: breathe 4s var(--ease-smooth) infinite; }
```
Sparkles decorativos del fondo (capa opcional sobre `.app::after`, muy sutil):
```css
/* puntos/destellos blancos y dorados muy tenues que titilan, dispersos por el lienzo;
   reutiliza el keyframe twinkle de §8.4. Refuerzan la sensación de "fiesta brillante". */
```

### 7.8 Otros

```css
@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
@keyframes toast-in  { from{opacity:0;transform:translate(-50%,20px)} to{opacity:1;transform:translate(-50%,0)} }
@keyframes spin      { to { transform: rotate(360deg); } }
@keyframes fade      { from{opacity:0} to{opacity:1} }   /* frase del loader */
```

**Tabla resumen de animaciones**

| Nombre | Duración | Easing | Uso |
|--------|----------|--------|-----|
| `card-in` | 450ms | bounce | montaje de cards/scene |
| `step-in`/`step-out` | 280ms | bounce | transición entre pasos del wizard |
| `mascot-bounce` | 2400ms (loop) | smooth | mascota en Landing |
| `pulse-glow` | 2000ms (loop) | smooth | CTA esperado, stepper actual |
| `dance-bounce` | 900ms (loop) | bounce | loader |
| `poster-reveal` | 600ms | bounce | póster del resultado |
| `confetti-fall` | 1200–2000ms | linear | celebración del match |
| `chip-pop` | 300ms | bounce | seleccionar chip/fav/ready |
| `blob-drift` | 22000ms (loop) | smooth | fondo |
| `breathe` | 4000ms (loop) | smooth | halo de mascota/póster |
| `shake` | 400ms | — | error-banner |
| `toast-in` | 250ms | smooth | toast |

---

## 8. Iconos y assets

**Sin librería de iconos.** Set propio de SVG inline. Crear `client/src/components/Icon.jsx` con un mapa `name → path`, render como:

```jsx
// <Icon name="star" size={20} />  -> SVG stroke con currentColor
// Reglas: viewBox "0 0 24 24", stroke-width 2, stroke-linecap/linejoin round,
// fill "none" salvo iconos sólidos (star, check-circle). Color SIEMPRE via currentColor.
```

### 8.1 Lista de iconos necesarios

| Nombre | Estilo | Uso |
|--------|--------|-----|
| `play` | fill currentColor (triángulo) | acentos, favicon, CTA cine |
| `popcorn` | stroke + detalles fill | mascota mini, loader, vacío |
| `star` | **fill** `--c-gold-soft` | rating badge |
| `check` | stroke | chip SÍ, copiado, ready |
| `x` | stroke | chip NO, quitar fav, cerrar |
| `copy` | stroke | botón copiar |
| `share` | stroke | compartir link |
| `arrow-right` | stroke | "Siguiente", links TMDB |
| `arrow-left` | stroke | "Atrás" |
| `users` | stroke | "En grupo", participantes |
| `user` | stroke | "Yo solo" |
| `heart` | stroke/fill | favoritas |
| `search` | stroke | input de búsqueda de pelis |
| `clock` | stroke | filtro duración |
| `calendar` | stroke | filtro año |
| `sparkle` | fill | decoración, confeti |
| `alert` | stroke | error-banner |
| `chevron-down` | stroke | selects |
| `info` | stroke | toasts informativos |
| `refresh` | stroke | "Otra recomendación / Otra vuelta" |

> Plataformas (Netflix, Prime, Disney+…): se pintan con su **logo real** que ya llega del API (`p.logo`), en un thumb 22px con `border-radius: 4px`. No replicar logos como SVG propios.

### 8.2 Render base (stroke)

- Tamaño por defecto 20–22px; en botones, 18px; en pills de icono, 22px.
- `stroke: currentColor; stroke-width: 2; fill: none;` (los sólidos: `fill: currentColor`).
- Heredan color del texto del contenedor → un chip SÍ verde tiene su check en color del texto del chip automáticamente.

### 8.3 Chevron del select (inline como background)

```css
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%232A1B3D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 16px center;
}
```

> El chevron usa la tinta morada `#2A1B3D` (no blanco) para ser visible sobre el input claro.

### 8.4 Mejoras a la mascota de palomitas (`Mascot.jsx`)

La mascota actual (dos cubos de palomitas con cara, en un sofá, con bordes negros gruesos) es buena de concepto pero "neo-brutalista". Mejorarla así:

1. **Quitar los strokes negros gruesos de 3px** → usar borde fino `1.5px` en `--ink` (morado) solo donde aporte definición, o suprimir bordes y definir por color. (Una línea fina morada ahora *sí* aporta definición sobre el lienzo claro y las palomitas blancas.)
2. **Recolorear** a la nueva paleta: cubo izquierdo `--c-primary` (rosa), cubo derecho `--c-violet`; rayas en `#FDFBFF`; palomitas blanco cálido `#FFF7EF` con borde fino morado para que recorten sobre el cubo claro; pintitas de mantequilla en `--c-gold-soft`. Sofá en tonos morados medios/lavanda (`#C9B6F0`, `#A98BE6`) — claros, no oscuros, para integrarse con el lienzo.
3. **Más expresividad / animabilidad:** separar en grupos con `class` para animar por CSS:
   - `.mascot-eye` (parpadeo: animación `blink` cada 4–6s, `scaleY` a 0.1 brevemente).
   - `.mascot-bucket-left` / `.mascot-bucket-right` con `transform-origin` en la base para `bounce` desfasado.
   - `.mascot-kernel` (palomitas sueltas que pueden saltar en el loader).
4. **Añadir un halo** detrás (`--grad-glow`) mediante un `<circle>` con `fill` del gradiente o un div `.glow-halo` posicionado detrás del SVG (la luz de color tiñe el lienzo claro alrededor de la mascota).
5. **Variantes de cara por estado** (prop): `happy` (Landing), `excited` (Result/match), `searching` (Waiting, ojos mirando a los lados con animación), `sad` (sin match, boca invertida). Mantener la API `<Mascot size={...} mood="happy" />`.
6. **Sparkles**: 2–3 `sparkle` pequeños alrededor que titilan (`twinkle`: opacity 0→1→0 con delays); en dorado/rosa para que destaquen sobre el fondo claro.

```css
@keyframes blink   { 0%,92%,100%{transform:scaleY(1)} 96%{transform:scaleY(.1)} }
@keyframes twinkle { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
```

### 8.5 Brand wordmark (`Brand.jsx`)

- "MOVIS" en Fredoka 700 con relleno `--grad-text` (clase `.grad-text`), tracking `-0.04em`, sin mayúsculas forzadas extra (Fredoka ya luce bien en caja alta o normal — usar "Movis" en caps naturales del logo).
- Sublínea "movie matcher" en `.label` (uppercase, tracking 0.06em, `--ink-55`).
- Opcional: un pequeño icono `play`/`popcorn` con glow junto al wordmark.
- **Eliminar** el triple `text-shadow` de offset duro actual.

### 8.6 Assets decorativos

- **Blobs de gradiente** (§7.7): puro CSS, sin imágenes. En clave clara/saturada (tiñen el lienzo, no lo oscurecen).
- **Grano sutil** (opcional, premium): overlay con `background-image` de ruido SVG a baja opacidad (`opacity:.025; mix-blend-mode: multiply;`) sobre `.app::after`, `pointer-events:none`. Da textura "film grain" muy ligera. Nota: sobre fondo claro usar `multiply` (no `overlay`) para que el grano se perciba. No imprescindible.
- **Sparkles**: icono `sparkle` reutilizado en confeti y alrededor de la mascota; tonos dorado/rosa para destacar sobre claro.

### 8.7 Spinner (loading de botones)

```css
/* spinner sobre botón primario (fondo de color saturado) → bordes blancos */
.spinner { width:18px;height:18px;border-radius:50%;
  border:2px solid rgba(255,255,255,.45); border-top-color:#fff;
  animation: spin .7s linear infinite; }
/* spinner sobre superficie clara (pills/inputs) → usar tinta morada */
.spinner.on-light { border-color: rgba(42,27,61,.25); border-top-color: var(--c-primary); }
```

### 8.8 Favicon

Actualizar `client/public/favicon.svg`: cubo de palomitas mini sobre fondo `--grad-primary` redondeado, o el icono `play`+`popcorn`. Mantener legible a 32px.

### 8.9 Confeti — implementación recomendada

Por defecto **CSS puro** (generar N spans absolutos con estilos inline aleatorios, `confetti-fall`, y limpiarlos a los ~2s). Si se busca un efecto más rico con poco coste, se permite la librería ligera **`canvas-confetti`** (~6kb gz) disparada en el `useEffect` que monta el Result. Es la única dependencia externa sugerida; opcional.

---

## 9. Responsive / mobile

> **Mobile-first**: el uso principal es en móvil, pasándose el teléfono entre personas. Diseñar para 360–430px primero.

### 9.1 Breakpoints

| Nombre | Ancho | Cambios clave |
|--------|-------|---------------|
| Mobile S | < 380px | padding lateral 16px; tipografía al mínimo del clamp; grids de filtros a 1 columna |
| Mobile | 380–640px | layout base; resultado en 1 columna (póster arriba, meta debajo, centrado) |
| Tablet | 640–900px | resultado a 2 columnas (póster | meta); filtros del paso 4 a 2 columnas |
| Desktop | > 900px | `max-width` 560px (formularios) / 820px (resultado), centrado; filtros a 3 columnas |

### 9.2 Comportamiento por vista

- **Landing:** mascota `size` ~200 en móvil, ~260 desktop (ya parametrizado). Chips "¿Cuántos sois?" en fila que envuelve.
- **Wizard:** chips de género en `flex-wrap` centrado; en móvil ocupan el ancho cómodo. Stepper full-width. Botones de navegación: en móvil "Atrás" y "Siguiente" en fila, 50/50; el primario más ancho.
- **Waiting:** todo en columna centrada; barra de participantes full-width.
- **Result:** 1 columna en móvil con póster a `max-width: 300px` centrado y halo reducido; 2 columnas desde 640px. Botones "Otra"/"Ya la vi" apilados full-width en móvil.

### 9.3 Targets táctiles

- **Mínimo 44×44px** en todo lo accionable. Botones primarios `min-height: 52px`. Chips `min-height: 44px`. Icon buttons `48×48`. La `.x` de fav chips: visual 20px pero área táctil ≥24px vía padding.

### 9.4 Escalado tipográfico

- Todo en `clamp()` (ver §3.3): el brand baja de 5rem a 2.8rem; H1 de 3.6 a 2.2rem. El cuerpo se mantiene 16px (no bajar de 16px para evitar zoom en iOS en inputs).
- Inputs/selects: `font-size: 16px` mínimo (evita auto-zoom iOS).

### 9.5 Móvil — extras

- `viewport-fit=cover` ya está; respetar `env(safe-area-inset-bottom)` en el toast y en footers de botones: `padding-bottom: max(24px, env(safe-area-inset-bottom));`.
- Reducir intensidad de blobs en móvil (`filter: blur(30px)` y menor opacidad) para no penalizar GPU: `@media (max-width:640px){ .app::before{ filter: blur(28px); opacity:.85 } }`.

---

## 10. Do's & Don'ts (específicos de Movis)

### Do
- **Pill-everything** en lo accionable: botones, chips, pills, rating, toast, share-box → `--r-pill`. Cards muy redondeadas (`--r-lg`/`--r-xl`).
- Usar **glow de color** (difuso, grande) para profundidad y foco; el glow comparte el color del elemento. Sobre el fondo claro el glow se lee como **luz de color** que tiñe el lienzo.
- Mantener el fondo **vibrante claro "fiesta de cine de día"** (lavanda→rosa→coral) con blobs animados muy lentos y sparkles detrás; el contenido siempre sobre cards de vidrio claro translúcido.
- Usar los **3 acentos** (rosa, violeta, coral) y sus gradientes con nombre. Dorado **solo** para rating/sparkles.
- Para *texto* de acento sobre claro, usar las variantes `-deep` (más oscuras y legibles); reservar base/`-soft` para rellenos, glows y fondos.
- Tracking **negativo** en display (-0.04 a -0.02em); cuerpo a 0; labels en mayúsculas con tracking positivo.
- Animar generosamente pero suave (overshoot juguetón con `--ease-bounce`), y siempre respetando `prefers-reduced-motion`.
- Celebrar el match (confeti) y dar feedback de cada acción (chip-pop, "¡Copiado!", barra de progreso).
- Mascota expresiva con variantes de mood y halo de color que respira.

### Don't
- **No** bordes negros gruesos de 3px ni `box-shadow` de offset duro (`0 6px 0`) — era el lenguaje viejo; queda **prohibido**.
- **No** Lilita One / mayúsculas forzadas en todos los títulos ni triple `text-shadow` de offset.
- **No** fondo oscuro "noche de cine"; el lienzo es claro y vibrante (lavanda→rosa→coral). **No** lavanda plana sin wash de gradiente. **No** cards de blanco puro opaco (usar vidrio claro translúcido para que el wash se transparente).
- **No** texto blanco/claro sobre el lienzo claro (la tinta es morada `#2A1B3D`); el blanco solo va sobre superficies de acento saturado (botones, chips de color).
- **No** glow gris/negro: el glow siempre es de color de marca o del estado (sobre claro, una sombra de card lleva una pizca de morado, nunca negro puro).
- **No** introducir un 4º acento ni saturar de dorado la UI (solo rating/sparkles).
- **No** radios pequeños (< 10px) salvo thumbnails diminutos; nada de esquinas vivas.
- **No** animaciones bruscas ni rebotes excesivos en elementos de lectura (texto/sinopsis no rebota).
- **No** mezclar el `box-shadow` de Lovable (negro) tal cual: aquí se colorea siempre.

---

## 11. Accesibilidad

### 11.1 Contraste (objetivo WCAG AA, AAA donde se pueda)

- Texto principal `--ink` (#2A1B3D) sobre `--c-bg` (#F3E9FF): ≈ 13.5:1 → **AAA**. Sobre cards `--c-surface` (blanco glassy) el contraste es aún mayor.
- `--ink-70` sobre fondo: ≈ 9.5:1 → AAA. `--ink-55` sobre fondo: ≈ 6.2:1 → AA (texto normal) / AAA (texto grande). **No usar `--ink-40` para texto legible importante** (solo placeholders/captions decorativos).
- Texto **de acento** (links, énfasis) sobre el lienzo/superficie clara: usar las variantes `-deep` — `--c-primary-deep` (#D81B79) ≈ 5.0:1, `--c-violet-deep` (#6D3FE0) ≈ 5.6:1, `--c-coral-deep` (#E84A3C) ≈ 4.6:1 → **AA**. **Nunca** usar `--c-primary`/`--c-coral` base como texto fino sobre claro (quedan por debajo de 3:1).
- Texto blanco (`--ink-on-dark`) sobre `--grad-primary` (magenta→rosa→coral): el punto más claro (coral #FF6B5C) con blanco ≈ 2.7:1 → **insuficiente**. Por eso el botón usa blanco peso 600 y el ángulo `100deg` mantiene el texto sobre la mitad rosa-magenta (#C026D3/#FF3D9A, contraste ≈ 4.6:1 AA); el glow no afecta a la legibilidad. Verificar que el texto no quede sobre la zona coral pura.
- Chip SÍ (verde menta) usa texto **oscuro** `#04241C` (contraste alto sobre verde claro). Chip NO (rojo) usa **blanco** (contraste suficiente sobre rojo saturado).
- Rating: el número usa ámbar oscuro `--c-warning` (#C77800) sobre el chip dorado translúcido claro → ≈ 4.5:1 AA; la estrella sí va en dorado vivo `--c-gold-soft` (decorativa, acompañada del número). Verificar ≥ 4.5:1 del número.

### 11.2 Foco visible

- **Siempre** `:focus-visible` con anillo: `box-shadow: var(--ring-focus)` (3px, rosa 50%) — nunca `outline: none` sin sustituto. En cards interactivas y links, mismo anillo.
- El anillo de foco es **adicional** al glow de hover (se combinan en el `box-shadow`).
- No depender del color para estado: chips SÍ/NO llevan **icono** (check/x) y el NO va **tachado**, no solo color.

### 11.3 `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
  .app::before, .glow-halo, .mascot { animation: none !important; }
  /* Confeti: no lanzar (comprobar matchMedia en JS antes de generar partículas). */
}
```
- En JS, el componente de confeti debe comprobar `window.matchMedia('(prefers-reduced-motion: reduce)').matches` y **no** dispararse si es true.
- Las transiciones de paso del wizard se reducen a un fade instantáneo bajo reduced-motion.

### 11.4 Semántica y otros

- Botones reales `<button>` con `aria-label` en icon-buttons (p.ej. "Copiar link", "Quitar favorita").
- Inputs con `<label>` asociado (los `.label` actuales deben usar `htmlFor`/`id`).
- Toast con `role="status"` `aria-live="polite"`; error-banner con `role="alert"`.
- Estados de chip: `aria-pressed` para reflejar seleccionado.
- Contraste de iconos: heredan `currentColor`, así que siguen el contraste del texto contenedor.

---

## Apéndice — Bloque `:root` completo listo para pegar

```css
:root {
  /* fondo (vibrante claro — fiesta de cine de día) */
  --c-bg:#F3E9FF; --c-bg-2:#FFE6F4; --c-bg-3:#FFEDE6;
  /* superficies (vidrio claro translúcido) */
  --c-surface:rgba(255,255,255,.72); --c-surface-2:rgba(255,255,255,.88);
  --c-surface-solid:#FFFFFF; --c-input-bg:rgba(255,255,255,.78);
  /* bordes (tinta morada por opacidad) */
  --c-border:rgba(42,27,61,.08); --c-border-strong:rgba(42,27,61,.16); --c-border-faint:rgba(42,27,61,.05);
  /* tinta */
  --ink:#2A1B3D; --ink-90:rgba(42,27,61,.90); --ink-70:rgba(42,27,61,.72);
  --ink-55:rgba(42,27,61,.58); --ink-40:rgba(42,27,61,.42); --ink-on-dark:#FDFBFF;
  /* acentos (base / -deep para texto sobre claro / -soft para fondos) */
  --c-primary:#FF3D9A; --c-primary-deep:#D81B79; --c-primary-soft:#FF7AC0;
  --c-violet:#8B5CF6; --c-violet-deep:#6D3FE0;
  --c-coral:#FF6B5C; --c-coral-deep:#E84A3C;
  --c-gold:#F5A623; --c-gold-soft:#FFC83D;
  /* estados */
  --c-success:#16A98A; --c-success-deep:#0E8A70; --c-success-soft:#2DD4A7;
  --c-error:#E0314F; --c-error-deep:#C01E3C; --c-error-soft:#FF4D6D; --c-warning:#C77800;
  /* gradientes */
  --grad-hero:linear-gradient(160deg,#F3E9FF 0%,#FFE6F4 50%,#FFEDE6 100%);
  --grad-primary:linear-gradient(100deg,#C026D3 0%,#FF3D9A 55%,#FF6B5C 100%);
  --grad-glow:radial-gradient(circle at 50% 40%,rgba(255,61,154,.45) 0%,rgba(139,92,246,.22) 45%,transparent 70%);
  --grad-yes:linear-gradient(120deg,#2DD4A7 0%,#22B8C4 100%);
  --grad-no:linear-gradient(120deg,#FF4D6D 0%,#FF6B5C 100%);
  --grad-text:linear-gradient(100deg,#C026D3 0%,#FF3D9A 50%,#FF6B5C 100%);
  --grad-vignette:radial-gradient(120% 80% at 50% 0%,rgba(255,255,255,.45) 0%,transparent 55%);
  /* glow / sombras (color difuso; card con morado suave, nunca negro puro) */
  --glow-primary:0 8px 32px rgba(255,61,154,.42); --glow-primary-sm:0 4px 16px rgba(255,61,154,.32);
  --glow-violet:0 8px 32px rgba(139,92,246,.40); --glow-yes:0 6px 24px rgba(45,212,167,.40);
  --glow-no:0 6px 24px rgba(255,77,109,.40); --glow-card:0 16px 40px rgba(120,60,160,.18);
  --glow-card-rest:0 8px 24px rgba(120,60,160,.12);
  --glow-poster:0 24px 70px rgba(255,61,154,.42); --ring-focus:0 0 0 3px rgba(255,61,154,.50);
  /* radios / blur / capas */
  --r-sm:10px; --r-md:16px; --r-lg:24px; --r-xl:32px; --r-pill:9999px; --blur:16px;
  --z-bg:0; --z-content:10; --z-toast:100; --z-confetti:90;
  /* fuentes / easing */
  --font-display:'Fredoka',system-ui,sans-serif; --font-body:'Plus Jakarta Sans',system-ui,sans-serif;
  --ease-bounce:cubic-bezier(.34,1.56,.64,1); --ease-smooth:cubic-bezier(.4,0,.2,1);
}
```
