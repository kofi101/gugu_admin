'use client';

import { UserCog } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/field';
import { DefinitionList, PageHeader, Panel } from '@/components/ui/panel';
import { DataView, EmptyState, ErrorState, ListSkeleton } from '@/components/ui/states';
import { useSignedIn } from '@/lib/auth';
import { findUsers, listMerchants, setUserRole } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { mutate } from '@/lib/notify';
import type { Merchant, Role, UserProfile } from '@/lib/types';
import { useAsync } from '@/lib/use-data';

const ROLE_LABEL: Record<Role, string> = { customer: 'Shopper', merchant: 'Seller', admin: 'GUGU staff' };

function RoleDialog({ user, onClose, onDone }: { user: UserProfile; onClose: () => void; onDone: () => void }) {
  const merchants = useAsync<Merchant[]>('merchants', listMerchants);
  const [role, setRole] = useState<Role>(user.role ?? 'customer');
  const [merchantId, setMerchantId] = useState(user.merchantId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmAdmin, setConfirmAdmin] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (role === 'merchant' && !merchantId) {
      setError('Choose the store this seller manages.');
      return;
    }
    if (role === 'admin' && user.role !== 'admin' && !confirmAdmin) {
      setError('Tick the box to confirm full staff access.');
      return;
    }
    setBusy(true);
    try {
      await mutate(() => setUserRole({ uid: user.uid, role, ...(role === 'merchant' ? { merchantId } : {}) }), {
        success: `${user.email ?? user.uid} is now ${ROLE_LABEL[role].toLowerCase()}. They have been signed out and must sign in again.`,
        error: 'Role not changed.',
      });
      onDone();
      onClose();
    } catch {
      /* toast shown */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Change role"
      description={user.email ?? user.uid}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="role-form" loading={busy} disabled={role === (user.role ?? 'customer') && merchantId === (user.merchantId ?? '')}>
            Change role
          </Button>
        </>
      }
    >
      <form id="role-form" onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Role">
          {(p) => (
            <Select {...p} value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="customer">Shopper (no dashboard access)</option>
              <option value="merchant">Seller (manages one store)</option>
              <option value="admin">GUGU staff (full admin access)</option>
            </Select>
          )}
        </Field>
        {role === 'merchant' ? (
          merchants.status === 'error' ? (
            <ErrorState error={merchants.error} onRetry={merchants.retry} title="Stores could not be loaded" className="px-0 py-2" />
          ) : (
            <Field label="Store" required hint="Seller applications create stores automatically when approved.">
              {(p) => (
                <Select {...p} value={merchantId} onChange={(e) => setMerchantId(e.target.value)} disabled={merchants.status !== 'ready'}>
                  <option value="">{merchants.status === 'ready' ? 'Choose a store' : 'Loading stores…'}</option>
                  {merchants.status === 'ready'
                    ? merchants.data.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.id})
                        </option>
                      ))
                    : null}
                </Select>
              )}
            </Field>
          )
        ) : null}
        <p className="text-sm text-ink-muted">
          Changing a role signs this person out on every device. They need to sign in again to get the new access.
        </p>
        {role === 'admin' && user.role !== 'admin' ? (
          <label className="flex items-start gap-2.5 rounded-lg border border-thread-300 bg-thread-50 p-3 text-[0.9375rem] text-thread-800">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-brand-700"
              checked={confirmAdmin}
              onChange={(e) => setConfirmAdmin(e.target.checked)}
            />
            This person can approve sellers and products, change any role and see every order.
          </label>
        ) : null}
        {error ? (
          <p role="alert" className="text-[0.9375rem] font-medium text-bad-700">
            {error}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}

export function Users() {
  const me = useSignedIn();
  const [input, setInput] = useState('');
  const [term, setTerm] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const result = useAsync<UserProfile[]>(term ? `users:${term}:${attempt}` : null, term ? () => findUsers(term) : null);

  return (
    <>
      <PageHeader title="Users and roles" description="Find an account by email or user ID and change what it can do." />
      <Panel className="mb-6" bodyClassName="px-4 py-4 sm:px-5">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) setTerm(input.trim());
          }}
        >
          <Field label="Email or user ID" className="flex-1" hint="Email must match exactly.">
            {(p) => <Input {...p} value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" spellCheck={false} />}
          </Field>
          <Button type="submit" className="sm:mb-[1.625rem]">
            Find user
          </Button>
        </form>
      </Panel>
      {term ? (
        <Panel title="Results">
          <DataView result={result} loading={<ListSkeleton rows={1} label="Searching" />} errorTitle="Search failed">
            {(users) =>
              users.length === 0 ? (
                <EmptyState title="No account found">
                  Check the spelling. Accounts only appear once the person has signed in to the GUGU app or website.
                </EmptyState>
              ) : (
                <ul className="divide-y divide-line">
                  {users.map((u) => (
                    <li key={u.uid} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:px-5">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 font-semibold">
                          {u.displayName || u.email || 'No name'}
                          <Badge tone={u.role === 'admin' ? 'brand' : u.role === 'merchant' ? 'ok' : 'neutral'}>
                            {ROLE_LABEL[u.role ?? 'customer']}
                          </Badge>
                        </p>
                        <div className="mt-2">
                          <DefinitionList
                            items={[
                              { label: 'Email', value: u.email || '—' },
                              { label: 'User ID', value: <code className="text-sm break-all">{u.uid}</code> },
                              ...(u.merchantId ? [{ label: 'Store', value: <code className="text-sm">{u.merchantId}</code> }] : []),
                              { label: 'Joined', value: formatDate(u.createdAt) },
                            ]}
                          />
                        </div>
                      </div>
                      {u.uid === me.user.uid ? (
                        <p className="text-sm text-ink-muted">This is you</p>
                      ) : (
                        <Button variant="secondary" icon={<UserCog aria-hidden />} onClick={() => setEditing(u)}>
                          Change role
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )
            }
          </DataView>
        </Panel>
      ) : null}
      {editing ? <RoleDialog user={editing} onClose={() => setEditing(null)} onDone={() => setAttempt((n) => n + 1)} /> : null}
      <p className="mt-6 text-sm text-ink-muted">
        Roles shown come from each account&apos;s profile record, which GUGU updates whenever a role changes.
      </p>
    </>
  );
}
