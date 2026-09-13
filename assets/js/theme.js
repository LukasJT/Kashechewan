/* Apply the saved appearance before styles render, including the River redesign. */
(() => {
  const modes = ['light', 'dark', 'river'];
  const systemTheme = () => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  try {
    const saved = localStorage.getItem('kashechewan-theme');
    document.documentElement.dataset.theme = modes.includes(saved) ? saved : systemTheme();
  } catch {
    document.documentElement.dataset.theme = systemTheme();
  }
})();
