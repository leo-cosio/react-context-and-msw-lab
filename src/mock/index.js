import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";

const BASE = "https://api.messages.org";

const messages = [{ id: self.crypto.randomUUID(), text: "Hello world" }];

const handleMessages = http.get(`${BASE}/messages`, (messages) => {
  return HttpResponse.json(messages);
});

const handleSend = http.post(`${BASE}/messages`, async ({ request }) => {
  const message = await request.json();
  message.id = self.crypto.randomUUID();
  messages.push(message);
  return HttpResponse.json(message, { status: 201 });
});

const worker = setupWorker(handleMessages, handleSend);

export default worker;
