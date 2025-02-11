import { OrderMetrics } from '@/app/shared/analytics-dashboard/goal-accomplished';
import StatCards from '@/app/shared/analytics-dashboard/stat-cards';
import TopTrafficSource from '@/app/shared/analytics-dashboard/top-traffic-source';

export type DashboardDataType = {
  totalOrders: number;
  totalOrdersPlaced: number;
  totalProductsDelivered: number;
  totalSales: number;
  totalSalesByOrder: TotalSalesByOrder[];
  pendingOrders: number;
  topSellingProducts: TopSellingProduct[];
};

export type TotalSalesByOrder = {
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

export default function MerchantAnalytics({
  salesData,
  dashboardData,
}: {
  salesData: Array<any>;
  dashboardData: DashboardDataType;
}) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2 3xl:gap-8">
        <OrderMetrics orderData={dashboardData} className="" />
        <StatCards
          metrics={salesData}
          className="grid-cols-1 overflow-x-auto @xl:grid-cols-2 @4xl:col-span-2"
        />
      </div>
    </div>
  );
}
