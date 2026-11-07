// Contrato del chat compartido por el navegador y el servidor.
export const CHAT_MAX_LENGTH = 300; // caracteres por mensaje
export const CHAT_MAX_TURNS = 8; // mensajes recientes que se envían como contexto

export type ChatTurn = { role: "user" | "assistant"; content: string };
