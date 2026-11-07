// Contrato del chat compartido por el navegador y el servidor.
export const CHAT_MAX_LENGTH = 300; // caracteres por mensaje
export const CHAT_MAX_TURNS = 8; // mensajes recientes que se envían como contexto
export const CHAT_MAX_ASSISTANT_LENGTH = 2000; // las respuestas del asistente son más largas que las del usuario
export const CHAT_CONTEXT_CHARS = 500; // lo que se reenvía de cada mensaje como contexto
export const CHAT_MAX_BODY = 20_000; // tamaño máximo de la petición

export type ChatTurn = { role: "user" | "assistant"; content: string };
