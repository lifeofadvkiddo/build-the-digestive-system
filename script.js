"use strict";

const ORGANS = ORGAN_DATA;
function speakText(text) {
  const speak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      voice =>
        voice.name.toLowerCase().includes("female") ||
        //  voice.name.toLowerCase().includes("zira") 
         voice.name.toLowerCase().includes("susan") 
        // voice.name.toLowerCase().includes("samantha")
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    window.speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded first
  if (speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", speak, { once: true });
  } else {
    speak();
  }
}

const JOURNEY_ORGANS = [
  {
    id: "mouth",
    label: "Mouth",
    color: "#ff4081",
    fact: "Digestion begins in the mouth. Teeth chew food and saliva starts breaking it down! 👄"
  },

  ...ORGANS
];

const ORGAN_FACTS = Object.fromEntries(
  ORGAN_DATA.map((organ) => [organ.id, organ.fact])
);

const ORGAN_COLORS = Object.fromEntries(
  ORGAN_DATA.map((organ) => [organ.id, organ.color])
);

const ORGAN_SVG_SNIPPETS = Object.fromEntries(
  ORGAN_DATA.map((organ) => [organ.id, organ.svg])
);

const gameState = {
  stage: 1,
  score: 0,
  placedOrgans: new Set(),
  journeyStep: 0,
};
const FOOD_PATH = [
  // Outside mouth / starting point
  // { organ: "mouth", x: 35, y: 150, type: "apple", arrow: "right" },

  // Inside mouth position
  { organ: "mouth", x: 250, y: 175, type: "apple", arrow: "right" },
  // Oesophagus
  { organ: "oesophagus", x: 305, y: 185, type: "chunks", arrow: "right" },
  { organ: "oesophagus", x: 323, y: 260, type: "chunks", arrow: "down" },
  { organ: "oesophagus", x: 315, y: 350, type: "chunks", arrow: "down" },

  // Stomach
  
  { organ: "stomach", x: 370, y: 455, type: "semi", arrow: "down" },
  { organ: "stomach", x: 340, y: 485, type: "semi", arrow: "left" },
  { organ: "stomach", x: 290, y: 495, type: "semi", arrow: "left" },

  // Small intestine
  { organ: "small-intestine", x: 345, y: 555, type: "liquid", arrow: "down" },
  { organ: "small-intestine", x: 275, y: 570, type: "liquid", arrow: "left" },
  { organ: "small-intestine", x: 325, y: 585, type: "liquid", arrow: "right" },
  { organ: "small-intestine", x: 295, y: 610, type: "liquid", arrow: "left" },

  // Large intestine
  { organ: "large-intestine", x: 235, y: 580, type: "liquid", arrow: "left" },
  { organ: "large-intestine", x: 295, y: 535, type: "liquid", arrow: "up" },
  { organ: "large-intestine", x: 360, y: 500, type: "waste", arrow: "right" },
  { organ: "large-intestine", x: 375, y: 555, type: "waste", arrow: "down" },
  { organ: "large-intestine", x: 345, y: 645, type: "wastegi", arrow: "down" },

  // Rectum / Anus
  { organ: "rectum", x: 305, y: 660, type: "waste", arrow: "down" },
  { organ: "anus", x: 305, y: 685, type: "waste", arrow: "down" }
];

let foodPathStep = 0;
const $ = (id) => document.getElementById(id);

/* Generate organ cards from organ-data.js */
function generateOrganCards() {
  const container = $("tray-grid");
  container.innerHTML = "";

  const shuffledOrgans = [...ORGANS].sort(() => Math.random() - 0.5);

shuffledOrgans.forEach((organ) => {
    const card = document.createElement("div");
    card.className = "organ-card";
    card.dataset.organ = organ.id;

    if (organ.cardPosition) {
      card.style.left = organ.cardPosition.x + "px";
      card.style.top = organ.cardPosition.y + "px";
    }

    card.innerHTML = `
  <img 
    src="${organ.image}" 
    draggable="false" 
    alt="${organ.label}"
    class="organ-svg"
  >

  <span class="organ-label">
    ${organ.label}
  </span>
`;

    container.appendChild(card);

    card.addEventListener("mousedown", s1DragStart, { passive: false });
    card.addEventListener("touchstart", s1DragStart, { passive: false });
  });
}

