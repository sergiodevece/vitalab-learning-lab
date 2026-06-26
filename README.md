laboratorio de estudio para programación y DAM
# VITALAB AUDIO · Audio Meter Studio

> Medidor de entrada de audio en tiempo real para navegador, construido con **HTML, CSS y JavaScript vanilla**.
> Analiza la señal del micrófono localmente, muestra nivel, pico, estimación dBFS, riesgo de clipping y visualización waveform/spectrum — sin grabar ni subir audio a ningún sitio.

![static app](https://img.shields.io/badge/build-static_app-49e08a)
![dependencies](https://img.shields.io/badge/dependencies-0-blue)
![vanilla js](https://img.shields.io/badge/stack-vanilla_JS-ffae47)
![web audio](https://img.shields.io/badge/audio-Web_Audio_API-b23b30)
![privacy](https://img.shields.io/badge/privacy-local_analysis-8b5cf6)

*Hecho para ti, no para todos.* — **Vitalab Audio**

---

## ¿Qué es?

**Audio Meter Studio** es una app web de análisis de entrada de audio en tiempo real.

Permite usar el micrófono del navegador para visualizar la intensidad de la señal, estimar el nivel en dBFS, mantener un pico temporal, detectar posibles zonas de clipping y alternar entre una vista de forma de onda y una vista de espectro.

Está pensada como:

* primera herramienta funcional de **Vitalab Audio**,
* app de aprendizaje para practicar HTML, CSS, JavaScript y Web Audio API,
* pieza de portfolio inicial,
* laboratorio técnico para comprender análisis de audio en navegador.

Todo el análisis ocurre en local dentro del navegador.
**La app no graba, no almacena y no sube audio a ningún servidor.**

---

## Características

### Entrada de audio en tiempo real

* Captura de micrófono mediante `getUserMedia`.
* Análisis local con **Web Audio API**.
* Procesamiento del navegador solicitado como desactivado:

  * `echoCancellation: false`
  * `noiseSuppression: false`
  * `autoGainControl: false`

Esto ayuda a recibir una señal más limpia y menos alterada por el navegador.

---

### Medidor de nivel

La app muestra:

* **Level** en porcentaje.
* **Peak hold** con retención temporal.
* **dBFS** como estimación digital del nivel de señal.
* Estado textual:

  * `Quiet`
  * `Active`
  * `Loud`

El cálculo parte de la señal temporal capturada por el analizador y utiliza una medición RMS básica para estimar la energía media de la entrada.

---

### Indicador de clipping

Audio Meter Studio incluye un indicador visual de estado:

* **Safe**
* **Hot**
* **Clipping risk**
* **Clipping**

El objetivo es ayudar a detectar cuándo la entrada está demasiado cerca del techo digital.

---

### Visualización waveform / spectrum

La app permite alternar entre dos vistas:

#### Waveform view

Muestra la forma de onda de la señal de entrada en tiempo real.

#### Spectrum view

Muestra una representación básica del contenido frecuencial usando los datos del analizador de frecuencia.

---

### Start / Stop microphone

La app incluye control completo de la entrada:

* **Start microphone** para iniciar la captura.
* **Stop microphone** para detener el stream.
* Al parar:

  * se detienen las pistas del micrófono,
  * se desconecta la fuente de audio,
  * se cancela la animación,
  * se reinician los valores visuales,
  * la app vuelve al estado `Idle`.

---

### Fullscreen mode

Incluye modo de pantalla completa para usar el medidor como herramienta visual ampliada durante pruebas o sesiones de audio.

---

### Privacidad

La interfaz muestra claramente:

> Audio is analyzed in real time. Nothing is recorded or uploaded.

Esto es importante porque la app solicita acceso al micrófono.

---

## Cómo se usa

1. Abre `index.html` en un navegador moderno.
2. Pulsa **Start microphone**.
3. Acepta el permiso del micrófono.
4. Observa el nivel de entrada, dBFS, peak hold y estado de clipping.
5. Usa **Switch to spectrum** para alternar entre forma de onda y espectro.
6. Usa **Fullscreen view** si quieres una visualización ampliada.
7. Pulsa **Stop microphone** para detener la captura.

---

## Estructura del proyecto

```text
/
├── index.html   ← estructura visual, estilos y elementos de interfaz
├── app.js       ← lógica de audio, análisis, canvas y eventos
└── README.md    ← documentación del proyecto
```

---

## Despliegue

Es una app estática.
No requiere instalación, compilación, backend ni dependencias externas.

### Local

Puedes abrir el proyecto directamente desde VS Code usando una extensión como **Live Server**.

También puedes abrir `index.html` en el navegador, aunque para acceso al micrófono es recomendable usar un entorno local servido correctamente.

### GitHub Pages / Netlify / Vercel

La app se puede desplegar como sitio estático:

* subiendo la carpeta completa,
* activando GitHub Pages,
* o arrastrando la carpeta a Netlify.

---

## Tecnología

* **HTML5** — estructura de la interfaz.
* **CSS3** — diseño visual, estados y responsive básico.
* **Vanilla JavaScript** — lógica principal sin frameworks.
* **Web Audio API** — captura y análisis de audio.
* **AnalyserNode** — lectura de datos temporales y frecuenciales.
* **Canvas 2D** — dibujo de waveform y spectrum.
* **requestAnimationFrame** — actualización visual en tiempo real.

No usa React, Vue, Angular, jQuery, librerías de audio ni dependencias externas.

---

## Conceptos técnicos trabajados

Esta app sirve como unidad de aprendizaje para practicar:

* selección de elementos con `getElementById`,
* variables `const` y `let`,
* funciones flecha,
* eventos con `addEventListener`,
* asincronía con `async / await`,
* manejo de errores con `try / catch`,
* permisos de navegador,
* entrada de micrófono con `getUserMedia`,
* creación de `AudioContext`,
* conexión de nodos de audio,
* lectura de arrays de audio con `Uint8Array`,
* cálculo RMS,
* conversión aproximada a dBFS,
* uso de condicionales,
* dibujo en `canvas`,
* animación con `requestAnimationFrame`,
* gestión de estado de aplicación.

---

## Limitaciones y honestidad técnica

Audio Meter Studio es una herramienta orientativa y educativa.
No sustituye a un medidor profesional certificado ni a una interfaz de audio calibrada.

### Limitaciones actuales

* **La lectura dBFS es aproximada.**
  Se calcula a partir del RMS de la señal recibida por el navegador, no desde un sistema calibrado profesional.

* **La señal depende del dispositivo de entrada.**
  Cada micrófono, interfaz o sistema operativo puede entregar niveles diferentes.

* **El navegador puede aplicar procesamiento interno.**
  Aunque la app solicita desactivar cancelación de eco, supresión de ruido y ganancia automática, no todos los navegadores o dispositivos garantizan el mismo comportamiento.

* **No mide LUFS.**
  Esta versión trabaja con RMS/dBFS aproximado, no con loudness integrado.

* **No mide True Peak.**
  El indicador de clipping se basa en la señal analizada, no en oversampling ni detección inter-sample peak.

* **No graba audio.**
  La app solo analiza la señal en tiempo real.

* **Requiere permisos de micrófono.**
  Si el usuario bloquea el permiso, la app no puede funcionar.

---

## Roadmap

| Versión    | Objetivo                  | Incluye                                                                                                      |
| ---------- | ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **v1.0** ✅ | Primera versión funcional | Medidor de nivel, dBFS aproximado, peak hold, clipping indicator, waveform, spectrum, start/stop, fullscreen |
| v1.1       | Pulido visual y UX        | Mejoras responsive, modo compacto, mejor feedback de errores                                                 |
| v1.2       | Medición más musical      | RMS más estable, historial de picos, ajuste de sensibilidad                                                  |
| v1.3       | Presets de uso            | Voice, Instrument, Mix Check, Mastering Input                                                                |
| v2.0       | Arquitectura DAM          | Separación modular, tests básicos, documentación técnica ampliada                                            |
| Pro        | Vitalab Audio Toolkit     | Comparador A/B, LUFS aproximado, export de informe, presets avanzados                                        |

---

## Estado del proyecto

**Audio Meter Studio v1.0** está completada como primera app funcional de audio dentro del ecosistema Vitalab Audio.

Estado actual:

* App funcional.
* Código separado en `index.html` y `app.js`.
* Sin dependencias.
* Preparada para GitHub.
* Preparada para ser usada como unidad de aprendizaje.
* Documentada como primera pieza del proyecto **Vitalab Learning Lab**.

---

## Sobre Vitalab Audio

**Vitalab Audio** es una línea de herramientas experimentales que une experiencia real en producción musical, mezcla/mastering y desarrollo de software.

El objetivo no es crear herramientas genéricas, sino soluciones con criterio musical, enfoque artesanal y aprendizaje técnico progresivo.

Esta app forma parte de mi transición profesional hacia el desarrollo de software, conectando mi experiencia en audio con programación web, IA aplicada y formación DAM.

---

## Autor

**Sergio Devece**
Vitalab Audio · Vitalab Learning Lab

**Diseño y desarrollo:** Sergio Devece · Vitalab Audio

---

## Licencia

© 2026 Sergio Devece · Vitalab Audio. Todos los derechos reservados.

Este proyecto forma parte de un proceso personal de aprendizaje, portfolio y desarrollo de herramientas propias.

> Si en el futuro quieres abrirlo a la comunidad, puedes cambiar esta sección por una licencia MIT y añadir un archivo `LICENSE`.
