/**
 * Character Asset Registry:
 * Central repository of all verified 3D character models discovered in the project.
 * Contains verified paths, mesh properties, lighting themes, and animation capabilities.
 * 
 * THOR ASSET AUDIT REPORT:
 * - public/models/thor/thor.glb was inspected and confirmed to contain Jane Foster (female Thor / hero_janefoster01).
 * - public/models/hero/doom/jane_foster_thor.glb is identical to thor.glb.
 * - System-wide search confirmed NO male Thor 3D model exists on this computer.
 * - In strict compliance with instructions: Female Thor is NOT used, NOT renamed, and NOT rendered as male Thor.
 * - Male Thor is documented as MISSING / EXCLUDED.
 */
export const CHARACTER_REGISTRY = [
  {
    id: 'universe',
    name: 'Cosmic Horizon',
    subtitle: 'Deep Space Planetary Alignment',
    primaryPath: '/models/the_universe.glb',
    sizeMB: 0.53,
    hasSkeleton: false,
    hasAnimations: true,
    clipNames: ['-10s'],
    role: 'Cosmic Environment',
    verified: true,
    activePhase: { start: 0.14, end: 0.28 },
  },
  {
    id: 'doom',
    name: 'Doctor Doom',
    subtitle: 'Monarch of Latveria • Master of Mystic Tech',
    primaryPath: '/models/doom/doom.glb',
    fallbackPath: '/models/hero/doom/doom.glb',
    sizeMB: 9.91,
    hasSkeleton: true,
    hasAnimations: false,
    defaultScale: 1.65,
    themeColor: '#00ff88',
    themeLight: 0x00ff77,
    ambientLight: 0x003318,
    role: 'Mystic Tech Sovereign',
    verified: true,
    activePhase: { start: 0.28, end: 0.46 },
    assemblyPos: { x: 3.8, y: 0.0, z: -1.0, rotY: -0.35 },
  },
  {
    id: 'thor',
    name: 'Male Thor (Asset Missing)',
    subtitle: 'Female Thor (Jane Foster) Excluded • No Male Thor In Project',
    primaryPath: null,
    sizeMB: 0,
    hasSkeleton: false,
    hasAnimations: false,
    themeColor: '#60d5ff',
    themeLight: 0x60d5ff,
    role: 'Thunder Warrior (Excluded - No Asset)',
    verified: false,
    status: 'MISSING_MALE_THOR_ASSET',
    note: 'public/models/thor/thor.glb is Jane Foster female Thor. Strictly excluded per instructions.',
    activePhase: { start: 0.46, end: 0.58 },
  },
  {
    id: 'ironman',
    name: 'Iron Man',
    subtitle: 'Tony Stark • Mark VII Armored Avenger',
    primaryPath: '/models/ironman/ironman.glb',
    fallbackPath: '/models/hero/doom/iron_man_rig.glb',
    sizeMB: 2.95,
    hasSkeleton: true,
    hasAnimations: false,
    defaultScale: 1.75,
    themeColor: '#ff3b30',
    themeLight: 0xff3b30,
    accentLight: 0x00e1ff,
    role: 'Armored Vanguard',
    verified: true,
    activePhase: { start: 0.58, end: 0.74 },
    assemblyPos: { x: 1.5, y: 0.0, z: 0.0, rotY: -0.2 },
  },
  {
    id: 'spiderman',
    name: 'The Amazing Spider-Man',
    subtitle: 'Peter Parker • Web-Slinging Protector',
    primaryPath: '/models/spiderman/spiderman.glb',
    fallbackPath: '/models/hero/doom/the_amazing_spider_man_2_rigged_model.glb',
    sizeMB: 10.96,
    hasSkeleton: true,
    hasAnimations: true,
    clipNames: ['Spidey'],
    defaultClip: 'Spidey',
    defaultScale: 1.75,
    themeColor: '#0070f3',
    themeLight: 0x2277ff,
    accentLight: 0xff1744,
    role: 'Acrobatic Web Guardian',
    verified: true,
    activePhase: { start: 0.74, end: 0.88 },
    assemblyPos: { x: -1.5, y: 0.0, z: 0.0, rotY: 0.2 },
  },
];

export default CHARACTER_REGISTRY;