/* Generate drop zones from organ-data.js */
function generateDropZones() {
  const layer = $("placed-organs-layer");
  if (!layer) return;

  layer.innerHTML = "";

  ORGANS.forEach((organ) => {
    const z = organ.zone;
    if (!z) return;

    const zone = document.createElement("div");
    zone.className = "organ-zone";
    zone.dataset.organ = organ.id;

    zone.style.left = z.x + "px";
    zone.style.top = z.y + "px";
    zone.style.width = z.width + "px";
    zone.style.height = z.height + "px";

    layer.appendChild(zone);
  });
}
/* Generate journey organs from organ-data.js */
function generateJourneyOrgans() {
  const organLayer = $("journey-organs-layer");
  const hitLayer = $("journey-hit-layer");

  if (!organLayer || !hitLayer) return;

  organLayer.innerHTML = "";
  hitLayer.innerHTML = "";

  ORGANS.forEach((organ) => {
    const p = organ.place || organ.zone;

    const img = document.createElement("img");

    img.src = organ.image;

    img.className = "journey-organ-img";

    img.id = `jorgan-${organ.id}`;

    img.dataset.organ = organ.id;

    img.style.left = p.x + "px";
    img.style.top = p.y + "px";
    img.style.width = p.width + "px";
    img.style.height = p.height + "px";

    img.style.zIndex = organ.layer;

    organLayer.appendChild(img);

    const hit = document.createElement("div");

    hit.className = "journey-hit-zone";

    hit.dataset.organ = organ.id;

    hit.dataset.index = ORGANS.indexOf(organ);

    hit.style.left = organ.zone.x + "px";
    hit.style.top = organ.zone.y + "px";
    hit.style.width = organ.zone.width + "px";
    hit.style.height = organ.zone.height + "px";

    hitLayer.appendChild(hit);
  });
}
let toastTimer;
function showToast(msg, type = "") {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show" + (type ? ` ${type}-toast` : "");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.className = "toast";
  }, 2200);
}

function spawnFloater(x, y, emoji = "✅") {
  const el = document.createElement("div");
  el.className = "check-float";
  el.textContent = emoji;
  el.style.left = x + "px";
  el.style.top = y + "px";
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

function spawnStars(x, y) {
  ["⭐", "✨", "🌟", "💫", "⭐"].forEach((s, i) => {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "check-float";
      el.textContent = s;
      el.style.left = x + (Math.random() - 0.5) * 60 + "px";
      el.style.top = y + (Math.random() - 0.5) * 40 + "px";
      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, i * 80);
  });
}

function spawnConfetti() {
  const container = $("s2-confetti");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const svgNS = "http://www.w3.org/2000/svg";
      const el = document.createElementNS(svgNS, "svg");

      el.setAttribute("class", "svg-confetti-piece");
      el.setAttribute("width", "16");
      el.setAttribute("height", "16");
      el.setAttribute("viewBox", "0 0 16 16");

      el.style.position = "absolute";
      el.style.left = Math.random() * 100 + "%";
      el.style.top = "-20px";
      el.style.animationDuration = 2 + Math.random() * 2 + "s";
      el.style.animationDelay = Math.random() * 0.5 + "s";

      // Create a circle inside the SVG
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", "8");
      circle.setAttribute("cy", "8");
      circle.setAttribute("r", "8");
      circle.setAttribute("fill", `hsl(${Math.random() * 360}, 70%, 50%)`);

      el.appendChild(circle);
      container.appendChild(el);

      el.addEventListener(
        "animationend",
        () => {
          el.remove();
        },
        { once: true }
      );
    }, i * 60);
  }
}

