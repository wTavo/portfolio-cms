/**
 * @file Icons.tsx
 * @description Componentes React de iconos y diseños SVG reutilizables para paneles interactivos.
 */

import React from 'react';
import type { IconName, IconProps } from './types';

export interface BaseSvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  ariaLabel?: string;
}

export function RocketIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export function MapPinIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function ExternalLinkIcon({ size = 14, className = 'w-3.5 h-3.5', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export function CheckIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function CircleDotIcon({ size = 12, className = 'w-3 h-3', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

export function CircleIcon({ size = 12, className = 'w-3 h-3', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function AlertCircleIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

export function UserIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function LockIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function Icon({ name, ...props }: IconProps) {
  switch (name) {
    case 'rocket':
      return <RocketIcon {...props} />;
    case 'map-pin':
      return <MapPinIcon {...props} />;
    case 'arrow-left':
      return <ArrowLeftIcon {...props} />;
    case 'arrow-right':
      return <ArrowRightIcon {...props} />;
    case 'external-link':
      return <ExternalLinkIcon {...props} />;
    case 'check':
      return <CheckIcon {...props} />;
    case 'circle-dot':
      return <CircleDotIcon {...props} />;
    case 'circle':
      return <CircleIcon {...props} />;
    case 'alert-circle':
      return <AlertCircleIcon {...props} />;
    case 'user':
      return <UserIcon {...props} />;
    case 'lock':
      return <LockIcon {...props} />;
    default:
      return null;
  }
}
