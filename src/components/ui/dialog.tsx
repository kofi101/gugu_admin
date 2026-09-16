'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './button';
import { Field, Textarea } from './field';

/** Native <dialog>: focus trap, Escape and inert background come for free. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = (e: Event) => {
      e.preventDefault();
      onCloseRef.current();
    };
    el.addEventListener('cancel', handle);
    return () => el.removeEventListener('cancel', handle);
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius-panel)] border border-line bg-surface p-0 text-ink shadow-[var(--shadow-pop)] backdrop:backdrop-blur-[1px] open:flex open:flex-col',
        size === 'lg' ? 'max-w-2xl' : 'max-w-md'
      )}
    >
      {open ? (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description ? <div className="mt-1 text-[0.9375rem] text-ink-muted">{description}</div> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-2 grid size-10 place-items-center rounded-md text-ink-muted hover:bg-ground hover:text-ink"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children ? <div className="overflow-y-auto px-5 py-4">{children}</div> : null}
          {footer ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-ground/60 px-5 py-3">{footer}</div>
          ) : null}
        </>
      ) : null}
    </dialog>
  );
}

/**
 * Confirmation for destructive or consequential actions. `withNote` adds an
 * optional reason field passed to onConfirm.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  tone = 'danger',
  withNote,
  noteLabel = 'Note (optional)',
  noteRequired,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  withNote?: boolean;
  noteLabel?: string;
  noteRequired?: boolean;
  onConfirm: (note: string) => Promise<unknown> | void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  const noteMissing = Boolean(withNote && noteRequired && !note.trim());

  const close = () => {
    if (busy) return;
    setNote('');
    setTouched(false);
    onClose();
  };

  const confirm = async () => {
    setTouched(true);
    if (noteMissing) return;
    setBusy(true);
    try {
      await onConfirm(note.trim());
      setNote('');
      setTouched(false);
      onClose();
    } catch {
      // The caller reports the failure (toast); keep the dialog open for retry.
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={confirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {withNote ? (
        <Field
          label={noteLabel}
          required={noteRequired}
          error={touched && noteMissing ? 'Add a short reason so the seller knows what to fix.' : undefined}
        >
          {(p) => <Textarea {...p} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />}
        </Field>
      ) : null}
    </Dialog>
  );
}
