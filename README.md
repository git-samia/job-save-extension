# Job Description Saver: Chrome Extension

Save job postings as PDF with one click. Designed for Workday career pages but works on any site.

## Installation (Developer Mode)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select this folder: `Desktop\projects\job-save-extension`
5. The extension icon (blue "JD") appears in your toolbar

## Usage

1. Navigate to a job posting (e.g. a Workday page)
2. Click the extension icon (or press `Ctrl+Shift+S`)
3. The popup auto-fills **Company**, **Job Title**, and **Work Term** if it can detect them
4. Edit any field if needed: corrections are remembered per employer
5. Click **Save as PDF**
6. The PDF is saved to `<Chrome downloads folder>\job desc\Company - Title - Term.pdf`

## Where files go

By default, PDFs save into a `job desc` subfolder inside your Chrome download directory.  
To save directly to Desktop, change Chrome's download location:  
**Settings → Downloads → Location → set to Desktop**

## Keyboard shortcut

`Ctrl+Shift+S` opens the popup (configurable in `chrome://extensions/shortcuts`).

## Permissions explained

| Permission | Why |
|---|---|
| `activeTab` | Read the current tab's URL/title when you click the icon |
| `debugger` | Generate PDF using Chrome's print engine (attach/detach only during save) |
| `downloads` | Save the generated PDF file |
| `storage` | Remember your company name corrections |

## Supported sites

- **Workday** (`*.myworkdayjobs.com`) — auto-parses company, title, and work term
- **Any other site** — fields default to empty; you fill them manually
