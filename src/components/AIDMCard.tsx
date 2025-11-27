import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "./Card";
import type {
  Ability,
  Skill,
  AdventureModule,
  ModuleProgress,
  Character,
  Message,
} from "../data/modules/goblin-cave";

// Electron bridge is declared in preload.d.ts or elsewhere in your project

/** ===== Helpers ===== */
const uid = () => Math.random().toString(36).slice(2);
const getProficiency = (lvl: number) => 2 + Math.floor((lvl - 1) / 4);

// Map each skill to its governing ability
const SKILL_ABILITIES: Record<Skill, Ability> = {
  "Acrobatics": "DEX",
  "Animal Handling": "WIS",
  "Arcana": "INT",
  "Athletics": "STR",
  "Deception": "CHA",
  "History": "INT",
  "Insight": "WIS",
  "Intimidation": "CHA",
  "Investigation": "INT",
  "Medicine": "WIS",
  "Nature": "INT",
  "Perception": "WIS",
  "Performance": "CHA",
  "Persuasion": "CHA",
  "Religion": "INT",
  "Sleight of Hand": "DEX",
  "Stealth": "DEX",
  "Survival": "WIS",
};

function sanitizeLLMOutput(text: string): string {
  let t = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  t = t.replace(/^(?:plan of action|plan|analysis)\s*[:\-]*\s*/gim, "");
  t = t.replace(/\S+$/, (m) => (/[.!?]$/.test(m) ? m : ""));
  return t.trim();
}

function extractDC(text: string): number | null {
  const m = text.match(/\bDC\s*(\d{1,2})\b/i);
  return m ? Number(m[1]) : null;
}

function useAutoScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const scrollToBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);
  return { ref, scrollToBottom };
}

/** ===== Actions based on current room/module ===== */
function getAvailableActions(
  currentModule?: AdventureModule,
  progress?: ModuleProgress,
  character?: Character
) {
  const actions: { label: string; action: string; icon: string }[] = [];
  if (!currentModule || !progress) return actions;

  const currentRoom = currentModule.rooms.find((r) => r.id === progress.currentRoom);
  if (!currentRoom) return actions;

  // Movement
  Object.entries(currentRoom.exits ?? {}).forEach(([dir]) => {
    actions.push({ label: `Go ${dir}`, action: `I go ${dir}.`, icon: "🧭" });
  });

  // Exploration
  if ((currentRoom.items?.length ?? 0) > 0) {
    actions.push({ label: "Search the room", action: "I search the room carefully.", icon: "🔍" });
  }
  if ((currentRoom.secrets?.length ?? 0) > 0) {
    actions.push({ label: "Look for secrets", action: "I look for hidden signs or mechanisms.", icon: "🕵️" });
  }
  if (currentRoom.stealthDC) {
    actions.push({ label: "Sneak through", action: "I move quietly and try to avoid notice.", icon: "🫥" });
  }

  // Social
  const firstNpcId = currentRoom.npcs?.[0];
  const npc = firstNpcId ? currentModule.npcs.find((n) => n.id === firstNpcId) : undefined;
  if (npc) {
    actions.push({ label: `Talk to ${npc.name}`, action: `I speak with ${npc.name}.`, icon: "💬" });
    actions.push({ label: `Intimidate ${npc.name}`, action: `I try to intimidate ${npc.name}.`, icon: "😠" });
    actions.push({ label: `Bribe ${npc.name}`, action: `I offer a small bribe to ${npc.name}.`, icon: "🪙" });
  }

  // Combat (encounterId)
  const encId = currentRoom.encounterId;
  if (encId && !progress.defeatedEncounters?.includes(encId)) {
    const encounter = currentModule.encounters.find((e) => e.id === encId);
    if (encounter) {
      actions.push({ label: "Attack", action: "I attack the nearest enemy.", icon: "⚔️" });
      actions.push({ label: "Defend", action: "I take a defensive stance.", icon: "🛡️" });
      actions.push({ label: "Hide", action: "I hide and try to gain advantage.", icon: "🌀" });
    }
  }

  // Always available
  actions.push({ label: "Listen", action: "I listen carefully to my surroundings.", icon: "👂" });
  actions.push({ label: "Short rest", action: "I take a short rest if it is safe.", icon: "😴" });

  // Character hooks
  if (character?.skills?.Perception) {
    actions.push({ label: "Perception check", action: "I make a Perception check.", icon: "👁️" });
  }
  if (character?.skills?.Investigation) {
    actions.push({ label: "Investigation check", action: "I examine the area closely.", icon: "🔎" });
  }
  if (character?.skills?.Stealth) {
    actions.push({ label: "Stealth check", action: "I move silently.", icon: "🫥" });
  }

  return actions;
}

