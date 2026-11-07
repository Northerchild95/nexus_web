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

export type Deps = {
  store: UserStore | null; // null = Upstash sin configurar
  agent: Agent | null; // null = sin key de Groq
  answerer: Answerer | null;
  isAllowed: (chatId: number) => boolean;
  today: () => string;
};
