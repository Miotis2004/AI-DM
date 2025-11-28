import {
  AdventureModule,
  Room,
  Encounter,
  NPC,
  Container,
  StatBlock,
  Objective
} from "../../types/module";

// ===== Data: Goblin Cave =====

// NPC templates and named figures
const GOBLIN_GUARD: StatBlock = {
  cr: 0.25,
  ac: 15,
  hp: 7,
  speed: "30 ft",
  initiativeMod: 2,
  abilities: { DEX: 2 },
  skills: { Stealth: 6, Perception: 2 },
  passivePerception: 9,
  senses: "darkvision 60 ft",
  attacks: [
    {
      name: "Scimitar",
      bonus: 4,
      damageDice: "1d6+2",
      damageType: "slashing",
      reach: "5 ft",
      formatted: "+4 to hit, 5 avg slashing",
    },
    {
      name: "Shortbow",
      bonus: 4,
      damageDice: "1d6+2",
      damageType: "piercing",
      range: "80/320 ft",
      formatted: "+4 to hit, 5 avg piercing",
    },
  ],
  traits: ["Nimble Escape: Disengage or Hide as a bonus action"],
  languages: "Common, Goblin",
};

const WOLF: StatBlock = {
  cr: 0.25,
  ac: 13,
  hp: 11,
  speed: "40 ft",
  initiativeMod: 2,
  abilities: { STR: 1, DEX: 2 },
  skills: { Perception: 3, Stealth: 4 },
  passivePerception: 13,
  senses: "keen hearing and smell",
  attacks: [
    {
      name: "Bite",
      bonus: 4,
      damageDice: "2d4+2",
      damageType: "piercing",
      reach: "5 ft",
      formatted: "+4 to hit, 7 avg piercing; DC 11 STR save or prone",
    },
  ],
  traits: ["Pack Tactics: Advantage on attacks if ally is within 5 ft of target"],
  languages: "",
};

// Items
const items: AdventureModule["items"] = [
  { id: "stone-key", name: "Notched Stone Key", description: "A palm-sized key carved from riverstone with crude goblin runes.", type: "key" },
  { id: "torch-bundle", name: "Bundle of Torches", description: "Six pitch-soaked torches wrapped in twine.", type: "gear" },
  { id: "rations-goblin", name: "Goblin Rations", description: "Dried fish, sour mushrooms, and hard cakes. Edible, barely.", type: "provisions" },
  { id: "dagger-plus1", name: "Dagger, +1", description: "A well-balanced blade with a dull sheen that catches the eye.", type: "weapon" },
];

// Containers
const containers: Container[] = [
  {
    id: "chest-01",
    name: "Sturdy Wooden Chest",
    description: "Iron-banded chest tucked in a niche with scuffed stone around it.",
    lock: { isLocked: true, keyItemId: "stone-key", pickDC: 15, forceDC: 14 },
    contents: ["50 gp", "dagger-plus1"],
  },
];

// NPC templates and named figures
const npcs: NPC[] = [
  {
    id: "snikk",
    name: "Snikk",
    role: "cowardly goblin lookout",
    disposition: "wary",
    motivations: ["Avoid pain", "Trade junk for safety", "Impress the boss"],
    dialogue: [
      { cue: "threaten", line: "No stab Snikk. Snikk talks. Boss hates torches." , intent: "stall"},
      { cue: "bribe", line: "Shiny for a secret? Chest key is round and cold. Snikk saw stone teeth by the pool.", intent: "deal"},
      { cue: "ask-way", line: "Left then down. Hear drips? That way. But gobbos wait.", intent: "guide"},
    ],
    stats: {
      cr: 0.25,
      ac: 13,
      hp: 7,
      speed: "30 ft",
      initiativeMod: 2,
      abilities: { DEX: 2 },
      skills: { Stealth: 6, Perception: 2 },
      passivePerception: 9,
      senses: "darkvision 60 ft",
      attacks: [
        {
          name: "Shortsword",
          bonus: 4,
          damageDice: "1d6+2",
          damageType: "slashing",
          reach: "5 ft",
          formatted: "+4 to hit, 5 avg slashing",
        },
      ],
      traits: ["Nimble Escape: Disengage or Hide as a bonus action"],
      languages: "Common, Goblin",
    },
  },
];

