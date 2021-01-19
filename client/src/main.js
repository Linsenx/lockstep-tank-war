import { Player } from './player.js';
import { SERVER_ADDRESS, SERVER_FRAMERATE } from './const.js';

const now = () => window.performance.now();

class Game {
  ws = null;
  players = {};
  playerIds = [];
  selfId = null;

  currentFrame = 0;
  frameQueue = [];
  isSpawn = false;

  keypress = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  init() {
    this.initPIXI();
    this.initNetwork();
    this.initEvents();
    this.runLogicLoop();
  }

  initPIXI() {
    const app = new PIXI.Application({
      width: 600,
      height: 600,
      backgroundColor: 0xeeeeee,
      resolution: window.devicePixelRatio || 1,
    });
    document.body.appendChild(app.view);

    const stage = new PIXI.Container();
    app.stage.addChild(stage);

    window.app = app;
    window.stage = stage;
  }

  initNetwork() {
    this.ws = new WebSocket(SERVER_ADDRESS);

    this.ws.onopen = () => {
      const animate = () => {
        for (const id of this.playerIds) {
          this.players[id].update();
        }
        requestAnimationFrame(animate);
      };
      animate();

      this.ws.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        if (data.length > 2) {
          this.addFrames(data);
        } else {
          this.addFrames([data]);
        }
      };
    };
  }

  initEvents() {
    const KEY_TO_DIR_MAP = {
      ArrowUp: 0,
      ArrowDown: 1,
      ArrowLeft: 2,
      ArrowRight: 3,
    }
    window.addEventListener('keydown', (ev) => {
      const dir = KEY_TO_DIR_MAP[ev.key];
      if (dir !== undefined) {
        this.ws.send(`move,${this.selfId},${dir}`);
      }
    });

    window.addEventListener('keyup', (ev) => {
      this.ws.send(`stop,${this.selfId}`);
    });
  }

  onMessage(message) {
    const [cmd, ...args] = message.split(',');
    switch (cmd) {
      case 'join':
        {
          const [pid, x, y, dir] = args;
          if (!this.playerIds.includes(pid)) {
            this.playerIds.push(pid);
            this.players[pid] = new Player(pid, x, y, dir);
          }
        }
        break;

      case 'move':
      case 'stop':
        {
          const [pid, ...params] = args;
          if (this.playerIds.includes(pid)) {
            this.players[pid][`cmd_${cmd}`](...params);
          }
        }
        break;
    }
  }

  playerSpawn() {
    this.selfId = Date.now() - Math.round(Math.random() * 1000);
    window.selfId = this.selfId;
    this.ws.send(`join,${this.selfId},100,100,-1`);
  }

  addFrames(frames) {
    this.frameQueue.push(...frames);
  }

  runLogicLoop() {
    const tick = () => {
      if (this.frameQueue.length === 0) {
        return;
      }
      const frame = this.frameQueue.shift();
      frame[1].forEach((cmd) => this.onMessage(cmd));
      this.curFrame = frame[0];

      for (const id of this.playerIds) {
        this.players[id].logic();
      }
    }

    let interval = 1000 / SERVER_FRAMERATE;
    if (this.frameQueue.length > 0) {
      const queueLength = this.frameQueue.length;
      const latestFrame = this.frameQueue[queueLength - 1][0];

      const buffer = latestFrame - this.currentFrame;
      if (buffer > 10) {
        interval = 0;
        for (let i = 0; i < 10; i++) {
          tick();
        }
      } else if (buffer >= 2) {
        if (this.isSpawn === false) {
          this.playerSpawn();
          this.isSpawn = true;
        }
        tick();
      }
    }
    setTimeout(this.runLogicLoop.bind(this), interval);
  }
}

const game = new Game();
game.init();
