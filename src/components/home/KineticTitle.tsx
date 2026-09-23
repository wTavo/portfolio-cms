/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: Un Portafolio Tech en el centro se abre y libera el título completo ('PORTAFOLIO PROFESIONAL' con todas sus letras normales). Las letras se despliegan en abanico (/\) y luego se posan y nivelan sobre la línea horizontal definitiva.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

type AnimationPhase = 'briefcase_solo' | 'briefcase_opening' | 'ejecting_letters' | 'settled';

/**
 * Gráfico vectorial de Portafolio Ejecutivo / Tech en acabados titanio y plata pulida.
 * Diseño limpio, moderno, sin colores cian ni azules de fantasía.
 */
function PortfolioBriefcaseGraphic({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative w-44 h-36 sm:w-56 sm:h-44 md:w-64 md:h-52 flex items-center justify-center [perspective:1000px] select-none">
      {/* Resplandor ambiental neutro suave */}
      <div
        className={`absolute inset-0 rounded-full bg-radial from-white/20 via-slate-400/10 to-transparent blur-3xl transition-all duration-700 ${
          isOpen ? 'opacity-90 scale-125' : 'opacity-35 scale-90'
        }`}
      />

      <svg
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_16px_40px_rgba(0,0,0,0.9)]"
      >
        <defs>
          {/* Degradado para el cuerpo principal de cuero/titanio oscuro */}
          <linearGradient id="briefcase-body-grad" x1="50" y1="26" x2="50" y2="74" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Degradado para la solapa superior */}
          <linearGradient id="briefcase-flap-grad" x1="50" y1="26" x2="50" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Degradado para herrajes metálicos de plata/cromo pulido */}
          <linearGradient id="chrome-hardware-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Degradado para el interior abierto */}
          <linearGradient id="interior-grad" x1="50" y1="26" x2="50" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#334155" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
        </defs>

        {/* Sombra base del maletín */}
        <ellipse cx="50" cy="75" rx="38" ry="4.5" fill="#000000" opacity="0.7" />

        {/* Asa Superior Ergonómica de Cromo / Titanio */}
        <g>
          {/* Fijaciones / Soportes del asa */}
          <rect x="36" y="23" width="6" height="6" rx="1.5" fill="url(#chrome-hardware-grad)" />
          <rect x="58" y="23" width="6" height="6" rx="1.5" fill="url(#chrome-hardware-grad)" />
          {/* Arco del Asa */}
          <path
            d="M39 24 C39 12, 61 12, 61 24"
            stroke="url(#chrome-hardware-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Detalle interno del asa */}
          <path
            d="M42 22 C42 15, 58 15, 58 22"
            stroke="#1e293b"
            strokeWidth="1.2"
            fill="none"
          />
        </g>

        {/* Interior del Portafolio (Visible cuando se abre) */}
        <rect
          x="15"
          y="26"
          width="70"
          height="48"
          rx="5"
          fill="url(#interior-grad)"
          stroke="#475569"
          strokeWidth="1"
        />

        {/* Compartimentos internos sutiles */}
        <line x1="22" y1="36" x2="78" y2="36" stroke="#64748b" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
        <line x1="22" y1="44" x2="78" y2="44" stroke="#64748b" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />

        {/* Cuerpo Principal del Portafolio */}
        <rect
          x="15"
          y="34"
          width="70"
          height="40"
          rx="5"
          fill="url(#briefcase-body-grad)"
          stroke="#334155"
          strokeWidth="1.2"
        />

        {/* Línea de costura perimetral en cuerpo */}
        <rect
          x="18"
          y="37"
          width="64"
          height="34"
          rx="3"
          stroke="#475569"
          strokeWidth="0.8"
          strokeDasharray="3 2"
          fill="none"
          opacity="0.7"
        />

        {/* Refuerzos esquineros metálicos inferiores */}
        <path d="M15 66 C15 71.5, 18.5 74, 24 74 L24 70 L19 70 L19 66 Z" fill="url(#chrome-hardware-grad)" />
        <path d="M85 66 C85 71.5, 81.5 74, 76 74 L76 70 L81 70 L81 66 Z" fill="url(#chrome-hardware-grad)" />

        {/* Base inferior del broche en el cuerpo */}
        <rect x="46.5" y="52" width="7" height="6" rx="1" fill="#1e293b" stroke="url(#chrome-hardware-grad)" strokeWidth="0.8" />
        <circle cx="50" cy="55" r="1" fill="url(#chrome-hardware-grad)" />

        {/* Tapa / Solapa que se abre hacia arriba con rotación 3D */}
        <g
          style={{
            transformOrigin: '50px 26px',
            transform: isOpen ? 'rotateX(-85deg) translateY(-4px)' : 'rotateX(0deg)',
            transition: 'transform 650ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Geometría de la solapa */}
          <path
            d="M15 26 H85 L85 45 L50 54 L15 45 Z"
            fill="url(#briefcase-flap-grad)"
            stroke="#475569"
            strokeWidth="1.2"
          />

          {/* Costura de la solapa */}
          <path
            d="M18 28 H82 L82 43 L50 51.5 L18 43 Z"
            stroke="#64748b"
            strokeWidth="0.8"
            strokeDasharray="3 2"
            fill="none"
            opacity="0.8"
          />

          {/* Broche Superior Metálico de Seguridad */}
          <rect
            x="46"
            y="47"
            width="8"
            height="8"
            rx="1.5"
            fill="url(#chrome-hardware-grad)"
            stroke="#334155"
            strokeWidth="0.5"
            className={isOpen ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]' : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'}
          />
          <line x1="47.5" y1="51" x2="52.5" y2="51" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
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
        // Retardo orgánico entre 0ms y 650ms
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

    // 1. El Portafolio aparece solitario y grande en el centro
    const t1 = setTimeout(() => {
      // 2. El portafolio se abre y se desplaza hacia abajo para no sobreponerse en el área de texto
      setPhase('briefcase_opening');

      const t2 = setTimeout(() => {
        // 3. Expulsión de letras: brotan desde el interior del portafolio en orden dinámico / aleatorio
        setPhase('ejecting_letters');

        // 4. Las letras completan su llegada horizontal
        const t3 = setTimeout(() => {
          setPhase('settled');
          setIsFinalGlow(true);

          // 5. Ciclo continuo de resplandor suave
          setTimeout(() => {
            setIsFinalGlow(false);
            const glowInt = setInterval(() => {
              setIsFinalGlow((prev) => !prev);
            }, 1800);
            return () => clearInterval(glowInt);
          }, 1100);
        }, 1100);

        return () => clearTimeout(t3);
      }, 550);

      return () => clearTimeout(t2);
    }, 650);

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

      {/* PORTAFOLIO GRANDE QUE SE ABRE Y BAJA PARA EXPULSAR LAS LETRAS HACIA ARRIBA */}
      <div
        onClick={() => runAnimationSequence()}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          phase === 'briefcase_solo'
            ? '-translate-y-1/2 opacity-100 scale-100 drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]'
            : phase === 'briefcase_opening'
            ? 'translate-y-[130px] sm:translate-y-[170px] md:translate-y-[200px] opacity-100 scale-95 drop-shadow-[0_16px_40px_rgba(0,0,0,0.9)]'
            : phase === 'ejecting_letters'
            ? 'translate-y-[140px] sm:translate-y-[180px] md:translate-y-[210px] opacity-90 scale-90 pointer-events-none'
            : 'translate-y-[220px] sm:translate-y-[260px] opacity-0 scale-75 pointer-events-none'
        }`}
        title="Haz clic para volver a reproducir"
        aria-hidden={phase === 'settled'}
      >
        <PortfolioBriefcaseGraphic isOpen={phase !== 'briefcase_solo'} />
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

                // Origen de nacimiento: boca del maletín que se encuentra abajo en el centro
                const relativeSpawnX = `calc(${(- (charIdx - wordCenter) * 0.9).toFixed(2)}em)`;
                // Para PORTAFOLIO (fila 1, arriba) la distancia hacia el maletín abajo es mayor (~180px)
                // Para PROFESIONAL (fila 2, abajo) la distancia es menor (~110px)
                const relativeSpawnY = isFirstWord ? '190px' : '120px';

                return (
                  <span
                    key={`slot-${wordIdx}-${charIdx}-${char}`}
                    className="inline-flex items-center justify-center relative leading-[1.0]"
                    style={{
                      minWidth: slotMinWidth,
                      height: slotHeight,
                    }}
                  >
                    {/* LETRA: Emerge directamente del interior del maletín inferior hacia su slot horizontal */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center select-none pointer-events-none text-white ${
                        isPlaced ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        transform: isPlaced
                          ? 'translate3d(0, 0, 0) scale(1)'
                          : `translate3d(${relativeSpawnX}, ${relativeSpawnY}, 0) scale(0.08)`,
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
