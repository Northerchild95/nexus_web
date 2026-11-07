"use client";
import { useSyncExternalStore } from "react";

const noop = () => () => {};
/** `false` durante SSR/hidratación, `true` después. */
export const useIsClient = () =>
  useSyncExternalStore(noop, () => true, () => false);
