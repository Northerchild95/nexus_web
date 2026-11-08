import type { ChatTurn } from "../../config/chat";
import type { BotLocale } from "../domain/knowledge";
import type { Action, UserData } from "../domain/types";

/** Puertos: lo que la lógica necesita del mundo exterior. Las implementaciones viven en infrastructure/. */
export interface UserStore {
  load(chatId: number): Promise<UserData>;
  save(chatId: number, data: UserData): Promise<void>;
}
export type Agent = (text: string, locale: BotLocale, today: string) => Promise<Action | null>;
export type Answerer = (question: string, locale: BotLocale) => Promise<string | null>;
export type Sender = (chatId: number, text: string, menu?: string[]) => Promise<void>;

import type { RateLimiter } from "../../shared/application/ports";
export type { RateLimiter };
/** Conversa con contexto: recibe los últimos mensajes y devuelve la respuesta (o null si la IA falla). */
export type Converser = (history: ChatTurn[], locale: BotLocale) => Promise<string | null>;
export type ChatDeps = { converser: Converser | null; limiter: RateLimiter };

export type Deps = {
  store: UserStore | null; // null = Upstash sin configurar
  agent: Agent | null; // null = sin key de Groq
  answerer: Answerer | null;
  isAllowed: (chatId: number) => boolean;
  today: () => string;
};
