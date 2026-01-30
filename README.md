# 🎫 Eventify - Event Ticketing Platform

> Modern event management and ticketing system built with Angular 20, deployed on Vercel with MongoDB Atlas and Render backend.

[![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 Overview

**Eventify** is a full-stack event ticketing platform with real-time availability, secure checkout, and comprehensive admin tools. Built with Angular 20's standalone components and Signal-based state management.

### Live Demo

- **Frontend:** [https://eventify-one-eta.vercel.app](https://eventify-one-eta.vercel.app)
- **API:** [https://eventify-api-wfdr.onrender.com](https://eventify-api-wfdr.onrender.com)
- **Database:** MongoDB Atlas (Cloud)

---

## ✨ Key Features

### For Users
- 🔍 Event discovery with search & filters
- 🛒 Persistent shopping cart
- 🎫 Secure ticket booking
- 💬 Event comments & ratings
- 📱 Fully responsive design
- 🌓 Dual themes (dark & light mode)

### For Admins
- 📊 Analytics dashboard
- 📝 Event management (CRUD)
- 👥 User management
- 💰 Order tracking & refunds
- 📈 Excel export functionality
- 🕒 Event & order history tracking

---

## 🛠️ Tech Stack

### Frontend
- **Angular 20.3** - Zoneless change detection
- **TypeScript 5.9** - Strict mode
- **Signals** - Reactive state management
- **Tailwind CSS 3.4** - Utility-first styling
- **RxJS 7.8** - Reactive programming

### Key Angular 20 Features
- ✨ **Zoneless** - No Zone.js for better performance
- 🧩 **Standalone** - All components standalone by default
- 📡 **Signals** - Built-in reactive primitives
- 🚀 **Lazy Loading** - Route-based code splitting with `canMatch`

### Backend & Database
- **Node.js + Express** - REST API
- **MongoDB Atlas** - Cloud database
- **JWT** - Authentication
- **Mongoose** - ODM

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Database hosting

---

## 📦 Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x
- **Git**

```bash
node --version  # v20.x.x or higher
npm --version   # 10.x.x or higher
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/eventify.git
cd eventify
npm install
```

### 2. Configure Environment

Create `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  apiBaseUrl: 'http://localhost:5000'
};
```

### 3. Start Development Server

```bash
npm start
```

Navigate to `http://localhost:4200`

---

## 📁 Project Structure

```
src/app/
├── core/                    # Core services & utilities
│   ├── guards/             # Route guards (auth, role)
│   ├── interceptors/       # HTTP interceptors
│   └── services/           # Business logic
│       ├── auth/           # Authentication
│       ├── events/         # Event management
│       ├── orders/         # Order management
│       ├── comments/       # Comment management
│       ├── cart/           # Shopping cart
│       └── ui/             # UI state
│
├── features/               # Feature modules
│   ├── auth/              # Login, Register
│   ├── events/            # Event browsing & details
│   ├── orders/            # Order tracking
│   └── admin/             # Admin panel
│
├── shared/                # Reusable components
│   ├── components/        # UI components
│   ├── pipes/             # Custom pipes
│   └── ui/                # Component library
│
└── models/                # TypeScript interfaces
```

---

## 🏗️ Architecture

### Zoneless Change Detection (Angular 20)

Eventify uses Angular 20's zoneless mode for optimal performance:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),  // No Zone.js!
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor, 
        loadingInterceptor, 
        httpErrorInterceptor
      ])
    )
  ]
};
```

**Benefits:**
- ⚡ Faster change detection
- 📦 Smaller bundle size (~30KB reduction)
- 🎯 More predictable performance
- 🔄 Works seamlessly with Signals

**How it works:**
- Signals automatically notify Angular of changes
- No need for Zone.js monkey-patching
- Manual change detection when needed with `ChangeDetectorRef`

### Standalone Components (Angular 20)

In Angular 20, components are standalone by default. No need to specify `standalone: true`:

```typescript
@Component({
  selector: 'app-event-details',
  imports: [EventComments, EventDetailsHero, EventRating],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css'
})
export class EventDetails implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  
  singleEvent = this.eventService.singleEvent;
  loading = this.eventService.isLoadingSingle;
  userId = this.authService.userId;
  isStaff = this.authService.isStaff;
}
```

### Signal-Based State Management

**Service + Store Pattern:**

```typescript
// Store: Pure state management
@Injectable({ providedIn: 'root' })
export class EventStoreService {
  private _events = signal<Event[]>([]);
  
