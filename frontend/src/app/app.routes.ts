import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: '',
    title: 'VTStore – Gaming Accessories',
    loadComponent: () => import('./pages/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'products',
    title: 'Products – VTStore',
    loadComponent: () => import('./pages/products/products-page').then((m) => m.ProductsPage),
  },
  {
    path: 'products/:id',
    title: 'Product – VTStore',
    loadComponent: () =>
      import('./pages/product-detail/product-detail-page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'cart',
    title: 'Your cart – VTStore',
    loadComponent: () => import('./pages/cart/cart-page').then((m) => m.CartPage),
  },
  {
    path: 'services',
    title: 'Services – VTStore',
    loadComponent: () => import('./pages/services/services-page').then((m) => m.ServicesPage),
  },
  {
    path: 'contact',
    title: 'Contact – VTStore',
    loadComponent: () => import('./pages/contact/contact-page').then((m) => m.ContactPage),
  },
  {
    path: 'account',
    title: 'My account – VTStore',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/account/account-page').then((m) => m.AccountPage),
  },
  {
    path: 'admin/products',
    title: 'Manage products – VTStore',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin-products-page').then((m) => m.AdminProductsPage),
  },
  {
    path: 'callback',
    title: 'Signing in – VTStore',
    loadComponent: () => import('./pages/callback/callback-page').then((m) => m.CallbackPage),
  },
  {
    path: '**',
    title: 'Page not found – VTStore',
    loadComponent: () => import('./pages/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