// Encounters
const encounters: Encounter[] = [
  {
    id: "ambush-antechamber",
    name: "Goblin Ambush",
    description: "Two goblin guards lurk behind jagged rocks while a third watches from a ledge.",
    enemies: [
      { name: "Goblin Guard", stats: GOBLIN_GUARD, count: 2 },
      { name: "Goblin Lookout", stats: { ...GOBLIN_GUARD, ac: 14, hp: 5, skills: { ...GOBLIN_GUARD.skills, Perception: 4 } } },
    ],
    tactics: "They snipe with shortbows then fall back toward the main chamber, using Nimble Escape to avoid melee.",
    stealthAvoidDC: 13,
    scaling: {
      easy: "Remove the lookout and start with only one guard on duty.",
      medium: "As written.",
      hard: "Add one more guard and give rocks half cover to archers.",
      deadly: "Start with surprised party unless they beat DC 15 Perception; add caltrops that slow pursuit.",
    },
  },
  {
    id: "kennel-fray",
    name: "Wolf Kennel",
    description: "A tethered wolf snarls near a pile of bones; a goblin handler prods it with a stick.",
    enemies: [
      { name: "Wolf", stats: WOLF },
      { name: "Goblin Handler", stats: { ...GOBLIN_GUARD, hp: 9, attacks: [{ name: "Club", bonus: 4, damageDice: "1d4+2", damageType: "bludgeoning", reach: "5 ft" }] } },
    ],
    tactics: "Handler commands the wolf to drag foes prone while he retreats and yells for help.",
    stealthAvoidDC: 12,
    treasure: ["rations-goblin"],
  },
  {
    id: "guard-post",
    name: "Main Chamber Guard Post",
    description: "A cook fire smolders. Two goblins play knucklebones while a third naps." ,
    enemies: [
      { name: "Goblin Guard", stats: GOBLIN_GUARD, count: 2 },
      { name: "Goblin Dozer", stats: { ...GOBLIN_GUARD, hp: 5 } },
    ],
    tactics: "If alerted by noise from the antechamber, they take positions behind stalagmites and focus fire on the least armored target.",
    stealthAvoidDC: 11,
    treasure: ["stone-key"],
  },
];

// Rooms
const rooms: Room[] = [
  {
    id: "entrance",
    name: "Cave Mouth",
    description: "A jagged cleft in a low cliff opens into cool darkness. Damp air carries the smell of smoke and wet fur.",
    light: "dim",
    ambient: "Distant drips and the faint clatter of stone on stone.",
    exits: { east: "antechamber" },
    secrets: [
      {
        text: "Fresh goblin tracks lead inward; smaller bare prints suggest a wolf pup once roamed here.",
        check: { skill: "Survival", dc: 10, onSuccess: "You can estimate at least four goblins use this path." },
      },
    ],
  },
  {
    id: "antechamber",
    name: "Shadowed Antechamber",
    description: "Jagged rocks form natural cover and narrow lanes. A soot smear stains the ceiling.",
    light: "dark",
    ambient: "A breath of cold air brushes your cheeks when you move.",
    exits: { west: "entrance", southeast: "main-chamber" },
    encounterId: "ambush-antechamber",
    stealthDC: 13,
    secrets: [
      {
        text: "Loose stones can be nudged to create a distraction in the southeast passage.",
        check: { skill: "Sleight of Hand", dc: 12, onSuccess: "You draw a goblin to investigate, opening a gap to slip past.", onFailure: "The clatter alerts the group instead." },
      },
    ],
  },
  {
    id: "main-chamber",
    name: "Main Chamber",
    description: "A broad cavern with a low fire pit, stacked crates, and a rope leading up to a rickety ledge.",
    light: "dim",
    ambient: "The crackle of embers, the rustle of sacks, and occasional goblin chatter.",
    exits: { northwest: "antechamber", east: "kennel", south: "treasure-hall" },
    encounterId: "guard-post",
    secrets: [
      {
        text: "A stone carving of jagged teeth near the rope marks the boss's personal stash.",
        check: { skill: "Investigation", dc: 12, onSuccess: "You spot a faint footprint pointing toward the southern passage." },
      },
    ],
  },
  {
    id: "kennel",
    name: "Wolf Kennel",
    description: "A side chamber reeking of musky fur. A crude fence and a frayed rope tether sit near a heap of bones.",
    light: "dark",
    ambient: "Low growls and the scrape of claws on stone.",
    exits: { west: "main-chamber" },
    encounterId: "kennel-fray",
    items: ["rations-goblin"],
  },
  {
    id: "treasure-hall",
    name: "Boss's Hoard Niche",
    description: "A narrow hall opens into a niche where an iron-banded chest rests on stacked slate.",
    light: "dark",
    ambient: "Water drops tick into a shallow pool that reflects a faint gleam from metal fittings.",
    exits: { north: "main-chamber" },
    secrets: [
      {
        text: "A notched stone keyhole sits under the front lip of the slate pedestal.",
        check: { skill: "Perception", dc: 11, onSuccess: "You find the keyhole without touching the chest." },
      },
    ],
    items: ["chest-01"], // reference to container by id for engine linking
  },
];

