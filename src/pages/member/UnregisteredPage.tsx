import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, UserPlus, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import wowLogo from "@/assets/wow-logo.png";

export default function UnregisteredPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={wowLogo} alt="WOW Foundation" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-serif font-bold">Välkommen till WOW</CardTitle>
          <CardDescription>Ditt konto har skapats framgångsrikt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm space-y-2">
            <p className="font-semibold">Medlemskap hittades inte</p>
            <p className="leading-relaxed">
              Du är inloggad som <strong className="break-all">{user?.email}</strong>, men denna e-postadress är inte kopplad till en aktiv medlem i vårt CRM.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 items-start text-sm">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Ansök om medlemskap</h4>
                <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">
                  Fyll i anmälningsformuläret för att ansöka om medlemskap och få tillgång till medlemsportalen.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start text-sm">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Redan medlem?</h4>
                <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">
                  Om du redan är medlem, se till att du loggar in med exakt samma e-postadress som du använde när du gick med i WOW.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="w-full h-11 text-base cursor-pointer">
              <Link to="/join">Gå till ansökan</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="w-full h-11 text-base cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logga ut
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