function addScore(pts) {
  gameState.score += pts;
  const el = $("header-score");
  el.textContent = `⭐ ${gameState.score}`;
  el.classList.add("bump");
  el.addEventListener("animationend", () => el.classList.remove("bump"), {
    once: true,
  });
}

function showStage(n) {
  document.querySelectorAll(".stage").forEach((s) => s.classList.remove("active"));
  $(`stage-${n}`).classList.add("active");

  gameState.stage = n;

  document.querySelectorAll(".stage-pill").forEach((p) =>
    p.classList.remove("active", "done")
  );

  for (let i = 1; i < n; i++) $(`pill-${i}`).classList.add("done");
  $(`pill-${n}`).classList.add("active");
}

let s1Drag = null;

function getPtr(e) {
  const s = e.touches?.[0] ?? e.changedTouches?.[0] ?? e;
  return { x: s.clientX, y: s.clientY };
}

function s1DragStart(e) {
  const card = e.currentTarget;
  if (card.classList.contains("placed")) return;

  e.preventDefault();

  const organId = card.dataset.organ;
  const organLabel = card.querySelector(".organ-label").textContent;
  speakText(organLabel);

  const originRect = card.getBoundingClientRect();
  const startPtr = getPtr(e);

  const ghost = card.cloneNode(true);
  ghost.className = "organ-ghost";
  const ptr = getPtr(e);
ghost.style.left = ptr.x - originRect.width / 2 + "px";
ghost.style.top  = ptr.y - originRect.height / 2 + "px";

  // Center the ghost under the pointer
  ghost.style.left = originRect.left - originRect.width / 2 + originRect.width / 2 + "px";
  ghost.style.top  = originRect.top - originRect.height / 2 + originRect.height / 2 + "px";

  document.body.appendChild(ghost);
  card.classList.add("dragging");

  s1Drag = { card, ghost, organId, originRect, startPtr };

  document.addEventListener("mousemove", s1DragMove, { passive: false });
  document.addEventListener("mouseup", s1DragEnd);
  document.addEventListener("touchmove", s1DragMove, { passive: false });
  document.addEventListener("touchend", s1DragEnd);
}

function s1DragMove(e) {
  if (!s1Drag) return;

  e.preventDefault();

  const { ghost, originRect, startPtr } = s1Drag;
  const ptr = getPtr(e);

  ghost.style.left = originRect.left + ptr.x - startPtr.x + "px";
  ghost.style.top = originRect.top + ptr.y - startPtr.y + "px";

  s1HighlightZones(ptr.x, ptr.y);
}

function s1DragEnd(e) {
  if (!s1Drag) return;

  const { card, ghost, organId, originRect } = s1Drag;

  document.removeEventListener("mousemove", s1DragMove);
  document.removeEventListener("mouseup", s1DragEnd);
  document.removeEventListener("touchmove", s1DragMove);
  document.removeEventListener("touchend", s1DragEnd);

  s1ClearHighlights();

  const ptr = getPtr(e);
  const zone = s1GetHitZone(ptr.x, ptr.y);

  s1Drag = null;

  if (zone) {
    s1ValidateDrop(card, ghost, organId, zone, originRect);
  } else {
    card.classList.remove("dragging");
    ghost.remove();
  }
}

function s1GetHitZone(px, py) {
  return [...document.querySelectorAll(".organ-zone")].find((z) => {
    if (z.classList.contains("filled")) return false;

    const r = z.getBoundingClientRect();
    return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
  });
}

function s1HighlightZones(px, py) {
  document.querySelectorAll(".organ-zone").forEach((z) => {
    if (z.classList.contains("filled")) return;

    const r = z.getBoundingClientRect();
    const hit = px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;

    z.classList.toggle("drag-over", hit);
  });
}

function s1ClearHighlights() {
  document.querySelectorAll(".organ-zone").forEach((z) =>
    z.classList.remove("drag-over")
  );
}

