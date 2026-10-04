"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import {
  Camera,
  CameraOff,
  Check,
  LoaderCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Video,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { fetchCurrentUser } from "@/lib/api/auth";
import {
  getCallRealtimeCredentials,
  type CallIceServer,
  type CallRealtimeCredentials,
} from "@/lib/api/calls";
import { getUserId, getName, setUserId } from "@/lib/auth-client";
import {
  getSupabaseRealtimeClient,
  isSupabaseRealtimeConfigured,
} from "@/lib/supabase-realtime";

type CallMode = "voice" | "video";
type CallStatus =
  | "idle"
  | "calling"
  | "ringing"
  | "incoming"
  | "connecting"
  | "connected"
  | "disconnected"
  | "ended"
  | "error";
type CallEndReason =
  | "normal"
  | "rejected"
  | "busy"
  | "noAnswer"
  | "permissionDenied"
  | "deviceUnavailable"
  | "remotePermissionDenied"
  | "connectionFailed"
  | "signalingFailed";
type CallDirection = "incoming" | "outgoing";

type ActiveCall = {
  status: CallStatus;
  id?: string;
  roomTopic?: string;
  peerId?: string;
  peerName?: string;
  mode?: CallMode;
  direction?: CallDirection;
  endReason?: CallEndReason;
};

type CallContextValue = {
  startCall: (
    peerId: string,
    peerName: string,
    mode: CallMode,
  ) => Promise<void>;
};

const CallContext = createContext<CallContextValue | null>(null);
const IDLE_CALL: ActiveCall = { status: "idle" };
const DEFAULT_ICE_SERVERS: CallIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

function newCallId() {
  return crypto.randomUUID();
}

function roomTopicFor(callerId: string, calleeId: string, callId: string) {
  return `call-room:${callerId}:${calleeId}:${callId}`;
}

function mediaErrorReason(
  error: unknown,
): "permissionDenied" | "deviceUnavailable" {
  const name = error instanceof DOMException ? error.name : "";
  return name === "NotAllowedError" || name === "SecurityError"
    ? "permissionDenied"
    : "deviceUnavailable";
}

class CallSetupError extends Error {
  reason: "permissionDenied" | "deviceUnavailable";

  constructor(reason: "permissionDenied" | "deviceUnavailable") {
    super(reason);
    this.name = "CallSetupError";
    this.reason = reason;
  }
}

function signalPayload(
  call: ActiveCall,
  fromUserId: string,
  type: string,
  extra: Record<string, unknown> = {},
) {
  return {
    type,
    callId: call.id,
    fromUserId,
    toUserId: call.peerId,
    ...extra,
  };
}

function getActiveCallSnapshot(callRef: { current: ActiveCall }): ActiveCall {
  return callRef.current;
}

