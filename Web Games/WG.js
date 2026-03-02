const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const parts = document.querySelectorAll(".part");
const slots = document.querySelectorAll(".slot");
const desc = document.getElementById("desc");

let model;
let grabbed = false;
let activePart = null;

let smoothX = 0;
let smoothY = 0;

const params = {
  flipHorizontal: true,
  maxNumBoxes: 1,
  scoreThreshold: 0.9
};

handTrack.startVideo(video).then(status => {
  if(status){
    handTrack.load(params).then(m => {
      model = m;
      detect();
    });
  } else {
    alert("Camera failed to start");
  }
});

function detect(){
  model.detect(video).then(predictions => {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(predictions.length > 0){

      let [x, y, w, h] = predictions[0].bbox;

      let targetX = x + w/2;
      let targetY = y + h/2;

      smoothX += (targetX - smoothX) * 0.25;
      smoothY += (targetY - smoothY) * 0.25;

      drawCursor(smoothX, smoothY);
      detectGesture(w, h);
      dragPart(smoothX, smoothY);
    }

    requestAnimationFrame(detect);
  });
}

function drawCursor(x, y){
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
}

function detectGesture(w, h){
  const size = w * h;

  if(size < 20000) grabbed = true;

  if(size > 40000) grabbed = false;
}

function dragPart(x, y){

  parts.forEach(part => {
    const rect = part.getBoundingClientRect();

    if(x > rect.left && x < rect.right &&
       y > rect.top && y < rect.bottom){

      desc.style.display = "block";
      desc.innerHTML = part.dataset.name;
      activePart = part;
    }
  });

  if(grabbed && activePart){
    activePart.style.left = (x - 55) + "px";
    activePart.style.top  = (y - 55) + "px";
  }

  slots.forEach(slot => {
    const s = slot.getBoundingClientRect();

    if(grabbed && activePart &&
       x > s.left && x < s.right &&
       y > s.top && y < s.bottom){

      if(activePart.dataset.name === slot.dataset.part){
        activePart.style.left = s.left + "px";
        activePart.style.top  = s.top  + "px";

        activePart.classList.add("placed");
        desc.innerHTML = "Correct!";
        grabbed = false;
        activePart = null;
      } else {
        desc.innerHTML = "Wrong slot!";
      }
    }
  });
}