const RAD = Math.PI / 180;

// UP DOWN LEFT RIGHT
const dirs = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

const angles = [0, 180, 270, 90];

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

class Player {
  pid = 0;
  dir = 0;
  logicX = 0;
  logicY = 0;
  predictX = 0;
  predictY = 0;

  sprite = null;

  constructor(pid, x, y, dir) {
    this.pid = pid;
    this.dir = +dir;
    this.logicX = +x;
    this.logicY = +y;

    this.sprite = new PIXI.Container();
    window.stage.addChild(this.sprite);

    const graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x555555);
    graphics.beginFill(0xcccccc);
    graphics.drawRect(0, 0, 50, 50);
    graphics.beginFill(0x666666);
    graphics.drawRect(20, -20, 10, 40);
    graphics.endFill();

    this.sprite.pivot.x = 25;
    this.sprite.pivot.y = 25;
    this.sprite.x = +x;
    this.sprite.y = +y;
    this.sprite.roration = angles[this.dir] * RAD;
    this.sprite.addChild(graphics);

    if (+pid !== +window.selfId) {
      console.log(pid, window.selfId)
      this.sprite.alpha = 0.5;
    }

    this.shadow = new PIXI.Container();
    window.stage.addChild(this.shadow);
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0xffffff);
    shadow.drawRect(0, 0, 50, 50);
    shadow.endFill();
    this.shadow.pivot.x = 25;
    this.shadow.pivot.y = 25;
    this.shadow.alpha = 0.0;
    this.shadow.addChild(shadow);
  }

  cmd_move(dir) {
    this.dir = dir;
    this.sprite.rotation = angles[this.dir] * RAD;
  }

  cmd_stop() {
    this.dir = -1;
    this.logicA = 0;
  }

  logic() {
    if (this.dir !== -1) {
      this.logicX = this.logicX + 10 * dirs[this.dir][0];
      this.logicY = this.logicY + 10 * dirs[this.dir][1];
      this.shadow.x = this.logicX;
      this.shadow.y = this.logicY;
      // this.jiucuo();
    }
  }

  update(dt = 1) {
    this.sprite.x = lerp(this.sprite.x, this.logicX, 0.1);
    this.sprite.y = lerp(this.sprite.y, this.logicY, 0.1);
    // console.log(1, 'window.dir',window.dir)
    // if (window.dir && window.dir !== -1) {
    //   this.sprite.x += (6/6) * dirs[window.dir][0];
    //   this.sprite.y += (6/6) * dirs[window.dir][1];
    // }
  }

  jiucuo() {
    console.log(this.sprite.x,this.sprite.y,this.logicX,this.logicY)
    if (this.sprite.x !== this.logicX || this.sprite.y !== this.logicY) {
      this.sprite.x = this.logicX;
      this.sprite.y = this.logicY;
    }
  }
}

export { Player };
