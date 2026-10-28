/*
 * Showroom Biur - ustawienia formularzy. To jedyne miejsce, które trzeba uzupełnić.
 *
 * tallyFormId    - ID formularza z Tally. Link do formularza wygląda tak: https://tally.so/r/wAbC12
 *                  → wpisz 'wAbC12'. Puste = działa formularz zapasowy (otwiera e-mail do redakcji).
 * beehiivEmbedId - ID formularza zapisu z Beehiiv (Grow → Subscribe Forms → Get embed code).
 *                  W kodzie jest adres https://embeds.beehiiv.com/xxxxxxxx-xxxx-... → wpisz samo xxxxxxxx-xxxx-...
 *                  Puste = zapis trafia mailem do redakcji.
 */
window.SB_CONFIG = {
  tallyFormId: '',
  beehiivEmbedId: '',
  redakcjaEmail: 'redakcja@showroombiur.pl'
};

/* Głosowanie „Podoba mi się” (Supabase, region UE). url i klucz publiczny „anon” z Project Settings → API.
   Puste = przyciski się nie pokazują. Klucz anon jest publiczny z założenia, dostęp ogranicza RLS w bazie. */
window.SB_LIKES = {
  url: 'https://plomfudejyisiqucavqg.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsb21mdWRlanlpc2lxdWNhdnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNjQ4OTUsImV4cCI6MjEwODc0MDg5NX0.2LOaPFSsbYELSTpCtlRyzl2iQlwMSoOsQLkpheShCJw'
};
