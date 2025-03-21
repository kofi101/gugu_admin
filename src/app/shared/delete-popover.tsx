'use client';

import { Title, Text } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';

import { FaRegFileArchive } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

type DeletePopoverProps = {
  title: string;
  description: string;
  onDelete: () => void;
  isMerchant?: boolean;
};

export default function DeletePopover({
  title,
  description,
  onDelete,
  isMerchant,
}: DeletePopoverProps) {
  return (
    <Popover placement="left">
      <Popover.Trigger>
        <ActionIcon
          size="sm"
          variant="outline"
          aria-label={'Archive Item'}
          className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
        >
          {isMerchant ? (
            <MdDelete className="h-4 w-4 text-red-500" />
          ) : (
            <FaRegFileArchive className="h-4 w-4 text-red-500" />
          )}
        </ActionIcon>
      </Popover.Trigger>
      <Popover.Content>
        {({ setOpen }) => (
          <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
            <Title
              as="h6"
              className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
            >
              <FaRegFileArchive className="me-1 h-[17px] w-[17px]" /> {title}
            </Title>
            <Text className="mb-2 leading-relaxed text-gray-500">
              {description}
            </Text>
            <div className="flex items-center justify-end">
              <Button size="sm" className="me-1.5 h-7" onClick={onDelete}>
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => setOpen(false)}
              >
                No
              </Button>
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}
