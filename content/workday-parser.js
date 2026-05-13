(() => {
  const TERM_PATTERNS = [
    /\b(fall|winter|spring|summer)\s+(\d{4})\b/i,
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})\b/i
  ];

  const SEASON_FROM_MONTH = {
    jan: "Winter", feb: "Winter", mar: "Winter", apr: "Winter",
    may: "Spring", jun: "Summer", jul: "Summer", aug: "Summer",
    sep: "Fall", oct: "Fall", nov: "Fall", dec: "Winter"
  };

  function extractTenantSlug() {
    const host = window.location.hostname;
    const match = host.match(/^([^.]+)\.wd\d+\.myworkdayjobs\.com$/);
    return match ? match[1] : null;
  }

  function prettifySlug(slug) {
    if (!slug) return "";
    return slug
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }

  function extractJobTitle() {
    const el =
      document.querySelector('[data-automation-id="jobPostingHeader"]') ||
      document.querySelector("h2[data-automation-id]") ||
      document.querySelector(".css-1q2dra3") ||
      document.querySelector("h1") ||
      document.querySelector("h2");

    if (el) {
      let title = el.textContent.trim();
      title = title.replace(/\s*[-–—]\s*\d+\s*Month.*$/i, "");
      title = title.replace(/\s*\(.*?(co-?op|intern|coop).*?\)\s*/gi, "");
      return title.trim();
    }

    const pageTitle = document.title;
    const cleaned = pageTitle.replace(/\s*[-|].*$/, "").trim();
    return cleaned || "";
  }

  function extractWorkTerm() {
    const sources = [
      document.title,
      document.querySelector('[data-automation-id="jobPostingHeader"]')?.textContent || "",
      window.location.pathname,
      window.location.href
    ].join(" ");

    for (const pattern of TERM_PATTERNS) {
      const match = sources.match(pattern);
      if (match) {
        const raw = match[1].toLowerCase();
        if (["fall", "winter", "spring", "summer"].includes(raw)) {
          return `${raw.charAt(0).toUpperCase() + raw.slice(1)} ${match[2]}`;
        }
        const season = SEASON_FROM_MONTH[raw.substring(0, 3)];
        if (season) {
          return `${season} ${match[2]}`;
        }
      }
    }
    return "";
  }

  function parseJobInfo() {
    const tenantSlug = extractTenantSlug();
    const company = prettifySlug(tenantSlug);
    const title = extractJobTitle();
    const term = extractWorkTerm();

    return {
      success: true,
      data: {
        company,
        companyKey: tenantSlug,
        title,
        term
      }
    };
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "parseJobInfo") {
      sendResponse(parseJobInfo());
    }
  });
})();
