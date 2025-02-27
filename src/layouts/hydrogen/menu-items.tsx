import { routes } from '@/config/routes';
import { PiShoppingBagLight } from 'react-icons/pi';
import { LiaBusinessTimeSolid } from 'react-icons/lia';
import {
  MdProductionQuantityLimits,
  MdOutlineLocalShipping,
  MdManageAccounts,
  MdOutlineStore,
  MdOutlineDashboardCustomize,
} from 'react-icons/md';
import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { RiCoupon2Line } from 'react-icons/ri';
import { IoCartOutline, IoSettingsOutline } from 'react-icons/io5';

// Note: do not add href in the label object, it is rendering as label
export const merchantMenuItems = [
  // label start
  {
    name: 'Overview',
  },

  {
    name: 'My Shop',
    href: '/home',
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
];

export const adminMenuItems = [
  // label start
  {
    name: 'Overview',
  },

  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: <MdOutlineDashboardCustomize />,
  },

  {
    name: 'Products',
    href: '/admin/products',
    icon: <MdProductionQuantityLimits />,
  },

  {
    name: 'Orders',
    href: '/admin/orders',
    icon: <IoCartOutline />,
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
    name: 'Business',
    href: '/admin/business',
    icon: <LiaBusinessTimeSolid />,
  },
  {
    name: 'Accounts',
    href: '/admin/accounts',
    icon: <MdManageAccounts />,
  },
  // {
  //   name: 'Reviews',
  //   href: '/admin/reviews',
  //   icon: <MdOutlineReviews />,
  // },
  {
    name: 'System',
    href: '/admin/system',
    icon: <IoSettingsOutline />,
  },
];
