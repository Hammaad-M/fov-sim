const getElement = (sel) => document.querySelector(sel);
const inputCanvas = getElement("#input-canvas");
const outputCanvas = getElement("#output-canvas");
const inputFOV = getElement("#input-angle");
const outputFOV = getElement("#output-angle");
const inputCtx = inputCanvas.getContext("2d");
const outputCtx = outputCanvas.getContext("2d");
let image = null;

function getInputs() {
  let inputAngle, outputAngle;
  try {
    inputAngle = inputFOV.value;
    outputAngle = outputFOV.value;
    if (inputAngle == "") {
      inputAngle = 30;
    } else {
      inputAngle = parseInt(inputAngle);
    }
    if (outputAngle == "") {
      outputAngle = 20;
    } else {
      outputAngle = parseInt(outputAngle);
    }
    if (isNaN(inputAngle) || isNaN(outputAngle)) {
      throw new Error();
    }
  } catch (err) {
    alert("Invalid Values!");
    inputAngle = temp[0];
    outputAngle = temp[1];
  }
  return [inputAngle, outputAngle];
}

function readImage() {
  if (!this.files || !this.files[0]) return;
  const FR = new FileReader();
  FR.addEventListener("load", (evt) => {
    const img = new Image();
    img.addEventListener("load", () => {
      image = img;
      update();
    });
    img.src = evt.target.result;
  });
  FR.readAsDataURL(this.files[0]);
}

const toRadians = (degrees) => (degrees * Math.PI) / 180;
function getNewImageSize(inputAngle, outputAngle) {
  const inputTan = Math.tan(toRadians(inputAngle / 2));
  const outputTan = Math.tan(toRadians(outputAngle / 2));
  const scaleFactor = outputTan / inputTan;
  return [image.width * scaleFactor, image.height * scaleFactor, scaleFactor];
}

function update() {
  const [inputAngle, outputAngle] = getInputs();
  if (inputAngle < outputAngle) {
    alert("Input angle must be less than output angle!");
  }
  const [width, height, scaleFactor] = getNewImageSize(inputAngle, outputAngle);
  const leftOffset = (image.width - width) / 2;
  const topOffset = (image.height - height) / 2;
  resizeCanvas(image.width, image.height, inputCanvas);
  resizeCanvas(width, height, outputCanvas);
  clearCanvases(inputCtx, outputCtx);
  inputCtx.drawImage(image, 0, 0);
  inputCtx.strokeStyle = "#0F0";
  inputCtx.lineWidth = inputCanvas.width * 0.005;
  const cropRect = [leftOffset, topOffset, width, height];
  inputCtx.strokeRect(...cropRect);
  outputCtx.drawImage(image, ...cropRect, 0, 0, width, height);
  outputCanvas.style.width = scaleFactor * 100 + "%";
  outputCanvas.style.marginTop = (img.height - height) / 2 + "px";
}

function resizeCanvas(width, height, canvas) {
  canvas.width = width;
  canvas.height = height;
}
function clearCanvases(...canvases) {
  canvases.forEach((ctx) =>
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  );
}
getElement("#image-upload").addEventListener("change", readImage);

document.body.onload = () => {
  image = getElement("#temp");
  update(30, 20);
};
