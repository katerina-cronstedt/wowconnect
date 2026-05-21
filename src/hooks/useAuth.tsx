import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: "hq_admin" | "hq_team" | "city_team" | "staff" | "volunteer" | "member" | null;
  personId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"hq_admin" | "hq_team" | "city_team" | "staff" | "volunteer" | "member" | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);

  const fetchRole = async (userId: string, emailAddress?: string) => {
    try {
      // 1. Fetch user role from user_roles
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      
      if (roleData?.role) {
        setRole(roleData.role as any);
        setPersonId(null);
        return;
      }

      // 2. Query people table to see if user is a member
      // First, try matching by auth_user_id
      let { data: personData } = await supabase
        .from("people")
        .select("id")
        .eq("auth_user_id", userId)
        .limit(1)
        .maybeSingle();

      // If not linked yet, try matching by email
      if (!personData && emailAddress) {
        const { data: personByEmail } = await supabase
          .from("people")
          .select("id")
          .eq("email", emailAddress.toLowerCase())
          .limit(1)
          .maybeSingle();
        personData = personByEmail;

        // If found by email, proactively update the auth_user_id (trigger should handle this, but it adds robustness)
        if (personByEmail) {
          await supabase
            .from("people")
            .update({ auth_user_id: userId })
            .eq("id", personByEmail.id);
        }
      }

      if (personData) {
        setRole("member");
        setPersonId(personData.id);
      } else {
        setRole(null);
        setPersonId(null);
      }
    } catch (e) {
      console.error("Error fetching user role / person record:", e);
      setRole(null);
      setPersonId(null);
    }
  };

  useEffect(() => {
    // Handle auth errors in URL hash (e.g. expired magic links)
    const hash = window.location.hash;
    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const errorDesc = params.get("error_description") || params.get("error");
      if (errorDesc) {
        // Clean the hash and redirect to login with error
        window.history.replaceState(null, "", window.location.pathname);
        const msg = errorDesc.includes("expired")
          ? "Länken har gått ut eller redan använts. Begär en ny."
          : errorDesc;
        // Store error to show on login page
        sessionStorage.setItem("auth_error", msg);
        if (!window.location.pathname.startsWith("/admin/login")) {
          window.location.href = "/admin/login";
          return;
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchRole(session.user.id, session.user.email);
        } else {
          setRole(null);
          setPersonId(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setLoading(true);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchRole(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setPersonId(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, personId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
