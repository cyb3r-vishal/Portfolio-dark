import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SITE_SWITCH_EVENT, type SiteSwitchDetail } from '@/lib/siteSwitch';

type SwitchState = (SiteSwitchDetail & { isActive: boolean }) | null;

export default function SiteSwitchOverlay() {
  const [state, setState] = useState<SwitchState>(null);

  useEffect(() => {
    const onSwitch = (event: Event) => {
      const custom = event as CustomEvent<SiteSwitchDetail>;
      const detail = custom.detail;
      if (!detail?.url) return;

      setState({ ...detail, isActive: true });

      window.setTimeout(() => {
        window.location.assign(detail.url);
      }, 520);

      window.setTimeout(() => {
        setState(null);
      }, 1200);
    };

    window.addEventListener(SITE_SWITCH_EVENT, onSwitch);
    return () => window.removeEventListener(SITE_SWITCH_EVENT, onSwitch);
  }, []);

  return (
    <AnimatePresence>
      {state?.isActive && (
        <motion.div
          className="fixed inset-0 z-[80] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          {/* Cyber-flavored reveal */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                state.variant === 'light'
                  ? 'radial-gradient(900px 600px at 30% 20%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.82) 35%, rgba(255,255,255,0.0) 70%),\n' +
                    'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.16) 45%, rgba(236,72,153,0.10) 100%)'
                  : 'radial-gradient(800px 520px at 35% 25%, rgba(16,185,129,0.22) 0%, rgba(0,0,0,0.86) 55%, rgba(0,0,0,0.98) 100%),\n' +
                    'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(56,189,248,0.08) 45%, rgba(0,0,0,0.0) 100%)',
            }}
            initial={{ clipPath: `circle(0px at ${state.originX}px ${state.originY}px)` }}
            animate={{ clipPath: `circle(160vmax at ${state.originX}px ${state.originY}px)` }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Sweep */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                state.variant === 'light'
                  ? 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 100%)'
                  : 'linear-gradient(90deg, rgba(16,185,129,0) 0%, rgba(16,185,129,0.25) 45%, rgba(16,185,129,0) 100%)',
              mixBlendMode: state.variant === 'light' ? 'overlay' : 'screen',
              transform: 'skewX(-18deg)',
            }}
            initial={{ x: '-120%' }}
            animate={{ x: '120%' }}
            transition={{ duration: 0.55, ease: 'easeInOut', delay: 0.12 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
