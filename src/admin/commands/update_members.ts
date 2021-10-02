export const updateMembers = async () => {
  const res = await fetch(`/api/admin/commands/update_members`, {
    method: "POST",
  });

  if (res.ok) {
    return "ok";
  } else {
    return await res.text();
  }
};
