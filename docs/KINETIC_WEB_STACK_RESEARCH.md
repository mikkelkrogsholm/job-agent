# Teknologistack til Jobagentens kinetiske landingpage

Status: Teknisk screening, 2. september 2026. Første frontend er implementeret
med den anbefalede Bun-, TypeScript-, font- og GSAP-kerne. Paper Shaders og
Lenis er bevidst ikke tilføjet, fordi den første browsermåling ikke viste et
behov for dem.

## Beslutning i kort form

Anbefalet første prototype:

- Bun 1.4 som runtime, package manager, dev server, bundler og test runner;
- TypeScript 7.0.2 med separat strict typecheck;
- semantisk HTML og almindelig moderne CSS som basis;
- GSAP 3.15.0 med ScrollTrigger, MotionPathPlugin og SplitText til den
  koreograferede bevægelse;
- native View Transitions og CSS scroll-driven animations som progressive
  enhancements, hvor browserunderstøttelsen er tilstrækkelig;
- `@paper-design/shaders` 0.0.80 som ét isoleret alpha-eksperiment til levende
  papirtekstur eller grain i heroen;
- Newsreader Variable og Manrope Variable som selv-hostede fonte;
- Lenis 1.3.26 kun som et kontrolleret eksperiment, ikke som standardvalg.

Vi bør ikke starte med React, Vite, Three.js, React Three Fiber eller Rive.
Ingen af dem løser et nødvendigt problem i det nuværende design. Arkitekturen
skal gøre det muligt at tilføje eller udskifte hvert animationslag senere.

## Opgaven, teknologien skal løse

Designet kræver følgende konkrete effekter:

1. Jobkort flyder ind langs kurvede baner og samler sig ved samtalekortet.
2. Heroens tekst og handlinger ankommer i en kontrolleret sekvens.
3. Kortene reagerer diskret på markør og touch uden at blive legetøj.
4. Sektioner afsløres med rumlig kontinuitet under scroll.
5. Platformsguiden kan skifte indhold uden et hårdt visuelt spring.
6. Baggrunden må gerne føles levende, men må ikke konkurrere med teksten.
7. Alt skal have en fuld `prefers-reduced-motion`-oplevelse.
8. Siden skal fortsat være forståelig, hvis animation eller WebGL ikke virker.

Primær bruger er en ikke-teknisk jobsøgende. Motion skal forklare retning,
sammenhæng og feedback. Dekorativ bevægelse må ikke forsinke den primære
handling: at vælge en platform og forbinde Jobagenten.

## Anbefalet stack

| Lag | Valg | Aktuel version | Rolle | Risikoniveau |
| --- | --- | ---: | --- | --- |
| Runtime og build | Bun | 1.4.x | HTML-imports, TS/CSS-bundling, HMR, server og tests | Lavt i dette projekt |
| Typesystem | TypeScript | 7.0.2 | Strict typecheck | Lavt; allerede i brug |
| Dokument og styling | HTML + CSS | Browserplatform | Indhold, layout, hover, focus og fallback | Lavt |
| Koreografi | GSAP | 3.15.0 | Timelines, paths, tekst og scroll | Middel |
| Scroll | Native scroll | Browserplatform | Normal navigation og tilgængelighed | Lavt |
| Eksperimentel tekstur | Paper Shaders | 0.0.80 | Ét afgrænset WebGL2-canvas | Højt, bevidst alpha-bet |
| Fonte | Newsreader Variable + Manrope Variable | 5.3.0 | Redaktionel display + læsbar UI | Lavt |
| Valgfrit scroll-lag | Lenis | 1.3.26 | Visuel scroll interpolation | Middel; skal bevise sin værdi |

Versionsoplysningerne er et øjebliksbillede fra npm-registret på datoen ovenfor.
Alle valgte versioner skal låses præcist i prototypen.

## Hvorfor Bun-native og ikke Vite

Bun har nu første-klasses HTML-indgange. En HTML-fil kan importere TypeScript,
CSS, fonte og billeder direkte; Bun bundler, hasher og serverer assets og giver
HMR i development. Det betyder, at siden kan bygges uden et ekstra buildsystem.

Det passer også direkte til projektets eksisterende runtimekrav. Vite 8 er
interessant og bruger nu Rolldown, men dets publicerede engine-krav er Node
`^20.19.0 || >=22.12.0`. Vite kan muligvis køre under Bun, men der er ingen
produktmæssig gevinst ved at gøre kompatibiliteten til endnu et eksperiment.

