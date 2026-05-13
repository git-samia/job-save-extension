const companyInput = document.getElementById("company");
const titleInput = document.getElementById("title");
const termInput = document.getElementById("term");
const preview = document.getElementById("filename-preview");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");

function sanitizeFilename(str) {
  return str
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildFilename() {
  const company = sanitizeFilename(companyInput.value);
  const title = sanitizeFilename(titleInput.value);
  const term = sanitizeFilename(termInput.value);

  if (!company && !title && !term) return "";

  const parts = [company, title, term].filter(Boolean);
  return parts.join(" - ");
}

function updatePreview() {
  const name = buildFilename();
  preview.textContent = name ? `${name}.pdf` : "—";
}

companyInput.addEventListener("input", updatePreview);
titleInput.addEventListener("input", updatePreview);
termInput.addEventListener("input", updatePreview);

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "parseJobInfo" });
    if (response && response.success) {
      const info = response.data;

      const stored = await chrome.storage.local.get("companyMap");
      const companyMap = stored.companyMap || {};

      if (info.companyKey && companyMap[info.companyKey]) {
        companyInput.value = companyMap[info.companyKey];
      } else if (info.company) {
        companyInput.value = info.company;
      }

      if (info.title) titleInput.value = info.title;
      if (info.term) termInput.value = info.term;

      updatePreview();
    }
  } catch (e) {
    // Content script not available on this page — user fills manually
  }
});

saveBtn.addEventListener("click", async () => {
  const filename = buildFilename();
  if (!filename) {
    showStatus("Please fill in at least one field.", "error");
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";
  hideStatus();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Remember the company mapping for this host
  try {
    const url = new URL(tab.url);
    const host = url.hostname;
    const tenantMatch = host.match(/^([^.]+)\.wd\d+\.myworkdayjobs\.com$/);
    if (tenantMatch && companyInput.value.trim()) {
      const key = tenantMatch[1];
      const stored = await chrome.storage.local.get("companyMap");
      const companyMap = stored.companyMap || {};
      companyMap[key] = companyInput.value.trim();
      await chrome.storage.local.set({ companyMap });
    }
  } catch (_) {}

  chrome.runtime.sendMessage(
    { action: "generatePDF", tabId: tab.id, filename },
    (response) => {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save as PDF";

      if (response && response.success) {
        showStatus("Saved successfully!", "success");
      } else {
        const errMsg = response?.error || "Unknown error";
        showStatus(`Failed: ${errMsg}`, "error");
      }
    }
  );
});

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function hideStatus() {
  statusEl.className = "status hidden";
}
