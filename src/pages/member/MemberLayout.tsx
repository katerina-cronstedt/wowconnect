import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import wowLogo from "@/assets/wow-logo.png";

export default function MemberLayout() {
  const { user, loading, role, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Redirect admin/staff users to their dashboard if they accidentally visit /member
  if (role && role !== "member" && role !== "volunteer") {
    return <Navigate to="/admin" replace />;
  }

  // If user is a volunteer, they can view events at /admin/events but let's allow them here too
  if (role === "volunteer" && location.pathname.startsWith("/member")) {
    // Keep them here if they specifically navigated here
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6">
          <Link to="/member/dashboard" className="flex items-center gap-3">
            <img src={wowLogo} alt="WOW" className="h-10 w-auto" />
            <div className="leading-none">
              <span className="font-serif font-bold text-lg tracking-wide text-foreground block">
                WOW Connect
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Medlemsportal
              </span>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/member/dashboard" 
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/member/dashboard" ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Min Profil</span>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive flex items-center gap-1.5 cursor-pointer h-9 px-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Logga ut</span>
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
