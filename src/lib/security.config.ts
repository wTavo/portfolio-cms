/**
 * @file security.config.ts
 * @description Configuración centralizada de seguridad: Content Security Policy (CSP), cookies y headers (Directivas 6 y 9).
 */

export interface SecurityConfig {
  csp: {
    directives: Record<string, string[]>;
  };
  headers: Record<string, string>;
  cookies: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
  rateLimit: {
    authWindowMs: number;
    authMaxAttempts: number;
  };
}

export const securityConfig: SecurityConfig = {
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
  },
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  cookies: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
  rateLimit: {
    authWindowMs: 15 * 60 * 1000, // 15 minutos
    authMaxAttempts: 5,
  },
};

/**
 * Serializa las directivas CSP en una cadena estándar para el encabezado HTTP.
 *
 * @returns Cadena formateada para la cabecera Content-Security-Policy.
 */
export function buildCspHeader(): string {
  return Object.entries(securityConfig.csp.directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}
