import "./styles.css";
import { fabric } from "fabric";
import tingle from "./tingle.min.js";
import productConfig from "./product.config";

console.log(productConfig);

/**
 * fabric.js template for bug reports
 *
 * Please update the name of the jsfiddle (see Fiddle Options).
 * This templates uses latest dev verison of fabric.js (https://rawgithub.com/kangax/fabric.js/master/dist/fabric.js).
 */

var bgColor = document.getElementById("bg-color");

// Global variables
var canvasAreaWidth = 800;
var canvasAreaHeight = 800;

var canvases = [];
var activeCanvas = null;
var activeColor = null;
var activeSide = null;

async function loadProduct() {
  var designerArea = document.getElementById("designer-area");
  var sideSwitcher = document.getElementById("side-switcher");
  var canvasesContainer = document.getElementById("canvases");

  var printSize = productConfig.printSize;
  var aspectRatio = parseFloat((printSize.width / printSize.height).toFixed(2));

  try {
    if (productConfig.sides) {
      // For each side
      var side;
      for (side in productConfig.sides) {
        var sideConfig = productConfig.sides[side];
        var boundingBox = sideConfig.boundingBox;

        var switchBtn = document.createElement("div");
        switchBtn.className = "button small";
        switchBtn.innerText = side;
        switchBtn.setAttribute("data-side", side);
        sideSwitcher.children[0].appendChild(switchBtn);

        // Create the layers canvas
        var layerscanvasEl = document.createElement("canvas");
        layerscanvasEl.id = "layers--" + side;
        layerscanvasEl.className = "layers";
        layerscanvasEl.width = canvasAreaWidth;
        layerscanvasEl.height = canvasAreaHeight;
        layerscanvasEl.setAttribute("ref", side);

        // Insert the layers canvas
        canvasesContainer.appendChild(layerscanvasEl);

        var layersCanvas = new fabric.StaticCanvas(layerscanvasEl, {
          side: side,
          name: "static-" + side
        });

        var c = document.createElement("canvas");
        c.width = canvasAreaWidth;
        c.height = canvasAreaHeight;
        c.setAttribute("data-title", side);

        // Insert the canvas
        canvasesContainer.appendChild(c);

        // initialize fabric canvas and assign to global windows object for debug
        var canvas = new fabric.Canvas(c, {
          controlsAboveOverlay: true,
          name: side,
          side: side
        });

        canvases.push(layersCanvas);
        canvases.push(canvas);

        initCanvas(canvas, {
          boundingBox,
          sideConfig,
          printSize,
          aspectRatio
        });

        // Load the product layers
        try {
          if (productConfig.sides[side].layers) {
            var layer;
            for (layer in productConfig.sides[side].layers) {
              var url = productConfig.sides[side].layers[layer];
              console.log(layer, url);
              loadLayer(side, url);
            }
          } else {
            throw new Error("Product doesn't have any layers defined.");
          }
        } catch (e) {
          console.error("Error building the product layers " + e.message);
        }
      }

      // Set the active canvas to the firts one
      selectSide(Object.keys(productConfig.sides)[0]);
    } else {
      // initialize fabric canvas and assign to global windows object for debug
      var c2 = document.createElement("canvas");
      c2.width = 800;
      c2.height = 800;
      canvasesContainer.appendChild(c);
      activeCanvas = window._canvas = new fabric.Canvas(c, {
        controlsAboveOverlay: true
      });
    }
  } catch (e) {
    console.error("Error building the canvas(s) " + e.message);
  }

  try {
    buildColors();
  } catch (e) {
    console.log("Error building product colors " + e.message);
  }
}

function initCanvas(canvas, config) {
  if (canvas && canvas instanceof fabric.Canvas) {
    var aspectRatio = config.aspectRatio;
    var boundingBox = config.boundingBox;
    var scale = boundingBox.sizeScalePercentage;
    var position = boundingBox.position;

    var width = Math.round((canvasAreaWidth * scale) / 100);
    var height = Math.round(width / aspectRatio);

    var left = (canvasAreaWidth * position.x) / 100;
    var top = (canvasAreaHeight * position.y) / 100;

    console.log(width);
    console.log(height);

    // Create the editable area
    var areaClip = canvas.createRect(
      width,
      height,
      {
        // top: 160,
        // left: 280,
        left: left,
        top: top,
        fill: "rgba(0,0,0,0)",
        strokeWidth: 3,
        stroke: "black",
        name: "area:clip",
        evented: false,
        selectable: false,
        hasControls: false
      },
      false
    );

    canvas.createRect(width, height, {
      // top: 160,
      // left: 280,
      left: left,
      top: top,
      fill: "rgba(0,0,0,0)",
      strokeWidth: 3,
      stroke: "rgb(64, 169, 243)",
      name: "area:border",
      opacity: 0,
      evented: false,
      selectable: false,
      hasControls: false
    });

    canvas.clipPath = areaClip;
    canvas.renderAll();

    canvas.on("mouse:down", function() {
      var border = getObject("area:border");
      console.log(border);
      border.set("opacity", 1);
      canvas.requestRenderAll();
    });
    canvas.on("mouse:up", function() {
      var border = getObject("area:border");
      border.set("opacity", 0);
      canvas.requestRenderAll();
      console.log("mouse up");
    });

    canvas.on("object:added", function(e) {
      var obj = e.target;
      obj.scaleToWidth(areaClip.width);
      obj.set({
        left: areaClip.get("left") + areaClip.width / 2,
        top: areaClip.get("top") + areaClip.height / 2
      });
      obj.setCoords();
      canvas.renderAll();
    });
  }
}

