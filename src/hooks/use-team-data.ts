"use client";

import { useEffect, useRef, useState } from "react";
import { initialData } from "@/lib/seed";
import { getSupabaseClient } from "@/lib/supabase";
import type { TeamData } from "@/lib/types";

const STORAGE_KEY = "viva-rich-team-data-v1";
const CHANNEL_NAME = "viva-rich-team-sync";

function normalizeTeamData(raw: Partial<TeamData>): TeamData {
  return {
    members: initialData.members,
    events: raw.events ?? [],
    posts: raw.posts ?? [],
    boardPosts: raw.boardPosts ?? [],
  };
}

export function useTeamData() {
  const [data, setData] = useState<TeamData>(initialData);
  const dataRef = useRef<TeamData>(initialData);

  useEffect(() => {
    let isActive = true;
    const supabase = getSupabaseClient();
    let localSnapshot = initialData;
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        localSnapshot = normalizeTeamData(JSON.parse(stored) as Partial<TeamData>);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    dataRef.current = localSnapshot;
    queueMicrotask(() => {
      if (isActive) setData(localSnapshot);
    });

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<TeamData>) => {
      dataRef.current = event.data;
      setData(event.data);
    };

    if (!supabase) {
      return () => {
        isActive = false;
        channel.close();
      };
    }

    const restoreSharedData = async () => {
      const { data: row, error } = await supabase
        .from("app_state")
        .select("data")
        .eq("id", "main")
        .maybeSingle();

      if (!isActive || error) {
        if (error) console.error("공동 데이터를 불러오지 못했습니다.", error);
        return;
      }

      if (row?.data) {
        const sharedData = normalizeTeamData(row.data as Partial<TeamData>);
        dataRef.current = sharedData;
        setData(sharedData);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedData));
        return;
      }

      const { error: insertError } = await supabase.from("app_state").upsert({
        id: "main",
        data: localSnapshot,
        updated_at: new Date().toISOString(),
      });
      if (insertError) {
        console.error("공동 데이터의 첫 저장에 실패했습니다.", insertError);
      }
    };

    void restoreSharedData();

    const realtimeChannel = supabase
      .channel(CHANNEL_NAME)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_state",
          filter: "id=eq.main",
        },
        (payload) => {
          const rawData = (payload.new as { data?: Partial<TeamData> }).data;
          if (!rawData || !isActive) return;
          const sharedData = normalizeTeamData(rawData);
          dataRef.current = sharedData;
          setData(sharedData);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedData));
        },
      )
      .subscribe();

    return () => {
      isActive = false;
      channel.close();
      void supabase.removeChannel(realtimeChannel);
    };
  }, []);

  const updateData = (updater: (current: TeamData) => TeamData) => {
    const next = updater(dataRef.current);
    dataRef.current = next;
    setData(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(next);
    channel.close();

    const supabase = getSupabaseClient();
    if (supabase) {
      void supabase
        .from("app_state")
        .upsert({
          id: "main",
          data: next,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error("공동 데이터 저장에 실패했습니다.", error);
        });
    }
  };

  return { data, updateData };
}
