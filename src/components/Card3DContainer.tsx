import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'motion/react';
import { sound } from '../utils/sound';

interface Props {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped: boolean;
  onFlipToggle: () => void;
}

export const Card3DContainer: React.FC<Props> = ({
  frontContent,
  backContent,
  isFlipped,
  onFlipToggle,
}) => {
  const targetAngle = isFlipped ? 180 : 0;

  // Optimized spring physics for ultra-smooth 60/120fps mobile paper flip
  const springRotateY = useSpring(targetAngle, { stiffness: 175, damping: 21, mass: 0.65 });
  const springRotateX = useSpring(0, { stiffness: 190, damping: 22 });

  const [currentY, setCurrentY] = useState(targetAngle);
  const isDraggingRef = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0, time: 0, baseAngle: 0, isButtonTarget: false });

  // Keep spring in sync with isFlipped state
  useEffect(() => {
    springRotateY.set(targetAngle);
    springRotateX.set(0);
  }, [targetAngle, springRotateY, springRotateX]);

  // Track live rotation angle for seamless backface visibility
  useEffect(() => {
    const unsub = springRotateY.on('change', (latest) => {
      setCurrentY(latest);
    });
    return () => unsub();
  }, [springRotateY]);

  const norm = ((Math.round(currentY) % 360) + 360) % 360;
  const isBack = norm > 88 && norm < 272;

  // -------------------------------------------------------------
  // MOBILE TOUCH GESTURE: Smooth Swipe Left/Right with Momentum
  // -------------------------------------------------------------
  const handleTouchStart = (e: React.TouchEvent) => {
    const targetEl = e.target as HTMLElement;
    if (
      targetEl.tagName === 'INPUT' ||
      targetEl.tagName === 'SELECT' ||
      targetEl.tagName === 'TEXTAREA' ||
      targetEl.closest('.prevent-swipe')
    ) {
      return;
    }

    const isButton = Boolean(targetEl.tagName === 'BUTTON' || targetEl.closest('button'));
    const touch = e.touches[0];

    touchStartPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      baseAngle: targetAngle,
      isButtonTarget: isButton,
    };
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.current.x;
    const deltaY = touch.clientY - touchStartPos.current.y;

    const threshold = touchStartPos.current.isButtonTarget ? 22 : 12;

    if (!isDraggingRef.current) {
      // Intentional horizontal swipe detection
      if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
        isDraggingRef.current = true;
      }
    }

    if (isDraggingRef.current) {
      if (e.cancelable) {
        e.preventDefault(); // Stop mobile rubber-band scrolling
      }

      // 1:1 real-time finger rotation with subtle vertical tilt
      const newAngle = touchStartPos.current.baseAngle + deltaX * 0.78;
      springRotateY.set(newAngle);
      springRotateX.set(Math.max(-10, Math.min(10, -deltaY * 0.18)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartPos.current.x;
    const elapsed = Math.max(1, Date.now() - touchStartPos.current.time);
    const velocity = Math.abs(deltaX) / elapsed;

    // Fast flick or passed distance threshold
    if ((velocity > 0.35 && Math.abs(deltaX) > 28) || Math.abs(deltaX) > 55) {
      sound.playGlassTap(1200, 0.05, 0.15);
      onFlipToggle();
    } else {
      // Snap cleanly back to active face
      springRotateY.set(targetAngle);
      springRotateX.set(0);
    }
  };

  // -------------------------------------------------------------
  // DESKTOP POINTER GESTURE (Mouse Drag)
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    const targetEl = e.target as HTMLElement;
    if (
      targetEl.tagName === 'BUTTON' ||
      targetEl.tagName === 'INPUT' ||
      targetEl.tagName === 'SELECT' ||
      targetEl.closest('button') ||
      targetEl.closest('.prevent-swipe')
    ) {
      return;
    }

    touchStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      baseAngle: targetAngle,
      isButtonTarget: false,
    };
    isDraggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - touchStartPos.current.x;
    const deltaY = e.clientY - touchStartPos.current.y;

    const newAngle = touchStartPos.current.baseAngle + deltaX * 0.78;
    springRotateY.set(newAngle);
    springRotateX.set(Math.max(-10, Math.min(10, -deltaY * 0.18)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const deltaX = e.clientX - touchStartPos.current.x;
    if (Math.abs(deltaX) > 45) {
      sound.playGlassTap(1200, 0.05, 0.15);
      onFlipToggle();
    } else {
      springRotateY.set(targetAngle);
      springRotateX.set(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-full flex-1 flex flex-col justify-between select-none touch-pan-y"
    >
      <div
        className="relative w-full h-full flex-1 flex flex-col"
        style={{ perspective: 1200 }}
      >
        <motion.div
          style={{
            rotateY: springRotateY,
            rotateX: springRotateX,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
          className="relative w-full h-full flex-1 flex flex-col"
        >
          {/* FRONT FACE: Calculator */}
          <div
            style={{
              transform: 'rotateY(0deg) translateZ(1px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className={`w-full h-full flex-1 flex flex-col justify-between overflow-hidden ${
              isBack ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
            } transition-opacity duration-150`}
          >
            {frontContent}
          </div>

          {/* BACK FACE: Stock Forecast & Pro Traders Card */}
          <div
            style={{
              transform: 'rotateY(180deg) translateZ(1px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className={`absolute inset-0 w-full h-full flex flex-col justify-between overflow-hidden ${
              isBack ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            } transition-opacity duration-150`}
          >
            {backContent}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
