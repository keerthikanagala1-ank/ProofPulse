/* =========================================================
   PROOFPULSE — script.js
   All interactions are self-contained. No network requests.
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     DEMO SCENARIO DATA
  --------------------------------------------------------- */
  const scenarios = [
    {
      name: "College Fee Receipt",
      score: 72,
      status: "Verification Recommended",
      text: 92,
      visual: 76,
      structural: 81,
      claim: 68,
      claimText: "This screenshot proves that ₹8,500 was successfully paid.",
      evidenceText: "The uploaded image displays ₹8,500 and a transaction reference.",
      limitationText: "The screenshot alone cannot independently confirm that the transaction settled successfully.",
      verificationText: "Verify the transaction through the official payment provider or institution portal.",
      signals: [
        { type: "positive", title: "Clear readable text", detail: "Text throughout the document is legible and well-formed." },
        { type: "positive", title: "Amount detected", detail: "A currency amount is clearly present in the document." },
        { type: "positive", title: "Transaction reference detected", detail: "A reference number is visible alongside the payment details." },
        { type: "warning", title: "Metadata unavailable", detail: "No embedded file metadata is available for cross-checking." },
        { type: "warning", title: "Independent verification required", detail: "Settlement status cannot be confirmed from the image alone." }
      ]
    },
    {
      name: "Internship Certificate",
      score: 61,
      status: "Further Verification Needed",
      text: 79,
      visual: 64,
      structural: 72,
      claim: 55,
      claimText: "This certificate confirms that the student completed an internship.",
      evidenceText: "The document contains a student name, organization name, dates, and certificate language.",
      limitationText: "The document itself does not independently confirm that the issuing organization actually issued or recorded the internship.",
      verificationText: "Confirm the certificate with the issuing organization's official contact or verification channel.",
      signals: [
        { type: "positive", title: "Clear readable text", detail: "Names, dates, and certificate language are legible." },
        { type: "positive", title: "Organization name detected", detail: "An issuing organization name is present on the document." },
        { type: "warning", title: "Issuer contact unverifiable", detail: "There is no way to confirm the issuer from the file alone." },
        { type: "warning", title: "Independent verification required", detail: "The issuing organization has not confirmed this record." }
      ]
    },
    {
      name: "Payment Screenshot",
      score: 48,
      status: "Independent Verification Required",
      text: 71,
      visual: 54,
      structural: 63,
      claim: 42,
      claimText: "This screenshot proves that the payment was completed.",
      evidenceText: "The image displays a payment amount and transaction-related information.",
      limitationText: "A screenshot is a representation of information, not independent confirmation of settlement.",
      verificationText: "Check the transaction directly through the relevant payment provider or official account.",
      signals: [
        { type: "positive", title: "Amount detected", detail: "A payment amount is visible in the screenshot." },
        { type: "warning", title: "Low structural consistency", detail: "Layout elements show more variation than typical for this app." },
        { type: "warning", title: "Metadata unavailable", detail: "No embedded file metadata is available for cross-checking." },
        { type: "warning", title: "Independent verification required", detail: "Settlement cannot be confirmed from a screenshot alone." }
      ]
    }
  ];

  let activeScenario = null;

  /* ---------------------------------------------------------
     ELEMENT REFERENCES
  --------------------------------------------------------- */
  const navBar = document.getElementById("navBar");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const navLinkEls = document.querySelectorAll('[data-nav]');

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const filePreview = document.getElementById("filePreview");
  const filePreviewMedia = document.getElementById("filePreviewMedia");
  const fileNameEl = document.getElementById("fileName");
  const fileMetaEl = document.getElementById("fileMeta");
  const removeFileBtn = document.getElementById("removeFileBtn");
  const uploadError = document.getElementById("uploadError");

  const demoBtn = document.getElementById("demoBtn");
  const scenarioPanel = document.getElementById("scenarioPanel");
  const scenarioItems = document.querySelectorAll(".scenario-item");

  const runAnalysisBtn = document.getElementById("runAnalysisBtn");
  const resetBtn = document.getElementById("resetBtn");

  const analysisProgress = document.getElementById("analysisProgress");
  const progressFill = document.getElementById("progressFill");
  const progressSteps = document.querySelectorAll(".progress-step");

  const reportSubtitle = document.getElementById("reportSubtitle");
  const reportBody = document.getElementById("reportBody");
  const gaugeFill = document.getElementById("gaugeFill");
  const gaugeNumber = document.getElementById("gaugeNumber");
  const trustStatus = document.getElementById("trustStatus");
  const metricText = document.getElementById("metricText");
  const metricVisual = document.getElementById("metricVisual");
  const metricStructural = document.getElementById("metricStructural");
  const metricClaim = document.getElementById("metricClaim");
  const signalsList = document.getElementById("signalsList");
  const limitationText = document.getElementById("limitationText");

  const claimEvidenceBody = document.getElementById("claimEvidenceBody");
  const ceFollowup = document.getElementById("ceFollowup");
  const processFlow = document.getElementById("processFlow");
  const cePlaceholder = document.getElementById("cePlaceholder");
  const claimTextEl = document.getElementById("claimText");
  const evidenceTextEl = document.getElementById("evidenceText");
  const ceLimitationText = document.getElementById("ceLimitationText");
  const ceVerificationText = document.getElementById("ceVerificationText");

  const toast = document.getElementById("toast");

  const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 68; // r=68

  /* ---------------------------------------------------------
     TOAST
  --------------------------------------------------------- */
  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---------------------------------------------------------
     NAVIGATION: sticky shadow, mobile menu, smooth scroll active state
  --------------------------------------------------------- */
  hamburgerBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
  });

  navLinkEls.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    });
  });

  const sectionIds = ["why", "analyzer", "report", "how-it-works", "responsible"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateActiveNav() {
    let currentId = null;
    const scrollPos = window.scrollY + 140;
    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) currentId = section.id;
    });
    document.querySelectorAll('[data-nav]').forEach((link) => {
      const href = link.getAttribute("href").replace("#", "");
      link.classList.toggle("active", href === currentId);
    });
  }
  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /* ---------------------------------------------------------
     SCROLL REVEAL
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------------------------------------------------------
     FILE UPLOAD: click, drag & drop, preview, validation
  --------------------------------------------------------- */
  const ACCEPTED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
  let uploadedFile = null;

  function bytesToSize(bytes) {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  }

  function clearUploadError() {
    uploadError.hidden = true;
    uploadError.textContent = "";
  }

  function showUploadError(message) {
    uploadError.hidden = false;
    uploadError.textContent = message;
  }

  function handleFile(file) {
    clearUploadError();
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      showUploadError("Please select PNG, JPG, JPEG, or PDF.");
      return;
    }

    uploadedFile = file;
    dropzone.hidden = true;
    filePreview.hidden = false;
    fileNameEl.textContent = file.name;
    const typeLabel = file.type === "application/pdf" ? "PDF document" : file.type.replace("image/", "").toUpperCase() + " image";
    fileMetaEl.textContent = `${typeLabel} · ${bytesToSize(file.size)}`;

    filePreviewMedia.innerHTML = "";
    if (file.type === "application/pdf") {
      filePreviewMedia.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" width="26" height="26" style="color:var(--lavender-deep)">
          <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
          <path d="M14 3v4h4" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
        </svg>`;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Preview of uploaded evidence";
        filePreviewMedia.appendChild(img);
      };
      reader.readAsDataURL(file);
    }

    // Uploading a real file counts as its own "scenario" for the demo pipeline.
    // Since this is a frontend prototype, the report content follows the
    // closest matching demo scenario, clearly labeled as prototype analysis.
    activeScenario = scenarios[0];
    scenarioItems.forEach((item) => item.classList.remove("active"));
    scenarioPanel.hidden = true;
    runAnalysisBtn.disabled = false;
    resetBtn.hidden = false;
    showToast("File added. Ready to run analysis.");
  }

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  });

  ["dragenter", "dragover"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("drag-over");
    });
  });
  ["dragleave", "drop"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("drag-over");
    });
  });
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  removeFileBtn.addEventListener("click", () => {
    uploadedFile = null;
    fileInput.value = "";
    filePreview.hidden = true;
    dropzone.hidden = false;
    clearUploadError();
    if (!activeScenario) {
      runAnalysisBtn.disabled = true;
      resetBtn.hidden = true;
    }
  });

  /* ---------------------------------------------------------
     DEMO MODE
  --------------------------------------------------------- */
  demoBtn.addEventListener("click", () => {
    scenarioPanel.hidden = !scenarioPanel.hidden;
    if (!scenarioPanel.hidden) {
      scenarioPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  scenarioItems.forEach((item) => {
    item.addEventListener("click", () => {
      const idx = Number(item.getAttribute("data-scenario"));
      activeScenario = scenarios[idx];
      scenarioItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      // Selecting a scenario clears any uploaded file state visually
      uploadedFile = null;
      fileInput.value = "";
      filePreview.hidden = true;
      dropzone.hidden = false;
      clearUploadError();

      runAnalysisBtn.disabled = false;
      resetBtn.hidden = false;
      showToast(`Loaded scenario: ${activeScenario.name}`);
    });
  });

  /* ---------------------------------------------------------
     ANALYSIS ANIMATION + REPORT RENDER
  --------------------------------------------------------- */
  let analysisRunning = false;

  runAnalysisBtn.addEventListener("click", () => {
    if (!activeScenario || analysisRunning) return;
    runEvidenceAnalysis(activeScenario);
  });

  function runEvidenceAnalysis(scenario) {
    analysisRunning = true;
    runAnalysisBtn.disabled = true;
    analysisProgress.hidden = false;
    progressFill.style.width = "0%";
    progressSteps.forEach((s) => s.classList.remove("active"));

    analysisProgress.scrollIntoView({ behavior: "smooth", block: "center" });

    const stepDurations = [750, 800, 750]; // ~2.3s total
    let elapsed = 0;
    let cumulative = 0;

    stepDurations.forEach((dur, i) => {
      cumulative += dur;
      setTimeout(() => {
        progressSteps.forEach((s, si) => s.classList.toggle("active", si === i));
        const pct = Math.round(((i + 1) / stepDurations.length) * 100);
        progressFill.style.width = pct + "%";
      }, elapsed);
      elapsed += dur;
    });

    setTimeout(() => {
      analysisProgress.hidden = true;
      renderReport(scenario);
      renderClaimVsEvidence(scenario);
      analysisRunning = false;
      runAnalysisBtn.disabled = false;
      showToast("Evidence report ready.");
      document.getElementById("report").scrollIntoView({ behavior: "smooth", block: "start" });
    }, cumulative + 150);
  }

  function animateNumber(el, target, duration = 900) {
    const start = 0;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function signalIconSvg(type) {
    if (type === "positive") {
      return `<svg class="signal-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.4"/><path d="m8 12.5 2.6 2.6L16 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    return `<svg class="signal-icon" viewBox="0 0 24 24" fill="none"><path d="M12 3 2 20h20L12 3Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 10v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="12" cy="17" r="0.9" fill="currentColor"/></svg>`;
  }

  function renderReport(scenario) {
    reportBody.hidden = false;
    reportSubtitle.textContent = `Prototype analysis for: ${scenario.name}. This is a demo report, not a forensic verdict.`;

    animateNumber(gaugeNumber, scenario.score);
    const offset = GAUGE_CIRCUMFERENCE - (scenario.score / 100) * GAUGE_CIRCUMFERENCE;
    requestAnimationFrame(() => {
      gaugeFill.style.strokeDasharray = String(GAUGE_CIRCUMFERENCE);
      gaugeFill.style.strokeDashoffset = String(offset);
    });
    trustStatus.textContent = scenario.status;

    animateNumber(metricText, scenario.text);
    animateNumber(metricVisual, scenario.visual);
    animateNumber(metricStructural, scenario.structural);
    animateNumber(metricClaim, scenario.claim);

    signalsList.innerHTML = "";
    scenario.signals.forEach((sig) => {
      const row = document.createElement("div");
      row.className = `signal-row ${sig.type}`;
      row.innerHTML = `
        ${signalIconSvg(sig.type)}
        <div class="signal-copy">
          <p class="signal-title">${sig.title}</p>
          <p class="signal-detail">${sig.detail}</p>
        </div>`;
      signalsList.appendChild(row);
    });

    limitationText.textContent = scenario.limitationText;
  }

  function renderClaimVsEvidence(scenario) {
    claimEvidenceBody.hidden = false;
    ceFollowup.hidden = false;
    processFlow.hidden = false;
    cePlaceholder.hidden = true;

    claimTextEl.textContent = scenario.claimText;
    evidenceTextEl.textContent = scenario.evidenceText;
    ceLimitationText.textContent = scenario.limitationText;
    ceVerificationText.textContent = scenario.verificationText;
  }

  /* ---------------------------------------------------------
     RESET
  --------------------------------------------------------- */
  resetBtn.addEventListener("click", () => {
    activeScenario = null;
    uploadedFile = null;
    fileInput.value = "";

    filePreview.hidden = true;
    dropzone.hidden = false;
    clearUploadError();
    scenarioPanel.hidden = true;
    scenarioItems.forEach((i) => i.classList.remove("active"));

    runAnalysisBtn.disabled = true;
    resetBtn.hidden = true;
    analysisProgress.hidden = true;

    reportBody.hidden = true;
    reportSubtitle.textContent = "Try a demo scenario or upload a file to generate a report.";

    claimEvidenceBody.hidden = true;
    ceFollowup.hidden = true;
    processFlow.hidden = true;
    cePlaceholder.hidden = false;

    showToast("Analyzer reset.");
  });
})();
