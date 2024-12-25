'use client';

import React, { useCallback, useState } from 'react';

import Image from 'next/image';
import isEmpty from 'lodash/isEmpty';
import prettyBytes from 'pretty-bytes';
import type { FileWithPath } from '@uploadthing/react';
import { useDropzone } from '@uploadthing/react/hooks';
import { PiTrashBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import cn from '@/utils/class-names';
import UploadIcon from '@/components/shape/upload';
import { FieldError } from '@/components/ui/field-error';
import { endsWith } from 'lodash';

interface UploadZoneProps {
  label?: string;
  name: string;
  setFileData: React.Dispatch<React.SetStateAction<Array<Array<File>>>>;
  className?: string;
  error?: string;
  filesData: Array<Array<File>>;
  fileIndex?: number;
  existingImages?: Array<string>;
  setExistingImages?: React.Dispatch<React.SetStateAction<Array<string>>>;
}

export default function UploadZone({
  label,
  className,
  error,
  setFileData,
  filesData,
  fileIndex,
  // productImages,
  existingImages,
  setExistingImages,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const files = [...filesData];

      files[fileIndex] = acceptedFiles;

      setFileData(files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filesData]
  );

  function handleRemoveFile(index: number) {
    const updatedFiles = [...filesData];

    updatedFiles[fileIndex].splice(index, 1);

    setFileData(updatedFiles);
  }

  function handleRemoveExistingFiles(index: number) {
    const files = existingImages && [...existingImages];
    if (files) {
      files.splice(index, 1);
      setExistingImages?.(files);
    }
  }

  const clearAllFiles = () => {
    const updatedFiles = [...filesData];
    updatedFiles.splice(fileIndex, 1);
    setFileData(updatedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png', '.jpg', '.jpeg', '.webp'] },
  });

  return (
    <div className={cn('grid @container', className)}>
      {label && (
        <span className="mb-1.5 block font-semibold text-gray-900">
          {label}
        </span>
      )}
      <div
        className={cn(
          'rounded-md border-[1.8px]',
          !isEmpty(filesData) &&
            'flex flex-wrap items-center justify-between @xl:flex-nowrap @xl:pr-6'
        )}
      >
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer items-center gap-4 px-6 py-5 transition-all duration-300',
            isEmpty(filesData)
              ? 'justify-center'
              : 'flex-grow justify-center @xl:justify-start'
          )}
        >
          <input {...getInputProps()} />
          <UploadIcon className="h-12 w-12" />
          <Text className="text-base font-medium">
            Drag and Drop or select filesData
          </Text>
        </div>

        {!isEmpty(filesData[fileIndex]) && (
          <UploadButtons
            files={filesData[fileIndex]}
            onClear={() => clearAllFiles()}
          />
        )}
      </div>

      {!isEmpty(filesData[fileIndex]) && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))]">
          {filesData[fileIndex]?.map((file: any, index: number) => (
            <div key={index} className={cn('relative')}>
              <figure className="group relative h-40 rounded-md bg-gray-50">
                <MediaPreview
                  name={file.name}
                  url={URL.createObjectURL(file)}
                />
                {
                  <>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute right-0 top-0 rounded-full bg-gray-700/70 p-1.5 opacity-20 transition duration-300 hover:bg-red-dark group-hover:opacity-100"
                    >
                      <PiTrashBold className="text-white" />
                    </button>
                  </>
                }
              </figure>
              <MediaCaption name={file.path} size={file.size} />
            </div>
          ))}
        </div>
      )}
      {existingImages && existingImages.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))]">
          {existingImages?.map(
            (file: any, index: number) =>
              file && (
                <div key={index} className={cn('relative')}>
                  <figure className="group relative h-40 rounded-md bg-gray-50">
                    <MediaPreview url={file} />
                    {
                      <>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingFiles(index)}
                          className="absolute right-0 top-0 rounded-full bg-gray-700/70 p-1.5 opacity-20 transition duration-300 hover:bg-red-dark group-hover:opacity-100"
                        >
                          <PiTrashBold className="text-white" />
                        </button>
                      </>
                    }
                  </figure>
                </div>
              )
          )}
        </div>
      )}
      {error && <FieldError error={error} />}
    </div>
  );
}

function UploadButtons({
  files,
  onClear,
}: {
  files: any[];
  onClear: () => void;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-4 px-6 pb-5 @sm:flex-nowrap @xl:w-auto @xl:justify-end @xl:px-0 @xl:pb-0">
      <Button
        variant="outline"
        className="w-full gap-2 @xl:w-auto"
        onClick={onClear}
      >
        <PiTrashBold />
        Clear {files.length} files
      </Button>
    </div>
  );
}

function MediaPreview({ name, url }: { name?: string; url: string }) {
  return endsWith(name, '.pdf') ? (
    <object data={url} type="application/pdf" width="100%" height="100%">
      <p>
        Alternative text - include a link <a href={url}>to the PDF!</a>
      </p>
    </object>
  ) : (
    <Image
      fill
      src={url}
      alt={name || 'file'}
      className="transform rounded-md object-contain"
    />
  );
}

function MediaCaption({ name, size }: { name: string; size: number }) {
  return (
    <div className="mt-1 text-xs">
      <p className="break-words font-medium text-gray-700">{name}</p>
      <p className="mt-1 font-mono">{prettyBytes(size)}</p>
    </div>
  );
}
