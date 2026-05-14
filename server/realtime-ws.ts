/**
 * Brown 실시간 순위 WebSocket 서버 (Node 전용)
 *
 * Next.js App Router는 일반 Route Handler에서 WebSocket 업그레이드를 지원하지 않으므로,
 * `npm run ws:dev` 로 이 프로세스를 별도로 띄운 뒤 브라우저는 `NEXT_PUBLIC_BROWN_WS_URL` 로 접속합니다.
 *
 * 동작: 클라이언트가 `subscribe` 한 채널만 KIS REST를 주기적으로 호출해, 같은 내용을 JSON으로 push.
 * (한국투자 공식 실시간은 ops.koreainvestment.com WebSocket + approval_key 별도 연동 — 아래 사용자 안내 참고)
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { WebSocket, WebSocketServer } from "ws";

import { fetchFluctuationRanking } from "../src/entities/kis/api/fluctuation-rank";
import { fetchVolumeRanking } from "../src/entities/kis/api/volume-rank";
import type { RankingWsChannel } from "../src/features/market-ranking/config/ranking-ws-protocol";
import { isRankingWsChannel } from "../src/features/market-ranking/config/ranking-ws-protocol";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const PORT = Number(process.env.BROWN_WS_PORT || "8787");
const POLL_MS = Number(process.env.BROWN_WS_POLL_MS || "3000");

type ClientMsg = { type: string; channel?: string };

const channelRefCount = new Map<RankingWsChannel, number>();
const channelIntervals = new Map<RankingWsChannel, ReturnType<typeof setInterval>>();

const broadcast = (channel: RankingWsChannel, payload: object) => {
  const msg = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState !== WebSocket.OPEN) return;
    const c = client as WebSocket & { channels?: Set<RankingWsChannel> };
    if (c.channels?.has(channel)) {
      client.send(msg);
    }
  });
};

const tick = async (channel: RankingWsChannel) => {
  const ts = Date.now();
  try {
    let data: Awaited<ReturnType<typeof fetchVolumeRanking>>;
    if (channel === "ranking:volume:amount") {
      data = await fetchVolumeRanking("amount");
    } else if (channel === "ranking:volume:volume") {
      data = await fetchVolumeRanking("volume");
    } else if (channel === "ranking:fluctuation:up") {
      data = await fetchFluctuationRanking("up");
    } else {
      data = await fetchFluctuationRanking("down");
    }
    broadcast(channel, { type: "ranking", channel, data, ts });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    broadcast(channel, { type: "error", channel, message, ts });
  }
};

const ensurePolling = (channel: RankingWsChannel) => {
  if (channelIntervals.has(channel)) return;
  void tick(channel);
  const id = setInterval(() => {
    void tick(channel);
  }, POLL_MS);
  channelIntervals.set(channel, id);
};

const stopPollingIfIdle = (channel: RankingWsChannel) => {
  const n = channelRefCount.get(channel) ?? 0;
  if (n > 0) return;
  channelRefCount.delete(channel);
  const id = channelIntervals.get(channel);
  if (id) {
    clearInterval(id);
    channelIntervals.delete(channel);
  }
};

const subscribe = (channel: RankingWsChannel) => {
  channelRefCount.set(channel, (channelRefCount.get(channel) ?? 0) + 1);
  ensurePolling(channel);
};

const unsubscribe = (channel: RankingWsChannel) => {
  const next = (channelRefCount.get(channel) ?? 1) - 1;
  if (next <= 0) {
    channelRefCount.delete(channel);
  } else {
    channelRefCount.set(channel, next);
  }
  stopPollingIfIdle(channel);
};

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket: WebSocket) => {
  const s = socket as WebSocket & { channels?: Set<RankingWsChannel> };
  s.channels = new Set();

  socket.send(
    JSON.stringify({
      type: "welcome",
      message: `Brown realtime · port ${PORT} · poll ${POLL_MS}ms`,
    }),
  );

  socket.on("message", (raw) => {
    let msg: ClientMsg;
    try {
      msg = JSON.parse(String(raw)) as ClientMsg;
    } catch {
      return;
    }
    if (msg.type === "ping") {
      socket.send(JSON.stringify({ type: "pong", ts: Date.now() }));
      return;
    }
    if (msg.type === "subscribe" && msg.channel && isRankingWsChannel(msg.channel)) {
      const ch = msg.channel;
      if (!s.channels!.has(ch)) {
        s.channels!.add(ch);
        subscribe(ch);
      }
      return;
    }
    if (msg.type === "unsubscribe" && msg.channel && isRankingWsChannel(msg.channel)) {
      const ch = msg.channel;
      if (s.channels!.has(ch)) {
        s.channels!.delete(ch);
        unsubscribe(ch);
      }
    }
  });

  socket.on("close", () => {
    for (const ch of s.channels ?? []) {
      unsubscribe(ch);
    }
    s.channels?.clear();
  });
});

console.log(`[brown-ws] listening on ws://127.0.0.1:${PORT} (poll ${POLL_MS}ms)`);
