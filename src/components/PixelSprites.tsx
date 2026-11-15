import React from 'react';
import { IngredientId } from '../game/rules';

/**
 * Pixel-art style SVG icons & sprites crafted to match the user's reference mockup:
 * - Purple Spellbook with golden crescent moon and corner clasps
 * - Tilted crimson Ice Berry vial with cork
 * - Bubbling lavender Moonwater round flask
 * - Emerald green Mandrake square bottle
 * - Sparkling cyan/blue Dragon Scale gem
 * - Charred Burnt Scale
 * - Bubbling Cauldron (Iron or Golden Upgrade)
 * - Quirky Customer sprites (Flaming hair wizard student, Frog knight, Sleepy astronomer, Drake warden)
 */

export const SpellbookSprite: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges" aria-hidden="true">
    {/* Dark pixel outline */}
    <path
      d="M7 3h16v2h2v20h-2v4H7v-2H5V5h2V3z"
      fill="#181020"
    />
    {/* Deep purple book cover */}
    <path
      d="M8 5h14v18H8V5z"
      fill="#4c1d95"
    />
    {/* Lighter purple shading */}
    <path
      d="M9 6h12v16H9V6z"
      fill="#5b21b6"
    />
    {/* Book spine ridges */}
    <rect x="6" y="6" width="2" height="20" fill="#3b0764" />
    <rect x="6" y="9" width="2" height="2" fill="#f59e0b" />
    <rect x="6" y="19" width="2" height="2" fill="#f59e0b" />
    {/* Gold corner clasps */}
    <path d="M20 5h3v3h-3V5zM20 20h3v3h-3v-3z" fill="#fbbf24" />
    {/* Pages at bottom */}
    <rect x="8" y="23" width="14" height="3" fill="#fef3c7" />
    <rect x="9" y="24" width="12" height="1" fill="#d97706" />
    {/* Purple bookmark ribbon */}
    <rect x="12" y="25" width="2" height="5" fill="#a855f7" />
    {/* Gold Crescent Moon & Stars on Cover */}
    <path
      d="M14 9h4v1h-2v2h-1v4h1v2h2v1h-4v-1h-2v-2h-1v-4h1v-2h2V9z"
      fill="#fbbf24"
    />
    <rect x="18" y="12" width="2" height="2" fill="#fde047" />
    <rect x="11" y="7" width="1" height="1" fill="#fde047" />
    <rect x="19" y="17" width="1" height="1" fill="#fde047" />
  </svg>
);

