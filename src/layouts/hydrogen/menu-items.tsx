import { routes } from '@/config/routes';
import { DUMMY_ID } from '@/config/constants';
import {
  PiHeadsetDuotone,
  PiChartBarDuotone,
  PiCurrencyDollarDuotone,
  PiBriefcaseDuotone,
  PiShoppingBagLight,
  PiUserCircleGearLight,
} from 'react-icons/pi';
import { LiaBusinessTimeSolid } from 'react-icons/lia';
import {
  MdProductionQuantityLimits,
  MdOutlineInventory,
  MdOutlineReviews,
  MdOutlineLocalShipping,
  MdManageAccounts,
  MdOutlineStore
} from 'react-icons/md';
import { FaBabyCarriage, FaRegMoneyBillAlt } from 'react-icons/fa';
import { SiSimpleanalytics } from 'react-icons/si';
import { GrServices } from 'react-icons/gr';
import { GiSatelliteCommunication } from 'react-icons/gi';
import { BiBookContent } from 'react-icons/bi';
import { RiCoupon2Line } from 'react-icons/ri';

// Note: do not add href in the label object, it is rendering as label
export const merchantMenuItems = [
  // label start
  {
    name: 'Overview',
  },

  {
    name: 'My Shop',
    href: '/',
    icon: <MdOutlineStore />,
    badge: '',
  }, 

  {
    name: 'Products',
    href: '/products',
    icon: <PiShoppingBagLight />,
    dropdownItems: [
      {
        name: 'All Products',
        href: routes.eCommerce.products,
      },
      {
        name: 'Add Product',
        href: routes.eCommerce.createProduct,
      },
      {
        name: 'Product Configs',
        href: routes.eCommerce.productConfigs,
      },
    ],
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: <RiCoupon2Line />,
    badge: '',
  }, 

  {
    name: 'Coupons',
    href: routes.eCommerce.coupons,
    icon: <RiCoupon2Line />,
    badge: '',
  }, 
  
  
  // {
  //   name: 'Orders',
  //   href: routes.eCommerce.orders,
  //   icon: <PiBriefcaseDuotone />,
  //   badge: '',
  // }

  // {
  //   name: 'Reviews',
  //   href: routes.eCommerce.reviews,
  //   icon: <PiHeadsetDuotone />,
  // },
  // {
  //   name: 'Analytics',
  //   href: routes.analytics,
  //   icon: <PiChartBarDuotone />,
  //   badge: '',
  // },

  // {
  //   name: 'Invoice',
  //   href: '/invoice',
  //   icon: <PiCurrencyDollarDuotone />,
  //   dropdownItems: [
  //     {
  //       name: 'List',
  //       href: routes.invoice.home,
  //     },
  //     {
  //       name: 'Details',
  //       href: routes.invoice.details(DUMMY_ID),
  //     },
  //     {
  //       name: 'Create',
  //       href: routes.invoice.create,
  //     },
  //     {
  //       name: 'Edit',
  //       href: routes.invoice.edit(DUMMY_ID),
  //     },
  //   ],
  // },
  ,
];

export const adminMenuItems = [
  // label start
  {
    name: 'Overview',
  },

  {
    name: 'Business',
    href: '/admin/business',
    icon: <LiaBusinessTimeSolid />,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: <MdProductionQuantityLimits />,
  },

  {
    name: 'Orders',
    href: '/admin/orders',
    icon: <FaBabyCarriage />,
  },
  {
    name: 'Logistics',
    href: '/admin/logistics',
    icon: <MdOutlineLocalShipping />,
  },
  {
    name: 'Taxes',
    href: '/admin/charges',
    icon: <FaRegMoneyBillAlt />,
  },
  {
    name: 'Accounts',
    href: '/admin/accounts',
    icon: <MdManageAccounts />,
  },
  {
    name: 'Reviews',
    href: '/admin/reviews',
    icon: <MdOutlineReviews />,
  },
  // {
  //   name: 'User Control',
  //   href: '/admin/user-control',
  //   icon: <PiUserCircleGearLight />,
  //   dropdownItems: [
  //     {
  //       name: 'Business Info',
  //       href: routes.admin.business_info,
  //     },
  //     {
  //       name: 'Roles',
  //       href: routes.admin.roles,
  //     },
  //   ],
  // },
  // {
  //   name: 'Analytics',
  //   href: routes.admin.analytics,
  //   icon: <SiSimpleanalytics />,
  //   badge: '',
  // },

  // {
  //   name: 'Customer Services',
  //   href: '/admin/customer-services',
  //   icon: <GrServices />,
  // },

  // {
  //   name: 'Communication and Notifications',
  //   href: '/admin/communication',
  //   icon: <GiSatelliteCommunication />,
  // },
  // {
  //   name: 'Content Management',
  //   href: '/admin/content',
  //   icon: <BiBookContent />,
  // },
];
