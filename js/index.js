var pts = [];
var faves = [];
var faveIx = 0;
var bgColor = 0;
var blendModeNum = 2;
var strokeWeightCoef = 4;
var faveTitle = "";
var pickFaveNotRandom = true;
var shouldRun = true;
var showDebug = false;
var shouldAutoCycle = true;
var config = {
  numParticles: 15,
  doBumps: true,
  bumpV: 200
}
var centre = {
  x: 100,
  y: 100
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  faves = createFavourites();
  faveIx = pickIx(faves);
  centre = {
    x: windowWidth / 2,
    y: windowHeight / 2
  };
  restartAndReschedule();
}

function restart() {
  if (pickFaveNotRandom) {
    if (faveIx < 0) {
      chosenFave = pick(faves);
    } else {
      chosenFave = faves[faveIx];
    }
    if (!chosenFave) {
      console.log("chosen fave null! " + faveIx);
    }
    console.log("chose fave: " + chosenFave.title);
    blendModeNum = chosenFave.blendModeNum;
    f = chosenFave.from;
    t = chosenFave.to;
    faveTitle = chosenFave.title;
    bgColor = chosenFave.bgColor;
  } else {
    f = randColor();
    t = randColor();
    bgColor = pick([0, 50, 255]);
    blendModeNum = floor(random() * 14);
    faveTitle = "(generated)";
  }
  config.doBumps = pick([true, false, false]);
  if (config.doBumps) {
    strokeWeightCoef = pick([0.1, 0.2, 0.2, 0.3, 0.5]);
  } else {
    strokeWeightCoef = pick([0.1, 0.2, 0.2, 0.3, 0.5, 0.5, 0.8, 1, 1.5, 2, 3, 10]);
  }
  blendMode(REPLACE);
  background(bgColor);
  changeBlendMode(blendModeNum);
  pts = [];
  explosionRad = width / 10 + random(width / 4);
  for (i = 0; i < config.numParticles; i++) {
    pts.push(
      randParticle(centre, explosionRad));
  }
  pts = pts.map(assignNewTarget);
  pts = pts.map(function(p) {
    return assignColors(p, f, t);
  });
  if (config.doBumps) {
    bumpParticles(200);
  }
  //  loop();
}

function restartAndReschedule() {
  restart();
  setTimeout(restartAndReschedule, 5000);
}

function toggleDebug() {
  showDebug = !showDebug;
}

function toggleAutoCycle() {
  autoCycle = !autoCycle;
}

function togglePause() {
  shouldRun = !shouldRun;
  if (shouldRun) {
    loop();
  } else {
    noLoop();
  }
}

function newP(x, y) {
  return {
    x: x,
    y: y
  };
}

function mousePressed() {
  centre = {
    x: mouseX,
    y: mouseY
  };
  restart();
  //loop();
}

function mouseReleased() {
  //  noLoop();
}

function assignColors(p, f, t) {
  p.fromColor = f;
  p.toColor = t;
  return p;
}

function pickIx(arr) {
  return floor(random() * faves.length);
}

function pick(arr) {
  return arr[floor(random() * arr.length)];
}

function pickOther(arr, notThisOne) {
  //TODO: handle case when array ONLY contains references to the one we don't want.  (Infinite loop.)
  ix = arr.indexOf(notThisOne);
  if (ix === -1) {
    return arr[floor(random() * arr.length)];
  } else {
    chosenIx = floor(random() * arr.length);
    while (chosenIx === ix) {
      chosenIx = floor(random() * arr.length);
    }
    return arr[chosenIx];
  }
}

function assignNewTarget(p) {
  return p.target = pickOther(pts, p);
}

function toCartesian(rad, ang) {
  x = round(rad * cos(ang));
  y = round(rad * sin(ang));
  return newP(x, y);
}

function randColor() {
  if (random() > 0.5) {
    return pick([color('orange'),
      color('yellow'),
      color('red'),
      color('white'),
      color('blue'),
      color('pink'),
      color('purple'),
    ]);
  } else {
    return color(
      random(255),
      random(255),
      random(255));
  }
}

function randBetween(a, b) {
  return random(b - a) + a;
}

function randParticle(ctr, rad) {
  p = toCartesian(random(rad), random(radians(360)));
  x = ctr.x + p.x;
  y = ctr.y + p.y;
  return {
    x: x,
    y: y,
    prevX: x,
    prevY: y,
    vx: randBetween(-3, 3),
    vy: randBetween(-3, 3),
    fromColor: randColor(),
    toColor: randColor(),
    target: null
  };
}

