import React from 'react';

interface MinecraftAvatarProps {
  patientId: string;
  size?: number;
  className?: string;
}

const AVATAR_PALETTES: Record<string, {
  skin: string;
  skinShadow: string;
  hair: string;
  hairDark: string;
  eye: string;
  clothing: string;
  clothingAccent: string;
  glasses?: boolean;
  beard?: boolean;
}> = {
  'HG-001': { skin: '#eec5a2', skinShadow: '#d9ac8b', hair: '#b59b7c', hairDark: '#9c8163', eye: '#3b82f6', clothing: '#0d9488', clothingAccent: '#14b8a6' },
  'HG-002': { skin: '#dfaa8b', skinShadow: '#c48f70', hair: '#4a3221', hairDark: '#322215', eye: '#15803d', clothing: '#1e40af', clothingAccent: '#3b82f6' },
  'HG-003': { skin: '#eed8c8', skinShadow: '#d9beaa', hair: '#e2e8f0', hairDark: '#cbd5e1', eye: '#0284c7', clothing: '#475569', clothingAccent: '#64748b', glasses: true },
  'HG-004': { skin: '#d49e7d', skinShadow: '#ba8261', hair: '#854d0e', hairDark: '#713f12', eye: '#78350f', clothing: '#831843', clothingAccent: '#9d174d' },
  'HG-005': { skin: '#c68662', skinShadow: '#ab6d49', hair: '#18181b', hairDark: '#09090b', eye: '#854d0e', clothing: '#365314', clothingAccent: '#4d7c0f', beard: true },
  'HG-006': { skin: '#eed3bc', skinShadow: '#d4b69d', hair: '#78350f', hairDark: '#451a03', eye: '#059669', clothing: '#be185d', clothingAccent: '#db2777' },
  'HG-007': { skin: '#d8ab8d', skinShadow: '#bf8e70', hair: '#a16207', hairDark: '#854d0e', eye: '#2563eb', clothing: '#1e293b', clothingAccent: '#334155' },
  'HG-008': { skin: '#f8e2cf', skinShadow: '#dfc7b2', hair: '#ca8a04', hairDark: '#a16207', eye: '#0284c7', clothing: '#059669', clothingAccent: '#10b981' },
  'HG-009': { skin: '#c89474', skinShadow: '#ad7859', hair: '#52525b', hairDark: '#3f3f46', eye: '#3b82f6', clothing: '#1d4ed8', clothingAccent: '#2563eb', glasses: true },
  'HG-010': { skin: '#8c5638', skinShadow: '#714227', hair: '#1c1917', hairDark: '#0c0a09', eye: '#451a03', clothing: '#c2410c', clothingAccent: '#ea580c' },
};

export const MinecraftAvatar: React.FC<MinecraftAvatarProps> = ({ patientId, size = 48, className = '' }) => {
  // Normalize patientId: HG-001 or P001 -> HG-001
  const normId = patientId.startsWith('P') ? `HG-0${patientId.slice(1)}` : patientId;
  const p = AVATAR_PALETTES[normId] || AVATAR_PALETTES['HG-001'];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 8 8"
      width={size}
      height={size}
      className={`rounded-lg shrink-0 shadow-sm ${className}`}
      style={{ imageRendering: 'pixelated', backgroundColor: '#0f172a' }}
      role="img"
      aria-label={`Minecraft avatar for ${patientId}`}
    >
      {/* Base skin */}
      <rect x="0" y="0" width="8" height="6" fill={p.skinShadow} shapeRendering="crispEdges" />
      <rect x="1" y="1" width="6" height="4" fill={p.skin} shapeRendering="crispEdges" />

      {/* Hair (top & sides) */}
      <rect x="0" y="0" width="8" height="1" fill={p.hairDark} shapeRendering="crispEdges" />
      <rect x="1" y="0" width="6" height="1" fill={p.hair} shapeRendering="crispEdges" />
      <rect x="0" y="1" width="8" height="1" fill={p.hair} shapeRendering="crispEdges" />
      <rect x="0" y="2" width="1" height="2" fill={p.hairDark} shapeRendering="crispEdges" />
      <rect x="7" y="2" width="1" height="2" fill={p.hairDark} shapeRendering="crispEdges" />

      {/* Eyes */}
      <rect x="1" y="2" width="1" height="1" fill="#ffffff" shapeRendering="crispEdges" />
      <rect x="2" y="2" width="1" height="1" fill={p.eye} shapeRendering="crispEdges" />
      <rect x="2" y="3" width="1" height="1" fill="#0f172a" shapeRendering="crispEdges" />

      <rect x="6" y="2" width="1" height="1" fill="#ffffff" shapeRendering="crispEdges" />
      <rect x="5" y="2" width="1" height="1" fill={p.eye} shapeRendering="crispEdges" />
      <rect x="5" y="3" width="1" height="1" fill="#0f172a" shapeRendering="crispEdges" />

      {/* Glasses */}
      {p.glasses && (
        <>
          <rect x="1" y="2" width="2" height="1" fill="#e0f2fe" opacity="0.6" shapeRendering="crispEdges" />
          <rect x="5" y="2" width="2" height="1" fill="#e0f2fe" opacity="0.6" shapeRendering="crispEdges" />
          <rect x="3" y="2" width="2" height="1" fill="#334155" shapeRendering="crispEdges" />
          <rect x="0" y="2" width="1" height="1" fill="#334155" shapeRendering="crispEdges" />
          <rect x="7" y="2" width="1" height="1" fill="#334155" shapeRendering="crispEdges" />
        </>
      )}

      {/* Nose & Mouth */}
      <rect x="3" y="3" width="2" height="1" fill={p.skinShadow} shapeRendering="crispEdges" />
      <rect x="3" y="4" width="2" height="1" fill="#b97b66" shapeRendering="crispEdges" />

      {/* Beard */}
      {p.beard && (
        <rect x="2" y="4" width="4" height="2" fill={p.hairDark} shapeRendering="crispEdges" />
      )}

      {/* Clothing Collar / Shoulders */}
      <rect x="0" y="6" width="8" height="2" fill={p.clothing} shapeRendering="crispEdges" />
      <rect x="1" y="6" width="6" height="1" fill={p.clothingAccent} shapeRendering="crispEdges" />
      <rect x="3" y="6" width="2" height="1" fill={p.skinShadow} shapeRendering="crispEdges" />
    </svg>
  );
};
