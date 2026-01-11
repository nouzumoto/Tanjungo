const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('darkThemeToggle');
  const status = document.getElementById('toggleStatus');

  const result = await browserAPI.storage.sync.get(['darkTheme']);
  const isDark = result.darkTheme === true;
  
  toggle.checked = isDark;
  updateStatus(isDark);

  toggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    try {
      await browserAPI.storage.sync.set({ darkTheme: enabled });
      updateStatus(enabled);
      
      const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('translations.telegram.org')) {
        try {
          await browserAPI.tabs.sendMessage(tab.id, { action: 'toggleDarkTheme', enabled });
        } catch (err) {
          console.error('Error sending message to tab:', err);
        }
      }
    } catch (error) {
      console.error('Error saving dark theme preference:', error);
    }
  });

  function updateStatus(enabled) {
    if (enabled) {
      status.textContent = 'ON';
      status.classList.add('active');
    } else {
      status.textContent = 'OFF';
      status.classList.remove('active');
    }
  }
});
