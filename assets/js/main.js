const navItems = document.querySelectorAll(".nav-item");
const panels = document.querySelectorAll(".panel");
const panelWrap = document.querySelector(".panel-wrap");
const scrollbarOverlay = document.querySelector(".scrollbar-overlay");
const scrollbarThumb = document.querySelector(".scrollbar-thumb");
let scrollbarHideTimeout;
let refreshScrollbar = () => {};
let syncScrollbarOverlay = () => {};

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

