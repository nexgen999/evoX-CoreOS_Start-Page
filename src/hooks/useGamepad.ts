import { useEffect, useState, useRef } from 'react';

export interface GamepadControls {
  onSelect?: () => void;
  onBack?: () => void;
  onEdit?: () => void;
  onSearch?: () => void;
  onPrevTab?: () => void;
  onNextTab?: () => void;
}

export function useGamepad(controls: GamepadControls) {
  const [connected, setConnected] = useState(false);
  const [controllerName, setControllerName] = useState<string>('');
  const [lastButton, setLastButton] = useState<string | null>(null);
  
  // Track previous button states for edge-detection
  const prevButtonsRef = useRef<boolean[]>([]);
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    const handleConnect = (e: GamepadEvent) => {
      setConnected(true);
      setControllerName(e.gamepad.id || 'PlayStation DualSense');
    };

    const handleDisconnect = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const hasAny = Array.from(gamepads).some(gp => gp && gp.connected);
      setConnected(hasAny);
      if (!hasAny) {
        setControllerName('');
        setLastButton(null);
      }
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    // Initial check
    if (typeof navigator.getGamepads === 'function') {
      const gps = navigator.getGamepads();
      for (const gp of gps) {
        if (gp && gp.connected) {
          setConnected(true);
          setControllerName(gp.id || 'PlayStation Controller');
          break;
        }
      }
    }

    let animFrame: number;

    const pollGamepad = () => {
      if (typeof navigator.getGamepads === 'function') {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0] || gamepads[1];

        if (gp && gp.connected) {
          if (!connected) {
            setConnected(true);
            setControllerName(gp.id || 'PlayStation Controller');
          }

          const currentButtons = gp.buttons.map(b => b.pressed);
          const prev = prevButtonsRef.current;

          // Helper to check just pressed
          const justPressed = (idx: number) => currentButtons[idx] && !prev[idx];

          // Cross (X) - Button 0
          if (justPressed(0)) {
            setLastButton('cross');
            if (controlsRef.current.onSelect) controlsRef.current.onSelect();
            else {
              // Click current focused element
              const active = document.activeElement as HTMLElement | null;
              if (active && typeof active.click === 'function') {
                active.click();
              }
            }
          }

          // Circle (O) - Button 1
          if (justPressed(1)) {
            setLastButton('circle');
            if (controlsRef.current.onBack) controlsRef.current.onBack();
          }

          // Square ([]) - Button 2
          if (justPressed(2)) {
            setLastButton('square');
            if (controlsRef.current.onEdit) controlsRef.current.onEdit();
          }

          // Triangle (^) - Button 3
          if (justPressed(3)) {
            setLastButton('triangle');
            if (controlsRef.current.onSearch) controlsRef.current.onSearch();
          }

          // L1 - Button 4
          if (justPressed(4)) {
            setLastButton('l1');
            if (controlsRef.current.onPrevTab) controlsRef.current.onPrevTab();
          }

          // R1 - Button 5
          if (justPressed(5)) {
            setLastButton('r1');
            if (controlsRef.current.onNextTab) controlsRef.current.onNextTab();
          }

          // D-Pad Navigation
          // Up: 12, Down: 13, Left: 14, Right: 15
          if (justPressed(12)) navigateFocus('up');
          if (justPressed(13)) navigateFocus('down');
          if (justPressed(14)) navigateFocus('left');
          if (justPressed(15)) navigateFocus('right');

          prevButtonsRef.current = currentButtons;
        }
      }
      animFrame = requestAnimationFrame(pollGamepad);
    };

    animFrame = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return { connected, controllerName, lastButton };
}

// Spatial navigation helper for D-Pad / Controller
function navigateFocus(direction: 'up' | 'down' | 'left' | 'right') {
  const focusables = Array.from(
    document.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
  });

  if (!focusables.length) return;

  const current = (document.activeElement as HTMLElement) || focusables[0];
  const currentIndex = focusables.indexOf(current);

  if (currentIndex === -1) {
    focusables[0].focus();
    return;
  }

  const currentRect = current.getBoundingClientRect();
  const currentCenter = {
    x: currentRect.left + currentRect.width / 2,
    y: currentRect.top + currentRect.height / 2
  };

  let bestNext: HTMLElement | null = null;
  let bestDist = Infinity;

  for (let i = 0; i < focusables.length; i++) {
    const el = focusables[i];
    if (el === current) continue;

    const r = el.getBoundingClientRect();
    const c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const dx = c.x - currentCenter.x;
    const dy = c.y - currentCenter.y;

    let valid = false;
    if (direction === 'left' && dx < -10 && Math.abs(dy) < Math.abs(dx) * 1.5) valid = true;
    if (direction === 'right' && dx > 10 && Math.abs(dy) < Math.abs(dx) * 1.5) valid = true;
    if (direction === 'up' && dy < -10 && Math.abs(dx) < Math.abs(dy) * 1.5) valid = true;
    if (direction === 'down' && dy > 10 && Math.abs(dx) < Math.abs(dy) * 1.5) valid = true;

    if (valid) {
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        bestNext = el;
      }
    }
  }

  if (bestNext) {
    bestNext.focus();
  } else {
    // Linear fallback
    if (direction === 'right' || direction === 'down') {
      const nextIdx = (currentIndex + 1) % focusables.length;
      focusables[nextIdx].focus();
    } else {
      const prevIdx = (currentIndex - 1 + focusables.length) % focusables.length;
      focusables[prevIdx].focus();
    }
  }
}
