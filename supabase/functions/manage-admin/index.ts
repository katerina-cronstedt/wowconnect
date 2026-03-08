import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, target_user_id, new_role, email } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authentication required" }, 403);

    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json({ error: "Invalid auth token" }, 401);

    // Get caller roles
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const callerRoleList = (callerRoles || []).map((r: any) => r.role);
    const isHqAdmin = callerRoleList.includes("hq_admin");
    const isHqTeam = callerRoleList.includes("hq_team");

    if (!isHqAdmin && !isHqTeam) {
      return json({ error: "Insufficient permissions" }, 403);
    }

    // Cannot modify yourself
    if (target_user_id === caller.id && action !== "reset_password") {
      return json({ error: "Du kan inte ändra din egen roll eller ta bort dig själv" }, 403);
    }

    // Get target user's current role
    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", target_user_id);
    const targetRoleList = (targetRoles || []).map((r: any) => r.role);
    const targetIsHqAdmin = targetRoleList.includes("hq_admin");

    // hq_team cannot modify hq_admin or hq_team users
    if (!isHqAdmin && (targetIsHqAdmin || targetRoleList.includes("hq_team"))) {
      return json({ error: "Du har inte behörighet att ändra denna användare" }, 403);
    }

    switch (action) {
      case "change_role": {
        const validRoles = ["hq_admin", "hq_team", "city_team"];
        if (!validRoles.includes(new_role)) {
          return json({ error: "Ogiltig roll" }, 400);
        }
        // Only hq_admin can assign hq_admin or hq_team
        if ((new_role === "hq_admin" || new_role === "hq_team") && !isHqAdmin) {
          return json({ error: "Bara HQ Admin kan tilldela denna roll" }, 403);
        }

        // Update: delete old roles and insert new
        await supabaseAdmin.from("user_roles").delete().eq("user_id", target_user_id);
        const { error } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: target_user_id, role: new_role });
        if (error) return json({ error: error.message }, 500);

        return json({ success: true, message: `Roll ändrad till ${new_role}` });
      }

      case "reset_password": {
        // Get target email
        const targetEmail = email;
        if (!targetEmail) return json({ error: "E-post saknas" }, 400);

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: targetEmail,
        });

        if (linkError) return json({ error: linkError.message }, 500);

        return json({
          success: true,
          message: "Återställningslänk genererad",
          recovery_link: linkData?.properties?.action_link || null,
        });
      }

      case "generate_invite_link": {
        const targetEmail = email;
        if (!targetEmail) return json({ error: "E-post saknas" }, 400);

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: targetEmail,
        });

        if (linkError) return json({ error: linkError.message }, 500);

        return json({
          success: true,
          invite_link: linkData?.properties?.action_link || null,
        });
      }

      case "delete_user": {
        if (!isHqAdmin) {
          return json({ error: "Bara HQ Admin kan ta bort användare" }, 403);
        }

        // Delete role first, then auth user
        await supabaseAdmin.from("user_roles").delete().eq("user_id", target_user_id);
        await supabaseAdmin.from("profiles").delete().eq("user_id", target_user_id);
        await supabaseAdmin.from("staff_cities").delete().eq("user_id", target_user_id);

        const { error } = await supabaseAdmin.auth.admin.deleteUser(target_user_id);
        if (error) return json({ error: error.message }, 500);

        return json({ success: true, message: "Användare borttagen" });
      }

      default:
        return json({ error: `Okänd action: ${action}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
