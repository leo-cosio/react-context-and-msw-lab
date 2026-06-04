import axios from "axios";

const http = axios.create({
  baseURL: "https://api.messages.org",
});

export async function getMesseges() {
  const { data } = await http.get("/messages");
  return data;
}

export async function postMessage(message) {
  const { data } = await http.post("/messages", message);
  return data;
}
