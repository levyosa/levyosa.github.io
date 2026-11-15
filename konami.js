// ↑ ↑ ↓ ↓ ← → ← → B A
const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const GAME = "konami-reconcile.html";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// digits, payment words, and some katakana (built from char codes so file encoding never matters)
const katakana = Array.from({ length: 40 }, (_, i) => String.fromCharCode(0x30A2 + i)).join("");
const chars = "0123456789R$PIXBOLETOSTR" + katakana;
const randomChar = () => chars[Math.floor(Math.random() * chars.length)];

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
		fadeToBlackThenGo();
	}
});

function fadeToBlackThenGo() {
	if (reducedMotion) return location.href = GAME;
	const black = document.createElement("div");
	black.style.cssText = "position:fixed;inset:0;z-index:9999;padding:0;background:#000;opacity:0;transition:opacity .4s";
	document.body.appendChild(black);
	requestAnimationFrame(() => black.style.opacity = 1);
	setTimeout(() => location.href = GAME + "#matrix", 450);
}

// full-screen green rain on a canvas
function startRain() {
	const canvas = document.createElement("canvas");
	canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:9999;padding:0;background:#000;pointer-events:none";
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	document.body.appendChild(canvas);

	const ctx = canvas.getContext("2d");
	const size = 16;
	const drops = Array(Math.ceil(canvas.width / size)).fill(0).map(() => Math.random() * -20);

	const timer = setInterval(() => {
		ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#3ecf8e";
		ctx.font = size + "px monospace";
		drops.forEach((y, i) => {
			ctx.fillText(randomChar(), i * size, y * size);
			drops[i] = y * size > canvas.height && Math.random() > 0.95 ? 0 : y + 1;
		});
	}, 40);

	return { canvas, stop: () => { clearInterval(timer); canvas.remove(); } };
}

// on the game page: rain for a moment, then it fades away while the page's text decodes from green gibberish
function rainIntoPage() {
	history.replaceState(null, "", location.pathname);
	const done = () => document.dispatchEvent(new Event("intro-done"));
	if (reducedMotion) {
		document.documentElement.classList.remove("intro");
		return done();
	}

	const rain = startRain();
	document.documentElement.classList.remove("intro");

	const style = document.createElement("style");
	style.textContent = ".decoding * { color: #3ecf8e !important; } .settling * { transition: color .8s; }";
	document.head.appendChild(style);
	document.body.classList.add("decoding");

	// every piece of visible text, with a random moment for each character to "lock in"
	const texts = [];
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	while (walker.nextNode()) {
		const node = walker.currentNode;
		if (!node.textContent.trim() || node.parentElement.closest("script, style")) continue;
		const original = node.textContent;
		texts.push({ node, original, lockAt: [...original].map(() => 0.15 + Math.random() * 0.85) });
	}

	const rainFor = 1500;   // pure rain first
	const duration = 1800;  // then the text locks in
	setTimeout(() => {
		rain.canvas.style.transition = "opacity 1.4s";
		rain.canvas.style.opacity = 0;
	}, rainFor);

	const start = performance.now();
	const decoder = setInterval(() => {
		const t = (performance.now() - start - rainFor) / duration;
		for (const { node, original, lockAt } of texts) {
			node.textContent = [...original].map((c, i) => c.trim() === "" || t >= lockAt[i] ? c : randomChar()).join("");
		}
		if (t < 1) return;

		clearInterval(decoder);
		rain.stop();
		document.body.classList.replace("decoding", "settling");
		setTimeout(() => document.body.classList.remove("settling"), 800);
		done();
	}, 40);
}

if (location.hash === "#matrix") rainIntoPage();