// Objectives
const objectives: Objective[] = [
  { id: "clear-goblins", text: "Drive off or defeat the goblins.", doneIf: "No hostile goblins remain in main-chamber or antechamber." },
  { id: "recover-treasure", text: "Recover what the goblin boss stole.", doneIf: "Chest chest-01 opened or its contents claimed." },
  { id: "spare-snikk", text: "Resolve Snikk's presence without killing him.", doneIf: "Snikk is not hostile at module end and is alive or has fled." },
];

export const GoblinCave: AdventureModule = {
  id: "goblin-cave",
  title: "Goblin Cave",
  levelRange: [1, 2],
  tags: ["intro", "goblins", "cave", "low-light", "level-1"],
  summary:
    "A short crawl ideal for level 1 groups. Skulk past goblin sentries, bargain with a cowardly lookout, calm a hungry wolf, and crack the boss's chest.",
  rooms,
  encounters,
  npcs,
  containers,
  items,
  objectives,
  rules: {
    stealth:
      "If the party's group Stealth beats a room's stealthDC or the encounter's stealthAvoidDC, they can bypass or gain advantage on the first round.",
    negotiation:
      "Offer rations or coin to adjust Snikk's disposition. A DC 12 Persuasion can turn him neutral; a DC 14 with a small bribe turns him friendly.",
  },
};

// ===== Validator =====
export function validateModule(m: AdventureModule): string[] {
  const errors: string[] = [];
  const roomIds = new Set(m.rooms.map((r) => r.id));
  const encIds = new Set(m.encounters.map((e) => e.id));
  const npcIds = new Set(m.npcs.map((n) => n.id));
  const containerIds = new Set(m.containers.map((c) => c.id));
  const itemIds = new Set(m.items.map((i) => i.id));

  // Rooms: exits and references
  for (const r of m.rooms) {
    for (const dest of Object.values(r.exits)) {
      if (!roomIds.has(dest)) errors.push(`Room ${r.id} exits to missing room: ${dest}`);
    }
    if (r.encounterId && !encIds.has(r.encounterId)) {
      errors.push(`Room ${r.id} references missing encounter: ${r.encounterId}`);
    }
    for (const n of r.npcs ?? []) {
      if (!npcIds.has(n)) errors.push(`Room ${r.id} references missing NPC: ${n}`);
    }
    for (const it of r.items ?? []) {
      if (!itemIds.has(it) && !containerIds.has(it)) {
        errors.push(`Room ${r.id} references missing item or container: ${it}`);
      }
    }
    for (const s of r.secrets ?? []) {
      if (s.check && s.check.dc <= 0) errors.push(`Room ${r.id} has invalid DC in a secret.`);
    }
  }

  // Encounters: enemies and treasure
  for (const e of m.encounters) {
    if (!e.enemies.length) errors.push(`Encounter ${e.id} has no enemies.`);
    for (const enemy of e.enemies) {
      if (!enemy.stats || !enemy.stats.ac || !enemy.stats.hp) {
        errors.push(`Encounter ${e.id} enemy ${enemy.name} has incomplete stats.`);
      }
    }
    for (const t of e.treasure ?? []) {
      if (typeof t === "string" && t.endsWith("gp")) continue; // loose coin ok
      if (!itemIds.has(t)) errors.push(`Encounter ${e.id} treasure references missing item: ${t}`);
    }
  }

  // Containers
  for (const c of m.containers) {
    for (const t of c.contents) {
      if (typeof t === "string" && t.endsWith("gp")) continue;
      if (!itemIds.has(t)) errors.push(`Container ${c.id} contents reference missing item: ${t}`);
    }
  }

  // Objectives: basic sanity
  for (const o of m.objectives) {
    if (!o.text.trim()) errors.push(`Objective ${o.id} has no text.`);
  }

  return errors;
}

export default GoblinCave;
