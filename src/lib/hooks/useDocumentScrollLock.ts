import { useEffect } from 'react';

interface DocumentScrollSnapshot {
  scrollY: number;
  body: {
    overflow: string;
    position: string;
    width: string;
    top: string;
    left: string;
    right: string;
  };
  documentElement: {
    overflow: string;
    scrollBehavior: string;
  };
}

let activeLocks = 0;
let snapshot: DocumentScrollSnapshot | null = null;

function acquireDocumentScrollLock(): () => void {
  if (typeof document === 'undefined') return () => {};

  if (activeLocks === 0) {
    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    snapshot = {
      scrollY,
      body: {
        overflow: body.style.overflow,
        position: body.style.position,
        width: body.style.width,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
      },
      documentElement: {
        overflow: documentElement.style.overflow,
        scrollBehavior: documentElement.style.scrollBehavior,
      },
    };

    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    documentElement.style.scrollBehavior = 'auto';
    body.style.position = 'fixed';
    body.style.width = '100%';
    body.style.top = `${-scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
  }

  activeLocks += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    activeLocks = Math.max(0, activeLocks - 1);

    if (activeLocks !== 0 || !snapshot || typeof document === 'undefined') return;

    const saved = snapshot;
    snapshot = null;
    const { body, documentElement } = document;

    body.style.overflow = saved.body.overflow;
    body.style.position = saved.body.position;
    body.style.width = saved.body.width;
    body.style.top = saved.body.top;
    body.style.left = saved.body.left;
    body.style.right = saved.body.right;
    documentElement.style.overflow = saved.documentElement.overflow;
    documentElement.style.scrollBehavior = saved.documentElement.scrollBehavior;
    window.scrollTo(0, saved.scrollY);
  };
}

/** Bloquea el desplazamiento del documento mientras haya una o más superficies modales montadas. */
export function useDocumentScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    return acquireDocumentScrollLock();
  }, [isLocked]);
}
