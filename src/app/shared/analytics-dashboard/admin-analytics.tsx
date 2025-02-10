
import GoalAccomplished from '@/app/shared/analytics-dashboard/goal-accomplished';
import StatCards from '@/app/shared/analytics-dashboard/stat-cards';
import TopTrafficSource from '@/app/shared/analytics-dashboard/top-traffic-source';


export default function MerchantAnalytics() {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12 3xl:gap-8">
        <StatCards className="grid-cols-1 @xl:grid-cols-2 @4xl:col-span-2 @6xl:grid-cols-4 @7xl:col-span-12" />

        <TopTrafficSource className="@7xl:col-span-4 3xl:col-span-6" />

        <GoalAccomplished className="@7xl:col-span-4 3xl:col-span-6" />
      </div>
    </div>
  );
}
