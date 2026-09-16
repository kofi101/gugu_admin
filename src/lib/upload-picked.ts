'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { PickedImage } from '@/components/ui/image-picker';
import { describeError } from './errors';
import { uploadImage } from './upload';

/**
 * Uploads every not-yet-uploaded image in parallel, reporting progress into
 * picker state. Successful uploads become `existing` so a retry after a
 * partial failure only re-sends the failures. Resolves to the final URLs in
 * display order, or throws if any upload failed.
 */
export async function uploadPicked(
  images: PickedImage[],
  folder: string,
  setImages: Dispatch<SetStateAction<PickedImage[]>>
): Promise<string[]> {
  const patch = (key: string, next: Partial<Extract<PickedImage, { kind: 'new' }>> | PickedImage) =>
    setImages((prev) =>
      prev.map((img) => {
        if (img.key !== key) return img;
        if ('kind' in next && next.kind === 'existing') return next;
        return img.kind === 'new' ? { ...img, ...(next as object) } : img;
      })
    );

  const results = await Promise.allSettled(
    images.map(async (img) => {
      if (img.kind === 'existing') return img.url;
      patch(img.key, { progress: 0, error: null });
      const { promise } = uploadImage(folder, img.file, (p) => patch(img.key, { progress: p }));
      try {
        const url = await promise;
        URL.revokeObjectURL(img.preview);
        patch(img.key, { key: img.key, kind: 'existing', url });
        return url;
      } catch (error) {
        patch(img.key, { error: describeError(error), progress: null });
        throw error;
      }
    })
  );

  const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  if (failed.length) {
    const reason = describeError(failed[0].reason);
    throw new Error(
      `${failed.length} ${failed.length === 1 ? 'image' : 'images'} did not upload. ${reason} Nothing was saved; try again.`
    );
  }
  return results.map((r) => (r as PromiseFulfilledResult<string>).value);
}
