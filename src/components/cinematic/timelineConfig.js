/**
 * Central Cinematic Timeline Configuration for HackFest 3.0:
 * Defines strict, normalized timeline intervals [start, end] for each sequential scene,
 * ensuring zero magical numbers and completely predictable, reversible scroll behavior.
 * 
 * Strict Sequence Order:
 * Scene 1: Space introduction (Starfield & cosmic dust) [0.00 - 0.10]
 * Scene 2: Animated planet & Space Fighter flyby [0.10 - 0.22]
 * Scene 3: Doctor Doom dedicated solo reveal [0.22 - 0.35]
 * Scene 4: Thor celestial lightning storm [0.35 - 0.46]
 * Scene 5: Iron Man portal emergence & straight upright hover [0.46 - 0.60]
 * Scene 6: Spider-Man web-slinger dynamic arrival [0.60 - 0.72]
 * Scene 7: Spacecraft vanguard tactical maneuver [0.72 - 0.80]
 * Scene 8: ALL CHARACTERS ASSEMBLED (NO TITLE YET!) [0.80 - 0.90]
 * Scene 9: FINAL HACKFEST 3.0 DIMENSIONAL TITLE REVEAL [0.90 - 1.00]
 */
export const CINEMATIC_TIMELINE = {
  SCENE_1_DEEP_SPACE: [0.00, 0.10],
  SCENE_2_PLANET_SPACECRAFT: [0.10, 0.22],
  SCENE_3_DOCTOR_DOOM: [0.22, 0.35],
  SCENE_4_THOR_LIGHTNING: [0.35, 0.46],
  SCENE_5_IRON_MAN: [0.46, 0.60],
  SCENE_6_SPIDER_MAN: [0.60, 0.72],
  SCENE_7_SPACECRAFT_ESCORT: [0.72, 0.80],
  SCENE_8_ASSEMBLY: [0.80, 0.90],
  SCENE_9_TITLE_REVEAL: [0.90, 1.00],
};

/**
 * Helper to calculate normalized progress (0 to 1) within a given scene range.
 */
export function getSceneProgress(progress, [start, end]) {
  if (progress < start) return 0;
  if (progress > end) return 1;
  return (progress - start) / (end - start);
}

/**
 * Helper to check if progress is within an active range.
 */
export function isSceneActive(progress, [start, end]) {
  return progress >= start && progress < end;
}

export default CINEMATIC_TIMELINE;
