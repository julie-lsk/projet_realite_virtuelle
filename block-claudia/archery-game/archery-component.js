// Composant pour masquer/réafficher le panneau d'orientation au bord de la zone
AFRAME.registerComponent("zone-panel", {
  init: function () {
    const scene = this.el;
    const panneau = document.getElementById("panneau-orient");
    scene.addEventListener("zoneEnter", () => {
      panneau.setAttribute("visible", "false");
    });
    scene.addEventListener("zoneExit", () => {
      panneau.setAttribute("visible", "true");
    });
  },
});

// Composant principal du jeu de visée
AFRAME.registerComponent("archery-game", {
  init: function () {
    const container = this.el;
    const scene = container.sceneEl;

    // Panneau d'instructions
    const panneau = document.createElement("a-entity");
    panneau.setAttribute("id", "panneau-tir");
    panneau.setAttribute("position", "-0.215 1.389 0.792");
    panneau.setAttribute("rotation", "0 55 0");
    panneau.innerHTML = `
      <a-text value="Jeu de Fléchettes" color="#FFAA00" align="center"
              width="2" position="0 0.2 0" font="mozillavr"></a-text>
      <a-text value="Appuyez sur ESPACE pour commencer.\nVisez le cercle rouge !"
              color="#FFF" align="center" width="1.5" position="0 0 0" font="mozillavr"></a-text>
    `;
    container.appendChild(panneau);

    // Conteneur de jeu (invisible au départ)
    const gameContainer = document.createElement("a-entity");
    gameContainer.setAttribute("id", "dart-game-container");
    gameContainer.setAttribute("visible", "false");

    // Sons de feedback
    const soundGain = document.createElement("a-entity");
    soundGain.setAttribute("id", "sound-gain");
    soundGain.setAttribute(
      "sound",
      "src: url(block-claudia/archery-game/assets/sons/gain.mp3); volume: 1",
    );
    gameContainer.appendChild(soundGain);

    const soundMiss = document.createElement("a-entity");
    soundMiss.setAttribute("id", "sound-miss");
    soundMiss.setAttribute(
      "sound",
      "src: url(block-claudia/archery-game/assets/sons/lost.mp3); volume: 1",
    );
    gameContainer.appendChild(soundMiss);

    const soundPerdu = document.createElement("a-entity");
    soundPerdu.setAttribute("id", "sound-perdu");
    soundPerdu.setAttribute(
      "sound",
      "src: url(block-claudia/archery-game/assets/sons/perdu.mp3); volume: 1",
    );
    gameContainer.appendChild(soundPerdu);

    const soundVictoire = document.createElement("a-entity");
    soundVictoire.setAttribute("id", "sound-victoire");
    soundVictoire.setAttribute(
      "sound",
      "src: url(block-caludia/archery-game/assets/sons/victoire.mp3); volume: 1",
    );
    gameContainer.appendChild(soundVictoire);

    // Pivot global pour centrer cible + cercles
    const targetPivot = document.createElement("a-entity");
    targetPivot.setAttribute("position", "-1.013 0.059 0.273");
    targetPivot.setAttribute("rotation", "0 55 0");
    gameContainer.appendChild(targetPivot);

    // Modèle 3D de la cible
    const targetModel = document.createElement("a-entity");
    targetModel.setAttribute("id", "targetModel-3d");
    targetModel.setAttribute("gltf-model", "#targetModel");
    targetModel.setAttribute("scale", "0.1 0.1 0.1");
    targetModel.setAttribute("position", "-0.026 0.322 -0.240");
    targetModel.setAttribute("rotation", "0 270 0");
    targetPivot.appendChild(targetModel);

    // Cercles statiques (rouge, orange, vert, noir)
    const targetGroup = document.createElement("a-entity");
    targetGroup.setAttribute("id", "target-group");
    targetGroup.setAttribute("position", "0.020 0.800 -0.114");
    targetGroup.setAttribute("rotation", "0 0 0");
    targetPivot.appendChild(targetGroup);
    targetGroup.innerHTML = `
      <a-circle radius="0.4"  color="#FF4444" opacity="0.8"></a-circle>
      <a-circle radius="0.25" color="#FFAA44" opacity="0.8" position="0 0 0.01"></a-circle>
      <a-circle radius="0.15" color="#44FF44" opacity="0.8" position="0 0 0.02"></a-circle>
      <a-circle radius="0.03" color="#000000" position="0 0 0.03"></a-circle>
    `;

    // Cible mobile (point rouge)
    const movingTarget = document.createElement("a-circle");
    movingTarget.setAttribute("id", "moving-target");
    movingTarget.setAttribute("position", "0 0 0.03");
    movingTarget.setAttribute("radius", "0.04");
    movingTarget.setAttribute("color", "#FF0000");
    movingTarget.setAttribute("visible", "false");
    targetGroup.appendChild(movingTarget);

    // Scoreboard
    const scoreboard = document.createElement("a-entity");
    scoreboard.setAttribute("id", "scoreboard");
    scoreboard.setAttribute("position", "-0.842 1.707 0.410");
    scoreboard.setAttribute("rotation", "0 55 0");
    scoreboard.setAttribute("scale", "0.5 0.5 0.5");
    scoreboard.innerHTML = `
      <a-plane width="1.5" height="1" color="#2C3E50" opacity="0.9"></a-plane>
      <a-text id="score-title"   value="SCORE"     position="0 0.35 0.01" align="center" color="#ECF0F1" width="4"></a-text>
      <a-text id="current-score" value="0"         position="-0.3 0.1 0.01" align="center" color="#E74C3C" width="6"></a-text>
      <a-text id="shots-left"    value="Tirs: 10" position="0.3 0.1 0.01" align="center" color="#ECF0F1" width="3"></a-text>
      <a-text id="last-shot"     value=""          position="0 -0.15 0.01" align="center" color="#F39C12" width="3"></a-text>
      <a-text id="game-over"     value=""          position="0 -0.35 0.01" align="center" color="#27AE60" width="3" visible="false"></a-text>
    `;
    gameContainer.appendChild(scoreboard);

    // Légende des points
    const legend = document.createElement("a-entity");
    legend.setAttribute("id", "legend");
    legend.setAttribute("position", "0.5 1.2 0.3");
    legend.setAttribute("rotation", "0 55 0");
    legend.setAttribute("scale", "0.5 0.5 0.5");
    legend.innerHTML = `
      <a-text value="Points :" color="#FFF" position="0 0.3 0.01" width="2"></a-text>
      <a-text value="● Centre (noir) = 50" color="#000" position="0 -0.05 0.01" width="2"></a-text>
      <a-text value="● Vert         = 40" color="#44FF44" position="0 -0.25 0.01" width="2"></a-text>
      <a-text value="● Orange    = 30" color="#FFAA44" position="0 -0.45 0.01" width="2"></a-text>
      <a-text value="● Rouge      = 20" color="#FF4444" position="0 -0.65 0.01" width="2"></a-text>
      <a-text value="Touche ESPACE pour tirer" color="#FFF" align="center" width="2" position="0 -0.9 0.01"></a-text>    
    `;
    gameContainer.appendChild(legend);

    // Ajouter le container complet
    container.appendChild(gameContainer);

    // Gérer entrée/sortie de zone pour instruction vs jeu
    scene.addEventListener("zoneEnter", () => {
      gameContainer.setAttribute("visible", "true");
      panneau.setAttribute("visible", "false");
    });
    scene.addEventListener("zoneExit", () => {
      gameContainer.setAttribute("visible", "false");
      panneau.setAttribute("visible", "true");
    });

    console.log("archery-game ready!");
  },
});