// The CHILI publish mark, traced from assets/company_logo.png (radius-normalised: the round side has radius 1).
// Body: flat top and bottom, a round left side, and a notch on the right. Facet: the brighter lower wedge.
export const MARK = {
  top: { x: 0.967, y: 1 }, // top-right corner
  notch: { x: 0.23, y: -0.005 },
  bottom: { x: 0.967, y: -1 }, // bottom-right corner
  facetAngle: -2.032, // where the facet edge meets the round side (radians, about -116°)
  colors: { body: '#d4063f', bodyDeep: '#c80b46', facet: '#ff0048' },
} as const;

/** SVG path data for the 2D mark, in a 0..2 box (x from -1 to 0.967 shifted by +1). */
export function markSvgPaths(): { body: string; facet: string } {
  const sx = (x: number) => (x + 1).toFixed(3);
  const sy = (y: number) => (1 - y).toFixed(3);
  const fx = Math.cos(MARK.facetAngle);
  const fy = Math.sin(MARK.facetAngle);
  const body = `M${sx(0)} ${sy(1)} L${sx(MARK.top.x)} ${sy(MARK.top.y)} L${sx(MARK.notch.x)} ${sy(MARK.notch.y)} L${sx(MARK.bottom.x)} ${sy(MARK.bottom.y)} L${sx(0)} ${sy(-1)} A1 1 0 0 1 ${sx(0)} ${sy(1)} Z`;
  const facet = `M${sx(MARK.notch.x)} ${sy(MARK.notch.y)} L${sx(MARK.bottom.x)} ${sy(MARK.bottom.y)} L${sx(0)} ${sy(-1)} A1 1 0 0 1 ${sx(fx)} ${sy(fy)} Z`;
  return { body, facet };
}
