const navItems = document.querySelectorAll(".nav-item");
const panels = document.querySelectorAll(".panel");
const panelWrap = document.querySelector(".panel-wrap");
const scrollbarOverlay = document.querySelector(".scrollbar-overlay");
const scrollbarThumb = document.querySelector(".scrollbar-thumb");
const specListItems = document.querySelectorAll(".spec-list li");
let scrollbarHideTimeout;
let refreshScrollbar = () => {};
let syncScrollbarOverlay = () => {};

function initializeSpecAccordions() {
	const normalizeSpecKey = (value) => {
		return value
			.toLowerCase()
			.replace(/ä/g, "ae")
			.replace(/ö/g, "oe")
			.replace(/ü/g, "ue")
			.replace(/ß/g, "ss")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");
	};

	const detailCopy = {
		case: "Form factor, airflow and component space are the key focus points.",
		cpu: "Core count, clock speed and efficiency drive gaming and multitasking performance.",
		mainboard: "Socket compatibility, ports and upgrade options define the platform.",
		"graphic-card": "VRAM, power profile and cooling determine high resolution performance.",
		ram: "Capacity and speed help keep games and background tasks smooth.",
		"cpu-cooler": "Acoustics and thermal behavior keep boost clocks stable under load.",
		"case-cooler": "Front-to-back airflow helps prevent heat buildup during long sessions.",
		ssd: "Fast read and write rates noticeably reduce loading times.",
		"power-supply": "Efficiency and power headroom ensure stable operation.",
		keyboard:
			"60% gaming keyboard with True 8K polling and around 0.125 ms input speed. Hall-effect control supports Rapid Trigger and adjustable actuation with 0.1 mm precision. The Lekker Tikken switch offers 4 mm travel with a deeper, muted sound profile. Available with ABS or aluminium case, FR4 plate and durable PBT keycaps. Wootility adds deep tuning, Tachyon mode and up to four onboard profiles.",
		mouse: "Sensor precision, weight and grip shape your control.",
		controller: "Ergonomics, trigger feel and latency impact gameplay.",
		monitor: "Panel type, refresh rate and response time define visual clarity.",
		headset: "Positional audio, comfort and tonal balance matter in long sessions.",
		microphone: "Pickup pattern and clarity improve voice communication.",
		"stream-deck": "Macro keys and scene controls cut down repetitive actions."
	};

	specListItems.forEach((item, index) => {
		const specMeta = item.querySelector(".spec-meta");
		const specValue = item.querySelector("strong");

		if (!specMeta || !specValue) {
			return;
		}

		item.classList.add("spec-item");

		const row = document.createElement("div");
		row.className = "spec-row";

		const right = document.createElement("div");
		right.className = "spec-right";

		specValue.classList.add("spec-value");
		const productName = specValue.textContent.trim();
		right.append(specValue);

		const toggle = document.createElement("button");
		toggle.type = "button";
		toggle.className = "spec-toggle";
		toggle.setAttribute("aria-expanded", "false");

		const detailsId = `spec-details-${index + 1}`;
		toggle.setAttribute("aria-controls", detailsId);
		toggle.setAttribute("aria-label", "Zusatzinformationen anzeigen");
		toggle.innerHTML = '<i data-lucide="chevron-up" aria-hidden="true"></i>';

		right.append(toggle);
		row.append(specMeta, right);

		const titleText = specMeta.textContent.replace(/\s+/g, " ").trim();
		const titleKey = normalizeSpecKey(titleText);
		const details = document.createElement("div");
		details.className = "spec-details";
		details.id = detailsId;

		const detailsTitle = document.createElement("p");
		detailsTitle.className = "spec-details-title";
		detailsTitle.textContent = productName;

		const detailsBody = document.createElement("p");
		detailsBody.className = "spec-details-body";
		detailsBody.textContent = detailCopy[titleKey] || `${titleText}: Weitere Produktdetails folgen.`;

		details.append(detailsTitle, detailsBody);

		item.textContent = "";
		item.append(row, details);

		toggle.addEventListener("click", () => {
			const isOpen = item.classList.toggle("is-open");
			toggle.setAttribute("aria-expanded", String(isOpen));
			toggle.setAttribute(
				"aria-label",
				isOpen ? "Zusatzinformationen ausblenden" : "Zusatzinformationen anzeigen"
			);
			syncScrollbarOverlay();
			refreshScrollbar();
		});
	});
}

