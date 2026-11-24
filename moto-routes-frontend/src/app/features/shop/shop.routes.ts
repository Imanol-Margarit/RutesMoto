import { Routes } from '@angular/router';
import { authGuard } from '../../auth/auth.guard';

export const SHOP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/shop-home/shop-home').then((m) => m.ShopHome)
  },
  {
    path: 'rutas',
    loadComponent: () => import('./pages/shop-list/shop-list').then((m) => m.ShopList)
  },
  {
    path: 'wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/shop-wishlist/shop-wishlist').then((m) => m.ShopWishlist)
  },
  {
    path: 'rutas/:slug',
    loadComponent: () => import('./pages/shop-detail/shop-detail').then((m) => m.ShopDetail)
  }
];
