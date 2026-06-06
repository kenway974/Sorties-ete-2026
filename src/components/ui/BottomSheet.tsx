"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface BottomSheetProps {
  /** Snap points as viewport-height fractions, ascending. e.g. [0.12, 0.5, 0.9] */
  snapPoints?: number[];
  initialSnap?: number;
  children: React.ReactNode;
  header?: React.ReactNode;
}

export default function BottomSheet({
  snapPoints = [0.12, 0.5, 0.9],
  initialSnap = 0,
  children,
  header,
}: BottomSheetProps) {
  const [snapIndex, setSnapIndex] = useState(initialSnap);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const targetHeight = snapPoints[snapIndex] * vh;
  const currentHeight = Math.max(
    snapPoints[0] * vh,
    Math.min(snapPoints[snapPoints.length - 1] * vh, targetHeight - dragOffset)
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setDragOffset(e.clientY - startY.current);
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    // Snap to nearest point based on resulting height
    const resultHeight = targetHeight - dragOffset;
    let nearest = 0;
    let minDist = Infinity;
    snapPoints.forEach((p, i) => {
      const dist = Math.abs(p * vh - resultHeight);
      if (dist < minDist) { minDist = dist; nearest = i; }
    });
    setSnapIndex(nearest);
    setDragOffset(0);
  }, [dragging, dragOffset, targetHeight, snapPoints, vh]);

  useEffect(() => { setDragOffset(0); }, [snapIndex]);

  return (
    <div
      ref={sheetRef}
      className="absolute bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl flex flex-col touch-none"
      style={{
        height: `${currentHeight}px`,
        transition: dragging ? "none" : "height 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      {/* Drag handle */}
      <div
        className="shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto" />
        {header && <div className="px-4 pt-2">{header}</div>}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 overscroll-contain">
        {children}
      </div>
    </div>
  );
}