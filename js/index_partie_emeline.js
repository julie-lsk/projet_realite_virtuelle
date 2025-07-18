// Jeu de mémoire
AFRAME.registerComponent("jeu-memoire", {
  init: function () {
    const container = this.el;
    // Liste des objets avec leur position
    const tousObjetsPossibles = [
      {
        id: "grimoire",
        src: "#grimoire",
        scale: "0.12 0.12 0.12",
        rotation: "0 120 0",
      },
      { id: "bougie", src: "#bougie", scale: "0.5 0.5 0.5", rotation: "0 0 0" },
      { id: "potion", src: "#potion", scale: "0.6 0.6 0.6", rotation: "0 0 0" },
      {
        id: "chapeau",
        src: "#chapeau",
        scale: "0.0010 0.0010 0.0010",
        rotation: "0 0 0",
      },
      {
        id: "champignon",
        src: "#champignon",
        scale: "0.015 0.015 0.015",
        rotation: "0 0 0",
      },
      { id: "cle", src: "#cle", scale: "0.15 0.15 0.15", rotation: "0 0 0" },
      {
        id: "pomme",
        src: "#pomme",
        scale: "0.01 0.01 0.01",
        rotation: "0 0 0",
      },
      {
        id: "baguette",
        src: "#baguette",
        scale: "0.20 0.10 0.10",
        rotation: "0 0 0",
      },
    ];

    const objetsChoix = [];
    // Titre du jeu mémoire
    const titre = document.createElement("a-text");
    titre.setAttribute("value", "Jeu de memoire du sorcier");
    titre.setAttribute("position", "0 1.70 1");
    titre.setAttribute("align", "center");
    titre.setAttribute("width", "4");
    titre.setAttribute("color", "#FFAA00");
    titre.setAttribute("font", "mozillavr");
    titre.classList.add("persistent");
    container.appendChild(titre);

    // Instructions visibles au début
    const panneauInstructions = document.createElement("a-text");
    panneauInstructions.setAttribute("id", "panneau-instruction");
    panneauInstructions.setAttribute(
      "value",
      "Observe bien les objets du marchand...\nTu devras les retrouver ensuite !"
    );
    panneauInstructions.setAttribute("position", "0 1 1");
    panneauInstructions.setAttribute("color", "#FFFFFF");
    panneauInstructions.setAttribute("align", "center");
    panneauInstructions.setAttribute("width", "3");
    panneauInstructions.setAttribute("font", "mozillavr");
    panneauInstructions.classList.add("persistent");
    container.appendChild(panneauInstructions);

    // Messages temporaires
    const message = document.createElement("a-text");
    message.setAttribute("id", "message-feedback");
    message.setAttribute("value", "");
    message.setAttribute("visible", "false");
    message.setAttribute("position", "0 1 0.5");
    message.setAttribute("align", "center");
    message.setAttribute("width", "3");
    message.setAttribute("font", "mozillavr");
    message.classList.add("persistent");
    container.appendChild(message);

    const soundCorrect = document.querySelector("#sound-correct-object");
    const soundWrong = document.querySelector("#sound-wrong-object");
    const soundWin = document.querySelector("#sound-win-memory-game");

    let bonsChoixTrouvés = [];
    let victoire = false;

    const afficherMessageTemporaire = (texte, couleur, durée = 2000) => {
      message.setAttribute("value", texte);
      message.setAttribute("color", couleur);
      message.setAttribute("visible", true);
      setTimeout(() => {
        message.setAttribute("visible", false);
      }, durée);
    };

    const effetBrillance = (objet, couleur, persister = false) => {
      const mesh = objet.getObject3D("mesh");
      if (!mesh) return;
      mesh.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.emissive = new THREE.Color(couleur);
          node.material.emissiveIntensity = 1;
          if (!persister) {
            setTimeout(() => {
              node.material.emissive.set("#000000");
              node.material.emissiveIntensity = 0;
            }, 2000);
          }
        }
      });
    };
    // Bouton Commencer
    const afficherBoutonCommencer = () => {
      const boutonStart = document.createElement("a-box");
      boutonStart.setAttribute("position", "-0.25 0.5 1");
      boutonStart.setAttribute("depth", "0.1");
      boutonStart.setAttribute("width", "1");
      boutonStart.setAttribute("height", "0.3");
      boutonStart.setAttribute(
        "material",
        "src: #texture-bois; repeat: 1 1; roughness: 1; metalness: 0;"
      );

      boutonStart.setAttribute("animation__hover", {
        property: "scale",
        startEvents: "mouseenter",
        to: "1.1 1.1 1.1",
        dur: 200,
      });
      boutonStart.setAttribute("animation__leave", {
        property: "scale",
        startEvents: "mouseleave",
        to: "1 1 1",
        dur: 200,
      });

      boutonStart.setAttribute("class", "clickable");

      const texteBtn = document.createElement("a-text");
      texteBtn.setAttribute("value", "Commencer\nla partie");
      texteBtn.setAttribute("align", "center");
      texteBtn.setAttribute("font", "mozillavr");
      texteBtn.setAttribute("color", "#fbe8a6");
      texteBtn.setAttribute("width", "1.8");
      texteBtn.setAttribute("position", "0 0.05 0.11");

      boutonStart.appendChild(texteBtn);
      container.appendChild(boutonStart);

      boutonStart.addEventListener("click", () => {
        container.removeChild(boutonStart);
        panneauInstructions.setAttribute("visible", "false");
        resetJeu();
      });
    };
    // Reset du jeu
    const resetJeu = () => {
      Array.from(container.children).forEach((child) => {
        if (!child.classList.contains("persistent")) {
          container.removeChild(child);
        }
      });

      bonsChoixTrouvés = [];
      victoire = false;

      message.setAttribute("visible", false);
      panneauInstructions.setAttribute("visible", "false");
      message.setAttribute("visible", "false");

      const melange = [...tousObjetsPossibles].sort(() => Math.random() - 0.5);
      const bonsObjets = melange.slice(0, 4);
      const leurres = melange.slice(4);

      const objetsTemporaires = [];

      bonsObjets.forEach((obj, i) => {
        const ent = document.createElement("a-entity");
        ent.setAttribute("gltf-model", obj.src);
        ent.setAttribute("rotation", obj.rotation || "0 0 0");
        ent.setAttribute("scale", "0 0 0");

        const x = -0.9 + i * 0.4;
        const y = 1.0;
        const z = 0.1;

        ent.setAttribute("position", `${x} ${y} ${z}`);
        ent.setAttribute("animation__scale", {
          property: "scale",
          to: obj.scale,
          from: "0 0 0",
          dur: 1200,
          easing: "easeOutElastic",
        });

        container.appendChild(ent);
        objetsTemporaires.push(ent);
      });

      setTimeout(() => {
        objetsTemporaires.forEach((ent) => container.removeChild(ent));

        const tousObjets = [...bonsObjets, ...leurres].sort(
          () => Math.random() - 0.5
        );

        tousObjets.forEach((obj, i) => {
          const ent = document.createElement("a-entity");
          ent.setAttribute("gltf-model", obj.src);
          ent.setAttribute("scale", obj.scale);
          ent.setAttribute("rotation", obj.rotation || "0 0 0");

          const x = -0.9 + (i % 4) * 0.4;
          const y = i < 4 ? 1.0 : 0.5;
          const z = i < 4 ? 0.02 : 0.3;

          ent.setAttribute("position", `${x} ${y} ${z}`);
          ent.setAttribute("class", "clickable");
          ent.setAttribute("id", `objet-${obj.id}`);
          container.appendChild(ent);
          objetsChoix.push(ent);

          ent.addEventListener("click", () => {
            if (victoire) return;

            const estBon = bonsObjets.some((o) => o.id === obj.id);

            if (estBon) {
              effetBrillance(ent, "#00ccff", true);
              soundCorrect.components.sound.stopSound();
              soundCorrect.components.sound.playSound();
              afficherMessageTemporaire(
                "Bravo, jeune sorcier du village !",
                "#0000FF"
              );

              if (!bonsChoixTrouvés.includes(ent)) {
                bonsChoixTrouvés.push(ent);
              }

              if (bonsChoixTrouvés.length === 4) {
                victoire = true;
                soundWin.components.sound.stopSound();
                soundWin.components.sound.playSound();
                message.setAttribute(
                  "value",
                  "Par les cornes du dragon, mission accomplie !"
                );
                message.setAttribute("color", "#FFAA00");
                message.setAttribute("position", "0 1 1");
                message.setAttribute("visible", true);

                objetsChoix.forEach((el) => el.removeAttribute("class"));
                const bouton = document.createElement("a-box");
                bouton.setAttribute("position", "-0.25 0.5 1");
                bouton.setAttribute("depth", "0.1");
                bouton.setAttribute("height", "0.3");
                bouton.setAttribute("width", "1");
                bouton.setAttribute("material", "shader: flat; roughness: 1;");
                bouton.setAttribute(
                  "material",
                  "src: #texture-bois; repeat: 1 1; roughness: 1; metalness: 0;"
                );
                bouton.setAttribute("class", "clickable");

                const texteBtn = document.createElement("a-text");
                texteBtn.setAttribute("value", "Recommencer");
                texteBtn.setAttribute("align", "center");
                texteBtn.setAttribute("font", "mozillavr");
                texteBtn.setAttribute("color", "#fbe8a6");
                texteBtn.setAttribute("width", "1.8");
                texteBtn.setAttribute("position", "0 0.05 0.11");
                bouton.appendChild(texteBtn);

                bouton.addEventListener("click", resetJeu);
                container.appendChild(bouton);
              }
            } else {
              effetBrillance(ent, "#FF0000", false);
              soundWrong.components.sound.stopSound();
              soundWrong.components.sound.playSound();
              afficherMessageTemporaire(
                "Ratage ! Ton flair de druide est en pause.",
                "#FF0000"
              );
            }
          });
        });
      }, 5000);
    };

    afficherBoutonCommencer();
  },
});

