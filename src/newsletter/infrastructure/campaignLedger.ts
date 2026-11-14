import { createUpstashCommand } from "../../shared/infrastructure/upstashClient";
import type { CampaignLedger } from "../application/ports";

const key = (campaignId: string) => `nexus:campaign:${campaignId}:sent`;

export function createCampaignLedger(url: string, token: string, fetchImpl: typeof fetch = fetch): CampaignLedger {
  const command = createUpstashCommand(url, token, fetchImpl);
  return {
    async sentTo(campaignId) {
      const members = await command(["SMEMBERS", key(campaignId)]);
      return new Set(Array.isArray(members) ? members.map(String) : []);
    },
    async markSent(campaignId, email) {
      await command(["SADD", key(campaignId), email]);
    },
  };
}