export const IngredientSprite: React.FC<{ id: IngredientId; className?: string }> = ({
  id,
  className = 'w-16 h-16',
}) => {
  switch (id) {
    case 'ice_berry':
      // Tilted crimson/pink vial with cork stopper (matches top-left shelf item in mockup)
      return (
        <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges" aria-hidden="true">
          {/* Cork stopper top-right */}
          <path d="M20 4h5v2h2v5h-2v1h-5V4z" fill="#78350f" />
          <path d="M21 5h4v5h-4V5z" fill="#b45309" />
          {/* Bottle neck & tilted body outline */}
          <path
            d="M18 8h4v2h2v4h-2v4h-2v4h-3v3h-4v2H7v-2H5v-6h2v-3h3v-3h3v-3h3V8h2z"
            fill="#181020"
          />
          {/* Glass highlight */}
          <path d="M17 10h4v4h-3v3h-3v3h-3v4H7v-5h3v-3h3v-3h4v-3z" fill="#fecdd3" />
          {/* Crimson Ice Berry Elixir liquid */}
          <path d="M15 13h5v3h-3v3h-3v4H8v-4h3v-3h4v-3z" fill="#e11d48" />
          <path d="M12 16h4v3h-3v3H9v-3h3v-3z" fill="#fb7185" />
          {/* White specular shine */}
          <rect x="9" y="19" width="2" height="2" fill="#ffffff" />
          <rect x="12" y="16" width="2" height="2" fill="#ffffff" />
        </svg>
      );

    case 'moonwater':
      // Purple round bubbling flask (matches top-right shelf item in mockup)
      return (
        <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges" aria-hidden="true">
          {/* Floating purple bubbles */}
          <rect x="13" y="3" width="3" height="3" fill="#181020" />
          <rect x="14" y="4" width="1" height="1" fill="#c084fc" />
          <rect x="17" y="6" width="2" height="2" fill="#a855f7" />
          {/* Flask neck and round base outline */}
          <path
            d="M12 10h8v2h-1v4h3v3h2v7h-2v2h-2v2H12v-2h-2v-2H8v-7h2v-3h3v-4h-1v-2z"
            fill="#181020"
          />
          {/* Inner glass */}
          <rect x="14" y="11" width="4" height="5" fill="#e9d5ff" />
          {/* Lavender liquid */}
          <path d="M11 18h10v2h2v5h-2v2H11v-2H9v-5h2v-2z" fill="#9333ea" />
          <path d="M12 20h8v6h-8v-6z" fill="#c084fc" />
          {/* Specular highlights */}
          <rect x="11" y="21" width="2" height="3" fill="#ffffff" />
          <rect x="19" y="24" width="2" height="2" fill="#6b21a8" />
        </svg>
      );

    case 'mandrake_root':
      // Emerald green apothecary bottle with cork (matches bottom-left shelf item in mockup)
      return (
        <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges" aria-hidden="true">
          {/* Cork */}
          <rect x="13" y="4" width="6" height="4" fill="#78350f" />
          <rect x="14" y="5" width="4" height="2" fill="#b45309" />
          {/* Bottle outline */}
          <path
            d="M11 8h10v3h-1v3h3v13h-2v2H11v-2H9V14h3v-3h-1V8z"
            fill="#181020"
          />
          {/* Upper clear glass */}
          <path d="M13 10h6v5h2v3H11v-3h2v-5z" fill="#dcfce7" />
          {/* Emerald liquid */}
          <rect x="11" y="17" width="10" height="9" fill="#16a34a" />
          <rect x="12" y="18" width="8" height="7" fill="#4ade80" />
          {/* Specular shine */}
          <rect x="12" y="19" width="2" height="5" fill="#ffffff" />
        </svg>
      );

    case 'dragon_scale':
      // Sparkling blue crystal / dragon scale egg (matches bottom-right shelf item in mockup)
      return (
        <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges" aria-hidden="true">
          {/* Golden 4-point pixel sparkles around scale */}
          <path d="M18 2h2v2h2v2h-2v2h-2V6h-2V4h2V2z" fill="#fef08a" />
          <path d="M26 9h2v2h2v2h-2v2h-2v-2h-2v-2h2V9z" fill="#fde047" />
          <path d="M4 17h2v2h2v2H6v2H4v-2H2v-2h2v-2z" fill="#fef08a" />
          <path d="M24 23h2v2h2v2h-2v2h-2v-2h-2v-2h2v-2z" fill="#fde047" />
          {/* Scale dark border */}
          <path
            d="M12 6h8v2h2v3h2v10h-2v3h-2v2h-8v-2h-2v-3H8V11h2V8h2V6z"
            fill="#181020"
          />
          {/* Faceted azure & ice-blue dragon scale */}
          <path
            d="M12 8h8v3h2v10h-2v3h-8v-3h-2V11h2V8z"
            fill="#0284c7"
          />
          <path d="M13 9h6v2h2v8h-2v2h-6v-2h-2v-8h2V9z" fill="#38bdf8" />
          {/* Bright diamond facets */}
          <rect x="14" y="10" width="4" height="4" fill="#e0f2fe" />
          <rect x="11" y="14" width="3" height="4" fill="#bae6fd" />
          <rect x="16" y="16" width="4" height="4" fill="#ffffff" />
          <rect x="18" y="12" width="2" height="3" fill="#0369a1" />
        </svg>
      );

    case 'burnt_scale':
      return (
        <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges" aria-hidden="true">
          <path
            d="M12 7h8v2h2v3h2v9h-2v3h-2v2h-8v-2h-2v-3H8v-9h2V9h2V7z"
            fill="#181020"
          />
          <path d="M12 9h8v3h2v8h-2v3h-8v-3h-2v-8h2V9z" fill="#44403c" />
          <rect x="13" y="12" width="5" height="5" fill="#78716c" />
          <rect x="16" y="16" width="3" height="3" fill="#ef4444" />
        </svg>
      );
  }
};