Kilder:

- [Bun: Fullstack dev server](https://bun.com/docs/bundler/fullstack)
- [Bun: HTML og statiske websites](https://bun.com/docs/bundler/html-static)
- [Bun: TypeScript 6 og 7](https://bun.com/docs/typescript-6)
- [Vite 8-annonce](https://vite.dev/blog/announcing-vite8)

## GSAP som hovedmotor

GSAP 3.15.0 er anbefalingen, fordi designet kræver præcis koreografi på tværs
af flere DOM-elementer, SVG-baner og scrollpositioner.

Planlagt brug:

- `gsap.timeline()` til heroens samlede entré;
- `MotionPathPlugin` til jobkortenes kurvede baner;
- `ScrollTrigger` til sektioner, der ankommer og forlader viewporten;
- `SplitText` på linje- eller ordniveau til herooverskriften;
- `gsap.matchMedia()` til forskellige desktop-, mobil- og reduced-motion-
  forløb;
- GSAP context/cleanup, så animationer kan afmonteres deterministisk.

GSAPs plugins er nu tilgængelige uden betaling, men biblioteket anvender
GreenSocks egen “no charge”-licens og ikke MIT. Licensen skal derfor gemmes og
kontrolleres som en eksplicit release-gate.

Kilder:

- [GSAP på npm](https://www.npmjs.com/package/gsap)
- [GSAP MotionPathPlugin](https://gsap.com/docs/v3/Plugins/MotionPathPlugin/)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)

### Effektbudget for GSAP

GSAP må kun eje de animationer, der kræver en timeline, sti eller synkronisering.
Almindelige hover-, focus- og pressed-states skal fortsat være CSS. Der må ikke
opstå parallelle GSAP- og CSS-animationer på samme transform-property.

## Paper Shaders som alpha-bet

`@paper-design/shaders` 0.0.80 er den mest interessante nye kandidat. Pakken
tilbyder zero-dependency canvas/WebGL2-shaders med TypeScript-typer, blandt
andet PaperTexture, GrainGradient, Dithering og Warp.

Den passer visuelt til mockuppets varme, taktile papirretning. Vi skal bruge
vanilla-pakken, ikke React-wrapperen.

Forsøget afgrænses til én baggrundsflade:

- PaperTexture eller GrainGradient;
- meget lav hastighed og kontrast;
- ingen markørtracking i første version;
- pauser automatisk uden for viewporten;
- statisk CSS-grain som fallback;
- deaktiveres helt ved reduced motion eller utilstrækkelig GPU.

Projektet advarer selv om breaking changes i `0.0.x` og anbefaler en præcis
versionslås. Det er acceptabelt, fordi laget isoleres bag en lille intern
adapter og kan fjernes uden at ændre layout eller indhold.

Kilder:

- [Paper Shaders repository](https://github.com/paper-design/shaders)
- [Paper Shaders dokumentation](https://shaders.paper.design/)
- [Paper Shaders changelog](https://github.com/paper-design/shaders/blob/main/CHANGELOG.md)

## Native browserfunktioner

### CSS scroll-driven animations

CSS `animation-timeline`, `scroll()` og `view()` kan drive enkle reveals og
progression direkte fra browserens animationstimeline. Det er potentielt mere
effektivt end JavaScript på main thread.

Vi bruger dem kun bag `@supports`. GSAP er fallback, hvor identisk timing er
vigtig. Reduced motion skal fjerne timeline-animationen helt.

Kilder:

- [MDN: CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [MDN: animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline)

### View Transition API

Samme-dokument View Transitions er Baseline 2025 og kan give rumlig kontinuitet,
når brugeren skifter mellem Claude- og ChatGPT-guiden. Funktionen skal være en
progressive enhancement; almindeligt DOM-skift er fallback.

Kilde:

- [MDN: Document.startViewTransition](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition)

## Lenis: kun hvis prototypen bliver bedre

Lenis 1.3.26 er aktivt vedligeholdt, TypeScript-baseret, MIT-licenseret og har
ingen dependencies. Det har en dokumenteret integration med GSAP ScrollTrigger.

Det er stadig ikke et automatisk valg. Native scrolling har den bedste
forudsigelighed og laveste kognitive og tekniske risiko. Lenis må kun beholdes,
hvis en mobil- og tastaturtest viser:

- mærkbart bedre rumlig oplevelse;
- ingen scrolljacking eller forsinket input;
- fungerende anchor-navigation og browserhistorik;
- korrekt adfærd med nested content og modaler;
- fuld deaktivering ved reduced motion;
- ingen målbar forringelse på en almindelig mobiltelefon.

Kilde:

- [Lenis på npm](https://www.npmjs.com/package/lenis)

## Stærke alternativer

### Motion 13.1.1

Motion er MIT-licenseret, TypeScript-baseret og bruger en hybridmotor med Web
Animations API og ScrollTimeline. Det er særligt stærkt til React state,
layout-animationer, gestures og elementer, der monteres eller afmonteres.

Det er førstevalg, hvis vi senere vælger React. Vi skal ikke indføre React kun
for at bruge Motion, og vi skal ikke bruge Motion og GSAP til de samme effekter.

Kilder:

- [Motion dokumentation](https://motion.dev/docs)
- [Motion for React](https://motion.dev/docs/react)
- [Motion changelog](https://www.motion.dev/changelog)

### Anime.js 4.5.0 og 5.0.0-beta.2

Anime.js 4 har timelines, draggable-interaktioner, layout-animationer,
tekstsplitning, ScrollObserver og WAAPI. Version 5 beta er relevant som den
aggressive challenger til GSAP.

Vi bør lave en lille separat spike med Anime.js 5 beta, hvor det samme jobkort
følger en kurve og reagerer på scroll. Hvis koden er væsentligt enklere og
oplevelsen lige så præcis, kan Anime.js erstatte GSAP. Vi må ikke shippe begge
motorer i landingpagen.

Kilder:

- [Anime.js dokumentation](https://animejs.com/documentation/)
- [Anime.js ScrollObserver](https://animejs.com/documentation/events/onscroll/scrollobserver-synchronisation-modes/)
- [Anime.js på npm](https://www.npmjs.com/package/animejs)

## Biblioteker vi ikke bør starte med

### React 19

React 19.2.8 fungerer som UI-platform, men landingpagen har for lidt kompleks
state til at retfærdiggøre frameworket nu. Platformsguider og promptbygger kan
implementeres tilgængeligt med native DOM og TypeScript.

### Three.js og React Three Fiber

Three.js 0.185.1 og React Three Fiber 9.7.0 er stærke til ægte 3D-scener. Vores
mockup er et 2D-layout med dybde, ikke en 3D-verden. Three vil øge bundle,
render-loop-kompleksitet og mobilrisiko uden en synlig gevinst.

Kilde:

- [React Three Fiber repository](https://github.com/pmndrs/react-three-fiber)

### Rive

Rive er godt til designerstyrede state machines, men kræver et separat `.riv`-
asset og runtime. Den letteste canvas-runtime er dokumenteret til cirka 222 KB
Brotli, mens WebGL2-runtime er cirka 648 KB. Vi har ikke en figur eller
illustration, der retfærdiggør dette endnu.

Kilder:

- [Rive Web runtime](https://rive.app/docs/runtimes/web/web-js)
- [Rive runtime-størrelser](https://rive.app/docs/runtimes/runtime-sizes)

### Theatre.js

Theatre.js er interessant som visuel timeline, men den seneste npm-version
`0.7.2` blev publiceret i 2024. Den giver ikke nok værdi til vores lille
koreografi sammenlignet med GSAP og et lokalt udviklingspanel.

### Barba og fulde page-transition-frameworks

Første version er én side. Et navigationsframework til sideskift vil skabe en
funktion uden et aktuelt behov.

## Foreslået intern opdeling

Dette er en arkitekturskitse, ikke filer der allerede findes:

```text
web/
  index.html                 Semantik og indhold
  styles/
    tokens.css               Farver, typografi, spacing og motion tokens
    layout.css               Responsivt layout
    components.css           Knapper, kort og guides
    motion.css               Native transitions og reduced-motion fallback
  scripts/
    main.ts                  Tabs, copy feedback og promptbygger
    motion/
      hero.ts                GSAP hero-timeline
      job-stream.ts          MotionPath for jobkort
      scroll-scenes.ts       ScrollTrigger eller native view timelines
      preferences.ts         Pointer, viewport og reduced-motion policy
      ambient-shader.ts      Isoleret Paper Shaders-adapter
```

Indhold og læserækkefølge skal være korrekte, før animationsmodulerne starter.
Hvert motion-modul skal kunne undlades uden at ødelægge siden.

## Konkret bevægelsesplan for mockuppet

| Element | Bevægelse | Teknologi | Reduced motion |
| --- | --- | --- | --- |
| Navigation | Blød, kort fade/translate ved load | CSS | Statisk |
| Herooverskrift | Linjer afsløres sekventielt | GSAP SplitText | Statisk fuld tekst |
| Primær CTA | Press, magnetisk pil og focus-feedback | CSS + få pointer-events | Ingen magnetisme |
| Jobkort | Kurvede paths med forskellig masse | GSAP MotionPath | Endelig position fra start |
| Forbindelseslinjer | SVG path draw | GSAP eller CSS | Fuldt synlige |
| Samtalekort | Diskret parallax og state-feedback | GSAP | Statisk |
| Guideskift | Spatial crossfade | View Transition API | Direkte skift |
| Sektioner | Viewport reveal | CSS view timeline eller ScrollTrigger | Statisk |
| Papirtekstur | Meget langsom shaderdrift | Paper Shaders | Statisk CSS-grain |

Ingen auto-loopende animation må flytte store UI-elementer efter heroens
entré. Brugeren skal kunne læse uden konstant visuel konkurrence.

## Prototype- og acceptforløb

### Spike A: Bun og TypeScript

- Installér kandidater med Bun 1.4 i en isoleret prototype.
- Byg fra en HTML-entrypoint med Bun alene.
- Kør TypeScript 7 strict `--noEmit`.
- Kontrollér HMR og production output.
- Kontrollér at imports tree-shakes og ikke kræver Node-runtime.

### Spike B: Motionmotor

Implementér det samme ene jobkort i to isolerede varianter:

1. GSAP 3.15 + MotionPathPlugin;
2. Anime.js 5 beta.

Mål:

- kodeomfang og forståelighed;
- kurvens præcision;
- resize-adfærd;
- cleanup;
- scroll-synkronisering;
- outputstørrelse efter Bun-build;
- frame stability på mobil.

Kun én motor går videre.

### Spike C: Paper Shaders

- Prøv PaperTexture og GrainGradient hver for sig.
- Begræns device-pixel-ratio og canvasstørrelse.
- Mål CPU/GPU i aktiv og skjult tilstand.
- Kontrollér WebGL2-fejl og tabt context.
- Kontrollér fallback uden WebGL og med reduced motion.
- Fjern biblioteket, hvis en statisk tekstur ser næsten lige så god ud.

### Browser- og inputmatrix

- seneste Chrome, Safari og Firefox;
- iPhone Safari og en mellemklasse Android-enhed;
- mus, trackpad, touch og tastatur;
- 200 % og 400 % zoom;
- reduced motion;
- langsom enhed og langsomt netværk;
- JavaScript-fejl og manglende WebGL2.

### Performanceporte

Foreløbige mål, som valideres under prototypen:

- ingen layout shift fra fonte eller animation;
- ingen scrolljacking;
- ingen vedvarende animation på skjulte elementer;
- kun `transform` og `opacity` for bevægende DOM-elementer;
- stabil oplevet frame rate på en almindelig mobil;
- shader indlæses efter kritisk tekst og CTA;
- siden er komplet og brugbar før animationskoden er færdigindlæst;
- samlet JavaScript- og WASM-budget fastsættes ud fra den målte prototype, ikke
  pakkernes npm-størrelser.

## Udskiftelighed

Vi accepterer nye og ustabile biblioteker, men ikke arkitektonisk lock-in:

- CSS ejer layout og sluttilstande.
- Biblioteker må kun animere fra eller mellem gyldige sluttilstande.
- GSAP/Anime-kode isoleres fra platformsguider og promptbygger.
- Shaderen må kun være et baggrundslag.
- Alle eksperimentelle pakker versionslåses uden caret.
- Der gemmes en visuel reference og en reduceret-motion-reference.
- Hver eksperimentel feature har en dokumenteret fjernelsesvej.

## Endelig anbefaling

Start med Bun + TypeScript + HTML/CSS + GSAP. Det er den korteste vej til at
ramme billedmockuppets kurvede jobstrøm og præcise koreografi.

Brug Paper Shaders som projektets ene bevidste alpha-bet. Test Anime.js 5 beta
som en reel challenger i en isoleret spike. Hold React, Vite, Three.js, Rive og
Lenis ude, indtil en målt prototype viser et problem, de konkret løser.
