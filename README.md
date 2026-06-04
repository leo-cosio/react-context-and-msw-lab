# React Context & MSW Lab

En este laboratorio construirás un mini-clon de Twitter que funciona **completamente en local**: no hay backend real. El servidor está simulado con **Mock Service Worker (MSW)** directamente en el navegador.

Al terminar tendrás:

- Un mock de API para mensajes funcionando en el navegador.
- Un contexto de React que centraliza el estado y las operaciones de mensajes.
- Un listado y un formulario de creación que consumen ese contexto.

---

## Estructura objetivo

```
src/
  contexts/
    messages-context.jsx
  mock/
    index.js
  pages/
    home-page.jsx
  components/
    messages-list.jsx
    message-item.jsx
    message-form.jsx
  services/
    messages-service.js
  App.jsx
  main.jsx
```

---

## Iteración 1 — Integrar MSW

MSW intercepta peticiones HTTP desde un **Service Worker** registrado en el navegador. Para ello necesita un fichero estático accesible en la raíz del dominio.

**Pasos:**

1. Instala la librería. Recuerda que MSW va en `dependencies` (no `devDependencies`) porque el worker corre en el navegador.

2. Inicializa el Service Worker en la carpeta `public/`:
   ```bash
   npx msw init public/ --save
   ```
   Esto genera `public/mockServiceWorker.js`. No lo modifiques.

3. Crea `src/mock/index.js`. Usa `setupWorker` de `msw/browser` para crear el worker. De momento puedes inicializarlo sin handlers.

4. En `src/main.jsx`, llama a `worker.start()` **antes** de montar React. `worker.start()` devuelve una promesa; monta la app en el `.then()`.

   > Tip: usa la opción `{ onUnhandledRequest: 'warn' }` para que MSW avise en consola cuando reciba una petición sin handler.

**Verificación:** al arrancar con `npm run dev` deberías ver en la consola del navegador:
```
[MSW] Mocking enabled.
```

---

## Iteración 2 — Configurar React Router

1. Instala `react-router`.

2. Envuelve la app con `BrowserRouter` en `main.jsx`.

3. Crea `src/pages/home-page.jsx` que renderice un `<h1>Hello world</h1>`.

4. Configura `App.jsx` para usar `Routes` y `Route` apuntando `/` a `HomePage`.

**Verificación:** navega a `http://localhost:5173` y comprueba que ves el `Hello world`.

---

## Iteración 3 — Servicio de mensajes

1. Instala `axios`.

2. Crea `src/services/messages-service.js` con una instancia de axios. La `baseURL` debe ser `https://api.messages.org` — el mismo dominio que configuraremos en MSW.

3. Expón dos funciones: una para obtener todos los mensajes (`GET /messages`) y otra para crear uno nuevo (`POST /messages`).

> Tip: usa `axios.create({ baseURL: '...' })` para que todas las peticiones del servicio compartan la URL base.

---

## Iteración 4 — Mock de `GET /messages` y contexto

### Mock

En `src/mock/index.js` añade un handler para `GET /messages`:

- Mantén un array `messages` en memoria (fuera del handler) que actúe como base de datos.
- Inicialízalo con al menos un mensaje de ejemplo: `{ id: '<uuid>', text: 'Hello world' }`.
- Usa `crypto.randomUUID()` para generar ids.
- El handler debe devolver ese array como JSON.

> Tip: importa `http` y `HttpResponse` desde `msw`. Un handler de GET tiene la forma `http.get(url, () => HttpResponse.json(...))`.

### Contexto

Aquí es donde vive el estado de los mensajes. Crea `src/contexts/messages-context.jsx` con un `MessagesContextProvider` que:

- Guarde el array de mensajes en estado con `useState`.
- Al montarse, llame al servicio para cargar los mensajes del mock usando `useEffect`.
- Exponga a sus hijos, a través del valor del contexto, los mensajes y todo lo necesario para operarlos.

Añade el provider en `main.jsx` envolviendo la app.

> Tip: crea un hook `useMessages` que encapsule el `useContext` para que los componentes no necesiten importar el contexto directamente.

### Componentes

- `message-item.jsx`: recibe un `message` por props y pinta su texto.
- `messages-list.jsx`: consume el contexto con `useMessages` para obtener los mensajes y renderiza un `MessageItem` por cada uno.

Añade `MessagesList` a `HomePage`.

**Verificación:** recarga y comprueba que aparece el mensaje "Hello world" en la lista.

---

## Iteración 5 — Mock de `POST /messages` y formulario

### Mock

Añade un handler para `POST /messages` en `src/mock/index.js`:

- Lee el cuerpo de la petición con `await request.json()`.
- Asigna un `id` con `crypto.randomUUID()`.
- Añade el mensaje al array `messages` (el mismo del `GET`, ya que vive en el mismo módulo).
- Devuelve el nuevo mensaje con status `201`.

### Contexto

El formulario no debe llamar al servicio directamente. En su lugar, el contexto debe exponer una función `createMessage` que:

- Llame al servicio.
- Actualice el estado interno con el mensaje devuelto por el mock.

De esta forma los componentes solo hablan con el contexto, nunca con el servicio.

### Componente

1. Instala `react-hook-form`.

2. Crea `src/components/message-form.jsx` con un input de texto y un botón de envío.

3. Al hacer submit, usa la función `createMessage` del contexto (vía `useMessages`) para crear el mensaje.

> Tip: al recibir la respuesta del mock ya no necesitas volver a llamar al `GET`: añade directamente el mensaje devuelto al array en el estado del contexto.

**Verificación:** escribe un mensaje, envíalo y comprueba que aparece en la lista al instante sin recargar la página.

---

## Flujo completo esperado

1. La app carga y el contexto llama al mock para obtener los mensajes iniciales.
2. `MessagesList` los pinta leyendo el contexto.
3. `MessageForm` llama a `createMessage` del contexto al enviar el formulario.
4. El contexto llama al servicio, recibe el mensaje creado y actualiza el estado.
5. `MessagesList` se re-renderiza automáticamente con el nuevo mensaje.

---

## Bonus

- Persiste los mensajes en `localStorage` dentro del mock para que sobrevivan a recargas de página.
- Añade una función `deleteMessage` en el contexto y un botón de borrado en `MessageItem`. Implementa el mock de `DELETE /messages/:id`.
- Muestra un indicador de carga (`isLoading`) mientras el contexto espera la respuesta del mock.
