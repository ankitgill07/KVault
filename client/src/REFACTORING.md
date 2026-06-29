# KVault Client - Refactored Architecture

## Project Structure

```
client/src/
├── api/                    # API layer - raw API calls
│   ├── authApi.ts
│   ├── cartApi.ts
│   ├── courseApi.ts
│   └── axiosInstance.ts
│
├── assets/                 # Static assets (images, fonts, etc.)
│
├── components/             # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── CourseCard.tsx
│   ├── Categories.tsx
│   ├── Breadcrumbs.tsx
│   ├── ContinueLearning.tsx
│   ├── CourseTabs.tsx
│   ├── Community.tsx
│   ├── BentoPaths.tsx
│   ├── WhyChoose.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── RegistrationForm.tsx
│   ├── OtpVerification.tsx
│   └── PageWrapper.tsx     # HOC for injecting common props
│
├── context/                # React Context providers
│   ├── UserContext.tsx     # User authentication state
│   └── AppStateContext.tsx # Global app state (cart, wishlist, etc.)
│
├── data/                   # Static data and mock data
│   └── courses.ts
│
├── hooks/                  # Custom React hooks
│   ├── useCart.ts          # Cart state management
│   ├── useWishlist.ts      # Wishlist state management
│   ├── useAppState.ts      # General app state management
│   └── useAllCourses.ts    # Courses data fetching
│
├── layouts/                # Layout components
│   ├── MainLayout.tsx      # Layout with header & footer
│   └── AuthLayout.tsx      # Layout for auth pages (no header/footer)
│
├── pages/                  # Page components (route targets)
│   ├── Home.tsx
│   ├── AllCourses.tsx
│   ├── CourseDetail.tsx
│   ├── CategoryPage.tsx
│   ├── Cart.tsx
│   ├── Wishlist.tsx
│   ├── MyLearning.tsx
│   ├── CoursePlayer.tsx
│   └── CoursesPage.tsx
│
├── routes/                 # Routing configuration
│   ├── routeConfig.ts      # Route constants and helpers
│   ├── routes.tsx          # Router instance creation
│   ├── AppRoutes.tsx       # Route definitions with layouts
│   └── ProtectedRoute.tsx  # Auth guard component
│
├── services/               # Business logic layer
│   ├── authService.ts
│   ├── cartService.ts
│   ├── wishlistService.ts
│   ├── courseService.ts
│   └── userService.ts
│
├── utils/                  # Utility functions
│   └── api.ts
│
├── App.tsx                 # Root component (clean & minimal)
├── App.css                 # Global styles
├── index.css               # Base styles
└── main.tsx                # Entry point
```

## Key Architectural Decisions

### 1. **Separation of Concerns**

- **API Layer** (`api/`): Raw HTTP calls only
- **Services Layer** (`services/`): Business logic, data transformation
- **Components** (`components/`): Presentational components
- **Pages** (`pages/`): Page-level components that compose features
- **Hooks** (`hooks/`): Reusable stateful logic

### 2. **State Management**

- **UserContext**: Manages authentication state
- **AppStateContext**: Manages global UI state (cart, wishlist, progress)
- **Custom Hooks**: Encapsulate state logic (useCart, useWishlist, useAppState)

### 3. **Component Communication**

- **Props**: Parent to child data flow
- **Context API**: Shared state across components
- **No prop drilling through routes**: Using HOC (Higher-Order Component) pattern

### 4. **Routing Architecture**

- **Layout-based routing**: Routes organized by layout (Main vs Auth)
- **Protected routes**: Auth guard wrapper
- **Clean route config**: Centralized route constants

### 5. **Data Flow**

```
Components → Hooks → Services → API → Backend
                ↓
           Context (for shared state)
                ↓
           Components (via props/HOC)
```

## Major Files Explained

### `App.tsx`
**Purpose**: Root component - minimal and clean
- Wraps app with providers (User, AppState)
- Renders router only
- No business logic

### `layouts/MainLayout.tsx`
**Purpose**: Primary layout wrapper
- Includes Header and Footer
- Uses `<Outlet />` for nested routes
- Applied to all public pages

