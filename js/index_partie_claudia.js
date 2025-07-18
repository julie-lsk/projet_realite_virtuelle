import '../block-claudia/barrel-game/barrel-game-component.js';

window.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  if (!sceneEl) return;

  // Setup téléport sur le cube
  const rig      = sceneEl.querySelector('#cameraRig');
  const teleport = sceneEl.querySelector('#teleport-barrel');
  if (rig && teleport) {
    teleport.addEventListener('click', () => {
      rig.setAttribute('position', '-9.951 4.731 8.307');
      rig.setAttribute('rotation', '0 20 0');
    });
  }
});