export function CallProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const callCopy = t("calls");
  const callCopyRef = useRef<CallCopy>(callCopy);
  callCopyRef.current = callCopy;
  const [call, setCall] = useState<ActiveCall>(IDLE_CALL);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const callRef = useRef<ActiveCall>(IDLE_CALL);
  const userIdRef = useRef("");
  const userNameRef = useRef("Teacher");
  const clientRef = useRef<SupabaseClient | null>(null);
  const credentialsRef = useRef<CallRealtimeCredentials | null>(null);
  const inboxRef = useRef<RealtimeChannel | null>(null);
  const roomRef = useRef<RealtimeChannel | null>(null);
  const roomReadyRef = useRef<Promise<RealtimeChannel> | null>(null);
  const endSignalSentRef = useRef("");
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const candidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const iceRestartAttemptsRef = useRef(0);
  const recoveryPendingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callDecisionInProgressRef = useRef("");

  const updateCall = useCallback(
    (next: ActiveCall | ((current: ActiveCall) => ActiveCall)) => {
      const value = typeof next === "function" ? next(callRef.current) : next;
      callRef.current = value;
      setCall(value);
    },
    [],
  );

  const clearCallTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const sendEndSignal = useCallback((reason: CallEndReason = "normal") => {
    const activeCall = callRef.current;
    if (
      !activeCall.id ||
      activeCall.status === "idle" ||
      activeCall.status === "ended" ||
      activeCall.status === "error" ||
      endSignalSentRef.current === activeCall.id ||
      !roomRef.current ||
      !userIdRef.current
    )
      return undefined;
    endSignalSentRef.current = activeCall.id;
    try {
      return roomRef.current
        .send({
          type: "broadcast",
          event: "call-signal",
          payload: signalPayload(activeCall, userIdRef.current, "ended", {
            reason,
          }),
        })
        .then(() => undefined)
        .catch(() => undefined);
    } catch {
      // The browser may be closing or the signaling socket may already be down.
      return undefined;
    }
  }, []);

  const ensureIdentity = useCallback(async () => {
    if (userIdRef.current) return userIdRef.current;
    let id = getUserId() || "";
    if (!id) {
      const user = await fetchCurrentUser();
      id = user.id;
      if (id) setUserId(id);
      userNameRef.current = user.fullName || getName() || "Teacher";
    }
    if (!id)
      throw new Error(
        "Your account identity is unavailable. Please sign in again.",
      );
    userIdRef.current = id;
    return id;
  }, []);

  const ensureClient = useCallback(async () => {
    if (!isSupabaseRealtimeConfigured()) {
      throw new Error(
        "Supabase Realtime is not configured. Set the project URL and anon key.",
      );
    }
    if (clientRef.current) return clientRef.current;
    const credentials = await getCallRealtimeCredentials();
    credentialsRef.current = credentials;
    const client = getSupabaseRealtimeClient(credentials.accessToken);
    clientRef.current = client;
    return client;
  }, []);

  const refreshRealtimeAuth = useCallback(async () => {
    if (!isSupabaseRealtimeConfigured()) {
      throw new Error(
        "Supabase Realtime is not configured. Set the project URL and anon key.",
      );
    }
    const credentials = await getCallRealtimeCredentials();
    credentialsRef.current = credentials;
    const client = getSupabaseRealtimeClient(credentials.accessToken);
    clientRef.current = client;
    return client;
  }, []);

  const sendRoomSignal = useCallback(
    async (type: string, extra: Record<string, unknown> = {}) => {
      const activeCall = callRef.current;
      const fromUserId = userIdRef.current;
      if (!roomRef.current || !activeCall.id || !fromUserId) {
        throw new Error("The call signaling channel is not connected.");
      }
      const result = await roomRef.current.send({
        type: "broadcast",
        event: "call-signal",
        payload: signalPayload(activeCall, fromUserId, type, extra),
      });
      if (result !== "ok") throw new Error("Could not send the call signal.");
    },
    [],
  );

  const finishCall = useCallback(
    (reason: CallEndReason, notifyPeer = false) => {
      const activeCall = callRef.current;
      if (
        !activeCall.id ||
        activeCall.status === "idle" ||
        activeCall.status === "ended" ||
        activeCall.status === "error"
      )
        return;
      clearCallTimer();
      const endSignal = notifyPeer ? sendEndSignal(reason) : undefined;
      if (activeCall.id && clientRef.current) {
        void Promise.resolve(
          clientRef.current
            .from("call_invites")
            .delete()
            .eq("id", activeCall.id),
        ).catch(() => undefined);
      }

      peerRef.current?.close();
      peerRef.current = null;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      setLocalStream(null);
      setRemoteStream(null);
      setMuted(false);
      setCameraOff(false);
      candidateQueueRef.current = [];
      iceRestartAttemptsRef.current = 0;
      recoveryPendingRef.current = false;
      if (roomRef.current && clientRef.current) {
        const room = roomRef.current;
        const client = clientRef.current;
        roomRef.current = null;
        roomReadyRef.current = null;
        if (endSignal) void endSignal.finally(() => client.removeChannel(room));
        else void client.removeChannel(room);
      }

      const isError =
        reason === "permissionDenied" ||
        reason === "deviceUnavailable" ||
        reason === "remotePermissionDenied" ||
        reason === "connectionFailed" ||
        reason === "signalingFailed";
      updateCall({
        ...activeCall,
        status: isError ? "error" : "ended",
        endReason: reason,
      });
      if (!isError) {
        timeoutRef.current = setTimeout(() => updateCall(IDLE_CALL), 3200);
      }
    },
    [clearCallTimer, sendEndSignal, updateCall],
  );

  const recoverWebRtc = useCallback(() => {
    const active = callRef.current;
    const pc = peerRef.current;
    if (!active.id || !pc || recoveryPendingRef.current) return;
    if (pc.connectionState === "connected") return;

    recoveryPendingRef.current = true;
    updateCall((current) => ({ ...current, status: "disconnected" }));
    clearCallTimer();

    if (active.direction !== "outgoing") {
      timeoutRef.current = setTimeout(() => {
        recoveryPendingRef.current = false;
        if (peerRef.current?.connectionState !== "connected") {
          finishCall("connectionFailed");
        }
      }, 55000);
      return;
    }

    const attemptRestart = (attempt: number) => {
      timeoutRef.current = setTimeout(async () => {
        if (callRef.current.id !== active.id) {
          recoveryPendingRef.current = false;
          return;
        }
        if (peerRef.current?.connectionState === "connected") {
          recoveryPendingRef.current = false;
          return;
        }
        if (attempt > 2) {
          recoveryPendingRef.current = false;
          finishCall("connectionFailed");
          return;
        }

        iceRestartAttemptsRef.current = attempt;
        updateCall((current) => ({ ...current, status: "connecting" }));
        try {
          const currentPeer = peerRef.current;
          if (!currentPeer) throw new Error("The WebRTC connection is closed.");
          const offer = await currentPeer.createOffer({ iceRestart: true });
          await currentPeer.setLocalDescription(offer);
          await sendRoomSignal("offer", {
            description: currentPeer.localDescription?.toJSON(),
            iceRestart: true,
          });
        } catch {
          recoveryPendingRef.current = false;
          finishCall("connectionFailed", true);
          return;
        }

        timeoutRef.current = setTimeout(() => {
          if (peerRef.current?.connectionState === "connected") {
            recoveryPendingRef.current = false;
            return;
          }
          if (attempt < 2) {
            updateCall((current) => ({ ...current, status: "disconnected" }));
            attemptRestart(attempt + 1);
          } else {
            recoveryPendingRef.current = false;
            finishCall("connectionFailed", true);
          }
        }, 18000);
      }, 5000);
    };

    attemptRestart(iceRestartAttemptsRef.current + 1);
  }, [clearCallTimer, finishCall, sendRoomSignal, updateCall]);

  const createPeerConnection = useCallback(
    async (mode: CallMode, expectedCallId: string) => {
      const client = await ensureClient();
      if (
        callRef.current.id !== expectedCallId ||
        callRef.current.status !== "connecting"
      ) {
        throw new DOMException(
          "Call ended before media setup began.",
          "AbortError",
        );
      }
      const credentials = credentialsRef.current;
      if (credentials) client.realtime.setAuth(credentials.accessToken);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new CallSetupError("deviceUnavailable");
      }
      let media: MediaStream;
      try {
        media = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: mode === "video",
        });
      } catch (error) {
        throw new CallSetupError(mediaErrorReason(error));
      }
      if (
        callRef.current.id !== expectedCallId ||
        callRef.current.status !== "connecting"
      ) {
        media.getTracks().forEach((track) => track.stop());
        throw new DOMException(
          "Call ended before media was ready.",
          "AbortError",
        );
      }
      localStreamRef.current = media;
      setLocalStream(media);
      setMuted(false);
      setCameraOff(false);

      const pc = new RTCPeerConnection({
        iceServers: credentials?.iceServers?.length
          ? credentials.iceServers
          : DEFAULT_ICE_SERVERS,
      });
      peerRef.current = pc;
      media.getTracks().forEach((track) => pc.addTrack(track, media));
      pc.ontrack = (event) => {
        let stream = event.streams[0];
        if (!stream) {
          stream = remoteStreamRef.current || new MediaStream();
          stream.addTrack(event.track);
        }
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          void sendRoomSignal("ice-candidate", {
            candidate: event.candidate.toJSON(),
          }).catch(() => {
            void finishCall("signalingFailed");
          });
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          recoveryPendingRef.current = false;
          clearCallTimer();
          updateCall((current) =>
            current.status === "ended"
              ? current
              : { ...current, status: "connected" },
          );
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          recoverWebRtc();
        }
      };
      return pc;
    },
    [
      clearCallTimer,
      ensureClient,
      finishCall,
      recoverWebRtc,
      sendRoomSignal,
      updateCall,
    ],
  );

  const flushCandidates = useCallback(async (pc: RTCPeerConnection) => {
    const queued = candidateQueueRef.current.splice(0);
    await Promise.all(queued.map((candidate) => pc.addIceCandidate(candidate)));
  }, []);

  const handleRoomSignal = useCallback(
    async (payload: Record<string, unknown>) => {
      const active = callRef.current;
      if (
        !active.id ||
        payload.callId !== active.id ||
        payload.fromUserId !== active.peerId ||
        payload.toUserId !== userIdRef.current
      )
        return;
      const type = String(payload.type || "");

      if (
        type === "accepted" &&
        active.direction === "outgoing" &&
        (active.status === "calling" || active.status === "ringing")
      ) {
        updateCall({ ...active, status: "connecting" });
        timeoutRef.current = setTimeout(() => {
          if (callRef.current.status === "connecting")
            void finishCall("connectionFailed", true);
        }, 45000);
        try {
          const pc = await createPeerConnection(
            active.mode || "voice",
            active.id!,
          );
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendRoomSignal("offer", {
            description: pc.localDescription?.toJSON(),
          });
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          const reason =
            error instanceof CallSetupError ? error.reason : "connectionFailed";
          try {
            await sendRoomSignal(
              reason === "permissionDenied" ? "permission-denied" : "failed",
            );
          } catch {
            /* report the local failure even if the peer is gone */
          }
          await finishCall(reason);
        }
        return;
      }

      if (type === "rejected") return void finishCall("rejected");
      if (type === "busy") return void finishCall("busy");
      if (type === "permission-denied")
        return void finishCall("remotePermissionDenied");
      if (type === "ended") return void finishCall("normal");
      if (type === "failed") return void finishCall("connectionFailed");

      const pc = peerRef.current;
      if (!pc) return;
      try {
        if (type === "offer" && active.direction === "incoming") {
          const description = payload.description as RTCSessionDescriptionInit;
          await pc.setRemoteDescription(description);
          await flushCandidates(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendRoomSignal("answer", {
            description: pc.localDescription?.toJSON(),
          });
        } else if (type === "answer" && active.direction === "outgoing") {
          await pc.setRemoteDescription(
            payload.description as RTCSessionDescriptionInit,
          );
          await flushCandidates(pc);
        } else if (type === "ice-candidate") {
          const candidate = payload.candidate as RTCIceCandidateInit;
          if (pc.remoteDescription) await pc.addIceCandidate(candidate);
          else candidateQueueRef.current.push(candidate);
        }
      } catch {
        await finishCall("connectionFailed", true);
      }
    },
    [
      createPeerConnection,
      finishCall,
      flushCandidates,
      sendRoomSignal,
      updateCall,
    ],
  );

  const subscribeRoom = useCallback(
    async (topic: string) => {
      if (roomRef.current?.topic === topic && roomReadyRef.current)
        return roomReadyRef.current;
      const client = await ensureClient();
      if (roomRef.current) void client.removeChannel(roomRef.current);
      const channel = client.channel(topic, {
        config: { private: true, broadcast: { ack: true, self: false } },
      });
      channel.on("broadcast", { event: "call-signal" }, ({ payload }) => {
        void handleRoomSignal((payload || {}) as Record<string, unknown>);
      });
      roomRef.current = channel;
      const ready = new Promise<RealtimeChannel>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Call channel timed out.")),
          12000,
        );
        channel.subscribe((status, error) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            resolve(channel);
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            clearTimeout(timeout);
            reject(error || new Error("Could not join the call channel."));
          }
        });
      });
      roomReadyRef.current = ready;
      try {
        return await ready;
      } catch (error) {
        if (roomRef.current === channel) {
          roomRef.current = null;
          roomReadyRef.current = null;
        }
        void client.removeChannel(channel);
        throw error;
      }
    },
    [ensureClient, handleRoomSignal],
  );

  const sendInboxInvite = useCallback(
    async (payload: Record<string, unknown>) => {
      const client = await ensureClient();
      const { error } = await client.from("call_invites").insert({
        id: payload.callId,
        caller_user_id: payload.fromUserId,
        target_user_id: payload.toUserId,
        caller_name: payload.fromName,
        mode: payload.mode,
        room_topic: payload.roomTopic,
        expires_at: new Date(Date.now() + 45000).toISOString(),
      });
      if (error)
        throw new Error(error.message || "Could not send the call invitation.");
    },
    [ensureClient],
  );

  const startCall = useCallback(
    async (peerId: string, peerName: string, mode: CallMode) => {
      if (!peerId)
        throw new Error("This profile does not have a call-enabled account.");
      if (callRef.current.status !== "idle") return;
      try {
        const ownId = await ensureIdentity();
        if (ownId === peerId)
          throw new Error("You cannot call your own account.");
        await refreshRealtimeAuth();
        const callId = newCallId();
        const topic = roomTopicFor(ownId, peerId, callId);
        updateCall({
          status: "calling",
          id: callId,
          roomTopic: topic,
          peerId,
          peerName,
          mode,
          direction: "outgoing",
        });
        await subscribeRoom(topic);
        await sendInboxInvite({
          callId,
          fromUserId: ownId,
          toUserId: peerId,
          fromName: userNameRef.current || getName() || "",
          mode,
          roomTopic: topic,
        });
        const sentCallState = callRef.current as ActiveCall;
        if (sentCallState.id === callId && sentCallState.status === "calling") {
          updateCall({ ...sentCallState, status: "ringing" });
          timeoutRef.current = setTimeout(() => {
            if (
              callRef.current.id === callId &&
              (callRef.current.status === "calling" ||
                callRef.current.status === "ringing")
            ) {
              finishCall("noAnswer", true);
            }
          }, 40000);
        }
      } catch (error) {
        await finishCall("signalingFailed");
        if (callRef.current.status === "idle") {
          updateCall({
            status: "error",
            endReason: "signalingFailed",
          });
        }
        console.error("Could not start call:", error);
      }
    },
    [
      ensureIdentity,
      finishCall,
      refreshRealtimeAuth,
      sendInboxInvite,
      subscribeRoom,
      updateCall,
    ],
  );

  const acceptCall = useCallback(async () => {
    const active = callRef.current;
    if (
      active.status !== "incoming" ||
      !active.id ||
      !active.roomTopic ||
      callDecisionInProgressRef.current === active.id
    )
      return;
    callDecisionInProgressRef.current = active.id;
    updateCall({ ...active, status: "connecting" });
    timeoutRef.current = setTimeout(() => {
      if (
        callRef.current.id === active.id &&
        callRef.current.status === "connecting"
      ) {
        finishCall("connectionFailed", true);
      }
    }, 45000);
    try {
      await ensureIdentity();
      if (
        callRef.current.id !== active.id ||
        callRef.current.status !== "connecting"
      )
        return;
      await refreshRealtimeAuth();
      if (
        callRef.current.id !== active.id ||
        callRef.current.status !== "connecting"
      )
        return;
      await subscribeRoom(active.roomTopic);
      await createPeerConnection(active.mode || "voice", active.id);
      if (
        callRef.current.id !== active.id ||
        callRef.current.status !== "connecting"
      )
        return;
      await sendRoomSignal("accepted");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const reason =
        error instanceof CallSetupError ? error.reason : "signalingFailed";
      try {
        await sendRoomSignal(
          reason === "permissionDenied" ? "permission-denied" : "failed",
        );
      } catch {
        /* report local failure even if peer disconnected */
      }
      await finishCall(reason);
    } finally {
      if (callDecisionInProgressRef.current === active.id)
        callDecisionInProgressRef.current = "";
    }
  }, [
    createPeerConnection,
    ensureIdentity,
    finishCall,
    refreshRealtimeAuth,
    sendRoomSignal,
    subscribeRoom,
    updateCall,
  ]);

  const rejectCall = useCallback(async () => {
    const active = callRef.current;
    if (
      active.status !== "incoming" ||
      !active.id ||
      callDecisionInProgressRef.current === active.id
    )
      return;
    callDecisionInProgressRef.current = active.id;
    try {
      await sendRoomSignal("rejected");
    } catch {
      /* call may have timed out */
    } finally {
      finishCall("rejected");
      if (callDecisionInProgressRef.current === active.id)
        callDecisionInProgressRef.current = "";
    }
  }, [finishCall, sendRoomSignal]);

  const endCall = useCallback(() => finishCall("normal", true), [finishCall]);
  const dismissCall = useCallback(() => {
    clearCallTimer();
    updateCall(IDLE_CALL);
  }, [clearCallTimer, updateCall]);

  const toggleMute = useCallback(() => {
    const nextMuted = !muted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMuted(nextMuted);
  }, [muted]);

  const toggleCamera = useCallback(() => {
    const nextOff = !cameraOff;
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !nextOff;
    });
    setCameraOff(nextOff);
  }, [cameraOff]);

  useEffect(() => {
    let active = true;
    let inbox: RealtimeChannel | null = null;
    let authRefreshInterval: ReturnType<typeof setInterval> | null = null;
    const onPageHide = () => finishCall("normal", true);
    window.addEventListener("pagehide", onPageHide);

    const onInvite = async (payload: Record<string, unknown>) => {
      if (!active) return;
      const ownId = userIdRef.current;
      const callId = String(payload.id || payload.callId || "");
      const fromUserId = String(
        payload.caller_user_id || payload.fromUserId || "",
      );
      const toUserId = String(payload.target_user_id || payload.toUserId || "");
      const mode = payload.mode === "video" ? "video" : "voice";
      if (
        !ownId ||
        toUserId !== ownId ||
        !fromUserId ||
        !callId ||
        fromUserId === ownId
      )
        return;
      const topic = roomTopicFor(fromUserId, ownId, callId);
      const suppliedTopic = String(
        payload.room_topic || payload.roomTopic || "",
      );
      const expiresAt = String(payload.expires_at || "");
      const expiresAtMs = Date.parse(expiresAt);
      if (
        suppliedTopic !== topic ||
        !Number.isFinite(expiresAtMs) ||
        expiresAtMs <= Date.now()
      )
        return;
      if (callRef.current.status !== "idle") {
        const busyCall = { id: callId, peerId: fromUserId } as ActiveCall;
        let busyClient: SupabaseClient | null = null;
        let busyChannel: RealtimeChannel | null = null;
        try {
          busyClient = await ensureClient();
          const channel = busyClient.channel(topic, {
            config: { private: true, broadcast: { ack: true } },
          });
          busyChannel = channel;
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(
              () => reject(new Error("timeout")),
              8000,
            );
            channel.subscribe((status) => {
              if (status === "SUBSCRIBED") {
                clearTimeout(timeout);
                resolve();
              } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                clearTimeout(timeout);
                reject(new Error(status));
              }
            });
          });
          await channel.send({
            type: "broadcast",
            event: "call-signal",
            payload: signalPayload(busyCall, ownId, "busy"),
          });
        } catch {
          /* Caller will time out if we cannot send busy. */
        } finally {
          if (busyClient && busyChannel)
            void busyClient.removeChannel(busyChannel);
        }
        return;
      }
      updateCall({
        status: "incoming",
        id: callId,
        roomTopic: topic,
        peerId: fromUserId,
        peerName: String(payload.caller_name || payload.fromName || ""),
        mode,
        direction: "incoming",
      });
      if (
        document.visibilityState === "hidden" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          const notification = new Notification(
            String(
              payload.caller_name ||
                payload.fromName ||
                callCopyRef.current.incoming,
            ),
            {
              body:
                mode === "video"
                  ? callCopyRef.current.incomingVideo
                  : callCopyRef.current.incomingVoice,
              tag: `call-${callId}`,
              requireInteraction: true,
            },
          );
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch {
          // The in-app incoming-call UI remains the fallback.
        }
      }
      try {
        await subscribeRoom(topic);
        const subscribedCall = getActiveCallSnapshot(callRef);
        if (
          subscribedCall.id === callId &&
          subscribedCall.status === "incoming"
        ) {
          timeoutRef.current = setTimeout(
            () => {
              const currentCall = getActiveCallSnapshot(callRef);
              if (
                currentCall.id === callId &&
                currentCall.status === "incoming"
              ) {
                finishCall("noAnswer");
              }
            },
            Math.max(0, expiresAtMs - Date.now()),
          );
        }
      } catch {
        await finishCall("signalingFailed");
      }
    };

    const initialize = async () => {
      try {
        let ownId = getUserId() || "";
        if (!ownId) {
          const user = await fetchCurrentUser();
          ownId = user.id;
          if (ownId) setUserId(ownId);
          userNameRef.current = user.fullName || getName() || "Teacher";
        } else {
          userNameRef.current = getName() || "Teacher";
        }
        if (!active || !ownId || !isSupabaseRealtimeConfigured()) return;
        userIdRef.current = ownId;
        const client = await ensureClient();
        if (!active) return;
        authRefreshInterval = setInterval(
          () => {
            void refreshRealtimeAuth().catch((error) => {
              console.error("Could not refresh call signaling token:", error);
            });
          },
          8 * 60 * 1000,
        );
        inbox = client.channel(`call-inbox:${ownId}`, {
          config: { private: true },
        });
        inbox.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "call_invites",
            filter: `target_user_id=eq.${ownId}`,
          },
          (payload) => {
            void onInvite((payload.new || {}) as Record<string, unknown>);
          },
        );
        inboxRef.current = inbox;
        inbox.subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("Call inbox subscription failed:", status);
          }
        });
      } catch (error) {
        console.error("Could not initialize incoming call listener:", error);
      }
    };

    void initialize();
    return () => {
      active = false;
      window.removeEventListener("pagehide", onPageHide);
      const endSignal = sendEndSignal();
      callRef.current = IDLE_CALL;
      if (authRefreshInterval) clearInterval(authRefreshInterval);
      clearCallTimer();
      peerRef.current?.close();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (clientRef.current) {
        if (inbox) void clientRef.current.removeChannel(inbox);
        if (roomRef.current) {
          const room = roomRef.current;
          const client = clientRef.current;
          if (endSignal)
            void endSignal.finally(() => client.removeChannel(room));
          else void client.removeChannel(room);
        }
      }
      inboxRef.current = null;
      roomRef.current = null;
      roomReadyRef.current = null;
    };
  }, [
    clearCallTimer,
    ensureClient,
    finishCall,
    refreshRealtimeAuth,
    sendEndSignal,
    subscribeRoom,
    updateCall,
  ]);

  const contextValue = { startCall };

  return (
    <CallContext.Provider value={contextValue}>
      {children}
      {call.status !== "idle" && (
        <CallOverlay
          call={call}
          copy={callCopy}
          localStream={localStream}
          remoteStream={remoteStream}
          muted={muted}
          cameraOff={cameraOff}
          onAccept={acceptCall}
          onReject={rejectCall}
          onEnd={endCall}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onDismiss={dismissCall}
        />
      )}
    </CallContext.Provider>
  );
}

