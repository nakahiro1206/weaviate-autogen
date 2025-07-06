"use client";
import { Summarize } from "@/components/summarize/summarize";
import { trpc } from "@/lib/trpc/client";

function Home() {
  return <Summarize />
}

export default trpc.withTRPC(Home);