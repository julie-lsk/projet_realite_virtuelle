// Jeu de Visée: logique de démarrage, mouvement et scoring
window.addEventListener("DOMContentLoaded", () => {
  const sceneEl = document.querySelector("a-scene");
  sceneEl.addEventListener("loaded", () => {
    // petits délais pour s'assurer que tout est rendu
    setTimeout(initGame, 500);
  });
});

function initGame() {
  const state = {
    score: 0,
    shotsLeft: 10,
    gameActive: false,
    targetMoving: false,
    currentPos: { x: 0, y: 0, z: 0 },
    intervalId: null,
  };
  const els = {
    panneau: document.querySelector("#panneau-tir"),
    container: document.querySelector("#dart-game-container"),
    movingTarget: document.querySelector("#moving-target"),
    scoreEl: document.querySelector("#current-score"),
    shotsEl: document.querySelector("#shots-left"),
    lastShotEl: document.querySelector("#last-shot"),
    gameOverEl: document.querySelector("#game-over"),
    soundGain: document.querySelector("#sound-gain"),
    soundMiss: document.querySelector("#sound-miss"),
    soundPerdu: document.querySelector("#sound-perdu"),
    soundVictoire: document.querySelector("#sound-victoire"),
  };

  function startGame() {
    state.gameActive = true;
    state.score = 0;
    state.shotsLeft = 10;
    els.panneau.setAttribute("visible", "false");
    els.container.setAttribute("visible", "true");
    nextShot();
  }

  function nextShot() {
    if (state.shotsLeft === 0) return endGame();
    state.targetMoving = true;
    els.movingTarget.setAttribute("visible", "true");
    els.lastShotEl.setAttribute("value", "Appuyez sur ESPACE pour tirer !");
    animateTarget();
  }

  function animateTarget() {
    const max = 0.4 - 0.04; // 0.36
    state.intervalId = setInterval(() => {
      if (!state.targetMoving) {
        clearInterval(state.intervalId);
        return;
      }
      const θ = Math.random() * 2 * Math.PI;
      const r = Math.random() * max;
      const x = Math.cos(θ) * r;
      const y = Math.sin(θ) * r;
      const z = 0.03; // devant le plan
      state.currentPos = { x, y, z };
      els.movingTarget.setAttribute("animation", {
        property: "position",
        to: `${x} ${y} ${z}`,
        dur: 500,
        easing: "easeInOutQuad",
      });
    }, 600);
  }

  function shoot() {
    if (!state.gameActive || !state.targetMoving) return;
    state.targetMoving = false;
    clearInterval(state.intervalId);
    els.lastShotEl.setAttribute("value", "Calcul du score...");
    els.movingTarget.setAttribute("animation", {
      property: "color",
      to: "#FFFF00",
      dur: 200,
      direction: "alternate",
      loop: 3,
    });
    setTimeout(() => {
      scoreShot();
      state.shotsLeft--;
      updateUI();
      setTimeout(() => {
        els.movingTarget.setAttribute("visible", "false");
        els.movingTarget.setAttribute("color", "#FF0000");
        setTimeout(nextShot, 500);
      }, 1500);
    }, 800);
  }

  function scoreShot() {
    const dx = state.currentPos.x; // coords locales dans target-group
    const dy = state.currentPos.y;
    const dist = Math.hypot(dx, dy);
    let pts = 0,
      msg = "",
      col = "#E74C3C";

    if (dist <= 0.03) {
      pts = 50; // tout petit centre noir
      msg = "CENTRE! +50";
      col = "#27AE60";
    } else if (dist <= 0.15) {
      pts = 40; // premier cercle vert
      msg = "VERT! +40";
      col = "#2ECC71";
    } else if (dist <= 0.25) {
      pts = 30; // cercle orange
      msg = "ORANGE! +30";
      col = "#F39C12";
    } else if (dist <= 0.4) {
      pts = 20; // cercle rouge
      msg = "ROUGE! +20";
      col = "#E74C3C";
    } else {
      pts = 0; // hors cible
      msg = "À CÔTÉ! +0";
      col = "#95A5A6";
    }

    // jouer son de tir
    if (pts > 0) {
      els.soundGain.components.sound.playSound();
    } else {
      els.soundMiss.components.sound.playSound();
    }

    state.score += pts;
    els.lastShotEl.setAttribute("value", msg);
    els.lastShotEl.setAttribute("color", col);
  }

  function updateUI() {
    els.scoreEl.setAttribute("value", state.score.toString());
    els.shotsEl.setAttribute("value", `Tirs: ${state.shotsLeft}`);
  }

  function endGame() {
    // jouer son de fin selon score total
    if (state.score >= 300) {
      els.soundVictoire.components.sound.playSound();
    } else {
      els.soundPerdu.components.sound.playSound();
    }

    state.gameActive = false;
    els.movingTarget.setAttribute("visible", "false");
    let final = `Jeu terminé! Score: ${state.score}`;
    if (state.score >= 300) final += "\nExcellent!";
    else if (state.score >= 150) final += "\nBon!";
    els.gameOverEl.setAttribute("value", final);
    els.gameOverEl.setAttribute("visible", "true");
    els.lastShotEl.setAttribute("value", "ESPACE pour recommencer");
    // reset après 3s
    setTimeout(() => {
      els.container.setAttribute("visible", "false");
      els.panneau.setAttribute("visible", "true");
      els.gameOverEl.setAttribute("visible", "false");
      state.score = 0;
      state.shotsLeft = 10;
    }, 3000);
  }

  // écoute de la barre ESPACE
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (!state.gameActive) startGame();
      else shoot();
    }
  });
}