/** ===== Component ===== */
type Props = {
  currentModule?: AdventureModule;
  moduleProgress?: ModuleProgress;
  currentCharacter?: Character;
  title?: string;
};

const AIDMCard: React.FC<Props> = ({
  currentModule,
  moduleProgress,
  currentCharacter,
  title = "AI Dungeon Master",
}) => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const { ref: scrollRef, scrollToBottom } = useAutoScroll<HTMLDivElement>();

  const actions = useMemo(
    () => getAvailableActions(currentModule, moduleProgress, currentCharacter),
    [currentModule, moduleProgress, currentCharacter]
  );

  const lastDM = useMemo(() => {
    for (let i = conversation.length - 1; i >= 0; i--) {
      if (conversation[i].role === "dm") return conversation[i];
    }
    return null;
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation, scrollToBottom]);

  const addMessage = useCallback((role: Message["role"], message: string) => {
    setConversation((prev) => [
      ...prev,
      { id: uid(), role, message, ts: Date.now() },
    ]);
  }, []);

  const rollSkill = useCallback(
    (skill: Skill, note?: string) => {
      // Get the correct ability modifier for this skill
      const governingAbility = SKILL_ABILITIES[skill];
      const mod = currentCharacter?.abilityMods?.[governingAbility] ?? 0;
      const trained = currentCharacter?.skills?.[skill] ?? false;
      const prof = trained ? getProficiency(currentCharacter?.level ?? 1) : 0;
      const d20 = 1 + Math.floor(Math.random() * 20);
      const total = d20 + mod + prof;
      const vs = extractDC(lastDM?.message ?? "");
      addMessage(
        "player",
        `Rolling ${skill}${note ? ` (${note})` : ""}: d20=${d20} + ${governingAbility} ${mod >= 0 ? '+' : ''}${mod} + prof ${prof >= 0 ? '+' : ''}${prof} = **${total}**${vs ? ` vs DC ${vs}` : ""}.`
      );
      return total;
    },
    [addMessage, currentCharacter?.abilityMods, currentCharacter?.level, currentCharacter?.skills, lastDM?.message]
  );

  /** ===== Get proficient skills for dynamic roll buttons ===== */
  const proficientSkills = useMemo(() => {
    if (!currentCharacter?.skills) return [];
    return Object.entries(currentCharacter.skills)
      .filter(([_, isProficient]) => isProficient)
      .map(([skill]) => skill as Skill);
  }, [currentCharacter?.skills]);

  /** ===== Electron streaming integration ===== */
  const streamRefs = useRef({ active: false, buffer: "" });

  const detachAllListeners = useCallback(() => {
    try {
      window.electron?.ollama?.clearListeners?.();
    } catch {
      /* noop */
    }
  }, []);

  const sendPrompt = useCallback(
    (prompt: string) => {
      if (!prompt.trim()) return;
      addMessage("player", prompt.trim());
      setInput("");

      if (!window.electron?.ollama?.sendPrompt) {
        addMessage("dm", "The cavern air chills as you act. (Electron bridge not connected.)");
        return;
      }

      setIsStreaming(true);
      streamRefs.current.active = true;
      streamRefs.current.buffer = "";

      detachAllListeners();

      const onChunk = (chunk: string) => {
        if (!streamRefs.current.active) return;
        streamRefs.current.buffer += chunk;
        const clean = sanitizeLLMOutput(streamRefs.current.buffer);
        setConversation((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "dm" && last.message.startsWith("…")) {
            const updated = prev.slice(0, -1);
            updated.push({ ...last, message: clean || "…" });
            return updated;
          }
          return [...prev, { id: uid(), role: "dm", message: clean || "…", ts: Date.now() }];
        });
      };

      const onDone = () => {
        streamRefs.current.active = false;
        setIsStreaming(false);
      };

      const onError = (err: any) => {
        streamRefs.current.active = false;
        setIsStreaming(false);
        addMessage("system", `Error: ${String(err?.message ?? err)}`);
      };

      window.electron.ollama.onStreamChunk?.(onChunk);
      window.electron.ollama.onStreamDone?.(onDone);
      window.electron.ollama.onStreamError?.(onError);
      window.electron.ollama.sendPrompt(prompt);
    },
    [addMessage, detachAllListeners]
  );

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendPrompt(input);
  }, [input, sendPrompt]);

  const handleActionClick = useCallback(
    (a: { label: string; action: string }) => {
      sendPrompt(a.action);
    },
    [sendPrompt]
  );

  return (
    <Card title={title}>
      <div className="aidm-card-body" style={styles.body}>
        {/* Subheader with module / room */}
        <div style={styles.subhead}>
          <span style={{ opacity: 0.9 }}>
            {currentModule ? currentModule.title : "No module loaded"}
          </span>
          <span style={{ opacity: 0.6 }}>
            {" · "}
            {moduleProgress?.currentRoom
              ? `Room: ${moduleProgress.currentRoom}`
              : "Choose a starting room"}
          </span>
        </div>

        {/* Actions */}
        <div className="aidm-actions" style={styles.actions}>
          {actions.map((a) => (
            <button
              key={a.label}
              style={styles.actionBtn}
              onClick={() => handleActionClick(a)}
              disabled={isStreaming}
              title={a.action}
            >
              <span style={{ marginRight: 6 }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div ref={scrollRef} className="aidm-chat" style={styles.chat}>
          {conversation.map((m) => (
            <div
              key={m.id}
              style={{
                ...styles.msgRow,
                justifyContent: m.role === "player" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.msgBubble,
                  background:
                    m.role === "player"
                      ? "#2d6cdf"
                      : m.role === "dm"
                      ? "#334155"
                      : "#7c3aed",
                  alignSelf: m.role === "player" ? "flex-end" : "flex-start",
                }}
              >
                <div style={styles.msgRole}>{m.role.toUpperCase()}</div>
                <div>{m.message}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="aidm-input" style={styles.inputRow}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say or do something… (Enter to send, Shift+Enter for newline)"
            style={styles.textarea}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            style={styles.sendBtn}
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
          >
            {isStreaming ? "…" : "Send"}
          </button>
        </div>

        {/* Dynamic Roll helpers - show skills character is proficient in */}
        {proficientSkills.length > 0 && (
          <div className="aidm-rolls" style={styles.rollRow}>
            {proficientSkills.slice(0, 5).map((skill) => (
              <button
                key={skill}
                style={styles.rollBtn}
                onClick={() => rollSkill(skill)}
                disabled={isStreaming}
              >
                Roll {skill}
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

/** ===== Inline styles for the content inside Card (non-conflicting) ===== */
const styles: Record<string, React.CSSProperties> = {
  body: { display: "flex", flexDirection: "column", gap: 12, height: "100%" },
  subhead: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontSize: 12,
    color: "#bbb",
  },
  actions: { display: "flex", flexWrap: "wrap", gap: 8 },
  actionBtn: {
    background: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #374151",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: 13,
  },
  chat: {
    flex: 1,
    overflowY: "auto",
    background: "#0a0f1a",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: 12,
  },
  msgRow: { display: "flex", marginBottom: 8 },
  msgBubble: {
    maxWidth: "72%",
    padding: "10px 12px",
    borderRadius: 12,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#e5e7eb",
  },
  msgRole: { fontSize: 10, opacity: 0.7, marginBottom: 6 },
  inputRow: { display: "flex", gap: 8, alignItems: "stretch" },
  textarea: {
    flex: 1,
    minHeight: 48,
    resize: "vertical",
    background: "#0b1220",
    color: "#e5e7eb",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: 10,
    fontFamily: "inherit",
  },
  sendBtn: {
    background: "#2563eb",
    color: "white",
    border: 0,
    borderRadius: 10,
    padding: "0 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  rollRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  rollBtn: {
    background: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #374151",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 12,
  },
};

export default AIDMCard;