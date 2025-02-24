import React from 'react';

export type SalesByOrder = {
  checkOutOrderNumber: string;
  salesAmount: number;
  statusDescription: string;
};

export type TopSellingProduct = {
  productCategory: string;
  brandName: string;
  productId: number;
  productCode: string;
  productName: string;
  highCount: number;
};

export type DashboardMetricsProps = {
  totalOrders: number;
  totalOrdersPlaced: number;
  totalProductsDelivered: number;
  totalSales: number;
  totalSalesByOrder: SalesByOrder[];
  pendingOrders: number;
  topSellingProducts: TopSellingProduct[];
};

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalOrders,
  totalOrdersPlaced,
  totalProductsDelivered,
  totalSales,
  totalSalesByOrder,
  pendingOrders,
  topSellingProducts,
}) => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total Orders', value: totalOrders },
          { label: 'Orders Placed', value: totalOrdersPlaced },
          { label: 'Products Delivered', value: totalProductsDelivered },
          { label: 'Total Sales', value: `GHC ${totalSales.toFixed(2)}` },
          { label: 'Pending Orders', value: pendingOrders },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-lg font-semibold">{item.label}</h3>
            <p className="text-xl font-bold text-primary-dark">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Sales by Order Table */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h3 className="mb-3 text-lg font-semibold">Sales by Order</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-2 text-left">Order #</th>
                <th className="p-2 text-left">Sales Amount</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {totalSalesByOrder?.map((order) => (
                <tr key={order.checkOutOrderNumber} className="border-b">
                  <td className="p-2">{order.checkOutOrderNumber}</td>
                  <td className="p-2">GHC {order.salesAmount.toFixed(2)}</td>
                  <td className="p-2">{order.statusDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top-Selling Products Table */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="mb-3 text-lg font-semibold">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Brand</th>
                <th className="p-2 text-left">Product Name</th>
                <th className="p-2 text-left">Sales Count</th>
              </tr>
            </thead>
            <tbody>
              {topSellingProducts?.map((product) => (
                <tr key={product.productName} className="border-b">
                  <td className="p-2">{product.productCategory}</td>
                  <td className="p-2">{product.brandName}</td>
                  <td className="p-2">{product.productName}</td>
                  <td className="p-2 text-primary-dark">{product.highCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
