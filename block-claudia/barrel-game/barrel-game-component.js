/* 1) Composant de chute manuelle */
AFRAME.registerComponent('fall', {
  schema: { speed: { type: 'number', default: 0.002 } }, // ~2 m/s
  tick(time, delta) {
    const step = this.data.speed * delta;
    const pos  = this.el.getAttribute('position');
    this.el.setAttribute('position', {
      x: pos.x,
      y: pos.y - step,
      z: pos.z
    });
  }
});

/* 2) Composant de capture des boules */
AFRAME.registerComponent('catch-balls', {
  init() {
    this.barrel = document.querySelector('#barrel');
    this.bb     = new THREE.Box3().setFromObject(this.barrel.object3D);
  },
  tick() {
    document.querySelectorAll('a-sphere.game-ball').forEach(ballEl => {
      const p = new THREE.Vector3();
      ballEl.object3D.getWorldPosition(p);
      this.bb.setFromObject(this.barrel.object3D);

      if (
        p.x >= this.bb.min.x && p.x <= this.bb.max.x &&
        p.z >= this.bb.min.z && p.z <= this.bb.max.z &&
        p.y <= this.bb.max.y
      ) {
        const pts = parseInt(ballEl.getAttribute('data-points'), 10) || 0;
        this.el.emit('ball-caught', { points: pts });
        ballEl.remove();
      }

      if (p.y < this.bb.min.y - 1) {
        ballEl.remove();
      }
    });
  }
});

/* 3) Composant principal du jeu */
AFRAME.registerComponent('barrel-game', {
  init() {
    const sceneEl     = this.el.sceneEl;
    let barrel, startBtn;
    let score         = 0;
    let isRunning     = false;
    const durationMs  = 180000;
    let startTS, fallInterval, timerInterval;
    const step        = 0.3;

    // — Panneau d’instructions —
    const instr = sceneEl.querySelector('#game-instructions');
    const pPlane = instr.querySelector('a-plane');
    pPlane.setAttribute('material','color:#000;opacity:0.6;shader:flat');
    pPlane.setAttribute('width','1.8');
    pPlane.setAttribute('height','2.2');
    instr.querySelectorAll('a-text').forEach(el=>el.remove());
    const mk = attrs => {
      const t = document.createElement('a-text');
      Object.entries(attrs).forEach(([k,v])=>t.setAttribute(k,v));
      instr.appendChild(t);
      return t;
    };
    mk({value:'Deplacement : <- / ->', color:'#FFF', align:'center', width:'1.6', position:'0 0.9 0.01'});
    mk({value:'Points :\n● Jaune : +20\n● Rouge : −5\n● Vert  : +50', color:'#FFF', align:'left', width:'1.6', position:'-0.8 0.4 0.01'});
    const scoreText = mk({id:'score-instr', value:'Score : 0', color:'#FFF', align:'left', width:'1.6', position:'-0.8 0.0 0.01'});
    const timeText  = mk({id:'time-instr', value:'Temps : 03:00', color:'#FFF', align:'left', width:'1.6', position:'-0.8 -0.3 0.01'});
    function fmt(ms) {
      const t = Math.ceil(ms/1000);
      return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
    }

    function updScore(pts) {
      score += pts;
      scoreText.setAttribute('value', `Score : ${score}`);
    }

    // — Après chargement de la scène —
    sceneEl.addEventListener('loaded', () => {
      barrel   = sceneEl.querySelector('#barrel');
      startBtn = sceneEl.querySelector('#start-button');

      sceneEl.querySelector('#ring-container').setAttribute('catch-balls','');
      sceneEl.querySelector('#ring-container').addEventListener('ball-caught', e => {
        updScore(e.detail.points);
      });

      if (startBtn) {
        startBtn.addEventListener('click', startGame);
        window.addEventListener('keydown', e => { if (e.code==='Space') startGame(); });
      }
    });

    // — Création des boules —
    function createBall(color, points) {
      const worldPos = new THREE.Vector3();
      barrel.object3D.getWorldPosition(worldPos);

      const spawnX = worldPos.x;
      const spawnZ = worldPos.z + (-1 + Math.random()*2);
      const spawnY = worldPos.y + 5.0;

      const ball = document.createElement('a-sphere');
      ball.classList.add('game-ball');
      ball.setAttribute('radius','0.1');
      ball.setAttribute('material', `shader:standard; color:${color}`);
      ball.setAttribute('position', `${spawnX} ${spawnY} ${spawnZ}`);
      ball.setAttribute('fall', 'speed:0.002');
      ball.setAttribute('data-points', points);

      sceneEl.appendChild(ball);
    }

    // — Fin de partie —
    function endGame() {
      isRunning = false;
      clearInterval(fallInterval);
      clearInterval(timerInterval);
      alert(`Fin du jeu ! Score final : ${score}`);
    }

    // — Démarrage —
    function startGame() {
      if (isRunning) return;
      isRunning = true;
      score     = 0;
      startTS   = Date.now();
      scoreText.setAttribute('value', 'Score : 0');
      timeText .setAttribute('value', `Temps : ${fmt(durationMs)}`);
      sceneEl.querySelector('#barrel-instruction').setAttribute('visible', 'false');

      fallInterval = setInterval(() => {
        const r = Math.random();
        if (r < 0.6)      createBall('yellow', 20);
        else if (r < 0.8) createBall('red',   -5);
        else              createBall('green',50);
      }, 800);

      timerInterval = setInterval(() => {
        const rem = durationMs - (Date.now() - startTS);
        if (rem <= 0) endGame();
        else          timeText.setAttribute('value', `Temps : ${fmt(rem)}`);
      }, 250);
    }

    // — Déplacement ← / → —
    window.addEventListener('keydown', e => {
      if (!isRunning || !barrel) return;
      const p = barrel.getAttribute('position');
      if (e.key === 'ArrowLeft')  barrel.setAttribute('position', `${p.x} ${p.y} ${p.z - step}`);
      if (e.key === 'ArrowRight') barrel.setAttribute('position', `${p.x} ${p.y} ${p.z + step}`);
    });
  }
});
