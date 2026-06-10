"use client";

import { useEffect, useState } from "react";
import { initialData } from "@/lib/seed";
import type { TeamData } from "@/lib/types";

const STORAGE_KEY = "viva-rich-team-data-v1";
const CHANNEL_NAME = "viva-rich-team-sync";

export function useTeamData() {
  const [data, setData] = useState<TeamData>(initialData);

  useEffect(() => {
    let isActive = true;
    const restoreStoredData = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isActive) {
        try {
          setData(JSON.parse(stored) as TeamData);
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    };
    queueMicrotask(restoreStoredData);

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<TeamData>) => setData(event.data);
    return () => {
      isActive = false;
      channel.close();
    };
  }, []);

  const updateData = (updater: (current: TeamData) => TeamData) => {
    setData((current) => {
      const next = updater(current);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(next);
      channel.close();
      return next;
    });
  };

  return { data, updateData };
}
