// Global UI providers used across all pages.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// 404 fallback page shown for unrecognised routes.
import NotFound from "@/pages/NotFound";
// Wouter's lightweight client-side router utilities.
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
// Theme context that applies dark/light CSS class to <html>.
import { ThemeProvider } from "./contexts/ThemeContext";
// Page-level components mapped to routes.
import Home from "./pages/Home";
import Search from "./pages/Search";
import JobDetail from "./pages/JobDetail";
import Dashboard from "./pages/Dashboard";
import ProfileEdit from "./pages/ProfileEdit";
import CVUpload from "./pages/CVUpload";
import Swipe from "./pages/Swipe";
import Login from "./pages/Login";
// Floating AI chat assistant rendered on every page.
import ChatBot from "./components/ChatBot";

// Router declares all client-side URL patterns and their corresponding page components.
// Wouter's <Switch> renders only the first matching <Route>.
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      {/* Login and authentication page */}
      <Route path={"/login"} component={Login} />
      {/* Landing / home page */}
      <Route path={"/"} component={Home} />
      {/* Job search results page */}
      <Route path={"/search"} component={Search} />
      {/* Individual job offer detail page, ':id' is the numeric job ID */}
      <Route path={"/job/:id"} component={JobDetail} />
      {/* Authenticated candidate dashboard */}
      <Route path={"/dashboard"} component={Dashboard} />
      {/* Profile editing form for the logged-in candidate */}
      <Route path={"/profile/edit"} component={ProfileEdit} />
      {/* CV upload and AI analysis page */}
      <Route path={"/cv/upload"} component={CVUpload} />
      {/* Tinder-style job swipe interface */}
      <Route path={"/swipe"} component={Swipe} />
      {/* Explicit 404 route */}
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route – catches any path not matched above */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

// Root application component.
// Wraps the entire app in:
//   1. ErrorBoundary  – catches uncaught render errors and shows a fallback UI.
//   2. ThemeProvider  – applies the dark theme class to <html> globally.
//   3. TooltipProvider – enables Radix tooltip components anywhere in the tree.
//   4. Toaster        – renders toast notifications styled to match the dark palette.
//   5. Router         – handles page routing.
//   6. ChatBot        – persistent AI assistant overlay rendered above all pages.
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable={false}  // Theme is fixed to light for Minimalist Emerald
      >
        <TooltipProvider>
          {/* Custom-styled toast notifications matching the Minimalist Emerald design system */}
          <Toaster
            theme="light"
            toastOptions={{
              style: {
                background: "#fafafa",
                border: "1px solid rgba(5,150,105,0.20)",
                color: "#1c1917",
              },
            }}
          />
          {/* Page routing */}
          <Router />
          {/* Global floating AI chat assistant */}
          <ChatBot />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
