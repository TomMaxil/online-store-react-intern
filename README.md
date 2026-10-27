# Aurora Store: High-End Liquid Glass E-Commerce Front End

A futuristic, dark-mode tech e-commerce store built with React and Vite. The application features a custom "Liquid Glass" design system, high-end 3D visual showcases, a responsive Bento Grid layout, real HD product imagery, a global cart engine, and a simulated checkout flow.

- **Live Demo:** [https://online-store-intern.vercel.app/]
- **GitHub Repository:** [https://github.com/TomMaxil/online-store-react-intern]
- **Author:** Muhammad Bilal
- **Program:** Web Development Internship at Taviq AI Solutions

---

## 1. Project Overview & Objective

Aurora Store is a single-page e-commerce front end built to demonstrate how interactive, production-grade web applications can be constructed using modern frontend paradigms without reliance on heavy UI frameworks.

### Core Objectives:
1. **Complete Shopping Journey:** Seamless flow from catalog browsing and product details to local storage cart persistence and validated checkout.
2. **UI/UX Excellence:** Implementing high-end design trends including Glassmorphism, interactive mouse-tracking 3D tilt showcases, dynamic blueprint scan reveals, and Bento Grid product layouts.
3. **Performance & Security:** Optimizing render cycles and layout performance for 60 FPS scrolling on glass surfaces, alongside proper source protection configurations.

---

## 2. Key Features & Upgraded Visual Components

### 🌟 Advanced UI/UX & Showcase Upgrades
- **Interactive AR Visor Hero Showcase:**
  - 3D perspective tilt effect driven by pointer dynamics and vector math (`rotateX` / `rotateY` limits).
  - Multi-layered blueprint-to-solid scan reveal line animation (`VisorSketch` & `VisorSolid` SVG overlays).
  - Floating status chips and live specs summary with smooth CSS keyframes.
- **Bento Grid Product Display:**
  - Dynamic asymmetric grid arrangement (`BentoGrid`) showcasing gadgets, wearables, and holographic hardware based on categories and popularity.
  - High-resolution real product photography integration via fast Unsplash CDN links.
- **Glassmorphism Wave Footer:**
  - 3-column structured desktop layout transitioning into a stacked touch-friendly mobile layout.
  - Ambient glowing mesh backdrop with embedded Newsletter subscription and contact metadata.
- **Liquid Neon Cursor Trail (`FluidCursor`):**
  - High-performance HTML5 Canvas ribbon trail responding dynamically to pointer coordinates and velocity.

### 🛒 Core Store & Cart Functionality
- **Global State Management:** Context API (`CartContext`) powering persistent item counts, live subtotal calculations, and item merging.
- **Client-Side Routing:** Dynamic multi-page feel powered by `react-router-dom` (`/`, `/product/:id`, `/checkout`).
- **Interactive Filtering & Search:** Category tab selection coupled with real-time text query filtering across catalog titles and descriptions.
- **Simulated Checkout & Validation:** Masked card inputs, multi-field validation, sticky order recap, and animated order confirmation screen.

---

## 3. Tech Stack Used

| Area | Technology |
| --- | --- |
| **Framework & Build** | React 18, Vite |
| **Routing & State** | React Router v6, React Context API (`useContext`, `useReducer`, `useMemo`) |
| **Styling & Design** | Modern CSS3 (CSS Variables, Flexbox, CSS Grid, `backdrop-filter`, Glassmorphism, keyframes) |
| **Graphics & Animation** | Inline SVG Vector Manipulation, HTML5 Canvas 2D Render Loop |
| **Assets & CDN** | Unsplash HD Imagery CDN |
| **Deployment** | Vercel |

---

## 4. Technical Challenges & Solutions

### 1. Compositing Lag on Stacked Glassmorphism Layers
**Challenge:** Heavy usage of `backdrop-filter: blur()` over animated gradient meshes caused frame drops during scroll.
**Solution:** Isolated background meshes inside a fixed `.backdrop` layer (`contain: strict`). Promoted interactive cards and grid containers to GPU hardware layers using `transform: translate3d(0,0,0)` and `will-change`.

### 2. Preserving SVG Blueprint Scan Animations
**Challenge:** Replacing vector art with standard raster images broke the custom SVG mask and blueprint scan line transition.
**Solution:** Preserved the dual-layer vector approach (`VisorSketch` + `VisorSolid`) for the interactive hero showcase while leveraging optimized HD product images for the Bento Grid catalog.

### 3. SPA Routing Refresh Bottlenecks (404 Prevention)
**Challenge:** Direct URL navigation on Vercel deployment led to server-side 404s.
**Solution:** Configured `vercel.json` rewrites to redirect all sub-routes (`/product/*`, `/checkout`) to `index.html`.

---

## 5. Local Setup Instructions

```bash
# 1. Clone repository
git clone [https://github.com/your-username/your-repo.git](https://github.com/your-username/your-repo.git)

# 2. Navigate to project folder
cd your-repo

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
