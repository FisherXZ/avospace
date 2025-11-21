/**
 * Marker Positioning Utility
 * 
 * Calculates pixel offsets for multiple kaomoji markers at the same location
 * to prevent overlap and create a natural, Snapchat-style clustering effect.
 */

interface Position {
  x: number; // Pixel offset from center
  y: number; // Pixel offset from center
}

/**
 * Configuration for marker spacing
 */
const MARKER_SPACING = {
  // Distance between markers in pixels
  // Reduced to keep clusters tighter with 48px markers
  RADIUS: 35,
  
  // Increase radius for each additional "ring" of markers
  RADIUS_INCREMENT: 35,
  
  // Max markers in first ring before creating second ring
  FIRST_RING_MAX: 6,
};

/**
 * Calculate positions for multiple markers at the same location
 * 
 * Algorithm:
 * - 1 marker: centered (0, 0)
 * - 2 markers: side by side
 * - 3-6 markers: circular arrangement (first ring)
 * - 7+ markers: multiple rings
 * 
 * @param count - Number of markers at this location
 * @returns Array of {x, y} pixel offsets
 */
export function calculateMarkerPositions(count: number): Position[] {
  if (count === 0) return [];
  
  // Single marker - centered
  if (count === 1) {
    return [{ x: 0, y: 0 }];
  }
  
  // Two markers - side by side
  if (count === 2) {
    return [
      { x: -MARKER_SPACING.RADIUS * 0.8, y: 0 },
      { x: MARKER_SPACING.RADIUS * 0.8, y: 0 },
    ];
  }
  
  // 3-6 markers - circular arrangement (first ring)
  if (count <= MARKER_SPACING.FIRST_RING_MAX) {
    return createCircularPositions(count, MARKER_SPACING.RADIUS);
  }
  
  // 7+ markers - multiple rings
  const positions: Position[] = [];
  
  // First ring (6 markers)
  const firstRing = createCircularPositions(
    MARKER_SPACING.FIRST_RING_MAX,
    MARKER_SPACING.RADIUS
  );
  positions.push(...firstRing);
  
  // Second ring (remaining markers)
  const remaining = count - MARKER_SPACING.FIRST_RING_MAX;
  const secondRingRadius = MARKER_SPACING.RADIUS + MARKER_SPACING.RADIUS_INCREMENT;
  const secondRing = createCircularPositions(remaining, secondRingRadius);
  positions.push(...secondRing);
  
  return positions;
}

/**
 * Create circular arrangement of positions
 * 
 * @param count - Number of positions to create
 * @param radius - Distance from center in pixels
 * @returns Array of {x, y} positions
 */
function createCircularPositions(count: number, radius: number): Position[] {
  const positions: Position[] = [];
  const angleStep = (2 * Math.PI) / count;
  
  // Start from top (-90 degrees) for aesthetic arrangement
  const startAngle = -Math.PI / 2;
  
  for (let i = 0; i < count; i++) {
    const angle = startAngle + (i * angleStep);
    positions.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }
  
  return positions;
}

/**
 * Add slight randomness to positions for more natural look (optional)
 * 
 * @param positions - Original positions
 * @param jitter - Maximum random offset in pixels (default: 5)
 * @returns Positions with slight randomness
 */
export function addPositionJitter(positions: Position[], jitter: number = 5): Position[] {
  return positions.map(pos => ({
    x: pos.x + (Math.random() - 0.5) * jitter,
    y: pos.y + (Math.random() - 0.5) * jitter,
  }));
}

/**
 * Example usage visualization:
 * 
 * 1 marker:      2 markers:      3 markers:
 *     ●          ●    ●            ●
 *                                ●   ●
 * 
 * 4 markers:     5 markers:      6 markers:
 *     ●           ●   ●           ●   ●
 *   ●   ●       ●   ●   ●       ●       ●
 *     ●             ●             ●   ●
 * 
 * 7+ markers: (center + 2 rings)
 *       ●   ●
 *     ●   ●   ●
 *   ●     ●     ●
 *     ●   ●   ●
 *       ●   ●
 */

