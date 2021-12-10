const getElement = (sel) => document.querySelector(sel);
const inputCanvas = getElement("#input-canvas");
const outputCanvas = getElement("#output-canvas");
const inputFOVs = document.querySelectorAll(".input-angle");
const outputFOVs = document.querySelectorAll(".output-angle");
const inputLabel = getElement("#input-label");
const outputLabel = getElement("#output-label");
const fovMode = getElement("#fov-mode");
const fovOption = getElement("#fov-option");

const inputCtx = inputCanvas.getContext("2d");
const outputCtx = outputCanvas.getContext("2d");
let image = null;
let useDiagonalFOV = true;

const validateInput = (input, fallback) => {
  if (input == "") {
    result = fallback;
  } else {
    result = parseInt(input);
  }
  if (isNaN(result)) {
    const msg = "Invalid Values!";
    alert(msg);
    throw new Error(msg);
  }
  if (result >= 180) {
    const msg = "Angles must be less than 180!";
    alert(msg);
    throw new Error(msg);
  }
  return result;
}
function getInputs() {
  let inputAngle, outputAngle;
  try {
    if (useDiagonalFOV) {
      inputAngle = validateInput(inputFOVs[0].value, 30);
      outputAngle = validateInput(outputFOVs[0].value, 20);
    } else {
      inputAngle = [validateInput(inputFOVs[0].value, 30), validateInput(inputFOVs[1].value, 30)];
      outputAngle = [validateInput(outputFOVs[0].value, 20), validateInput(outputFOVs[1].value, 20)];
    }
  } catch (err) {
    console.error(err)
    if (useDiagonalFOV) {
      inputAngle = 30;
      outputAngle = 20;
      inputFOVs[0].value = "";
      outputFOVs[0].value = "";
    } else {
      inputAngle = [30, 30];
      outputAngle = [20, 20];
      const reset = (e) => e.value = "";
      inputFOVs.forEach(reset);
      outputFOVs.forEach(reset);
    }
  }
  return [inputAngle, outputAngle];
}

function saveImage() {
  outputCanvas.toBlob(blob => {
    saveAs(blob, "simulated-fov.png");
  });
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
  if (useDiagonalFOV) {
    const inputTan = Math.tan(toRadians(inputAngle / 2));
    const outputTan = Math.tan(toRadians(outputAngle / 2));
    const scaleFactor = outputTan / inputTan;
    return [image.width * scaleFactor, image.height * scaleFactor, scaleFactor];
  } 
  
  const inputTan = [
    Math.tan(toRadians(inputAngle[0] / 2)), 
    Math.tan(toRadians(inputAngle[1] / 2))
  ];
  const outputTan = [
    Math.tan(toRadians(outputAngle[0] / 2)),
    Math.tan(toRadians(outputAngle[1] / 2))
  ];

  const width = (image.width * outputTan[0]) / (2 * inputTan[0]);
  const height = (image.height * outputTan[1]) / (2 * inputTan[1]);

  //    PURCELL
  // const distanceX = (image.width / 2) / (inputTan[0] * 2)
  // const width = (distanceX * outputTan[0]) * 2;
  // const distanceY = (image.height / 2) / (inputTan[1] * 2);
  // const height = (distanceY * outputTan[1]) * 2;

  console.log("[RESULTS]\nnew width: ", width, "\nnew height: ", height, "\noriginal width: ", image.width, "\noriginal height: ", image.height);

  return [width * 2, height * 2, null];

}

function update() {
  const [inputAngle, outputAngle] = getInputs();
  // validate angles
  if (useDiagonalFOV) {
    if (inputAngle < outputAngle) {
      alert("Output Angle must be less than input angle!");
      return;
    }
  } else {
    if (inputAngle[0] < outputAngle[0] || inputAngle[1] < outputAngle[1]) {
      alert("Output Angle must be less than input angle!");
      return;
    }
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
  if (useDiagonalFOV) {
    outputCanvas.style.width = scaleFactor * 100 + "%";
  } else {
    outputCanvas.style.width = (width / image.width) * 100 + "%";
  }
  outputCanvas.style.marginTop = (((inputCanvas.offsetHeight - outputCanvas.offsetHeight) / 2)) + "px";
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
  update();
};

// UI TOGGLE 
function toggleFOVMode() {
  useDiagonalFOV = !useDiagonalFOV;
  if (useDiagonalFOV) {
    fovMode.innerHTML = "FOV mode: diagonal";
    fovOption.innerHTML = "FOV mode: Vertical & Horizontal";
    inputFOVs[1].style.display = "none";
    outputFOVs[1].style.display = "none";
    
    inputLabel.innerHTML = "Input FOV angle: ";
    outputLabel.innerHTML = "Output FOV angle: ";
  } else {
    fovMode.innerHTML = "FOV mode: Vertical & Horizontal";
    fovOption.innerHTML = "FOV mode: diagonal";
    inputFOVs[1].style.display = "block";
    outputFOVs[1].style.display = "block";

    inputLabel.innerHTML = "Input FOV: (horizontal) (vertical) ";
    outputLabel.innerHTML = "Output FOV: (horizontal) (vertical) ";
  }
  update();
}
