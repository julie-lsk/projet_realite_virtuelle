// Ajout du mini-jeu des 10 cubes interactifs
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