function selectSide(side) {
  console.log("Selected side: ", side);
  // Hide all the layers containers
  // var layersCanvas = document.querySelectorAll("canvas.layers");
  // layersCanvas.forEach(e => {
  //   e.style.display = "none";
  // });

  // var layers = document.getElementById("layers--" + side);

  // Find the canvas in the canvases array

  // debugger;

  activeSide = side;

  canvases.forEach(c => {
    var canvas = c.getElement();

    if (c.side === side) {
      if (/^static-/.test(c.name)) {
        canvas.style.display = "block";
      } else {
        activeCanvas = c;
        canvas.parentElement.style.display = "block";
      }
    } else {
      if (/^static-/.test(c.name)) {
        canvas.style.display = "none";
      } else {
        canvas.parentElement.style.display = "none";
      }
    }
  });
}

// Fabric.js Customization ...
// --------------------------------------------
fabric.Canvas.prototype.createRect = createRect;
fabric.Canvas.prototype.createCircle = createCircle;

function createRect(width, height, opts, insert) {
  console.log(this);
  var rect = new fabric.Rect({
    width,
    height,
    ...opts
  });

  if (typeof insert === "undefined" || insert === true) this.add(rect);

  this.renderAll();
  return rect;
}

function createCircle(r, options) {
  var circle = new fabric.Circle({
    radius: r,
    ...options
  });
  this.add(circle);
  this.renderAll();
  return circle;
}

function loadImage(src) {
  console.log("Load image:", src);
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.onload = function() {
      var imgEl = document.createElement("img");
      imgEl.src = src;
      resolve(imgEl);
    };
    img.src = src;
  });
}

async function loadLayer(side, url) {
  console.log(side, url);
  var img,
    layersCanvasEl = document.getElementById("layers--" + side),
    layersCanvas = canvases.find(
      c => c.side === side && c instanceof fabric.StaticCanvas
    );

  console.log(layersCanvas);

  img = await loadImage(url);

  console.log(layersCanvas, img);

  if (img) {
    var imgObj = new fabric.Image(img);
    imgObj.scaleToWidth(layersCanvas.width);
    imgObj.scaleToHeight(layersCanvas.height);
    layersCanvas.add(imgObj);
    layersCanvas.renderAll();

    //layersContainer.appendChild(img);
  } else {
    console.error("No image created");
  }
}

function handleSwitchClick(e) {
  var side = e.target.getAttribute("data-side");
  selectSide(side);
}

