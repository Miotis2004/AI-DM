import React, { useCallback, useEffect, useMemo, useRef } from "react";
import Card from "./Card";
import { useGameStore } from "../store/gameStore";
import type { AdventureModule, ModuleProgress, Character } from "../types/module";

// Helper to auto-scroll to bottom of chat
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
  currentModule: AdventureModule | null,
  progress: ModuleProgress | null,
  activeEncounter: any
) {
  const actions: { label: string; action: () => void; icon: string; type: 'move' | 'interact' | 'combat' }[] = [];

  const store = useGameStore.getState();

  // 1. COMBAT ACTIONS
  if (activeEncounter) {
    activeEncounter.enemies.forEach((enemy: any) => {
        actions.push({
            label: `Attack ${enemy.name} (${enemy.hp}/${enemy.maxHp})`,
            action: () => store.attackEnemy(enemy.instanceId),
            icon: "⚔️",
            type: "combat"
        });
    });

    actions.push({
        label: "Flee",
        action: () => store.fleeEncounter(),
        icon: "🏃",
        type: "combat"
    });

    return actions; // Only show combat actions during combat
  }

  // 2. EXPLORATION ACTIONS
  if (!currentModule || !progress) return actions;

  const currentRoom = currentModule.rooms.find((r) => r.id === progress.currentRoom);
  if (!currentRoom) return actions;

  // Movement
  Object.entries(currentRoom.exits ?? {}).forEach(([dir]) => {
    actions.push({
      label: `Go ${dir}`,
      action: () => store.move(dir),
      icon: "🧭",
      type: 'move'
    });
  });

  return actions;
}

const AdventureCard: React.FC = () => {
  const {
    currentModule,
    moduleProgress,
    activeEncounter,
    log,
    getCurrentCharacter
  } = useGameStore();

  const currentCharacter = getCurrentCharacter();
  const { ref: scrollRef, scrollToBottom } = useAutoScroll<HTMLDivElement>();

  const actions = useMemo(
    () => getAvailableActions(currentModule, moduleProgress, activeEncounter),
    [currentModule, moduleProgress, activeEncounter]
  );

  useEffect(() => {
    scrollToBottom();
  }, [log, scrollToBottom]);

  return (
    <Card title="Adventure Log">
      <div className="aidm-card-body" style={styles.body}>
        {/* Subheader with module / room */}
        <div style={styles.subhead}>
          <span style={{ opacity: 0.9 }}>
            {currentModule ? currentModule.title : "No module loaded"}
          </span>
          <span style={{ opacity: 0.6 }}>
            {" · "}
            {activeEncounter ? "COMBAT" : (moduleProgress?.currentRoom
              ? `Room: ${moduleProgress.currentRoom}`
              : "Load a module to start")}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="aidm-actions" style={styles.actions}>
          {actions.map((a, idx) => (
            <button
              key={`${a.label}-${idx}`}
              style={{
                  ...styles.actionBtn,
                  background: a.type === 'combat' ? '#7f1d1d' : '#1f2937',
                  borderColor: a.type === 'combat' ? '#b91c1c' : '#374151'
              }}
              onClick={a.action}
              title={a.label}
            >
              <span style={{ marginRight: 6 }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
          {actions.length === 0 && currentModule && (
             <div style={{fontSize: 12, color: '#888'}}>No actions available.</div>
          )}
        </div>

        {/* Log Display */}
        <div ref={scrollRef} className="aidm-chat" style={styles.chat}>
          {log.map((m) => (
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
                      : "#7c3aed", // System messages
                  alignSelf: m.role === "player" ? "flex-end" : "flex-start",
                  border: m.role === 'system' ? '1px solid #7c3aed' : 'none',
                  background: m.role === 'system' ? 'rgba(124, 58, 237, 0.2)' : (m.role === 'player' ? "#2d6cdf" : "#334155")
                }}
              >
                {m.role !== 'player' && <div style={styles.msgRole}>{m.role.toUpperCase()}</div>}
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

/** ===== Inline styles for the content inside Card ===== */
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
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 14,
    display: 'flex',
    alignItems: 'center'
  },
  chat: {
    flex: 1,
    overflowY: "auto",
    background: "#0a0f1a",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: 12,
  },
  msgRow: { display: "flex", marginBottom: 12 },
  msgBubble: {
    maxWidth: "85%",
    padding: "10px 14px",
    borderRadius: 12,
    wordBreak: "break-word",
    color: "#e5e7eb",
    lineHeight: '1.5'
  },
  msgRole: { fontSize: 10, opacity: 0.7, marginBottom: 4, fontWeight: 'bold', letterSpacing: '0.5px' },
};

export default AdventureCard;
