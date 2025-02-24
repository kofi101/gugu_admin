import Header from '@/layouts/hydrogen/header';
import Sidebar from '@/layouts/hydrogen/sidebar';
import { cookies } from 'next/headers';

export default async function HydrogenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userType = await cookies().get('userType')?.value;

  return (
    <main className="flex min-h-screen flex-grow">
      <Sidebar
        userType={userType}
        className="fixed hidden xl:block dark:bg-gray-50"
      />
      <div className="flex w-full flex-col xl:ms-[270px] xl:w-[calc(100%-270px)] 2xl:ms-72 2xl:w-[calc(100%-288px)]">
        <Header />
        <div className="flex flex-grow flex-col px-4 pb-6 pt-2 md:px-5 lg:px-6 lg:pb-8 3xl:px-8 3xl:pt-4 4xl:px-10 4xl:pb-9">
          {children}
        </div>
      </div>
    </main>
  );
}
