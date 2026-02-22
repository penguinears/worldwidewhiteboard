#window.onload = function () {

  // Firebase config (your project)
  var firebaseConfig = {
    apiKey: "AIzaSyBMAFSxXeDkSNVuKRLbVWrkFQCOjmNcdgM",
    authDomain: "studio-455799439-399e9.firebaseapp.com",
    databaseURL: "https://studio-455799439-399e9-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "studio-455799439-399e9",
    storageBucket: "studio-455799439-399e9.firebasestorage.app",
    messagingSenderId: "462470140143",
    appId: "1:462470140143:web:4d96f9668c0816ab45cb1a"
  };

  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();

  // UI
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="title_container">
      <h1 id="title">WORLD WIDE WHITEBOARD</h1>
    </div>

    <div id="chat_container">
      <div id="chat_inner_container">

        <canvas id="board" width="900" height="500"></canvas>

        <button id="clearBtn">Clear Board</button>

      </div>
    </div>
  `;

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");

  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function drawLine(x1, y1, x2, y2, color="#000", size=3) {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  canvas.addEventListener("mousedown", e => {
    drawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
  });

  canvas.addEventListener("mouseup", () => drawing = false);
  canvas.addEventListener("mouseleave", () => drawing = false);

  canvas.addEventListener("mousemove", e => {
    if (!drawing) return;

    let x = e.offsetX;
    let y = e.offsetY;

    drawLine(lastX, lastY, x, y);

    db.ref("whiteboard/lines").push({
      x1: lastX, y1: lastY,
      x2: x, y2: y,
      color: "#000",
      size: 3
    });

    lastX = x;
    lastY = y;
  });

  db.ref("whiteboard/lines").on("child_added", snap => {
    const d = snap.val();
    drawLine(d.x1, d.y1, d.x2, d.y2, d.color, d.size);
  });

  document.getElementById("clearBtn").onclick = () => {
    db.ref("whiteboard").set({});
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

};
