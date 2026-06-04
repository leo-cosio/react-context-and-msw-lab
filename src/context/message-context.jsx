import { useContext, createContext, useState, useEffect } from "react";
import * as MessagesServices from "../services/messages-services";

const MessageContext = createContext();

export function MessageContextProvider({ children }) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    async function fetchMessages() {
      try {
        const messages = await MessagesServices.getMesseges();
        setMessages(messages);
      } catch (error) {
        console.error(error);
      }
    }

    fetchMessages();
  }, []);

  const listMessages = () => {
    async function fetchMessages() {
      try {
        const messages = await MessagesServices.getMesseges();
        setMessages(messages);
      } catch (error) {
        console.error(error);
      }
    }
    fetchMessages();
  };

  return (
    <MessageContext.Provider value={{ messages, listMessages }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  return useContext(MessageContext);
}