  readonly events = computed(() => this._events());
  
  setEvents(events: Event[]): void {
    this._events.set(events);
  }
}

// Service: Business logic + API calls
@Injectable({ providedIn: 'root' })
export class EventService {
  private api = inject(EventApiService);
  private store = inject(EventStoreService);
  
  readonly events = this.store.events;
  
  loadEvents(): Observable<Event[]> {
    return this.api.getEvents().pipe(
      tap(events => this.store.setEvents(events))
    );
  }
}
```

**Benefits:**
- Clear separation of concerns
- Reactive by default
- Automatic change detection
- Type-safe state updates

### Route-Based Code Splitting

Using `canMatch` for lazy-loaded routes provides better performance than `canActivate`:

```typescript
export const routes: Routes = [
  // Public route - lazy loaded
  {
    path: 'events',
    loadComponent: () => 
      import('./features/events/event-board/event-board')
        .then(c => c.EventBoard)
  },
  
  // Protected route - canMatch prevents loading if unauthorized
  {
    path: 'admin/dashboard',
    canMatch: [adminGuard],  // Checks BEFORE loading component
    loadComponent: () => 
      import('./features/admin/admin-dashboard/admin-dashboard')
        .then(c => c.AdminDashboard)
  },
  
  // Protected route - canActivate for already loaded routes
  {
    path: 'orders/:id',
    canActivate: [authGuard],  // Checks AFTER route matched
    loadComponent: () => 
      import('./features/orders/order-details/order-details')
        .then(c => c.OrderDetails)
  }
];
```

**Guard Strategy:**
- `canMatch` - Best for lazy routes (prevents downloading code)
- `canActivate` - For eagerly loaded routes or when you need route data

---

## 🌐 Deployment

### Production Stack

```
┌─────────────────────────────────────────┐
│         Users (Browser/Mobile)          │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│    Vercel (Frontend - Angular App)      │
│    https://eventify-one-eta.vercel.app  │
│    Plan: Free (Hobby)                   │
└────────────────┬────────────────────────┘
                 │ API Calls
                 ↓
┌─────────────────────────────────────────┐
│    Render (Backend - Node.js API)       │
│    https://eventify-api-wfdr.onrender.com │
│    Plan: Free (512MB RAM, 0.1 CPU)      │
└────────────────┬────────────────────────┘
                 │ Database Queries
                 ↓
┌─────────────────────────────────────────┐
│    MongoDB Atlas (Cloud Database)       │
│    mongodb+srv://cluster.mongodb.net    │
│    Plan: Free (M0 Cluster, 512MB)       │
└─────────────────────────────────────────┘
```

> **💡 Note:** All services use free tier plans, perfect for hobby projects and demos.
> Free instances may spin down after inactivity and take ~30 seconds to wake up.

### Deploy Frontend (Vercel)

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Framework preset: **Angular**
   - Build command: `npm run build`
   - Output directory: `dist/eventify/browser`

3. **Set Environment Variables:**
   ```
   VITE_API_URL=https://eventify-api-wfdr.onrender.com/api
   ```

4. **Deploy:**
   Vercel auto-deploys on every push to `main`

### Deploy Backend (Render)

1. **Create Web Service:**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect repository

2. **Configure:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eventify
   JWT_SECRET=your-super-secret-key
   PORT=5000
   CORS_ORIGIN=https://eventify-one-eta.vercel.app
   ```

> **⚠️ Important:** Render Free tier spins down after 15 minutes of inactivity.
> First request after idle may take 30-50 seconds to wake up the server.

4. **Deploy:**
   Render auto-deploys on every push

### Setup Database (MongoDB Atlas)

1. **Create Cluster:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free M0 cluster
   - Choose region closest to Render server

2. **Configure Access:**
   - Database Access → Add user
   - Network Access → Add IP: `0.0.0.0/0` (allow from anywhere)

