

## Plan: Förbättrad användarhantering

Baserat på dina screenshots (HubSpot-liknande) och nuvarande kod, här är planen:

### 1. Ny Edge Function: `manage-admin`
Skapa en ny edge function som hanterar:
- **Ändra roll** på befintlig användare (update `user_roles`)
- **Skicka lösenordsåterställning** till en användare (`auth.admin.generateLink` type `recovery`)
- **Inaktivera/ta bort användare** (`auth.admin.deleteUser` + ta bort `user_roles` rad) — bara HQ Admin

Samma rollhierarki-kontroller som `create-admin`.

### 2. Förbättrad SettingsPage UI
Uppgradera användartabellen med:
- **Avatarinitial** (första bokstaven i namn, färgad cirkel)
- **Actions dropdown per rad** (DropdownMenu) med:
  - "Ändra roll" → öppnar dialog med rollväljare
  - "Skicka lösenordsåterställning" → anropar edge function
  - "Kopiera inbjudningslänk" → genererar ny magic link
  - "Ta bort användare" → bekräftelsedialog, bara för HQ Admin
- **Sökfält** ovanför tabellen för att filtrera namn/email
- **Invite-status-indikator** (baserat på om profil har display_name satt)
- Flytta "Bjud in ny användare" till en **knapp i headern** som öppnar en dialog istället för separat kort

### 3. RLS-uppdatering
- Uppdatera `user_roles` SELECT-policy så att `hq_team` också kan se alla roller (behövs för att visa listan):
  ```sql
  USING (is_hq_level() OR user_id = auth.uid())
  ```

### 4. Databasändring
- Ingen ny tabell behövs — allt hanteras via `user_roles`, `profiles`, och edge functions

### Filer som ändras
- `src/pages/admin/SettingsPage.tsx` — total omskrivning av användarhanteringsdelen
- `supabase/functions/manage-admin/index.ts` — ny edge function
- Migration för RLS-policy-uppdatering

