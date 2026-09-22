import React, { useState, useEffect } from 'react';

interface UserItem {
  id: string;
  email: string;
  role: string;
  displayName: string;
  isActive: boolean;
  slug?: string;
  createdAt: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch {
      setError('Error al cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          displayName,
          slug: slug.toLowerCase().trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Error al crear usuario.');
        return;
      }

      setSuccessMsg('Usuario creado exitosamente. Se ha enviado la invitación por correo.');
      setEmail('');
      setDisplayName('');
      setSlug('');
      fetchUsers();
    } catch {
      setError('Error de conexión al registrar usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchUsers();
      } else {
        alert(json.error?.message || 'Error al actualizar estado.');
      }
    } catch {
      alert('Error de conexión.');
    }
  };

  return (
    <div className="space-y-10">
      {/* Formulario de Alta */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-bold mb-1">Dar de alta a nuevo usuario (Owner)</h2>
        <p className="text-xs text-[var(--color-text-secondary)] mb-6">
          Ingresa los datos del propietario del portfolio. Se enviará una invitación a su correo electrónico.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-error-bg)] border border-[var(--color-status-error)] text-[var(--color-status-error)] text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-success-bg)] border border-[var(--color-status-success)] text-[var(--color-status-success)] text-xs">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Nombre para mostrar
            </label>
            <input
              type="text"
              required
              placeholder="Gustavo Morales"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full min-h-(--size-input-height) px-3 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-brand-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              placeholder="gustavo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-(--size-input-height) px-3 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-brand-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Enlace / Slug del portfolio
            </label>
            <div className="flex items-center">
              <span className="text-xs text-[var(--color-text-muted)] mr-1">/</span>
              <input
                type="text"
                required
                placeholder="gustavo"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full min-h-(--size-input-height) px-3 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-brand-accent)]"
              />
            </div>
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="min-h-(--size-button-height) px-6 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Enviando invitación...' : 'Crear usuario y enviar invitación'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Usuarios */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-bold mb-4">Usuarios registrados</h2>

        {loading ? (
          <p className="text-xs text-[var(--color-text-muted)]">Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)]">No hay usuarios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  <th className="py-3 px-2">Usuario</th>
                  <th className="py-3 px-2">Rol</th>
                  <th className="py-3 px-2">Portfolio</th>
                  <th className="py-3 px-2">Estado</th>
                  <th className="py-3 px-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-2">
                      <span className="font-semibold block">{u.displayName}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{u.email}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-[var(--color-bg-subtle)]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {u.slug ? (
                        <a
                          href={`/${u.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[var(--color-brand-accent)] hover:underline"
                        >
                          /{u.slug} ↗
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.isActive
                            ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)]'
                            : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error)]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {u.isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {u.role !== 'superadmin' && (
                        <button
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
                        >
                          {u.isActive ? 'Suspender' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
