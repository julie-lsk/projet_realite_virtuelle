AFRAME.registerComponent("jeu-memoire", {
  init: function () {
    const container = this.el;

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
        id: "parchemin",
        src: "#parchemin",
        scale: "0.0010 0.0010 0.0010",
        rotation: "0 90 0",
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

    // On met les instructions visibles au début
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

    const afficherBoutonCommencer = () => {
      const boutonStart = document.createElement("a-box");
      boutonStart.setAttribute("position", "0 0.5 1");
      boutonStart.setAttribute("depth", "0.2");
      boutonStart.setAttribute("width", "1.2");
      boutonStart.setAttribute("height", "0.3");
      boutonStart.setAttribute("color", "#5c3a21");
      boutonStart.setAttribute("material", "shader: flat; roughness: 1;");
      boutonStart.setAttribute(
        "geometry",
        "primitive: box; depth: 0.1; height: 0.3; width: 1.2;"
      );
      boutonStart.setAttribute("class", "clickable");

      const texteBtn = document.createElement("a-text");
      texteBtn.setAttribute("value", "Commencer la partie");
      texteBtn.setAttribute("align", "center");
      texteBtn.setAttribute("font", "mozillavr");
      texteBtn.setAttribute("color", "#fbe8a6");
      texteBtn.setAttribute("width", "1.8");
      texteBtn.setAttribute("position", "0 0 0.11");

      boutonStart.appendChild(texteBtn);
      container.appendChild(boutonStart);

      boutonStart.addEventListener("click", () => {
        container.removeChild(boutonStart);
        panneauInstructions.setAttribute("visible", "false");
        resetJeu();
      });
    };

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
                message.setAttribute("color", "#FFD700");
                message.setAttribute("position", "0 1 1");
                message.setAttribute("visible", true);

                objetsChoix.forEach((el) => el.removeAttribute("class"));
                const bouton = document.createElement("a-box");
                bouton.setAttribute("position", "0 0.5 1");
                bouton.setAttribute("depth", "0.1");
                bouton.setAttribute("height", "0.3");
                bouton.setAttribute("width", "1.2");
                bouton.setAttribute("color", "#5c3a21");
                bouton.setAttribute("material", "shader: flat; roughness: 1;");
                bouton.setAttribute(
                  "geometry",
                  "primitive: box; depth: 0.1; height: 0.3; width: 1.2;"
                );
                bouton.setAttribute("class", "clickable");

                const texteBtn = document.createElement("a-text");
                texteBtn.setAttribute("value", "Recommencer");
                texteBtn.setAttribute("align", "center");
                texteBtn.setAttribute("font", "mozillavr");
                texteBtn.setAttribute("color", "#fbe8a6");
                texteBtn.setAttribute("width", "1.8");
                texteBtn.setAttribute("position", "0 0 0.11");
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