window.addEventListener("load", () => {
  const scene = document.querySelector("a-scene");
  scene.addEventListener("loaded", () => {
    const zone = document.querySelector("#stand-memoire");
    if (zone) zone.setAttribute("jeu-memoire", "");
  });
});

// Jeu des mots avec les sorts
AFRAME.registerComponent("jeu-mots", {
  init: function () {
    const container = this.el;

    // Sons
    const sonSuccess = document.querySelector("#find-correct-object");
    const sonError = document.querySelector("#find-wrong-object");
    const sonWin = document.querySelector("#win-memory-game");

    // Fonction scintillement
    function effetScintillement(el) {
      el.setAttribute("animation__scintillement", {
        property: "color",
        to: "#FFD700",
        dur: 500,
        dir: "alternate",
        loop: 2,
      });
    }

    // Message final + bouton recommencer
    function afficherMessageFinal(parent) {
      sonWin.play();
      const message = document.createElement("a-text");
      message.setAttribute("value", "Bravo, tu es un apprenti sorcier !");
      message.setAttribute("position", "0 1.20 0.5");
      message.setAttribute("align", "center");
      message.setAttribute("width", "4");
      message.setAttribute("color", "#FFAA00");
      message.setAttribute("font", "mozillavr");
      parent.appendChild(message);

      const btnRestart = document.createElement("a-box");
      btnRestart.setAttribute("position", "0 0.5 0.5");
      btnRestart.setAttribute("depth", "0.1");
      btnRestart.setAttribute("width", "1");
      btnRestart.setAttribute("height", "0.3");
      btnRestart.setAttribute(
        "material",
        "src: #texture-bois; repeat: 1 1; roughness: 1; metalness: 0;"
      );
      btnRestart.setAttribute("class", "clickable");

      const texteBtn = document.createElement("a-text");
      texteBtn.setAttribute("value", "Recommencer");
      texteBtn.setAttribute("font", "mozillavr");
      texteBtn.setAttribute("color", "#fbe8a6");
      texteBtn.setAttribute("width", "1.8");
      texteBtn.setAttribute("position", "-0.25 0.05 0.11");

      btnRestart.appendChild(texteBtn);
      parent.appendChild(btnRestart);

      btnRestart.addEventListener("click", resetJeuMots);
    }
    // Titre du jeu
    const titre = document.createElement("a-text");
    titre.setAttribute("value", "Jeu des mots magiques");
    titre.setAttribute("position", "0 2.15 0.5");
    titre.setAttribute("align", "center");
    titre.setAttribute("width", "4");
    titre.setAttribute("color", "#FFAA00");
    titre.setAttribute("font", "mozillavr");
    titre.classList.add("persistent");
    container.appendChild(titre);

    // Instructions
    const panneauInstructions = document.createElement("a-text");
    panneauInstructions.setAttribute(
      "id",
      "panneau-instruction-jeu-completer-mot"
    );
    panneauInstructions.setAttribute(
      "value",
      "Des mots magiques sont incomplets !\nLance un sort sur la bonne lettre.\nTrois mots complets et tu seras apprenti sorcier !"
    );
    panneauInstructions.setAttribute("position", "0 1.20 0.5");
    panneauInstructions.setAttribute("color", "#FFFFFF");
    panneauInstructions.setAttribute("align", "center");
    panneauInstructions.setAttribute("width", "3.5");
    panneauInstructions.setAttribute("font", "mozillavr");
    panneauInstructions.classList.add("persistent");
    container.appendChild(panneauInstructions);

    // Bouton Commencer
    const boutonStart = document.createElement("a-box");
    boutonStart.setAttribute("position", "0 0.5 0.5");
    boutonStart.setAttribute("depth", "0.1");
    boutonStart.setAttribute("width", "1");
    boutonStart.setAttribute("height", "0.3");
    boutonStart.setAttribute(
      "material",
      "src: #texture-bois; repeat: 1 1; roughness: 1; metalness: 0;"
    );
    boutonStart.setAttribute("animation__hover", {
      property: "scale",
      startEvents: "mouseenter",
      to: "1.1 1.1 1.1",
      dur: 200,
    });
    boutonStart.setAttribute("animation__leave", {
      property: "scale",
      startEvents: "mouseleave",
      to: "1 1 1",
      dur: 200,
    });
    boutonStart.setAttribute("class", "clickable");

    const texteBtn = document.createElement("a-text");
    texteBtn.setAttribute("value", "Commencer\nla partie");
    texteBtn.setAttribute("align", "center");
    texteBtn.setAttribute("font", "mozillavr");
    texteBtn.setAttribute("color", "#fbe8a6");
    texteBtn.setAttribute("width", "1.8");
    texteBtn.setAttribute("position", "0 0.05 0.11");

    boutonStart.appendChild(texteBtn);
    container.appendChild(boutonStart);

    boutonStart.addEventListener("click", () => {
      container.removeChild(boutonStart);
      panneauInstructions.setAttribute("visible", "false");
      demarrerPartie();
    });

    function resetJeuMots() {
      Array.from(container.children).forEach((child) => {
        if (!child.classList.contains("persistent")) {
          container.removeChild(child);
        }
      });

      const lettresMagiques = document.getElementById("lettres-magiques");
      if (lettresMagiques) lettresMagiques.innerHTML = "";
      const parchemins = container.querySelectorAll(".parchemin-slot");
      parchemins.forEach((p) => p.setAttribute("visible", "false"));

      demarrerPartie();
    }

    function demarrerPartie() {
      const tousLesMots = [
        { mot: "C_RTE", solution: "CARTE" },
        { mot: "POT_ON", solution: "POTION" },
        { mot: "BAGUET_E", solution: "BAGUETTE" },
        { mot: "CH_PEAU", solution: "CHAPEAU" },
        { mot: "D_AGON", solution: "DRAGON" },
        { mot: "SOR_IER", solution: "SORCIER" },
        { mot: "MAG_E", solution: "MAGIE" },
        { mot: "CHAU_RON", solution: "CHAUDRON" },
        { mot: "BAL_I", solution: "BALAI" },
      ];
      const positionsY = [2.1, 1.35, 0.65];
      const lettresTrouvées = [false, false, false];
      const textesMots = [];

      const motsCibles = tousLesMots
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const parchemins = container.querySelectorAll(".parchemin-slot");
      parchemins.forEach((p) => p.setAttribute("visible", "true"));

      motsCibles.forEach((motObj, i) => {
        const text = document.createElement("a-text");
        text.setAttribute("value", motObj.mot.replace(/_/g, " _ "));
        text.setAttribute("position", `0 ${positionsY[i]} 0`);
        text.setAttribute("align", "center");
        text.setAttribute("width", "3");
        text.setAttribute("color", "#fff");
        text.setAttribute("font", "mozillavr");
        container.appendChild(text);
        textesMots.push(text);
      });

      const lettresMagiques = document.getElementById("lettres-magiques");
      const positionsBoules = [
        { x: -1.2, y: 1.2 },
        { x: 0.4, y: 1.2 },
        { x: -1.2, y: 0.6 },
        { x: 0.42, y: 0.6 },
        { x: -1.2, y: 0.01 },
        { x: 0.4, y: 0.01 },
      ];

      const lettresBonnes = motsCibles.map(
        (m) => m.solution[m.mot.indexOf("_")]
      );
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      const lettresLeurres = alphabet
        .filter((l) => !lettresBonnes.includes(l))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const lettresAUtiliser = [...lettresBonnes, ...lettresLeurres].sort(
        () => Math.random() - 0.5
      );

      positionsBoules.forEach(({ x, y }, index) => {
        const char = lettresAUtiliser[index];
        const boule = document.createElement("a-entity");
        boule.setAttribute("gltf-model", "#boule");
        boule.setAttribute("position", `${x} ${y} 0`);
        boule.setAttribute("scale", "0.05 0.05 0.05");
        boule.setAttribute("class", "lettre-clickable clickable");

        const texte = document.createElement("a-text");
        texte.setAttribute("value", char);
        texte.setAttribute("font", "mozillavr");
        texte.setAttribute("position", "0 5 1.10");
        texte.setAttribute("scale", "2 2 2");
        texte.setAttribute("width", "50");
        texte.setAttribute("align", "center");
        texte.setAttribute("color", "#000");

        boule.appendChild(texte);
        lettresMagiques.appendChild(boule);

        boule.addEventListener("click", () => {
          const lettre = texte.getAttribute("value");
          let match = false;

          for (let i = 0; i < motsCibles.length; i++) {
            if (lettresTrouvées[i]) continue;

            const indexManquant = motsCibles[i].mot.indexOf("_");

            if (motsCibles[i].solution[indexManquant] === lettre) {
              const nouveauMot =
                motsCibles[i].mot.substring(0, indexManquant) +
                lettre +
                motsCibles[i].mot.substring(indexManquant + 1);

              motsCibles[i].mot = nouveauMot;
              textesMots[i].setAttribute(
                "value",
                nouveauMot.replace(/_/g, " _ ")
              );
              lettresTrouvées[i] = !nouveauMot.includes("_");

              if (lettresTrouvées[i]) {
                effetScintillement(textesMots[i]);
                if (lettresTrouvées.every((v) => v)) {
                  afficherMessageFinal(container);
                }
              }

              lettresMagiques.removeChild(boule);
              sonSuccess.play();
              match = true;
              break;
            }
          }

          if (!match) {
            sonError.play();
            texte.setAttribute("color", "red");
            setTimeout(() => {
              texte.setAttribute("color", "#000");
            }, 400);
          }
        });
      });
    }
  },
});

window.addEventListener("load", () => {
  const scene = document.querySelector("a-scene");
  scene.addEventListener("loaded", () => {
    const zone = document.querySelector("#stand-mots");
    if (zone) zone.setAttribute("jeu-mots", "");
  });
});