function handleUpload(e) {
  var file = this.files[0];
  console.log(file);
  try {
    // Simple file validation: only allow jpgs and pngs
    if (/\w+\.[jpe?g|png]+$/i.test(file.name)) {
      console.log("File is valid");
    } else {
      throw new Error("Error: Please upload an image");
    }

    var reader = new FileReader();
    reader.onloadend = e => {
      var img = new Image();
      img.onload = function() {
        const imgObj = new fabric.Image(img, {
          left: activeCanvas.width / 2,
          top: activeCanvas.height / 2,
          originX: "center",
          originY: "center"
        });
        console.log(imgObj);
        activeCanvas.add(imgObj);
        activeCanvas.renderAll();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  } catch (e) {
    alert(e.message);
  }
}

function buildColors() {
  var colorsContainer = document.getElementById("colors");
  var colorsHtml = productConfig.colors
    .map(
      color =>
        '<div class="color" title="' +
        color +
        '" style="background: ' +
        color +
        '"></div>'
    )
    .join("");
  colorsContainer.innerHTML = colorsHtml;
  var $colors = document.querySelectorAll(".color");
  $colors.forEach(c => {
    c.addEventListener("click", () => changeColor(c.getAttribute("title")));
  });
}

function changeColor(c) {
  bgColor.style.backgroundColor = c;
  activeColor = c;
}

function getObject(name, id) {
  if (name) {
    return activeCanvas.getObjects().find(obj => obj.name === name);
  } else if (id) {
    return activeCanvas.getObjects().find(obj => obj.id === id);
  }
}

function saveBase64AsFile(base64, fileName) {
  debugger;
  var link = document.createElement("a");
  base64.replace("image/png", "image/octet-stream");
  link.setAttribute("href", base64);
  link.setAttribute("download", fileName);
  link.click();
}

// Export the actual artwork image
function exportArt() {
  // Deactivate all active objects
  activeCanvas.discardActiveObject();
  // Get the editable area
  var clipArea = activeCanvas.getObjects().find(o => o.name === "area:border");

  // Get real print size in pixels
  var printSize = productConfig.printSize;
  var resolution = printSize.resolution;
  var printW = parseFloat((printSize.width * resolution).toFixed(2));
  var printH = parseFloat((printSize.height * resolution).toFixed(2));

  var multiplier = printW / clipArea.width;

  console.log(clipArea);
  var dataUrl = activeCanvas.toDataURL({
    format: "png",
    multiplier: multiplier,
    left: clipArea.left,
    top: clipArea.top,
    width: clipArea.width,
    height: clipArea.height
  });

  var img = document.createElement("img");
  img.src = dataUrl;
  img.width = 400;
  img.style.display = "flex";
  img.style.margin = "auto";
  img.style.display = "block";

  // instanciate new modal
  var modal = new tingle.modal({
    footer: true,
    closeMethods: ["button", "escape"],
    closeLabel: "Close",
    cssClass: ["custom-class-1"],
    onOpen: function() {
      console.log("modal open");
    },
    onClose: function() {
      console.log("modal closed");
    },
    beforeClose: function() {
      // here's goes some logic
      // e.g. save content before closing the modal
      return true; // close the modal
    }
  });

  // set content
  modal.setContent(img);

  // add a button
  modal.addFooterBtn(
    "Download",
    "tingle-btn tingle-btn--primary tingle-btn--pull-right",
    function() {
      saveBase64AsFile(dataUrl, "artwork.png");
      // here goes some logic
      modal.close();
    }
  );

  // add another button
  modal.addFooterBtn(
    "Cancel",
    "tingle-btn tingle-btn--default tingle-btn--pull-right",
    function() {
      // here goes some logic
      modal.close();
    }
  );

  // open modal
  modal.open();
}

// Export the canvas as a png
function exportMockup() {
  // Deactivate all active objects
  activeCanvas.discardActiveObject();

  // Create a tmp canvas
  var tmpcanvas = document.createElement("canvas");
  var _ctx = tmpcanvas.getContext("2d");
  tmpcanvas.width = 800;
  tmpcanvas.height = 800;

  // Export the artwork canvas
  var dataUrl = activeCanvas.toDataURL({
    format: "png",
    multiplier: 3
  });

  // Export the layers canvas
  var layersCanvas = canvases.find(c => c.name === "static-" + activeSide);
  // layersCanvas.toDataURL({
  //   format: "png",
  //   multiplier: 3
  // });

  debugger;

  var artworkImg = new Image();

  artworkImg.onload = function() {
    debugger;

    // With all the components above, compose an image
    _ctx.fillStyle = activeColor || "white";
    _ctx.fillRect(0, 0, tmpcanvas.width, tmpcanvas.height);
    _ctx.drawImage(
      layersCanvas.getElement(),
      0,
      0,
      tmpcanvas.width,
      tmpcanvas.height
    );
    _ctx.drawImage(this, 0, 0, tmpcanvas.width, tmpcanvas.height);

    // var img = document.createElement("img");
    // img.src = dataUrl;
    // img.width = 400;
    // img.style.display = "flex";
    // img.style.margin = "auto";
    // img.style.display = "block";

    // instanciate new modal
    var modal = new tingle.modal({
      footer: true,
      closeMethods: ["button", "escape"],
      closeLabel: "Close",
      cssClass: ["custom-class-1"],
      onOpen: function() {
        console.log("modal open");
      },
      onClose: function() {
        console.log("modal closed");
      },
      beforeClose: function() {
        // here's goes some logic
        // e.g. save content before closing the modal
        return true; // close the modal
      }
    });

    // set content
    modal.setContent(tmpcanvas);

    // add a button
    modal.addFooterBtn(
      "Download",
      "tingle-btn tingle-btn--primary tingle-btn--pull-right",
      function() {
        // here goes some logic
        modal.close();
      }
    );

    // add another button
    modal.addFooterBtn(
      "Cancel",
      "tingle-btn tingle-btn--default tingle-btn--pull-right",
      function() {
        // here goes some logic
        modal.close();
      }
    );

    // open modal
    modal.open();
  };

  artworkImg.src = dataUrl;
}

// Submits the export artwork and requests the mockups
function generateMockups() {}

(async function init() {
  var uploadArt = document.getElementById("uploadart"),
    btn_exportArt = document.getElementById("exportart"),
    btn_exportMockup = document.getElementById("exportmockup"),
    btn_genMockups = document.getElementById("generatemockups");

  uploadArt.addEventListener("change", handleUpload);
  btn_exportArt.addEventListener("click", exportArt);
  btn_exportMockup.addEventListener("click", exportMockup);
  btn_genMockups.addEventListener("click", generateMockups);

  try {
    // Load up the product config and init the canvases
    await loadProduct();

    var sideSwitches = document.querySelectorAll("#side-switcher .button");
    sideSwitches.forEach(e => e.addEventListener("click", handleSwitchClick));

    // createRect(40, 40, { left: 10, top: 10 });
    // createRect(60, 60, { left: 40, top: 40, fill: "red" });
    activeCanvas.createCircle(80, { top: 100, left: 10, fill: "blue" });
  } catch (e) {
    console.error(e);
  }
})();