initializeSpecAccordions();

function showPanel(targetName) {
	panels.forEach((panel) => {
		const isTarget = panel.dataset.panel === targetName;
		panel.classList.toggle("is-active", isTarget);
		panel.setAttribute("aria-hidden", String(!isTarget));
	});

	if (panelWrap) {
		panelWrap.scrollTop = 0;
	}

	navItems.forEach((item) => {
		const isTarget = item.dataset.target === targetName;
		item.classList.toggle("is-active", isTarget);
		item.setAttribute("aria-pressed", String(isTarget));
	});
}

navItems.forEach((item) => {
	item.addEventListener("click", () => {
		showPanel(item.dataset.target);
		refreshScrollbar();
	});
});

if (panelWrap) {
	const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
	const getActivePanel = () => document.querySelector(".panel.is-active");

	const setScrollbarVisible = (isVisible) => {
		panelWrap.classList.toggle("is-scrollbar-visible", isVisible);
		panelWrap.classList.toggle("is-scrollbar-hidden", !isVisible);
		if (scrollbarOverlay) {
			scrollbarOverlay.style.opacity = isVisible ? "1" : "0";
		}
	};

	refreshScrollbar = () => {
		const activePanel = getActivePanel();

		if (!scrollbarOverlay || !scrollbarThumb || !activePanel) {
			return;
		}

		const scrollableHeight = panelWrap.scrollHeight - panelWrap.clientHeight;

		if (scrollableHeight <= 0) {
			setScrollbarVisible(false);
			return;
		}

		const overlayRect = scrollbarOverlay.getBoundingClientRect();
		const trackHeight = overlayRect.height - 12;
		const contentRatio = panelWrap.clientHeight / activePanel.scrollHeight;
		const thumbHeight = Math.max(48, Math.min(110, Math.round(trackHeight * contentRatio * 0.16)));
		const thumbTravel = Math.max(0, trackHeight - thumbHeight);
		const thumbTop = clamp((panelWrap.scrollTop / scrollableHeight) * thumbTravel, 0, thumbTravel);

		scrollbarThumb.style.height = `${thumbHeight}px`;
		scrollbarThumb.style.transform = `translateY(${thumbTop}px)`;
		setScrollbarVisible(true);
	};

	syncScrollbarOverlay = () => {
		if (!scrollbarOverlay) {
			return;
		}

		const panelRect = panelWrap.getBoundingClientRect();
		scrollbarOverlay.style.top = `${panelRect.top}px`;
		scrollbarOverlay.style.left = `${panelRect.right - 14}px`;
		scrollbarOverlay.style.width = `14px`;
		scrollbarOverlay.style.height = `${panelRect.height}px`;
	};

	const hideScrollbar = () => {
		const activePanel = getActivePanel();

		if (activePanel && activePanel.scrollHeight > panelWrap.clientHeight) {
			setScrollbarVisible(false);
		}
	};

	const showScrollbarTemporarily = () => {
		syncScrollbarOverlay();
		refreshScrollbar();
		window.clearTimeout(scrollbarHideTimeout);
		scrollbarHideTimeout = window.setTimeout(() => {
			hideScrollbar();
		}, 1400);
	};

	panelWrap.addEventListener("scroll", showScrollbarTemporarily, { passive: true });
	panelWrap.addEventListener("pointerenter", showScrollbarTemporarily);
	panelWrap.addEventListener("pointerleave", hideScrollbar);
	window.addEventListener("resize", refreshScrollbar);
	window.addEventListener("resize", syncScrollbarOverlay);
	document.querySelectorAll(".panel-wrap img").forEach((image) => {
		image.addEventListener("load", refreshScrollbar, { passive: true });
	});
	syncScrollbarOverlay();
	refreshScrollbar();
	hideScrollbar();
}

if (window.lucide) {
	window.lucide.createIcons();
}

