// ↑ ↑ ↓ ↓ ← → ← → B A
const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const GAME = "konami-reconcile.html";

let progress = 0;
document.addEventListener("keydown", event => {
	const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
	if (key === konami[progress]) {
		progress++;
	} else {
		progress = key === konami[0] ? 1 : 0;
	}
	if (progress === konami.length) {
		progress = 0;
		location.href = GAME;
	}
});
