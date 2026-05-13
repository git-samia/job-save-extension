const DEFAULT_FOLDER = "job desc";

chrome.commands.onCommand.addListener((command) => {
  if (command === "save-posting") {
    chrome.action.openPopup();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generatePDF") {
    handlePDFGeneration(message.tabId, message.filename)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === "getPageInfo") {
    chrome.tabs.sendMessage(message.tabId, { action: "parseJobInfo" }, (response) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse(response);
      }
    });
    return true;
  }
});

async function handlePDFGeneration(tabId, filename) {
  const debugTarget = { tabId };

  try {
    await chrome.debugger.attach(debugTarget, "1.3");

    const result = await chrome.debugger.sendCommand(debugTarget, "Page.printToPDF", {
      landscape: false,
      displayHeaderFooter: false,
      printBackground: true,
      preferCSSPageSize: true,
      marginTop: 0.4,
      marginBottom: 0.4,
      marginLeft: 0.4,
      marginRight: 0.4
    });

    await chrome.debugger.detach(debugTarget);

    const url = `data:application/pdf;base64,${result.data}`;

    const stored = await chrome.storage.local.get("downloadFolder");
    const folder = stored.downloadFolder || DEFAULT_FOLDER;

    const downloadId = await chrome.downloads.download({
      url: url,
      filename: `${folder}/${filename}.pdf`,
      saveAs: false,
      conflictAction: "uniquify"
    });

    return { success: true, downloadId };
  } catch (err) {
    try {
      await chrome.debugger.detach(debugTarget);
    } catch (_) {}
    throw err;
  }
}
