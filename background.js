const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.commands.onCommand.addListener(async (command) => {
  const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url || !tab.url.includes('translations.telegram.org')) {
    return;
  }

  try {
    await browserAPI.tabs.sendMessage(tab.id, { action: 'command', command });
  } catch (error) {
    console.error('Error sending command to content script:', error);
  }
});

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSearch') {
    browserAPI.tabs.create({ url: message.url });
    sendResponse({ success: true });
  }
  return true;
});
