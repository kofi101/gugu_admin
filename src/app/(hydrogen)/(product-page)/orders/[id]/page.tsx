import PageHeader from '@/app/shared/page-header';
import OrderView from '@/app/shared/ecommerce/order/order-view';
import { baseUrl } from '@/config/base-url';
import { cookies } from 'next/headers';

// export default async function OrderDetailsPage({ params }: any) {
//   const orderId = await params?.id;
//   const slug = orderId?.split('-');
//   const orderNumber = slug?.[0];
//   const customerId = slug?.[1];

//   const token = cookies().get('token');

//   let customerOrders;
//   let statuses;

//   const fetchOptions = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   };

//   try {
//     const orderDetailsRes = await fetch(
//       `${baseUrl}/Orders/CustomerOrderDetails/${customerId}/${orderNumber}`,
//       fetchOptions
//     );

//     statuses = await fetch(`${baseUrl}/Orders/OrderStatus`, fetchOptions).then(
//       (data) => data.json()
//     );

//     customerOrders = await orderDetailsRes.json();
//   } catch (err) {}

//   const pageHeader = {
//     title: `Order #${orderNumber}`,
//     breadcrumb: [
//       {
//         href: '/orders',
//         name: 'All Orders',
//       },
//       {
//         name: orderNumber,
//       },
//     ],
//   };


//   return (
//     <>
//       <PageHeader
//         title={pageHeader.title}
//         breadcrumb={pageHeader.breadcrumb}
//       ></PageHeader>
//       <OrderView orderData={customerOrders} orderStatus={statuses} />
//     </>
//   );
// }


export default async function OrderDetailsPage({ params }: any) {
  try {
    if (!params?.id) {
      throw new Error("Order ID is missing.");
    }

    const [orderNumber, customerId] = params.id.split('-');

    if (!orderNumber || !customerId) {
      throw new Error("Invalid order ID format.");
    }

    const token = cookies().get('token');
    if (!token) {
      throw new Error("Unauthorized: Missing token.");
    }

    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    // Fetch order details and statuses concurrently
    const [orderDetailsRes, statusRes] = await Promise.all([
      fetch(`${baseUrl}/Orders/CustomerOrderDetails/${customerId}/${orderNumber}`, fetchOptions),
      fetch(`${baseUrl}/Orders/OrderStatus`, fetchOptions),
    ]);

    if (!orderDetailsRes.ok || !statusRes.ok) {
      throw new Error("Failed to fetch order details or statuses.");
    }

    const [customerOrders, statuses] = await Promise.all([
      orderDetailsRes.json(),
      statusRes.json(),
    ]);

    const pageHeader = {
      title: `Order #${orderNumber}`,
      breadcrumb: [
        { href: '/orders', name: 'All Orders' },
        { name: orderNumber },
      ],
    };

    return (
      <>
        <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
        <OrderView orderData={customerOrders} orderStatus={statuses} />
      </>
    );
  } catch (error) {
    console.error("Error loading order details:", error);
    return <p className="text-center text-red-500">Failed to load order details.</p>;
  }
}
