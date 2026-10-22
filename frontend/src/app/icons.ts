import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideCheck,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCircleAlert,
  lucideCpu,
  lucideExternalLink,
  lucideGamepad2,
  lucideHeadphones,
  lucideKeyboard,
  lucideLayoutGrid,
  lucideLoaderCircle,
  lucideLogOut,
  lucideMail,
  lucideMapPin,
  lucideMenu,
  lucideMessagesSquare,
  lucideMinus,
  lucideMonitor,
  lucideMoon,
  lucideMouse,
  lucidePackage,
  lucidePencil,
  lucidePhone,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideSearchX,
  lucideShield,
  lucideShieldCheck,
  lucideShoppingBag,
  lucideShoppingCart,
  lucideSparkles,
  lucideStar,
  lucideStore,
  lucideSun,
  lucideTrash2,
  lucideTriangleAlert,
  lucideTruck,
  lucideTv,
  lucideUser,
  lucideWrench,
  lucideX,
} from '@ng-icons/lucide';

/** Every icon the app uses, registered once in app.config.ts. */
export const ICONS = {
  lucideArrowLeft,
  lucideArrowRight,
  lucideCheck,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCircleAlert,
  lucideCpu,
  lucideExternalLink,
  lucideGamepad2,
  lucideHeadphones,
  lucideKeyboard,
  lucideLayoutGrid,
  lucideLoaderCircle,
  lucideLogOut,
  lucideMail,
  lucideMapPin,
  lucideMenu,
  lucideMessagesSquare,
  lucideMinus,
  lucideMonitor,
  lucideMoon,
  lucideMouse,
  lucidePackage,
  lucidePencil,
  lucidePhone,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideSearchX,
  lucideShield,
  lucideShieldCheck,
  lucideShoppingBag,
  lucideShoppingCart,
  lucideSparkles,
  lucideStar,
  lucideStore,
  lucideSun,
  lucideTrash2,
  lucideTriangleAlert,
  lucideTruck,
  lucideTv,
  lucideUser,
  lucideWrench,
  lucideX,
};

/** Icon for each product category; anything unknown falls back to a box. */
export function categoryIcon(category: string): string {
  switch (category) {
    case 'Headsets':
      return 'lucideHeadphones';
    case 'Mice':
      return 'lucideMouse';
    case 'Controllers':
      return 'lucideGamepad2';
    case 'Consoles':
      return 'lucideTv';
    case 'PCs':
      return 'lucideCpu';
    case 'Keyboards':
      return 'lucideKeyboard';
    case 'Monitors':
      return 'lucideMonitor';
    default:
      return 'lucidePackage';
  }
}