function changeBlendMode(v) {
  blendModeNum = v;
  if (v === 1) {
    blendMode(BLEND);
  } else if (v === 2) {
    blendMode(ADD);
  } else if (v === 3) {
    blendMode(DARKEST);
  } else if (v === 4) {
    blendMode(LIGHTEST);
  } else if (v === 5) {
    blendMode(DIFFERENCE);
  } else if (v === 6) {
    blendMode(EXCLUSION);
  } else if (v === 7) {
    //Don't use this with a black background
    //as it will paint nothing
    blendMode(MULTIPLY);
  } else if (v === 8) {
    blendMode(SCREEN);
  } else if (v === 9) {
    blendMode(REPLACE);
  } else if (v === 10) {
    blendMode(OVERLAY);
  } else if (v === 11) {
    blendMode(HARD_LIGHT);
  } else if (v === 12) {
    blendMode(SOFT_LIGHT);
  } else if (v === 13) {
    blendMode(DODGE);
  } else if (v === 14) {
    blendMode(BURN);
  }
}

function bumpParticles(n) {
  pts = pts.map(
    function(p) {
      return bumpParticle(p, n);
    }
  );
}

function bumpParticle(p, bumpV) {
  p.vx = randBetween(-bumpV, bumpV);
  p.vy = randBetween(-bumpV, bumpV);
  return p;
}

function keyTyped() {
  v = key.charCodeAt(0) - "0".charCodeAt(0);
  if (key === "r") {
    reportColors();
  } else if (key === "f") {
    pickFaveNotRandom = !pickFaveNotRandom;
  } else if (key === "b") {
    bumpParticles(15);
  } else if (key === "c") {
    captureParticles();
  } else if (key === "p") {
    togglePause();
  } else if (key === "d") {
    toggleDebug();
  } else if (key === ",") {
    prevFave();
  } else if (key === ".") {
    nextFave();
  } else if (key === "l") {
    faves = createFavourites();
    faveIx = pickIx(faves);
  } else {
    return changeBlendMode(v);
  }
}

function captureParticles() {
  console.log("particle capture: ");
  recordedPts = pts;
  for (p of pts) {
    console.log(p);
  }
}

function nextFave() {
  faveIx = faveIx + 1;
  if (faveIx >= faves.length) {
    faveIx = 0;
  }
  restart();
}

function prevFave() {
  faveIx = faveIx - 1;
  if (faveIx < 0) {
    faveIx = faves.length - 1;
  }
  restart();
}

function rectAt(x, y, w, h) {
  rect(x - w, y - h, w, h);
}

function subtract(p1, p2) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y
  };
}

function normalise(v) {
  m = mag(v.x, v.y);
  return {
    x: v.x / m,
    y: v.y / m
  };
}

function accelTowards(p, target) {
  delta = subtract(target, p);
  delta = normalise(delta);
  p.vx = p.vx + delta.x / 5;
  p.vy = p.vy + delta.y / 5;
  p.vx = p.vx * 0.97;
  p.vy = p.vy * 0.97;
  return p;
}

function applyGravityAndBounce(p) {
  p.vy = p.vy + 0.2;
  if (p.y > 520) {
    p.vy = p.vy - 5;
  }
  if (p.x > 580 || p.x < 20) {
    p.vx = -p.vx;
  }
}

function updatePos(p, inList) {
  p.prevX = p.x;
  p.prevY = p.y;
  p.x = p.x + p.vx;
  p.y = p.y + p.vy;
  mousePoint = {
    x: mouseX,
    y: mouseY
  };

  return accelTowards(p, p.target);
}

function draw() {
  pts = pts.map(function(p) {
    return updatePos(p, pts);
  });
  stroke(255);
  strokeWeight(2);
  shouldLerpColor = true;
  for (p of pts) {
    if (shouldLerpColor) {
      c = lerpColor(p.fromColor, p.toColor, mag(p.vx, p.vy) / 4);
    } else {
      c = p.fromColor;
    }
    fill(c);
    d = mag(p.vx, p.vy) * 3;
    stroke(c);
    strokeWeight(d * strokeWeightCoef);

    line(p.prevX, p.prevY, p.x, p.y);
  }

  if (showDebug) {
    stroke(100, 255, 100);
    textSize(20);
    strokeWeight(0);
    stroke(0);
    text("bm: " + blendModeNum, 40, windowHeight - 50);
    text("w: " + strokeWeightCoef, 100, windowHeight - 50);
    text("title: " + faveTitle, 200, windowHeight - 50);
  }
}