export const CauldronSprite: React.FC<{
  isGolden?: boolean;
  isBubblingFast?: boolean;
  ingredientCount?: number;
  className?: string;
}> = ({ isGolden = false, isBubblingFast = false, ingredientCount = 0, className = 'w-56 h-56' }) => {
  const bodyOuter = isGolden ? '#92400e' : '#181020';
  const bodyMain = isGolden ? '#d97706' : '#272038';
  const bodyMid = isGolden ? '#f59e0b' : '#352b4d';
  const bodyShine = isGolden ? '#fef08a' : '#cbd5e1';

  return (
    <svg viewBox="0 0 48 48" className={className} shapeRendering="crispEdges" aria-hidden="true">
      {/* Floating green pixel bubbles above the rim (just like the reference image!) */}
      <g className={isBubblingFast ? 'animate-bounce' : 'animate-bubble'}>
        <rect x="14" y="2" width="4" height="4" fill="#181020" />
        <rect x="15" y="3" width="2" height="2" fill="#a3e635" />

        <rect x="26" y="4" width="5" height="5" fill="#181020" />
        <rect x="27" y="5" width="3" height="3" fill="#bef264" />

        <rect x="10" y="7" width="4" height="4" fill="#181020" />
        <rect x="11" y="8" width="2" height="2" fill="#84cc16" />

        <rect x="20" y="6" width="3" height="3" fill="#181020" />
        <rect x="21" y="7" width="1" height="1" fill="#d9f99d" />

        <rect x="33" y="9" width="3" height="3" fill="#181020" />
        <rect x="34" y="10" width="1" height="1" fill="#a3e635" />
      </g>

      {/* Cauldron Rim & Side Handles */}
      <path
        d="M10 14h28v3h3v3h4v7h-4v3h-1v6h-3v4h-3v4h-4v-3H18v3h-4v-4h-3v-4H8v-6H7v-3H3v-7h4v-3h3v-3z"
        fill={bodyOuter}
      />

      {/* Left & Right Ring Handles */}
      <rect x="5" y="21" width="2" height="5" fill={bodyMid} />
      <rect x="41" y="21" width="2" height="5" fill={bodyMid} />

      {/* Cauldron Upper Lip */}
      <rect x="11" y="16" width="26" height="4" fill={bodyMid} />

      {/* Glowing Lime-Green Bubbling Potion Surface */}
      <rect x="12" y="14" width="24" height="5" fill="#65a30d" />
      <rect x="14" y="13" width="20" height="5" fill="#a3e635" />
      <rect x="17" y="11" width="6" height="4" fill="#d9f99d" />
      <rect x="25" y="12" width="5" height="3" fill="#bef264" />

      {/* Cauldron Belly */}
      <path d="M10 20h28v14H10V20z" fill={bodyMain} />
      <path d="M12 21h24v12H12V21z" fill={bodyMid} />

      {/* Left Specular Highlight (matches reference cauldron gleam) */}
      <rect x="12" y="23" width="3" height="6" fill={bodyShine} />
      <rect x="15" y="23" width="1" height="3" fill="#94a3b8" />

      {/* Cauldron Iron Feet */}
      <rect x="14" y="38" width="4" height="5" fill={bodyMain} />
      <rect x="22" y="39" width="4" height="5" fill={bodyMain} />
      <rect x="30" y="38" width="4" height="5" fill={bodyMain} />

      {/* Ingredient count badge if items are inside */}
      {ingredientCount > 0 && (
        <g>
          <rect x="19" y="25" width="10" height="7" fill="#181020" />
          <rect x="20" y="26" width="8" height="5" fill="#fef08a" />
        </g>
      )}
    </svg>
  );
};

