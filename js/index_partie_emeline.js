AFRAME.registerComponent("jeu-memoire", {
  init: function () {
    const container = this.el;

    const bonsObjets = [
      { shape: "cylinder", color: "#FF00FF" },
      { shape: "box", color: "#8B0000" },
      { shape: "cylinder", color: "#FFD700" },
      { shape: "sphere", color: "#FF0000" },
    ];

    const leurres = [
      { shape: "box", color: "#00FFFF" },
      { shape: "box", color: "#228B22" },
      { shape: "box", color: "#A52A2A" },
      { shape: "box", color: "#F0E68C" },
    ];

    const objetsMemo = [];
    const objetsChoix = [];

    // Instructions visibles au début
    const panneauInstructions = document.createElement("a-text");
    panneauInstructions.setAttribute(
      "value",
      "Observe bien les objets du marchand...\nIls disparaîtront bientôt !"
    );
    panneauInstructions.setAttribute("position", "0 1.3 1.2");
    panneauInstructions.setAttribute("color", "#FFFFFF");
    panneauInstructions.setAttribute("align", "center");
    panneauInstructions.setAttribute("width", "3");
    panneauInstructions.setAttribute("font", "mozillavr");
    container.appendChild(panneauInstructions);

    const message = document.createElement("a-text");
    message.setAttribute("id", "message-feedback");
    message.setAttribute("value", "");
    message.setAttribute("visible", "false");
    message.setAttribute("position", "0 1.6 1.2");
    message.setAttribute("align", "center");
    message.setAttribute("width", "3");
    message.setAttribute("font", "mozillavr");
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

    const resetJeu = () => {
      container.innerHTML = "";
      bonsChoixTrouvés = [];
      victoire = false;

      container.appendChild(panneauInstructions);
      container.appendChild(message);

      bonsObjets.forEach((obj, i) => {
        const ent = document.createElement(`a-${obj.shape}`);
        ent.setAttribute("color", obj.color);
        ent.setAttribute("position", `${-0.7 + i * 0.5} 0.6 0`);
        ent.setAttribute("scale", "0.3 0.3 0.3");
        ent.setAttribute("visible", true);
        ent.setAttribute("id", `obj-memo-${i + 1}`);
        container.appendChild(ent);
        objetsMemo.push(ent);
      });

      const tousObjets = [...bonsObjets, ...leurres].sort(
        () => Math.random() - 0.5
      );

      tousObjets.forEach((obj, i) => {
        const ent = document.createElement(`a-${obj.shape}`);
        ent.setAttribute("color", obj.color);
        ent.setAttribute("position", `${-1.4 + i * 0.4} 0.7 1.5`);
        ent.setAttribute("scale", "0.3 0.3 0.3");
        ent.setAttribute("visible", false);
        ent.setAttribute("class", "clickable");
        ent.setAttribute("id", `choix-${i + 1}`);
        container.appendChild(ent);
        objetsChoix.push(ent);

        ent.addEventListener("click", () => {
          if (victoire || !ent.getAttribute("visible")) return;

          const estBon = bonsObjets.some(
            (o) => o.shape === obj.shape && o.color === obj.color
          );

          if (estBon) {
            ent.setAttribute("color", "#00FF00");
            soundCorrect.components.sound.stopSound();
            soundCorrect.components.sound.playSound();
            afficherMessageTemporaire(
              "Bravo ! Tu as une mémoire digne d’un mage !",
              "#00FF00"
            );

            if (!bonsChoixTrouvés.includes(ent)) {
              bonsChoixTrouvés.push(ent);
            }

            if (bonsChoixTrouvés.length === 4) {
              victoire = true;
              soundWin.components.sound.stopSound();
              soundWin.components.sound.playSound();
              afficherMessageTemporaire(
                "🎉 Tu as retrouvé tous les bons objets !",
                "#FFD700",
                5000
              );

              objetsChoix.forEach((el) => el.removeAttribute("class"));

              const bouton = document.createElement("a-box");
              bouton.setAttribute("position", "0 1.2 1");
              bouton.setAttribute("depth", "0.2");
              bouton.setAttribute("height", "0.4");
              bouton.setAttribute("width", "1.5");
              bouton.setAttribute("color", "#3366FF");
              bouton.setAttribute("class", "clickable");

              const texteBtn = document.createElement("a-text");
              texteBtn.setAttribute("value", "Recommencer");
              texteBtn.setAttribute("align", "center");
              texteBtn.setAttribute("color", "white");
              texteBtn.setAttribute("position", "0 0 0.11");
              texteBtn.setAttribute("width", "2");
              bouton.appendChild(texteBtn);

              bouton.addEventListener("click", resetJeu);
              container.appendChild(bouton);
            }
          } else {
            ent.setAttribute("color", "#FF0000");
            soundWrong.components.sound.stopSound();
            soundWrong.components.sound.playSound();
            afficherMessageTemporaire(
              "Ce n’était pas exactement ça…",
              "#FF0000"
            );
          }
        });
      });

      setTimeout(() => {
        objetsMemo.forEach((el) => el.setAttribute("visible", false));
        objetsChoix.forEach((el) => el.setAttribute("visible", true));
      }, 5000);
    };

    resetJeu();
  },
});

window.addEventListener("load", () => {
  const scene = document.querySelector("a-scene");
  scene.addEventListener("loaded", () => {
    const zone = document.querySelector("#stand-memoire");
    if (zone) zone.setAttribute("jeu-memoire", "");
  });
});
