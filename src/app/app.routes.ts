import { Routes } from '@angular/router';

import { authGuard, adminGuard } from './core/guards';

export const routes: Routes = [
  // ==========================================
  // ROOT REDIRECT
  // ==========================================
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },

  // ==========================================
  // PUBLIC ROUTES
  // ==========================================
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then((c) => c.Home),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then((c) => c.About),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact-us/contact-us').then((c) => c.ContactUs),
  },

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((c) => c.Register),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((c) => c.Login),
  },

  // ==========================================
  // EVENTS (Public)
  // ==========================================
  {
    path: 'events',
    loadComponent: () =>
      import('./features/events/event-board/event-board').then((c) => c.EventBoard),
  },
  {
    path: 'search-events',
    loadComponent: () =>
      import('./features/events/event-search/event-search').then((c) => c.EventSearch),
  },
  {
    path: 'details-event/:id',
    loadComponent: () =>
      import('./features/events/event-details/event-details').then((c) => c.EventDetails),
  },

  // ==========================================
  // EVENTS (Protected - Staff Only)
  // ==========================================
  {
    path: 'create-event',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./features/events/event-create/event-create').then((c) => c.EventCreate),
  },
  {
    path: 'edit-event/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/events/event-edit/event-edit').then((c) => c.EventEdit),
  },

  // ==========================================
  // CART & ORDERS
  // ==========================================
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart').then((c) => c.Cart),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/orders/orders-board/orders-board').then((c) => c.Orders),
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/order-details/order-details').then((c) => c.OrderDetails),
  },

  // ==========================================
  // ADMIN ROUTES (Staff Only)
  // ==========================================
  {
    path: 'admin/dashboard',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-dashboard/admin-dashboard').then((c) => c.AdminDashboard),
  },
  {
    path: 'admin/users',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-users/admin-users').then((c) => c.AdminUsers),
  },
  {
    path: 'admin/events',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-events/admin-events').then((c) => c.AdminEvents),
  },

  // ==========================================
  // 404 FALLBACK
  // ==========================================
  {
    path: '**',
    loadComponent: () => import('./core/pages/not-found/not-found').then((c) => c.NotFound),
  },
];