function reportColors() {
  console.log("recording color scheme..." + new Date());

  f = pts[0].fromColor;
  t = pts[0].toColor;
  newFave = {
    from: color(red(f), green(f), blue(f)),
    to: color(red(t), green(t), blue(t)),
    title: "untitled",
    blendModeNum: blendModeNum,
    bgColor: bgColor
  }

  faves.push(newFave);
  console.log("{from: " +
    colorToStr(newFave.from) + ", to:" +
    colorToStr(newFave.to) +
    ", title: 'untitled', blendModeNum: " +
    blendModeNum + ", bgColor: " +
    bgColor + "}");
}

function colorToStr(c) {
  return "color(" + round(red(c)) + ", " + round(green(c)) + ", " + round(blue(c)) + ")";
}

function createFavourites() {
  return [{
      from: color(64, 54, 66),
      to: color(9, 46, 237),
      blendModeNum: 2,
      title: "blues",
      bgColor: 0
    }, {
      from: color(66, 44, 242),
      to: color(101, 201, 0),
      blendModeNum: 2,
      title: "neon",
      bgColor: 0
    }, {
      from: color(127, 44, 11),
      to: color(57, 105, 5),
      blendModeNum: 8,
      title: "niceGreenYellows",
      bgColor: 0
    }, {
      from: color(115, 69, 101),
      to: color(246, 168, 4),
      blendModeNum: 11,
      title: "red oranges",
      bgColor: 0
    }, {
      from: color(236, 21, 124),
      to: color(111, 138, 221),
      blendModeNum: 2,
      title: "icy",
      bgColor: 0
    }, {
      from: color(27, 194, 64),
      to: color(60, 60, 8),
      title: 'yellowgreens',
      blendModeNum: 2,
      bgColor: 0
    }, {
      from: color(153, 245, 208),
      to: color(76, 27, 97),
      title: 'black on white',
      blendModeNum: 7,
      bgColor: 255
    }, {
      from: color(70, 33, 81),
      to: color(214, 105, 132),
      title: 'pink neon/w',
      blendModeNum: 11,
      bgColor: 255
    }, {
      from: color(219, 121, 162),
      to: color(1, 164, 241),
      title: 'blue/black',
      blendModeNum: 1,
      bgColor: 0
    }, {
      from: color(224, 178, 24),
      to: color(111, 11, 113),
      title: 'funky',
      blendModeNum: 13,
      bgColor: 50
    }, {
      from: color(134, 216, 175),
      to: color(103, 85, 225),
      title: 'multiply',
      blendModeNum: 10,
      bgColor: 127
    }, {
      from: color(17, 32, 18),
      to: color(218, 62, 110),
      title: 'hotreds',
      blendModeNum: 11,
      bgColor: 255
    }, {
      from: color(144, 70, 57),
      to: color(162, 217, 174),
      title: 'coldfire',
      blendModeNum: 12,
      bgColor: 50
    }, {
      from: color(10, 101, 71),
      to: color(228, 10, 19),
      title: 'warmred',
      blendModeNum: 4,
      bgColor: 0
    }, {
      from: color(38, 131, 16),
      to: color(232, 204, 17),
      title: 'yellowgreen',
      blendModeNum: 11,
      bgColor: 50
    }, {
      from: color(251, 190, 71),
      to: color(8, 187, 177),
      title: 'yellowblue',
      blendModeNum: 11,
      bgColor: 255
    }, {
      from: color(255, 165, 0),
      to: color(255, 255, 0),
      title: 'yellowred',
      blendModeNum: 7,
      bgColor: 255
    }, {
      from: color(255, 255, 255),
      to: color(128, 0, 128),
      title: 'purpleWithHighlights',
      blendModeNum: 10,
      bgColor: 50
    }, {
      from: color(128, 0, 128),
      to: color(255, 192, 203),
      title: 'soft pink',
      blendModeNum: 3,
      bgColor: 255
    }, {
      from: color(255, 255, 255),
      to: color(255, 127, 0),
      title: 'yellowsOnBlack',
      blendModeNum: 8,
      bgColor: 0
    }, {
      from: color(1, 4, 226),
      to: color(251, 180, 90),
      title: 'yellowrust',
      blendModeNum: 13,
      bgColor: 50
    }, {
      from: color(83, 54, 217),
      to: color(116, 6, 64),
      title: 'red ink',
      blendModeNum: 11,
      bgColor: 255
    }

  ];
}