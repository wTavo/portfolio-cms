/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: Un Portafolio Tech en el centro se abre y libera el título completo ('PORTAFOLIO PROFESIONAL' con todas sus letras normales). Las letras se despliegan en abanico (/\) y luego se posan y nivelan sobre la línea horizontal definitiva.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

type AnimationPhase =
  | 'briefcase_solo'
  | 'briefcase_opening'
  | 'briefcase_descending'
  | 'ejecting_letters'
  | 'settled';

/**
 * Gráfico vectorial de Portafolio Ejecutivo / Tech en acabados titanio y plata pulida.
 * Interior oscuro, misterioso e iluminado con haz volumétrico de luz.
 */
function PortfolioBriefcaseGraphic({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative w-48 h-40 sm:w-60 sm:h-48 md:w-72 md:h-56 flex items-center justify-center [perspective:1000px] select-none">
      {/* Resplandor ambiental de misterio */}
      <div
        className={`absolute inset-0 rounded-full bg-radial from-white/25 via-slate-400/10 to-transparent blur-3xl transition-all duration-700 ${
          isOpen ? 'opacity-95 scale-130' : 'opacity-30 scale-85'
        }`}
      />

      <svg
        viewBox="0 0 100 85"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] overflow-visible"
      >
        <defs>
          {/* Degradado para el cuerpo exterior de titanio/cuero oscuro */}
          <linearGradient id="briefcase-body-grad" x1="50" y1="28" x2="50" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="45%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Degradado para la solapa superior */}
          <linearGradient id="briefcase-flap-grad" x1="50" y1="28" x2="50" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Herrajes de plata y cromo pulido */}
          <linearGradient id="chrome-hardware-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Interior oscuro, abismal y misterioso con núcleo de luz */}
          <radialGradient id="mystic-void-grad" cx="50" cy="52" r="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="18%" stopColor="#e2e8f0" stopOpacity="0.7" />
            <stop offset="45%" stopColor="#334155" stopOpacity="0.4" />
            <stop offset="75%" stopColor="#090d16" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>

          {/* Cono volumétrico de luz etérea que asciende desde la apertura */}
          <linearGradient id="mystic-beam-grad" x1="50" y1="28" x2="50" y2="-40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="30%" stopColor="#e2e8f0" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Cono de Luz Volumétrica que brota hacia arriba cuando está abierto */}
        <g
          className="transition-all duration-700"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: '50px 28px',
          }}
        >
          <polygon
            points="24,28 76,28 92,-40 8,-40"
            fill="url(#mystic-beam-grad)"
            className="blur-sm"
          />
        </g>

        {/* Sombra base del maletín */}
        <ellipse cx="50" cy="79" rx="40" ry="4.5" fill="#000000" opacity="0.75" />

        {/* Asa Superior Ergonómica de Cromo / Titanio */}
        <g>
          {/* Fijaciones / Soportes del asa */}
          <rect x="36" y="24" width="6" height="6" rx="1.5" fill="url(#chrome-hardware-grad)" />
          <rect x="58" y="24" width="6" height="6" rx="1.5" fill="url(#chrome-hardware-grad)" />
          {/* Arco del Asa */}
          <path
            d="M39 25 C39 12, 61 12, 61 25"
            stroke="url(#chrome-hardware-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M42 23 C42 16, 58 16, 58 23"
            stroke="#1e293b"
            strokeWidth="1.2"
            fill="none"
          />
        </g>

        {/* Interior Oscuro y Misterioso (Visible cuando se abre) */}
        <rect
          x="14"
          y="28"
          width="72"
          height="50"
          rx="5"
          fill="url(#mystic-void-grad)"
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* Resplandor de la Apertura de Salida */}
        <ellipse
          cx="50"
          cy="34"
          rx="28"
          ry="5"
          fill="#ffffff"
          opacity={isOpen ? 0.7 : 0}
          className="transition-opacity duration-500 blur-[2px]"
        />

        {/* Cuerpo Principal del Portafolio */}
        <rect
          x="14"
          y="36"
          width="72"
          height="42"
          rx="5"
          fill="url(#briefcase-body-grad)"
          stroke="#334155"
          strokeWidth="1.2"
        />

        {/* Costura perimetral en cuerpo */}
        <rect
          x="17"
          y="39"
          width="66"
          height="36"
          rx="3"
          stroke="#475569"
          strokeWidth="0.8"
          strokeDasharray="3 2"
          fill="none"
          opacity="0.7"
        />

        {/* Refuerzos esquineros metálicos inferiores */}
        <path d="M14 68 C14 74, 18 78, 24 78 L24 73 L19 73 L19 68 Z" fill="url(#chrome-hardware-grad)" />
        <path d="M86 68 C86 74, 82 78, 76 78 L76 73 L81 73 L81 68 Z" fill="url(#chrome-hardware-grad)" />

        {/* Base del broche */}
        <rect x="46.5" y="54" width="7" height="6" rx="1" fill="#1e293b" stroke="url(#chrome-hardware-grad)" strokeWidth="0.8" />
        <circle cx="50" cy="57" r="1" fill="url(#chrome-hardware-grad)" />

        {/* Tapa / Solapa que se abre hacia arriba con rotación 3D */}
        <g
          style={{
            transformOrigin: '50px 28px',
            transform: isOpen ? 'rotateX(-95deg) translateY(-5px)' : 'rotateX(0deg)',
            transition: 'transform 650ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Geometría de la solapa */}
          <path
            d="M14 28 H86 L86 48 L50 57 L14 48 Z"
            fill="url(#briefcase-flap-grad)"
            stroke="#475569"
            strokeWidth="1.2"
          />

          {/* Costura de la solapa */}
          <path
            d="M17 30 H83 L83 46 L50 54.5 L17 46 Z"
            stroke="#64748b"
            strokeWidth="0.8"
            strokeDasharray="3 2"
            fill="none"
            opacity="0.8"
          />

          {/* Broche Superior Metálico de Seguridad */}
          <rect
            x="46"
            y="49"
            width="8"
            height="8"
            rx="1.5"
            fill="url(#chrome-hardware-grad)"
            stroke="#334155"
            strokeWidth="0.5"
            className={isOpen ? 'drop-shadow-[0_0_12px_rgba(255,255,255,1)]' : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'}
          />
          <line x1="47.5" y1="53" x2="52.5" y2="53" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [phase, setPhase] = useState<AnimationPhase>('briefcase_solo');
  const [randomDelays, setRandomDelays] = useState<number[][]>([]);
  const [isFinalGlow, setIsFinalGlow] = useState(false);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  // Genera mapa de retardos desordenados / aleatorios para que las letras salgan en orden no secuencial
  const generateRandomDelays = () => {
    const totalCount = words.reduce((acc, w) => acc + w.length, 0);
    // Crear array de índices y mezclarlo aleatoriamente
    const indices = Array.from({ length: totalCount }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    let pointer = 0;
    const result: number[][] = [];
    for (const w of words) {
      const rowDelays: number[] = [];
      for (let c = 0; c < w.length; c++) {
        const orderRank = indices[pointer++];
        // Retardos distribuidos entre 0ms y 650ms
        rowDelays.push(orderRank * 35);
      }
      result.push(rowDelays);
    }
    return result;
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const runAnimationSequence = () => {
    setPhase('briefcase_solo');
    setRandomDelays(generateRandomDelays());
    setIsFinalGlow(false);

    // PASO 1: El Portafolio aparece solitario y cerrado exactamente en el centro (700ms)
    const t1 = setTimeout(() => {
      // PASO 2: El portafolio SE ABRE EN EL CENTRO primero (el usuario ve la apertura y el interior misterioso) (700ms)
      setPhase('briefcase_opening');

      const t2 = setTimeout(() => {
        // PASO 3: Ya abierto, desciende suavemente a la parte inferior para dar paso a las letras (500ms)
        setPhase('briefcase_descending');

        const t3 = setTimeout(() => {
          // PASO 4: Expulsión de letras desde la boca del maletín en orden aleatorio
          setPhase('ejecting_letters');

          // PASO 5: Todas las letras aterrizan en su línea horizontal y el título se asienta
          const t4 = setTimeout(() => {
            setPhase('settled');
            setIsFinalGlow(true);

            // PASO 6: Ciclo continuo de resplandor suave
            setTimeout(() => {
              setIsFinalGlow(false);
              const glowInt = setInterval(() => {
                setIsFinalGlow((prev) => !prev);
              }, 1800);
              return () => clearInterval(glowInt);
            }, 1100);
          }, 1150);

          return () => clearTimeout(t4);
        }, 450);

        return () => clearTimeout(t3);
      }, 700);

      return () => clearTimeout(t2);
    }, 700);

    return () => clearTimeout(t1);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase('settled');
      return;
    }

    const cleanup = runAnimationSequence();
    return cleanup;
  }, [prefersReducedMotion]);

  const isSettled = phase === 'settled';
  const isOpen = phase !== 'briefcase_solo';

  // Determinación de la posición del maletín:
  // - En 'briefcase_solo' y 'briefcase_opening': está en el CENTRO EXACTO (-translate-y-1/2).
  // - En 'briefcase_descending' y 'ejecting_letters': baja a la parte inferior.
  // - En 'settled': se desvanece suavemente.
  const getBriefcasePositionClass = () => {
    switch (phase) {
      case 'briefcase_solo':
        return '-translate-y-1/2 opacity-100 scale-100 drop-shadow-[0_24px_60px_rgba(0,0,0,0.95)]';
      case 'briefcase_opening':
        return '-translate-y-1/2 opacity-100 scale-105 drop-shadow-[0_24px_60px_rgba(0,0,0,0.95)]';
      case 'briefcase_descending':
        return 'translate-y-[140px] sm:translate-y-[180px] md:translate-y-[210px] opacity-100 scale-95 drop-shadow-[0_16px_40px_rgba(0,0,0,0.9)]';
      case 'ejecting_letters':
        return 'translate-y-[140px] sm:translate-y-[180px] md:translate-y-[210px] opacity-90 scale-95 pointer-events-none';
      case 'settled':
      default:
        return 'translate-y-[220px] sm:translate-y-[260px] opacity-0 scale-75 pointer-events-none';
    }
  };

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 text-center select-none ${className}`}>
        <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider text-[var(--color-text-primary)] leading-[1.0] uppercase">
          {words[0]}
        </span>
        <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[var(--color-text-primary)] leading-[1.0] uppercase">
          {words[1]}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[540px] sm:min-h-[620px] md:min-h-[680px] py-12 sm:py-16 overflow-visible">
      {/* Resplandor ambiental de fondo neutro */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/10 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-in-out ${
          isFinalGlow || phase === 'briefcase_solo' ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* PORTAFOLIO QUE SE ABRE EN EL CENTRO Y LUEGO BAJA PARA EXPULSAR LAS LETRAS */}
      <div
        onClick={() => runAnimationSequence()}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${getBriefcasePositionClass()}`}
        title="Haz clic para volver a reproducir"
        aria-hidden={phase === 'settled'}
      >
        <PortfolioBriefcaseGraphic isOpen={isOpen} />
      </div>

      {/* Título Principal Completo (Líneas Horizontales Directas, Sin Inclinación /\) */}
      <h1
        onClick={() => {
          if (phase === 'settled') runAnimationSequence();
        }}
        className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 lg:gap-y-5 select-none relative z-30 cursor-pointer ${className}`}
        aria-label={uppercaseText}
      >
        {words.map((word, wordIdx) => {
          const wordLen = word.length;
          const wordCenter = (wordLen - 1) / 2;
          const isFirstWord = wordIdx === 0;

          // Jerarquía visual: PORTAFOLIO grande, PROFESIONAL compacto con tracking
          const fontClasses = isFirstWord
            ? 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider'
            : 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.2em] sm:tracking-[0.25em]';

          const slotMinWidth = isFirstWord ? '0.74em' : '0.85em';
          const slotHeight = isFirstWord ? '1.1em' : '1.2em';

          return (
            <div
              key={`word-row-${wordIdx}`}
              className={`inline-flex items-center justify-center relative ${fontClasses} ${
                isFirstWord ? 'gap-x-2 sm:gap-x-3.5 md:gap-x-5' : 'gap-x-1.5 sm:gap-x-2.5 md:gap-x-3.5'
              }`}
            >
              {word.split('').map((char, charIdx) => {
                const isPlaced = phase === 'ejecting_letters' || phase === 'settled';
                const delayMs = randomDelays[wordIdx]?.[charIdx] ?? 0;

                // Coordenadas de nacimiento: Nace exactamente en la boca iluminada del maletín
                const relativeSpawnX = `calc(${(- (charIdx - wordCenter) * (isFirstWord ? 0.76 : 0.86)).toFixed(2)}em)`;
                // Distancia vertical desde la fila hasta la boca del maletín abajo
                const relativeSpawnY = isFirstWord ? '205px' : '135px';

                return (
                  <span
                    key={`slot-${wordIdx}-${charIdx}-${char}`}
                    className="inline-flex items-center justify-center relative leading-[1.0]"
                    style={{
                      minWidth: slotMinWidth,
                      height: slotHeight,
                    }}
                  >
                    {/* LETRA: Emerge directamente del interior del maletín inferior hacia su posición */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center select-none pointer-events-none text-white ${
                        isPlaced ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        transform: isPlaced
                          ? 'translate3d(0, 0, 0) scale(1)'
                          : `translate3d(${relativeSpawnX}, ${relativeSpawnY}, 0) scale(0.04)`,
                        transition: isPlaced
                          ? `transform 750ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, opacity 350ms ease-out ${delayMs}ms`
                          : 'none',
                        willChange: 'transform, opacity',
                      }}
                    >
                      <span
                        className={`transition-all duration-1000 ease-in-out ${
                          isSettled
                            ? isFinalGlow
                              ? 'drop-shadow-[0_0_24px_rgba(255,255,255,0.85)] drop-shadow-[0_2px_16px_rgba(255,255,255,0.6)]'
                              : 'drop-shadow-[0_2px_14px_rgba(255,255,255,0.35)]'
                            : 'drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)]'
                        }`}
                      >
                        {char}
                      </span>
                    </span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </h1>
    </div>
  );
}
