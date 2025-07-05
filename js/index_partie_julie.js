// ********** Jeu des 10 cubes interactifs **********

AFRAME.registerComponent('jeu-cubes', {
    init: function () {
        const container = this.el;
        let current = 1;
        let failed = false;

        // Sons interactif
        const soundTouch = document.querySelector('#sound-touch');
        const soundWin = document.querySelector('#sound-win');
        const soundLose = document.querySelector('#sound-lose');

        const cubesData = [
            { x: -3, y: 1.5, z: -1, color: 'red' },
            { x: -3.7, y: 1.5, z: -2.5, color: 'orange' },
            { x: -4.5, y: 3, z: 0, color: 'yellow' },
            { x: -0.5, y: 0.5, z: -2, color: 'green' },
            { x: -1.1, y: 2, z: 0.5, color: 'blue' },
            { x: 1.9, y: 0.3, z: 1.2, color: 'purple' },
            { x: -5, y: 0.3, z: -1.42, color: 'pink' },
            { x: -0.2, y: 2.6, z: -2.8, color: 'cyan' },
            { x: 3, y: 1.5, z: -2, color: 'lime' },
            { x: 2, y: 3.5, z: 2, color: 'magenta' }
        ];

        const resetCubes = () => {
        current = 1;
        failed = false;
        container.innerHTML = '';

        cubesData.forEach((data, i) => {
            const cubeNumber = i + 1;
            const cube = document.createElement('a-box');

            cube.setAttribute('position', `${data.x} ${data.y} ${data.z}`);
            cube.setAttribute('depth', '0.5');
            cube.setAttribute('height', '0.5');
            cube.setAttribute('width', '0.5');
            cube.setAttribute('color', data.color);
            cube.setAttribute('class', 'clickable');

            // Chiffre sur les 4 faces
            const faces = [
                { rotation: '0 0 0',    position: '0 0 0.26' },
                { rotation: '0 90 0',   position: '0.26 0 0' },
                { rotation: '0 180 0',  position: '0 0 -0.26' },
                { rotation: '0 -90 0',  position: '-0.26 0 0' }
            ];

            faces.forEach(f => {
                const label = document.createElement('a-text');
                label.setAttribute('value', cubeNumber);
                label.setAttribute('align', 'center');
                label.setAttribute('color', 'white');
                label.setAttribute('width', '3,5');
                label.setAttribute('position', f.position);
                label.setAttribute('rotation', f.rotation);
                cube.appendChild(label);
            });

            // Gestion du clic sur les cubes
            cube.addEventListener('click', function () {
                if (failed) return;

                if (cubeNumber === current) {
                    cube.remove();

                    // Quand un cube est touché
                    if (soundTouch && soundTouch.components.sound) {
                        soundTouch.components.sound.playSound();
                    }

                    current++;
                    if (current > cubesData.length) {
                        // Musique de victoire
                        if (soundWin && soundWin.components.sound) {
                            soundWin.components.sound.playSound();
                        }

                        alert("Bravo ! \nTu as réussi à toucher les 10 cubes dans l'ordre ! =D");

                        setTimeout(resetCubes, 5000); // Recommence après 5s
                    }
                } else {
                        failed = true;
                        // Musique de défaite
                        if (soundLose && soundLose.components.sound) {
                            soundLose.components.sound.playSound();
                        }

                        alert("Raté ! \nTu n'as pas cliqué dans l'ordre. Retente ta chance ! \nLes cubes réapparaissent dans 5 sec...");
                        container.innerHTML = '';

                        setTimeout(resetCubes, 5000); // Recommence après 5s
                    }
                });

                container.appendChild(cube);
            });
        };

        resetCubes();
    }
});

// Ajout des 10 cubes au HTML
window.addEventListener('load', () => {
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', () => {
        const cubesZone = document.querySelector('#cubes-jeu');
        if (cubesZone) cubesZone.setAttribute('jeu-cubes', '');
    });
});



// ********** Jeu du grimoire **********

const panneau = document.querySelector('#panneau-jeu-grimoire');
const formesExemple = document.querySelector('#formes-exemple');
const formesTest = document.querySelector('#formes');
const btnDemarrer = document.querySelector('#btn-demarrer');
const btnStart = document.querySelector('#btn-start');

AFRAME.registerComponent('lancement-jeu-grimoire', {
    init: function () {

        btnDemarrer.addEventListener('click', () => {
            panneau.setAttribute('visible', 'true');
            formesExemple.setAttribute('visible', 'true');
            btnStart.setAttribute('visible', 'true');
            btnDemarrer.setAttribute('visible', 'false');
        });
    }
});

AFRAME.registerComponent('jeu-grimoire', {
    init: function () {
        // Sons interactif
        const soundTouch = document.querySelector('#sound-touch');
        const soundWin = document.querySelector('#sound-win');
        const soundLose = document.querySelector('#sound-lose');

        // Suite de formes à retenir
        const bonneSequence = ['a-box', 'a-sphere', 'a-cone', 'a-cylinder'];
        let reponseJoueur = [];

        // Fonction qui compare les formes d'exemple et de test
        const haveSameContents = (a, b) =>
        a.length === b.length &&
        [...new Set([...a, ...b])].every(
            v => a.filter(e => e === v).length === b.filter(e => e === v).length
        );

        // Cache les formes d'exemple et montre les formes de test
        btnStart.addEventListener('click', () => {
            formesExemple.setAttribute('visible', 'false');
            formesTest.setAttribute('visible', 'true');
            btnStart.setAttribute('visible', 'false');
        });

        // Gestion des clics sur les formes
        document.querySelectorAll('#formes > .clickable').forEach(forme => {
            forme.addEventListener('click', () => {
                const formeCliquee = forme.tagName.toLowerCase();
                reponseJoueur.push(formeCliquee);

                // Musique de clic sur une forme
                if (soundTouch && soundTouch.components.sound) {
                    soundTouch.components.sound.playSound();
                }

                // Si clic sur la forme piège = perdu
                if (bonneSequence.includes(formeCliquee) == false) {
                    // Musique de défaite
                    if (soundLose && soundLose.components.sound) {
                        soundLose.components.sound.playSound();
                    }
                    alert("Raté ! Retente ta chance !");

                    // Réinitialisation
                    reponseJoueur = [];
                    formesExemple.setAttribute('visible', 'false');
                    formesTest.setAttribute('visible', 'false');
                    panneau.setAttribute('visible', 'false');
                    btnStart.setAttribute('visible', 'false');
                    btnDemarrer.setAttribute('visible', 'true');
                    return;
                }


                // Vérif quand les 4 formes sont cliquées
                if (reponseJoueur.length === 4) {
                    if (haveSameContents(reponseJoueur, bonneSequence)) {
                        // Victoire
                        if (soundWin && soundWin.components.sound) {
                            soundWin.components.sound.playSound();
                        }
                        alert("Bravo ! Tu as retrouvé toutes les formes ! =D");

                    } else {
                        // Défaite
                        if (soundLose && soundLose.components.sound) {
                            soundLose.components.sound.playSound();
                        }
                        alert("Raté ! Retente ta chance !");
                    }

                    // Réinitialisation
                    reponseJoueur = [];
                    formesExemple.setAttribute('visible', 'false');
                    formesTest.setAttribute('visible', 'false');
                    panneau.setAttribute('visible', 'false');
                    btnStart.setAttribute('visible', 'false');
                    btnDemarrer.setAttribute('visible', 'true');
                    return;
                }
            });
        });
    }
});