3. **Get Connection String:**
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/eventify
   ```

4. **Add to Render:**
   Paste connection string in `MONGODB_URI` environment variable

### Environment Variables Reference

#### Frontend (Vercel)
```bash
VITE_API_URL=https://eventify-api-wfdr.onrender.com/api
```

#### Backend (Render)
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eventify
JWT_SECRET=your-super-secret-jwt-secret-key-change-this
PORT=5000
CORS_ORIGIN=https://eventify-one-eta.vercel.app
```

### Free Tier Limitations

**Vercel (Free/Hobby):**
- ✅ Unlimited bandwidth
- ✅ 100GB bandwidth per month
- ✅ Automatic HTTPS
- ⚠️ Limited build minutes (6,000/month)

**Render (Free):**
- ⚠️ 512MB RAM, 0.1 CPU
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 750 hours/month (enough for 1 service)
- ⚠️ Cold start: ~30-50 seconds

**MongoDB Atlas (M0 Free):**
- ✅ 512MB storage
- ✅ Shared RAM
- ✅ No credit card required
- ⚠️ Limited to 100 connections

---

## 💻 Development

### Run Locally

```bash
# Start development server
npm start

# Start with custom port
ng serve --port 4201

# Start with proxy (avoid CORS)
ng serve --proxy-config proxy.conf.json
```

### Build for Production

```bash
npm run build
# Output: dist/eventify/browser/
```

### Code Generation

```bash
# Component
ng generate component features/my-feature

# Service
ng generate service core/services/my-service

# Guard
ng generate guard core/guards/my-guard
```

---

## 🔌 API Integration

### Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class EventApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/events`;
  
  getEvents(): Observable<Event[]> {
    return this.http.get<ApiResponse<Event[]>>(this.apiUrl).pipe(
      map(res => res.data)
    );
  }
  
  createEvent(event: Partial<Event>): Observable<Event> {
    return this.http.post<ApiResponse<Event>>(this.apiUrl, event).pipe(
      map(res => res.data)
    );
  }
}
```

### Auth Interceptor

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req);
};
```

---

## 🎨 Styling

### Dual Theme System

Built-in dark and light themes using CSS custom properties:

**Dark Theme (Default):**
```css
[data-theme="dark"] {
  --primary: 59 130 246;
  --accent: 139 92 246;
  --background: 15 23 42;    /* Dark slate */
  --foreground: 248 250 252; /* Light text */
  --muted: 148 163 184;      /* Gray */
  --border: 51 65 85;        /* Dark border */
}
```

**Light Theme:**
```css
[data-theme="light"] {
  --primary: 59 130 246;
  --accent: 139 92 246;
  --background: 255 255 255; /* White */
  --foreground: 15 23 42;    /* Dark text */
  --muted: 100 116 139;      /* Gray */
  --border: 226 232 240;     /* Light border */
}
```

**Theme Toggle:**
Users can switch between themes in the UI. Theme preference is saved to `localStorage`.

### Tailwind Utilities

```css
/* Component classes */
.btn-primary → Primary button
.btn-ghost → Ghost button
.card → Card container
.input → Input field
```

---

## 🔒 Authentication

### Protected Routes

```typescript
{
  path: 'admin',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['admin', 'poweruser'] }
}
```

### Role-Based Access

- **User** - Browse events, place orders, comment & rate
- **Poweruser** - Manage events, view all orders
- **Admin** - Full system access, user management

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
ng serve --port 4201
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
Use proxy configuration in development:

**proxy.conf.json**
```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Build Memory Error
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Refactor code
chore: Update dependencies
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🗺️ Roadmap

### Coming Soon
- [ ] Payment gateway (Stripe/PayPal)
- [ ] QR code tickets
- [ ] Email notifications
- [ ] Multi-language support (i18n)
- [ ] Mobile app (Capacitor)
- [ ] Social media authentication
- [ ] Advanced analytics

### Recently Completed ✅
- [x] Production deployment (Vercel + Render + MongoDB Atlas)
- [x] Angular 20 migration with zoneless change detection
- [x] Signal-based state management
- [x] Service + Store architecture
- [x] Dual theme system (dark & light)
- [x] Excel export
- [x] Event comments & ratings
- [x] Order history tracking

---

## 📞 Support

- **Email:** support@eventify.com
- **Issues:** [GitHub Issues](https://github.com/your-username/eventify/issues)

---

**Built with ❤️ using Angular 20**

*Deployed on Vercel, Render & MongoDB Atlas*

Last updated: January 2026