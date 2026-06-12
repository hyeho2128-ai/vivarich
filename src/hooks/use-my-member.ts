"use client";

import { useEffect, useState } from "react";

const MY_MEMBER_KEY = "viva-rich-my-member-id";

export function useMyMember() {
  const [myMemberId, setMyMemberIdState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setMyMemberIdState(window.localStorage.getItem(MY_MEMBER_KEY));
    setIsLoaded(true);
  }, []);

  const setMyMemberId = (id: string | null) => {
    setMyMemberIdState(id);
    if (id) window.localStorage.setItem(MY_MEMBER_KEY, id);
    else window.localStorage.removeItem(MY_MEMBER_KEY);
  };

  return { myMemberId, setMyMemberId, isLoaded };
}