### `layouts/AuthLayout.tsx`
**Purpose**: Authentication pages layout
- No header/footer
- Centered content
- Applied to login/register pages

### `context/AppStateContext.tsx`
**Purpose**: Global state management
- Combines cart, wishlist, and app state
- Provides unified context for entire app
- Eliminates prop drilling

### `hooks/useCart.ts`, `useWishlist.ts`, `useAppState.ts`
**Purpose**: Encapsulated state logic
- Local state management
- API integration
- localStorage persistence
- Reusable across components

### `components/PageWrapper.tsx`
**Purpose**: Higher-Order Component for pages
- Injects common props into all pages
- Eliminates repetitive prop passing
- Centralizes prop definitions

### `routes/AppRoutes.tsx`
**Purpose**: Route definitions
- Maps routes to layouts
- Wraps pages with HOC
- Organizes routes by layout type

### `services/*Service.ts`
**Purpose**: Business logic layer
- API calls abstraction
- Data transformation
- Error handling
- Components never call APIs directly

## Best Practices Implemented

### ✅ **Clean Architecture**
- Separation of concerns
- Single responsibility principle
- Dependency injection via context

### ✅ **React Best Practices**
- Functional components with hooks
- Custom hooks for reusable logic
- Context API for state management
- Composition over inheritance

### ✅ **Type Safety**
- TypeScript interfaces
- Type-safe API responses
- Proper type exports

### ✅ **Performance**
- useMemo for context values
- useCallback for event handlers
- Efficient re-renders

### ✅ **Maintainability**
- Clear folder structure
- Consistent naming conventions
- Centralized configuration
- DRY principle (Don't Repeat Yourself)

### ✅ **Scalability**
- Easy to add new pages
- Easy to add new features
- Modular architecture
- Clear extension points

## Migration Guide

### Before (Old Structure)
```tsx
// App.tsx - Had all state and logic
function App() {
  const [cart, setCart] = useState(...)
  const [wishlist, setWishlist] = useState(...)
  // ... 200 lines of state management
  
  return (
    <div>
      <Header cartCount={cart.length} wishlistCount={wishlist.length} />
      <Routes>
        <Route path="/" element={<Home cart={cart} ... />} />
        {/* Props passed through routes */}
      </Routes>
    </div>
  )
}
```

### After (New Structure)
```tsx
// App.tsx - Clean and minimal
function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppStateProvider>
          <AppRoutes />
        </AppStateProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

// Pages receive props via HOC
const HomePage = withPageData(Home)
// No prop passing through routes!
```

## Usage Examples

### Using Context in Components
```tsx
import { useAppStateContext } from '../context/AppStateContext';

export const Header = () => {
  const { cartCount, wishlistCount } = useAppStateContext();
  // Use the values directly
};
```

### Creating a New Page
```tsx
// 1. Create page component in pages/
export const NewPage = ({ cart, onToggleCart }) => {
  // Page logic
};

// 2. Wrap with HOC in AppRoutes.tsx
const NewPageWrapper = withPageData(NewPage);

// 3. Add route
{
  path: '/new-page',
  element: <NewPageWrapper />,
}
```

### Using Custom Hooks
```tsx
import { useCart } from '../hooks/useCart';

export const CartComponent = () => {
  const { cart, addToCart, removeFromCart, cartCount } = useCart();
  // Hook provides everything you need
};
```

## Benefits of This Architecture

1. **Maintainability**: Easy to find and update code
2. **Testability**: Isolated components and hooks
3. **Reusability**: Shared hooks and components
4. **Scalability**: Easy to add features
5. **Readability**: Clear structure and organization
6. **Type Safety**: Full TypeScript support
7. **Performance**: Optimized re-renders
8. **Developer Experience**: Easy onboarding for new devs

## Next Steps

- [ ] Add unit tests for hooks and services
- [ ] Add error boundaries
- [ ] Implement lazy loading for routes
- [ ] Add loading skeletons
- [ ] Implement proper error handling
- [ ] Add analytics tracking
- [ ] Set up E2E tests