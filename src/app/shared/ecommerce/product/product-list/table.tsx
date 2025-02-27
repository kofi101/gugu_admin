'use client';

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import { Button } from '@/components/ui/button';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/ecommerce/product/product-list/columns';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { merchantUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';

const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

const filterState = {
  // price: ['', ''],
  createdAt: [null, null],
  status: '',
};

export default function ProductsTable({
  data = [],
  isMerchant,
}: {
  data: any[];
  isMerchant?: boolean;
}) {
  const [pageSize, setPageSize] = useState(10);

  const [user] = useAuthState(auth);

  const router = useRouter();

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const onDeleteItem = useCallback(async (id: string) => {
    const token = await getUserToken();

    const fetchOptions = {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    await fetch(`${merchantUrl}/Delete/${user?.uid}/${id}`, fetchOptions);
    router.refresh();
    toast.success(<Text as="b">Product deleted successfully</Text>);
  }, []);

  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    totalItems,
    handlePaginate,
    filters,
    updateFilter,
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    // handleDelete,
    handleReset,
  } = useTable(data, pageSize, filterState);

  const columns = useMemo(
    () =>
      getColumns({
        data,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem,
        onChecked: handleRowSelect,
        handleSelectAll,
        isMerchant
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedRowKeys,
      onHeaderCellClick,
      sortConfig.key,
      sortConfig.direction,
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  return (
    <ControlledTable
      variant="modern"
      isLoading={isLoading}
      showLoadingText={true}
      data={tableData}
      // @ts-ignore
      columns={visibleColumns}
      paginatorOptions={{
        pageSize,
        setPageSize,
        total: totalItems,
        current: currentPage,
        onChange: (page: number) => handlePaginate(page),
      }}
      filterOptions={{
        searchTerm,
        onSearchClear: () => {
          handleSearch('');
        },
        onSearchChange: (event) => {
          handleSearch(event.target.value);
        },
        hasSearched: isFiltered,
        hideIndex: 1,
        columns,
        checkedColumns,
        setCheckedColumns,
        enableDrawerFilter: true,
      }}
      tableFooter={<></>}
      className="overflow-hidden rounded-md border border-muted text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
    />
  );
}