export const CustomerSprite: React.FC<{
  ailmentState: 'flaming_hair' | 'frog_voice' | 'starry_drowsy' | 'drake_sneeze';
  cured?: boolean;
  className?: string;
}> = ({ ailmentState, cured = false, className = 'w-36 h-36' }) => {
  return (
    <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges" aria-hidden="true">
      {/* Top Status Effect: Flaming Hair, Frog Bubble, Drowsy Zzz, or Sparks */}
      {!cured && ailmentState === 'flaming_hair' && (
        <g className="animate-flame">
          <path d="M10 1h2v2h2V0h3v3h2V1h2v4h2v5H9V5h1V1z" fill="#ef4444" />
          <path d="M11 3h2v2h2V2h2v3h2V3h1v5H10V4h1V3z" fill="#f97316" />
          <path d="M12 5h8v4h-8V5z" fill="#fde047" />
        </g>
      )}

      {cured && (
        <g className="animate-bounce">
          {/* Cool blue & gold sparkles when cured! */}
          <rect x="8" y="3" width="2" height="2" fill="#38bdf8" />
          <rect x="15" y="1" width="2" height="2" fill="#fde047" />
          <rect x="22" y="3" width="2" height="2" fill="#4ade80" />
        </g>
      )}

      {/* Wizard Hat or Helmet or Hood */}
      {ailmentState === 'flaming_hair' && (
        <g>
          {/* Singed wizard hair when cured or burning */}
          <path d="M10 8h12v4H10V8z" fill={cured ? '#475569' : '#b91c1c'} />
        </g>
      )}

      {ailmentState === 'frog_voice' && (
        <g>
          {/* Knight Silver Plume & Frog green tint if cursed */}
          <rect x="13" y="3" width="6" height="4" fill="#22c55e" />
          <rect x="9" y="7" width="14" height="4" fill="#94a3b8" />
        </g>
      )}

      {ailmentState === 'starry_drowsy' && (
        <g>
          {/* Starry Blue Pointed Hat */}
          <path d="M14 2h4v3h3v3h3v2H8V8h3V5h3V2z" fill="#312e81" />
          <rect x="15" y="5" width="2" height="2" fill="#fde047" />
        </g>
      )}

      {ailmentState === 'drake_sneeze' && (
        <g>
          {/* Warden horned helm */}
          <rect x="8" y="5" width="3" height="4" fill="#fef3c7" />
          <rect x="21" y="5" width="3" height="4" fill="#fef3c7" />
          <rect x="10" y="7" width="12" height="4" fill="#7c2d12" />
        </g>
      )}

      {/* Character Head Outline */}
      <rect x="9" y="10" width="14" height="11" fill="#181020" />
      <rect
        x="10"
        y="11"
        width="12"
        height="9"
        fill={!cured && ailmentState === 'frog_voice' ? '#86efac' : '#fed7aa'}
      />

      {/* Eyes */}
      <rect x="12" y="13" width="2" height="2" fill="#181020" />
      <rect x="18" y="13" width="2" height="2" fill="#181020" />

      {/* Expression (Stressed/Open mouth vs Happy smile when cured) */}
      {cured ? (
        <path d="M13 17h6v1h-6v-1zM12 16h1v1h-1v-1zM19 16h1v1h-1v-1z" fill="#181020" />
      ) : (
        <rect x="14" y="16" width="4" height="3" fill="#991b1b" />
      )}

      {/* Robe / Armor Shoulders */}
      <path d="M6 21h20v10H6V21z" fill="#181020" />
      <path
        d="M7 22h18v9H7v-9z"
        fill={
          ailmentState === 'flaming_hair'
            ? '#7c3aed'
            : ailmentState === 'frog_voice'
            ? '#64748b'
            : ailmentState === 'starry_drowsy'
            ? '#1e40af'
            : '#b45309'
        }
      />
      {/* Gold trim on robe */}
      <rect x="14" y="22" width="4" height="9" fill="#fbbf24" />
    </svg>
  );
};

export const HintOwlSprite: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges" aria-hidden="true">
    <path d="M6 3h3v2h6V3h3v4h2v11h-2v3H6v-3H4V7h2V3z" fill="#181020" />
    <path d="M7 5h10v13H7V5z" fill="#92400e" />
    <rect x="8" y="11" width="8" height="7" fill="#fef3c7" />
    {/* Big wise owl eyes */}
    <rect x="8" y="7" width="3" height="3" fill="#fef08a" />
    <rect x="13" y="7" width="3" height="3" fill="#fef08a" />
    <rect x="9" y="8" width="1" height="1" fill="#181020" />
    <rect x="14" y="8" width="1" height="1" fill="#181020" />
    {/* Beak */}
    <rect x="11" y="9" width="2" height="2" fill="#f97316" />
  </svg>
);