function s1ValidateDrop(card, ghost, organId, zone, originRect) {
  const expected = zone.dataset.organ;

  if (organId === expected) {

  const organ = ORGANS.find(o => o.id === organId);

  ghost.remove();

  const placed = document.createElement("img");

  placed.src = organ.image;

  placed.className = "placed-organ-img";
  placed.style.zIndex = organ.layer;
  placed.dataset.organ = organ.id;

  placed.style.left = organ.zone.x + "px";
const p = organ.place || organ.zone;

placed.style.left = p.x + "px";

placed.style.top = p.y + "px";

placed.style.width = p.width + "px";

placed.style.height = p.height + "px";

  $("placed-organs-layer").appendChild(placed);

  card.classList.remove("dragging");

  card.classList.add("placed");

  zone.classList.add("filled");

  gameState.placedOrgans.add(organId);

  addScore(10);

  const counter = $("placed-counter");

if (counter) {
  counter.textContent =
    `${gameState.placedOrgans.size} / ${ORGANS.length} placed`;
}

  // showToast(`✅ ${organ.label} placed correctly!`, "correct");

  if (gameState.placedOrgans.size >= ORGANS.length) {
    setTimeout(s1Complete, 700);
  }

  } else {
    // Wrong drop - fix freeze
    card.classList.remove("dragging"); // immediately allow dragging again
    ghost.remove();                     // remove the ghost immediately
    s1Drag = null;                      // clear the global drag reference

    zone.classList.add("wrong-zone");   // show temporary highlight
    showToast("❌ That's not right — try again!", "wrong");

    setTimeout(() => {
        zone.classList.remove("wrong-zone"); // remove highlight after 0.4s
    }, 400);

    return; // exit the function immediately
}
}

function s1Complete() {
  $("s1-complete").style.display = "flex";
}

function buildJourneySteps() {
  const container = $("journey-steps");
  container.innerHTML = "";

  JOURNEY_ORGANS.forEach((organ, i) => {
    // Create the step box
    const div = document.createElement("div");
    div.className = "journey-step-item" + (i === 0 ? " step-current" : "");
    div.id = `jstep-${organ.id}`;

    // Step number + label
    div.innerHTML = `
      <span class="step-num-badge" style="background:${ORGAN_COLORS[organ.id]};color:white">${i+1}</span>
      <span class="step-label">${organ.label}</span>
      <span class="step-check" id="jcheck-${organ.id}"></span>
    `;

    container.appendChild(div);

    // Add a **separate arrow element between steps** (except after last step)
    if (i < JOURNEY_ORGANS.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "step-connector-arrow";
      arrow.textContent = "↓"; // arrow symbol
      container.appendChild(arrow);
    }
  });

  // Instruction box below all steps
  const factBox = $("journey-fact-box");
  factBox.innerHTML = `
    <div class="fact-icon">💡</div>
    <div class="fact-text">
      Drag the apple to the <strong>Mouth</strong> to begin!
    </div>
  `;
}

function updateJourneyOrganStates() {
  ORGANS.forEach((organ, i) => {
    const el = document.getElementById(`jorgan-${organ.id}`);
    if (!el) return;

    el.classList.remove("active-organ", "completed", "organ-wrong");

    if (i < gameState.journeyStep) {
      el.classList.add("completed");
    } else if (i === gameState.journeyStep) {
      el.classList.add("active-organ");
    }
  });
}

function updateJourneySteps(completedIndex) {
  JOURNEY_ORGANS.forEach((organ, i) => {
    const stepEl = $(`jstep-${organ.id}`);
    const checkEl = $(`jcheck-${organ.id}`);

    if (!stepEl) return;

    stepEl.classList.remove("step-done", "step-current");

    if (i < completedIndex) {
      stepEl.classList.add("step-done");
      checkEl.textContent = "✅";
    } else if (i === completedIndex) {
      stepEl.classList.add("step-current");
      checkEl.textContent = "";
    }
  });
}

let s2Drag = null;

