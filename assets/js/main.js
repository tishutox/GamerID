const navItems = document.querySelectorAll(".nav-item");
const panels = document.querySelectorAll(".panel");

function showPanel(targetName) {
	panels.forEach((panel) => {
		const isTarget = panel.dataset.panel === targetName;
		panel.classList.toggle("is-active", isTarget);
		panel.setAttribute("aria-hidden", String(!isTarget));
	});

	navItems.forEach((item) => {
		const isTarget = item.dataset.target === targetName;
		item.classList.toggle("is-active", isTarget);
		item.setAttribute("aria-pressed", String(isTarget));
	});
}

navItems.forEach((item) => {
	item.addEventListener("click", () => {
		showPanel(item.dataset.target);
	});
});

if (window.lucide) {
	window.lucide.createIcons();
}

