console.log("statistics module loaded");

async function incrementSiteCounter(counter) {
  const { error } = await supabaseClient.rpc(
    "increment_site_counter",
    { counter_name: counter }
  );

  if (error) {
    console.error("Teller verhogen mislukt:", counter, error);
  }
}

async function countVisitor() {
  if (sessionStorage.getItem("freeapps_visit_counted")) {
    return;
  }

  const { data: { user } } =
    await supabaseClient.auth.getUser();

  if (user) {
    const { data: member, error } = await supabaseClient
      .from("members")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && member?.role === "admin") {
      return;
    }
  }

 const { error } = await supabaseClient.rpc(
  "increment_visit_counters"
);

if (error) {
  console.error("Bezoek tellen mislukt:", error);
  return;
}

  sessionStorage.setItem(
    "freeapps_visit_counted",
    "1"
  );
}

countVisitor();