export async function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
        windowType: 'normal'
      },
      (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (tabs && tabs.length > 0) {
          resolve(tabs[0]);
        } else {
          resolve(undefined);
        }
      }
    );
  });
}
