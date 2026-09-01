document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.requireAuth(['CUSTOMER']);
  if (!user) return;

  document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
});