'use client';

import { getDownloadURL, ref, uploadBytesResumable, type UploadTask } from 'firebase/storage';
import { firebase } from './firebase';

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/** Returns a sentence describing why the file is not accepted, or null. */
export function checkImage(file: File): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return `${file.name} is not a JPG, PNG or WebP image.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. Images must be 5 MB or smaller.`;
  }
  if (file.size === 0) return `${file.name} is empty.`;
  return null;
}

export type UploadHandle = { promise: Promise<string>; cancel: () => void };

/**
 * Uploads to a Storage folder the caller's claims allow
 * (products/{merchantId}/{productId}/ or merchants/{merchantId}/branding/).
 */
export function uploadImage(folder: string, file: File, onProgress: (fraction: number) => void): UploadHandle {
  const { storage } = firebase();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT[file.type] ?? 'img'}`;
  const objectRef = ref(storage, `${folder.replace(/\/+$/, '')}/${name}`);
  const task: UploadTask = uploadBytesResumable(objectRef, file, {
    contentType: file.type,
    cacheControl: 'public,max-age=31536000',
  });
  const promise = new Promise<string>((resolve, reject) => {
    task.on(
      'state_changed',
      (s) => onProgress(s.totalBytes ? s.bytesTransferred / s.totalBytes : 0),
      reject,
      () => getDownloadURL(task.snapshot.ref).then(resolve, reject)
    );
  });
  return { promise, cancel: () => task.cancel() };
}
