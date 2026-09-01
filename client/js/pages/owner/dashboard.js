document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.requireAuth(['OWNER']);
  if (!user) return;

  document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
});