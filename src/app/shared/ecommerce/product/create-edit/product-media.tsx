import React from 'react';

import UploadZone from '@/components/ui/file-upload/upload-zone';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';

interface ProductMediaProps {
  className?: string;
  setFileData: React.Dispatch<React.SetStateAction<Array<Array<File>>>>;
  filesData: Array<Array<File>>;
  index?: number;
  // productImages?: Array<string>
  existingImages?: Array<string>;
  setExistingImages?: React.Dispatch<React.SetStateAction<Array<string>>>;
}

export default function ProductMedia({
  className,
  setFileData,
  filesData,
  index,
  // productImages,
  existingImages,
  setExistingImages,
}: ProductMediaProps) {
  return (
    <FormGroup
      title="Upload new product images"
      description="Upload your product image gallery here"
      className={cn(className)}
    >
      <UploadZone
        className="col-span-full"
        name="productImages"
        setFileData={setFileData}
        filesData={filesData}
        fileIndex={index}
        existingImages={existingImages}
        setExistingImages={setExistingImages}
        // productImages={productImages}
      />
    </FormGroup>
  );
}
