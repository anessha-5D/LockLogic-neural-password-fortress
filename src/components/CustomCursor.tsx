import React, { useEffect, useState } from 'react';

interface CustomCursorProps {
  isReducedMotion?: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ isReducedMotion = false }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable for desktop mice
    if (window.matchMedia('(pointer: coarse)').matches || isReducedMotion) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check hover state on buttons/inputs/links
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.getAttribute('role') === 'button')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Trailing ring animation loop
    let animId: number;
    const updateTrail = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.22,
        y: prev.y + (pos.y - prev.y) * 0.22,
      }));
      animId = requestAnimationFrame(updateTrail);
    };
    animId = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [pos.x, pos.y, isVisible, isReducedMotion]);

  if (isReducedMotion || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Central pin point */}
      <div
        className="fixed w-2 h-2 rounded-full bg-[#C6FF3D] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 shadow-[0_0_8px_#C6FF3D]"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: `translate(-50%, -50%) scale(${isMouseDown ? 0.6 : 1})`,
        }}
      />

      {/* Trailing Soft Halo */}
      <div
        className={`fixed rounded-full border pointer-events-none transition-all duration-150 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovering
            ? 'w-10 h-10 border-[#C6FF3D] bg-[#C6FF3D]/10 scale-110 shadow-[0_0_12px_rgba(198,255,61,0.3)]'
            : isMouseDown
            ? 'w-6 h-6 border-[#00E5FF] bg-[#00E5FF]/15 scale-90'
            : 'w-7 h-7 border-[#7C5CFF]/50 bg-[#7C5CFF]/5'
        }`}
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
        }}
      />
    </div>
  );
};