function s2FoodDragStart(e) {
  const organName = e.currentTarget.querySelector(".organ-label").textContent;
speakText(organName);
  const food = e.currentTarget;

  e.preventDefault();

  const originRect = food.getBoundingClientRect();
  const startPtr = getPtr(e);

  const ghost = document.createElement("div");
  ghost.className = "food-ghost";
  ghost.innerHTML = food.innerHTML;
  ghost.style.width = originRect.width + "px";
  ghost.style.left = originRect.left + "px";
  ghost.style.top = originRect.top + "px";

  document.body.appendChild(ghost);

  food.classList.add("dragging-food");

  s2Drag = { food, ghost, originRect, startPtr };

  document.addEventListener("mousemove", s2DragMove, { passive: false });
  document.addEventListener("mouseup", s2DragEnd);
  document.addEventListener("touchmove", s2DragMove, { passive: false });
  document.addEventListener("touchend", s2DragEnd);
}

function s2DragMove(e) {
  if (!s2Drag) return;

  e.preventDefault();

  const { ghost, originRect, startPtr } = s2Drag;
  const ptr = getPtr(e);

  ghost.style.left = originRect.left + ptr.x - startPtr.x + "px";
  ghost.style.top = originRect.top + ptr.y - startPtr.y + "px";
}

function s2DragEnd(e) {
  if (!s2Drag) return;

  const { food, ghost } = s2Drag;

  document.removeEventListener("mousemove", s2DragMove);
  document.removeEventListener("mouseup", s2DragEnd);
  document.removeEventListener("touchmove", s2DragMove);
  document.removeEventListener("touchend", s2DragEnd);

  const ptr = getPtr(e);
  const hit = s2GetHitOrgan(ptr.x, ptr.y);

  s2Drag = null;

  food.classList.remove("dragging-food");
  ghost.remove();

  if (hit !== null) {
    s2ValidateFoodDrop(food, hit);
  }
}

function s2GetHitOrgan(px, py) {
  let found = null;

  document.querySelectorAll(".journey-hit-zone").forEach((zone) => {

    const r = zone.getBoundingClientRect();

    if (
      px >= r.left &&
      px <= r.right &&
      py >= r.top &&
      py <= r.bottom
    ) {
      found = Number(zone.dataset.index);
    }
  });

  return found;
}

function s2ValidateFoodDrop(food, hitIndex) {
  const expected = gameState.journeyStep;

  if (hitIndex === expected) {
    const organ = ORGANS[hitIndex];
    const organEl = document.getElementById(`jorgan-${organ.id}`);
    const organRect = organEl.getBoundingClientRect();

    const svgWrapper = food.closest(".journey-body");

    if (svgWrapper) {
      const wrapRect = svgWrapper.getBoundingClientRect();

      food.style.position = "absolute";
      food.style.left =
        organRect.left - wrapRect.left + organRect.width / 2 - food.offsetWidth / 2 + "px";
      food.style.top =
        organRect.top - wrapRect.top + organRect.height / 2 - food.offsetHeight / 2 + "px";
      food.style.transform = "none";
    }

    organEl.classList.add("organ-success", "completed");

    spawnStars(
      organRect.left + organRect.width / 2,
      organRect.top + organRect.height / 2
    );

    gameState.journeyStep++;
    addScore(15);

    $("fact-text").innerHTML = `<strong>${organ.label}:</strong> ${ORGAN_FACTS[organ.id]}`;

    updateJourneySteps(gameState.journeyStep);
    updateJourneyOrganStates();

    // showToast(`✅ Food enters the ${organ.label}!`, "correct");

    if (gameState.journeyStep >= ORGANS.length) {
      setTimeout(s2Complete, 900);
    }
  } else if (hitIndex < expected) {
    showToast("⬆️ You already passed through there!", "wrong");
    s2WrongFeedback(hitIndex);
  } else {
    showToast(`⚠️ Go to the ${ORGANS[expected].label} first!`, "wrong");
    s2WrongFeedback(hitIndex);
  }
}

