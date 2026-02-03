export const SITE_SWITCH_EVENT = 'vishal:site-switch';

export type SiteSwitchVariant = 'light' | 'cyber';

export type SiteSwitchDetail = {
  url: string;
  originX: number;
  originY: number;
  variant: SiteSwitchVariant;
};

const getCenter = (el: HTMLElement | null | undefined) => {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

export const startSiteSwitch = (
  url: string,
  options?: {
    originEl?: HTMLElement | null;
    variant?: SiteSwitchVariant;
  }
) => {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  if (prefersReducedMotion) {
    window.location.assign(url);
    return;
  }

  const origin = getCenter(options?.originEl) ?? {
    x: window.innerWidth - 48,
    y: 48,
  };

  const detail: SiteSwitchDetail = {
    url,
    originX: origin.x,
    originY: origin.y,
    variant: options?.variant ?? 'cyber',
  };

  window.dispatchEvent(new CustomEvent<SiteSwitchDetail>(SITE_SWITCH_EVENT, { detail }));
};