export function useCalls() {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCalls must be used inside CallProvider.");
  return context;
}

type CallCopy = Record<string, any>;

function CallOverlay({
  call,
  copy,
  localStream,
  remoteStream,
  muted,
  cameraOff,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleCamera,
  onDismiss,
}: {
  call: ActiveCall;
  copy: CallCopy;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  muted: boolean;
  cameraOff: boolean;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onDismiss: () => void;
}) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      void remoteVideoRef.current.play().catch(() => undefined);
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      void remoteAudioRef.current.play().catch(() => undefined);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      void localVideoRef.current.play().catch(() => undefined);
    }
  }, [localStream, remoteStream, call.mode]);

  const isActive =
    call.status === "connected" ||
    call.status === "connecting" ||
    call.status === "disconnected";
  const statusLabel =
    call.status === "incoming"
      ? copy.incoming
      : call.status === "calling"
        ? copy.calling
        : call.status === "ringing"
          ? copy.ringing
          : call.status === "connecting"
            ? copy.connecting
            : call.status === "disconnected"
              ? copy.disconnected
              : call.status === "connected"
                ? copy.connected
                : call.status === "error"
                  ? copy.errorTitle
                  : copy.ended;
  const endMessage = call.endReason ? copy.reasons[call.endReason] : "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      <div
        className={`relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101923] text-white shadow-2xl ${call.mode === "video" && isActive ? "h-[min(86vh,720px)]" : "min-h-[350px] max-w-lg"}`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="m-0 text-[11px] text-white/60">
              {call.mode === "video" ? copy.videoCall : copy.voiceCall}
            </p>
            <h2 className="m-0 mt-0.5 truncate text-[15px] font-semibold">
              {call.peerName || copy.user}
            </h2>
          </div>
          {(call.status === "ended" || call.status === "error") && (
            <button
              type="button"
              aria-label={copy.close}
              onClick={onDismiss}
              className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </header>

        {call.mode === "video" && isActive ? (
          <div className="relative flex-1 min-h-0 bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            {!remoteStream && <CallAvatar name={call.peerName || copy.user} />}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`absolute bottom-4 end-4 aspect-video w-28 rounded-xl border border-white/30 bg-black object-cover shadow-lg sm:w-40 ${cameraOff ? "invisible" : ""}`}
            />
            {cameraOff && (
              <div className="absolute bottom-4 end-4 flex aspect-video w-28 items-center justify-center rounded-xl border border-white/20 bg-ink sm:w-40">
                <CameraOff size={20} />
              </div>
            )}
            {call.status === "disconnected" && (
              <div className="absolute top-4 start-4 rounded-full bg-amber-500/90 px-3 py-1.5 text-[12px] font-semibold text-white">
                {copy.disconnected}
              </div>
            )}
            {!remoteStream && (
              <div className="absolute bottom-4 start-4 rounded-full bg-black/50 px-3 py-1.5 text-[12px]">
                {copy.connecting}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
            <CallAvatar name={call.peerName || copy.user} />
            <p className="mb-1 mt-5 text-[19px] font-semibold">
              {call.peerName || copy.user}
            </p>
            <p className="m-0 text-[13px] text-white/65">{statusLabel}</p>
            {call.endReason && (
              <p
                role="alert"
                className="mb-0 mt-3 max-w-sm text-[12px] text-white/70"
              >
                {endMessage}
              </p>
            )}
            {call.status === "calling" && (
              <LoaderCircle
                className="mt-5 animate-spin text-[#E7C98A]"
                size={23}
              />
            )}
            {call.status === "ringing" && (
              <LoaderCircle
                className="mt-5 animate-spin text-[#E7C98A]"
                size={23}
              />
            )}
            {call.status === "connecting" && (
              <LoaderCircle
                className="mt-5 animate-spin text-[#E7C98A]"
                size={23}
              />
            )}
          </div>
        )}

        {call.mode === "video" &&
          call.status !== "connected" &&
          call.status !== "connecting" &&
          call.status !== "incoming" &&
          call.status !== "calling" &&
          call.endReason && (
            <p
              role="alert"
              className="mx-5 mb-0 text-center text-[12px] text-white/70"
            >
              {endMessage}
            </p>
          )}

        <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 px-4 py-4">
          {call.status === "incoming" ? (
            <>
              <button
                type="button"
                onClick={onReject}
                className="inline-flex items-center gap-2 rounded-full bg-danger px-5 py-3 text-[13px] font-semibold hover:bg-danger/80"
              >
                <PhoneOff size={17} />
                {copy.reject}
              </button>
              <button
                type="button"
                onClick={onAccept}
                className="inline-flex items-center gap-2 rounded-full bg-sage px-5 py-3 text-[13px] font-semibold text-ink hover:bg-sage/80"
              >
                <Check size={17} />
                {copy.accept}
              </button>
            </>
          ) : isActive ? (
            <>
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={muted ? copy.unmute : copy.mute}
                className={`flex h-12 w-12 items-center justify-center rounded-full ${muted ? "bg-white text-ink" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {muted ? <MicOff size={19} /> : <Mic size={19} />}
              </button>
              {call.mode === "video" && (
                <button
                  type="button"
                  onClick={onToggleCamera}
                  aria-label={cameraOff ? copy.cameraOn : copy.cameraOff}
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${cameraOff ? "bg-white text-ink" : "bg-white/10 text-white hover:bg-white/20"}`}
                >
                  {cameraOff ? <CameraOff size={19} /> : <Camera size={19} />}
                </button>
              )}
              <button
                type="button"
                onClick={onEnd}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-danger px-5 text-[13px] font-semibold hover:bg-danger/80"
              >
                <PhoneOff size={18} />
                {copy.endCall}
              </button>
            </>
          ) : call.status === "calling" || call.status === "ringing" ? (
            <button
              type="button"
              onClick={onEnd}
              className="inline-flex items-center gap-2 rounded-full bg-danger px-5 py-3 text-[13px] font-semibold hover:bg-danger/80"
            >
              <PhoneOff size={17} />
              {copy.cancel}
            </button>
          ) : (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-[13px] font-semibold hover:bg-white/20"
            >
              {copy.close}
            </button>
          )}
        </footer>
      </div>
      {call.mode !== "video" && <audio ref={remoteAudioRef} autoPlay />}
    </div>
  );
}

function CallAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#CFE7E4] to-[#9FCFC9] text-3xl font-semibold text-ink shadow-xl">
      {name.trim().charAt(0).toLocaleUpperCase() || <Video size={28} />}
    </div>
  );
}