function s2WrongFeedback(hitIndex) {
  const organ = ORGANS[hitIndex];
  const el = document.getElementById(`jorgan-${organ.id}`);

  if (!el) return;

  el.classList.add("organ-wrong");
  el.addEventListener("animationend", () => el.classList.remove("organ-wrong"), {
    once: true,
  });
}

function handleArrowClick(e) {
  const clickedArrow = e.currentTarget.dataset.dir;
  const currentPoint = FOOD_PATH[foodPathStep];

  if (!currentPoint) return;

  if (clickedArrow === currentPoint.arrow) {
    moveFoodToOrgan();
  } else {
    showToast("Oops! Food doesn’t go that way. Try another path!", "wrong");
  }
}

function moveFoodToOrgan() {
  const point = FOOD_PATH[foodPathStep];
  const food = document.getElementById("food-item");
  const arrow = document.getElementById("arrow-control");

  if (!point) {
    arrow.style.display = "none";
    s2Complete();
    return;
  }

  food.style.position = "absolute";
  food.style.transition = "left .6s ease, top .6s ease";
  food.style.left = point.x - food.offsetWidth / 2 + "px";
  food.style.top = point.y - food.offsetHeight / 2 + "px";

  // Change food type class
  food.className = "food-item food-" + point.type;

  // Move arrow along
  arrow.style.left = point.x + 110 + "px";
  arrow.style.top = point.y - 24 + "px";

  // Update journey step only when organ changes
  const nextPoint = FOOD_PATH[foodPathStep + 1];

  if (!nextPoint || nextPoint.organ !== point.organ) {
    gameState.journeyStep++;
    updateJourneySteps(gameState.journeyStep);
    updateJourneyOrganStates();
  }

  foodPathStep++;

  // SHOW COMPLETED SCREEN AFTER FINAL FOOD PATH POINT
  if (foodPathStep >= FOOD_PATH.length) {
    arrow.style.display = "none";

    setTimeout(() => {
      s2Complete();
    }, 700);
  }
}

function s2Complete() {
  $("s2-complete").style.display = "flex";
  spawnConfetti();
}
function resetGame() {
  // Hide intro screen always
  const startScreen = document.getElementById("start-screen");
  if (startScreen) {
    startScreen.style.display = "none";
  }

  // Hide stage 1 complete popup
  const s1CompleteBox = document.getElementById("s1-complete");
  if (s1CompleteBox) {
    s1CompleteBox.style.display = "none";
  }

  // Hide stage 2 complete popup
  const s2CompleteBox = document.getElementById("s2-complete");
  if (s2CompleteBox) {
    s2CompleteBox.style.display = "none";
  }

  // Clear confetti
  const confetti = document.getElementById("s2-confetti");
  if (confetti) {
    confetti.innerHTML = "";
  }

  // Reset all game values
  gameState.stage = 1;
  gameState.score = 0;
  gameState.journeyStep = 0;
  gameState.placedOrgans.clear();

  foodPathStep = 0;

  // Reset score
  const score = document.getElementById("header-score");
  if (score) {
    score.textContent = "⭐ 0";
  }

  // Show Stage 1 directly
  showStage(1);

  // Reset stage pills
  const pill1 = document.getElementById("pill-1");
  const pill2 = document.getElementById("pill-2");

  if (pill1) {
    pill1.classList.add("active");
    pill1.classList.remove("done");
  }

  if (pill2) {
    pill2.classList.remove("active", "done");
  }

  // Clear placed organs
  const placedLayer = document.getElementById("placed-organs-layer");
  if (placedLayer) {
    placedLayer.innerHTML = "";
  }

  // Rebuild Build System stage
  generateDropZones();
  generateOrganCards();

  // Reset placed counter if available
  const placedCounter = document.getElementById("placed-counter");
  if (placedCounter) {
    placedCounter.textContent = `0 / ${ORGANS.length} placed`;
  }

  // Rebuild Food Journey also, so it is fresh when user reaches Stage 2
  generateJourneyOrgans();
  buildJourneySteps();
  updateJourneySteps(0);
  updateJourneyOrganStates();

  const factText = document.getElementById("fact-text");
  if (factText) {
    factText.innerHTML = `Drag the apple to the <strong>Mouth</strong> to begin!`;
  }

  // Reset food and arrow position
  const food = document.getElementById("food-item");
  const arrow = document.getElementById("arrow-control");

  if (food && arrow) {
    const firstPoint = FOOD_PATH[0];

    food.className = "food-item food-apple";
    food.style.position = "absolute";
    food.style.transition = "none";

    setTimeout(() => {
      food.style.left = firstPoint.x - food.offsetWidth / 2 - 100 + "px";
      food.style.top = firstPoint.y - food.offsetHeight / 2 + "px";

      arrow.style.display = "grid";
      arrow.style.left = firstPoint.x - 80 + "px";
      arrow.style.top = firstPoint.y + 30 + "px";
    }, 100);
  }

  speakText("Drag each organ into the correct place in the body.");
}
document.querySelectorAll(".arrow-btn").forEach((btn) => {
  btn.addEventListener("click", handleArrowClick);
});

function init() {
  $("btn-start-game").addEventListener("click", () => {
  $("start-screen").style.display = "none";
  showStage(1);

  // Use speakText() which already uses female voice
  speakText("Drag each organ into the correct place in the body.");
});

$("s1-instruction").addEventListener(
  "mouseenter",
  () => {

    speakText(
      $("s1-instruction").textContent
    );

});

$("s1-instruction").addEventListener(
  "touchstart",
  () => {

    speakText(
      $("s1-instruction").textContent
    );

});

// Stage 2 instruction speaking
$("s2-instruction").addEventListener("mouseenter", () => {
  speakText($("s2-instruction").textContent);
});

$("s2-instruction").addEventListener("touchstart", () => {
  speakText($("s2-instruction").textContent);
});
  generateOrganCards();

// Make all organ cards draggable and speak on drag
document.querySelectorAll(".organ-card").forEach(function(card) {
  // Set draggable
  card.setAttribute("draggable", true);

  // Desktop drag
  card.addEventListener("dragstart", function(e) {
    const organName = this.querySelector(".organ-label").textContent;
    speakText(organName);
  });

  // Mobile touch
  card.addEventListener("touchstart", function(e) {
    const organName = this.querySelector(".organ-label").textContent;
    speakText(organName);
  });
});
  generateDropZones();
  generateJourneyOrgans();

  $("btn-to-stage2").addEventListener("click", () => {
  $("s1-complete").style.display = "none";
  showStage(2);
  buildJourneySteps();
  updateJourneyOrganStates();

  // Speak Stage 2 instruction once when stage loads
  speakText($("s2-instruction").textContent);
});

  const food = $("food-item");

const arrow = $("arrow-control");



setTimeout(() => {

  const firstPoint = FOOD_PATH[0];

  const food = $("food-item");

  food.style.left =
    firstPoint.x - food.offsetWidth / 2 - 100 + "px";

  food.style.top =
    firstPoint.y - food.offsetHeight / 2 + "px";

  arrow.style.left =
    firstPoint.x - 80 + "px";

  arrow.style.top =
    firstPoint.y + 30 + "px";

}, 300);

  const replayBtn = document.getElementById("btn-replay");

if (replayBtn) {
  replayBtn.onclick = function () {
    resetGame();
  };
}

  const placedCounter = $("placed-counter");
if (placedCounter) {
  placedCounter.textContent = `0 / ${ORGANS.length} placed`;
}
  $("header-score").textContent = "⭐ 0";
  $("fact-text").innerHTML = `Drag the apple to the <strong>${ORGANS[0].label}</strong> to begin!`;

  buildJourneySteps();
  updateJourneyOrganStates();
}

document.addEventListener("DOMContentLoaded", init);