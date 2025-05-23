let width = window.innerWidth;
let height = window.innerHeight;
let sliceWidth = 1024;
let sliceHeight = 984;

let zoom = 0.1;

const minScale = 1;
const maxScale = 15;
let strokeWidth = 3;

let targetScale = minScale;
let currentScale = targetScale;
let targetOrigin = {
  x: 0,
  y: 0,
};
let currentOrigin = {
  x: 0,
  y: 0,
};

let offset = { x: 0, y: 0 };
let move = { x: 0, y: 0 };

let viewportCounter = 0;
let viewports = [];
let activeViewport = {
  index: null,
  time: 0,
  startX: null,
  startY: null,
  endX: null,
  endY: null,
};
let viewportButtons = [];
let buttonPxSize = 30;

let action = "camera"; // camera, viewport, cutting
let grab;
let grabbedViewportIndex = 0;
let test = [];

let mapYears = [
  "1200",
  "1390",
  "1400",
  "1680 a",
  "1680 b",
  "1700",
  "1830",
  "1832",
  "1904",
  "1929",
  "1947",
];

let map1200 = new Array(160);

let jsonAtlas = [];
let atlas = [];
mapYears.forEach(() => {
  atlas.push(new Array(160));
  jsonAtlas.push([]);
});

let bgImg = [];
let hiResLoading = false;
let hiResReady = false;

let moveIcon, arrowLeftIcon, arrowRightIcon, closeIcon;
let castleFlag, columnFlag, trainFlag, shipFlag;

let markers = [];
let clickedMarker;

let markerHover;

let loaderScore = 0;
let maxLoaderScore = 160;
let loaderBar = document.querySelector(".loader__bar");
let loadingScreen = document.querySelector(".loadingScreen");
function initialLoader() {
  console.log(loaderScore);
  loaderBar.style.width = (loaderScore / maxLoaderScore) * 100 + "%";
  loaderScore++;
  if (loaderScore >= maxLoaderScore) {
    clearLoadingScreen();
  }
}

function clearLoadingScreen() {
  loadingScreen.classList.add("loadingScreen--hidden");
}

function fetchMarkers() {
  fetch("./markers.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      markers = data.markers;
      // console.log(data);
    })
    .catch((error) => console.error("Failed to fetch data:", error));
}

let bgJson;
let hiResBgJson;

function fetchBgJson() {
  return fetch("/imgJson/bgImg10.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      bgJson = data.images;
      console.log(data);
      return bgJson;
    })
    .catch((error) => {
      console.error("Failed to fetch data:", error);
      throw error;
    });
}

function fetchHiResBgJson() {
  return fetch("/imgJson/bgImg.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      hiResBgJson = data.images;
      console.log(data);
      return bgJson;
    })
    .catch((error) => {
      console.error("Failed to fetch data:", error);
      throw error;
    });
}

function fetchJson(path) {
  return fetch(path)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      return data.images;
    })
    .catch((error) => {
      console.error("Failed to fetch data:", error);
      throw error;
    });
}

function loadAllMapJson() {
  mapYears.forEach((item, i) => {
    fetchJson("/imgJson/" + item + ".json").then((data) => {
      jsonAtlas[i] = data;
    });
  });
}

async function loadBgImgJson() {
  try {
    // Wait for JSON data to be fetched
    await fetchBgJson();

    // Now load each image using the paths from the JSON
    for (let i = 0; i < 160; i++) {
      // Assuming bgJson[i] contains the path or URL to the image
      let path = bgJson[i].link;

      // Use p5.js loadImage
      let loadedImg = loadImage(path, initialLoader, () =>
        handleImageLoadFailure(bgJson[i].name)
      );
      bgImg.push(loadedImg);
    }
  } catch (error) {
    console.error("Error in loadBgImgJson:", error);
  }
}

async function loadHiResBgImgJson() {
  try {
    // Wait for JSON data to be fetched
    await fetchHiResBgJson();

    // Now load each image using the paths from the JSON
    for (let i = 0; i < 160; i++) {
      // Assuming bgJson[i] contains the path or URL to the image
      let path = hiResBgJson[i].link;

      // Use p5.js loadImage
      let loadedImg = loadImage(
        path,
        (img) => {
          bgImg[i] = img;
        },
        () => handleImageLoadFailure(hiResBgJson[i].name)
      );
    }
    console.log("finished loading hi res");
    hiResReady = true;
  } catch (error) {
    console.error("Error in loadBgImgJson:", error);
  }
}
// debugger;
function preload() {
  font = loadFont(
    "/Aktura-Regular.otf",
    handleImageLoadSuccess("font"),
    handleImageLoadFailure("Aktura")
  );

  moveIcon = loadImage(
    "/img/icon/moveIcon.png",
    handleImageLoadSuccess("move"),
    handleImageLoadFailure("move")
  );
  arrowLeftIcon = loadImage(
    "/img/icon/arrowLeftIcon.png",
    handleImageLoadSuccess("arrowL"),
    handleImageLoadFailure("arrowL")
  );
  arrowRightIcon = loadImage(
    "/img/icon/arrowRightIcon.png",
    handleImageLoadSuccess("arrowR"),
    handleImageLoadFailure("arrowR")
  );
  closeIcon = loadImage(
    "/img/icon/closeIcon.png",
    handleImageLoadSuccess("close"),
    handleImageLoadFailure("close")
  );

  castleFlag = loadImage(
    "/img/icon/castleFlag.PNG",
    handleImageLoadSuccess("castle"),
    handleImageLoadFailure("castle")
  );
  shipFlag = loadImage(
    "/img/icon/shipFlag.PNG",
    handleImageLoadSuccess("ship"),
    handleImageLoadFailure("ship")
  );
  trainFlag = loadImage(
    "/img/icon/trainFlag.PNG",
    handleImageLoadSuccess("train"),
    handleImageLoadFailure("train")
  );
  columnFlag = loadImage(
    "/img/icon/columnFlag.PNG",
    handleImageLoadSuccess("column"),
    handleImageLoadFailure("column")
  );
}

function screenToWorldCoords(x, y) {
  // First subtract the initial translation (currentOrigin)
  let adjustedX = x - currentOrigin.x;
  let adjustedY = y - currentOrigin.y;

  // Then account for the scale
  adjustedX = adjustedX / currentScale;
  adjustedY = adjustedY / currentScale;

  // Finally subtract the center translation
  adjustedX -= width / 2;
  adjustedY -= height / 2;

  //new viewport
  return { x: adjustedX, y: adjustedY };
}

function realWorldToMapCoords(east, north) {
  let minX = 4.28905;
  let maxX = 4.54031;

  let minY = 51.17;
  let maxY = 51.26555;

  let subX = north - minX;
  let subY = east - minY;
  let normX = subX / (maxX - minX);
  let normY = subY / (maxY - minY);
  let mapX = (normX - 0.5) * (16 * (sliceWidth * zoom));
  let mapY = (normY - 0.5) * (10 * (sliceHeight * zoom)) * -1;

  return { x: mapX, y: mapY };
}

let loadedIndexes = mapYears.map(() => {
  return [];
});

function setImageStatus(mapYear, index) {
  // Return a callback function instead of executing immediately
  return () => {
    const indexInArray = loadedIndexes[mapYear].findIndex(
      (item) => item.data === index
    );
    if (indexInArray !== -1) {
      loadedIndexes[mapYear][indexInArray].loading = false;
    }
  };
}

function handleImageLoadFailure(item) {
  return () => {
    console.log("failed loading image" + item);
  };
}

function handleImageLoadSuccess(item) {
  return () => {
    // console.log("loaded image" + item);
  };
}

function loadNewRequiredImages(allIndexes) {
  allIndexes.forEach((currYearIndexes, mapYear) => {
    currYearIndexes.forEach((item, i) => {
      if (
        loadedIndexes[mapYear].some((index) => index.data === item) == false
      ) {
        loadedIndexes[mapYear].push({ loading: true, data: item });
        loadImage(
          jsonAtlas[mapYear][item].link,
          // loadImage(
          //   "../../img/" +
          //     mapYears[mapYear] +
          //     "/" +
          //     mapYears[mapYear] +
          //     "map" +
          //     item +
          //     ".png"
          (loadedImage) => {
            atlas[mapYear][item] = loadedImage;
            const indexInArray = loadedIndexes[mapYear].findIndex(
              (idx) => idx.data === item
            );
            if (indexInArray !== -1) {
              loadedIndexes[mapYear][indexInArray].loading = false;
            }
          },
          handleImageLoadFailure(jsonAtlas[mapYear][item].name)
        );
      } else {
        //img loaded or loading
      }
    });
  });
}

function getRequiredImageIndexes() {
  const atlasIndexes = mapYears.map(() => {
    return new Set();
  });
  const indexes = new Set();
  const gridWidth = 16; //rowcount

  function worldToGridCoords(x, y) {
    // + half imagegrid
    const adjustedX = x / (sliceWidth * zoom) + 8; // +8 to account for left = -8 * sliceWidth * zoom
    const adjustedY = y / (sliceHeight * zoom) + 5; // +5 to account for top = -5 * sliceHeight * zoom

    return {
      col: Math.floor(adjustedX),
      row: Math.floor(adjustedY),
    };
  }

  viewports.forEach((viewport) => {
    const topLeft = worldToGridCoords(viewport.startX, viewport.startY);
    const bottomRight = worldToGridCoords(viewport.endX, viewport.endY);

    // Dont draw images <row 0 || >row 16 || <col 0 || >col 16
    const startRow = Math.max(0, Math.min(9, topLeft.row));
    const endRow = Math.max(0, Math.min(9, bottomRight.row));
    const startCol = Math.max(0, Math.min(15, topLeft.col));
    const endCol = Math.max(0, Math.min(15, bottomRight.col));

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const index = row * gridWidth + col;
        if (index >= 0 && index < 160) {
          atlasIndexes[viewport.time].add(index);
          indexes.add(index);
        }
      }
    }
  });
  //load topleft to botright
  // return Array.from(indexes).sort((a, b) => a - b);
  let sortedAtlasIndexes = atlasIndexes.map((indexArray, i) => {
    return Array.from(atlasIndexes[i]).sort((a, b) => a - b);
  });
  return sortedAtlasIndexes;
}

function checkHit(x, y, boxX, boxY, boxW, boxH) {
  if (x > boxX + boxW || x < boxX || y > boxY + boxH || y < boxY) {
    //miss
    return false;
  } else {
    return true;
  }
}

function viewportButtonSwitchSplit(x, buttonSize) {
  let button = Math.floor(x / buttonSize);
  //0 = close 1 = move
  switch (button) {
    case 0:
      return { hit: true, action: "close" };
      break;
    case 1:
      return { hit: true, action: "viewport" };
      break;
    default:
      return { hit: false, action: "" };
  }
}

function viewportButtonSwitchNoSplit(x, buttonSize) {
  let button = Math.floor(x / buttonSize);

  switch (button) {
    case 0:
      return { hit: true, action: "previous" };
      break;
    case 1:
      return { hit: true, action: "year" };
      break;
    case 2:
      return { hit: true, action: "year" };
      break;
    case 3:
      return { hit: true, action: "next" };
      break;
    case 4:
      return { hit: true, action: "viewport" };
      break;
    case 5:
      return { hit: true, action: "close" };
      break;
    default:
      return { hit: false, action: "" };
  }
}

function checkButtonHitType(x, y, boxX, boxY, boxW, boxH, split) {
  //if checkhit is true figure out what button
  if (x > boxX + boxW || x < boxX || y > boxY + boxH || y < boxY) {
    //miss
    return { hit: false, type: "" };
  } else {
    if (split && boxX + boxW - x < boxH * 2) {
      // if cursor in on right side of split buttons
      return viewportButtonSwitchSplit(boxX + boxW - x, boxH);
    } else {
      return viewportButtonSwitchNoSplit(x - boxX, boxH);
    }
  }
}

function checkViewportButtonHit(x, y) {
  let buttonSize = buttonPxSize / currentScale;
  let splitButtons = true;

  function buttonModeCoords(viewport) {
    if (buttonSize * 6 < viewport.endX - viewport.startX) {
      return viewport.endX - buttonSize * 2;
    } else {
      return viewport.startX + buttonSize * 4;
    }
  }

  let worldMouse = screenToWorldCoords(x, y);
  /*
  if btnsize * 6 > check top bar in bounds, return worldmouse.x - startX / buttonSize math.floor for button number
  else check top bar return  if (worldmouse.x - startX / buttonSize > button * 4) 
  return from right button calc => endX - worldMouse.x / buttonSize
  else return from left button calc => wordlmouse.x - startX / buttonSize
*/

  let hits = [];
  viewports.filter((viewport) => {
    if (buttonSize * 6 < viewport.endX - viewport.startX) {
      splitButtons = true;
    } else {
      splitButtons = false;
    }
    let currViewportHit = checkButtonHitType(
      worldMouse.x,
      worldMouse.y,

      viewport.startX,
      viewport.startY - buttonPxSize / currentScale,
      Math.max(buttonSize * 6, viewport.endX - viewport.startX),
      buttonSize,
      splitButtons
    );
    if (currViewportHit.hit === true) {
      hits.push({ viewport: viewport, action: currViewportHit.action });
    } else {
      //miss
    }
  });
  //return hits instead of current return

  // return viewports
  //   .map((item, i) => ({ viewport: item, index: i }))
  //   .filter(({ viewport, index }) =>
  //     checkHit(
  //       worldMouse.x,
  //       worldMouse.y,

  //       buttonModeCoords(viewport),
  //       viewport.startY - buttonPxSize / currentScale,
  //       buttonPxSize / currentScale,
  //       buttonPxSize / currentScale
  //     )
  //   );
  return hits;
}

function checkMarkerHover(x, y) {
  const hoverCanvas = document.querySelector(".p5Canvas");
  if (checkMarkerHit(x, y).length != 0) {
    hoverCanvas.classList.add("canvas--hover");
  } else {
    try {
      hoverCanvas.classList.remove("canvas--hover");
    } catch (e) {
      // console.log("nothing to remove");
    }
  }
}

function checkMarkerHit(x, y) {
  if (document.querySelector("#markerToggle").checked == true) {
    let hits = [];
    let worldMouse = screenToWorldCoords(x, y);
    drawnMarkers.forEach((item) => {
      if (
        checkHit(
          worldMouse.x,
          worldMouse.y,
          item.x,
          item.y,
          markerSize,
          markerSize
        )
      ) {
        hits.push(item);
      }
    });
    console.log(hits);
    return hits;
  } else {
    return [];
  }
}

function mousePressed(event) {
  if (event.target.tagName.toLowerCase() !== "canvas") {
    return; // Exit if clicked element is not the canvas
  }

  let checkViewports = checkViewportButtonHit(mouseX, mouseY);
  let checkMarkers = checkMarkerHit(mouseX, mouseY);
  // console.log(checkViewports.length);
  if (checkViewports.length > 0) {
    action = checkViewports[checkViewports.length - 1].action;
    grabbedViewportIndex =
      checkViewports[checkViewports.length - 1].viewport.index;
    let arrayIndex = viewports.findIndex(
      (item) => item.index === grabbedViewportIndex
    );
    let currentTime = viewports[arrayIndex].time;
    switch (action) {
      case "viewport":
        grab = { x: mouseX, y: mouseY };
        // Get the index of the last (topmost) viewport that was hit

        break;
      case "close":
        console.log("close window");
        // console.log(grabbedViewportIndex);
        viewports.splice(arrayIndex, 1);
        break;
      case "next":
        console.log("set time to next");
        // viewports[arrayIndex].time += 1;
        currentTime == mapYears.length - 1
          ? (viewports[arrayIndex].time = currentTime)
          : (viewports[arrayIndex].time += 1);
        break;
      case "previous":
        console.log("set time to previous");
        // viewports[arrayIndex].time -= 1;
        currentTime == 0
          ? (viewports[arrayIndex].time = currentTime)
          : (viewports[arrayIndex].time -= 1);
        break;
      default:
    }

    //reveives last index as response set grabbed to func return no array
  } else if (checkMarkers.length > 0) {
    console.log("clicked marker");
    const event = new CustomEvent("flagSelected", { detail: checkMarkers });
    clickedMarker = checkMarkers;
    document.dispatchEvent(event);
  } else {
    if (document.querySelector(".move").checked == true) {
      action = "camera";
      //change action to func return.action
      grab = { x: mouseX, y: mouseY };
      // only move when action is camera
      //new actions to viewport data => change years + & - & close viewport
    } else {
      action = "cut";
      let worldCoords = screenToWorldCoords(mouseX, mouseY);
      activeViewport.startX = worldCoords.x;
      activeViewport.startY = worldCoords.y;
    }
  }
}

document
  .querySelector(".timeline--flagged__close")
  .addEventListener("click", () => {
    clickedMarker = null;
  });

function mouseDragged(event) {
  if (event.target.tagName.toLowerCase() !== "canvas") {
    return; // Exit if clicked element is not the canvas
  }

  let arrayIndex = viewports.findIndex(
    (item) => item.index === grabbedViewportIndex
  );

  if (action !== "camera" && action !== "cut") {
    switch (action) {
      case "viewport":
        //moving viewport
        // targetOrigin.x += mouseX - grab.x;
        // targetOrigin.y += mouseY - grab.y;
        let mouseMove = {
          x: (mouseX - grab.x) / currentScale,
          y: (mouseY - grab.y) / currentScale,
        };
        // let mouseMove = { x: 10, y: 10 };

        viewports[arrayIndex] = {
          ...viewports[arrayIndex],
          startX: viewports[arrayIndex].startX + mouseMove.x,
          startY: viewports[arrayIndex].startY + mouseMove.y,
          endX: viewports[arrayIndex].endX + mouseMove.x,
          endY: viewports[arrayIndex].endY + mouseMove.y,
        };

        grab.x = mouseX;
        grab.y = mouseY;
        break;
      case "close":
        console.log("close window");

        break;
      case "next":
        console.log("set time to next");
        break;
      case "previous":
        console.log("set time to previous");
        break;
      default:
        console.log("oops - clicked year");
    }
  } else if (document.querySelector(".move").checked == true) {
    if (action === "camera") {
      targetOrigin.x += mouseX - grab.x;
      targetOrigin.y += mouseY - grab.y;
      grab.x = mouseX;
      grab.y = mouseY;
    } else {
      console.log("oops");
    }
  }
}

function mouseReleased(event) {
  if (event.target.tagName.toLowerCase() !== "canvas") {
    return; // Exit if clicked element is not the canvas
  }

  if (document.querySelector(".move").checked == true || action !== "cut") {
  } else {
    // First subtract the initial translation (currentOrigin)
    let adjustedX = mouseX - currentOrigin.x;
    let adjustedY = mouseY - currentOrigin.y;

    // Then account for the scale
    adjustedX = adjustedX / currentScale;
    adjustedY = adjustedY / currentScale;

    // Finally subtract the center translation
    adjustedX -= width / 2;
    adjustedY -= height / 2;

    //new viewport
    activeViewport.endX = adjustedX;
    activeViewport.endY = adjustedY;

    activeViewport.index = viewportCounter;
    viewportCounter++;

    console.log(activeViewport);
    viewports.push(activeViewport);

    viewportButtons.push({
      index: activeViewport.index,
      startX: activeViewport.startX,
      startY: activeViewport.startY,
    });

    activeViewport = {
      index: null,
      startX: null,
      startY: null,
      endX: null,
      endY: null,
      time: 0,
    };

    test.push({
      x: adjustedX,
      y: adjustedY,
    });
  }
}

// Global vars to cache event state
const evCache = [];
let prevDiff = -1;

function disableZoom() {
  // Disable pinch-zoom gestures (multi-touch)
  window.addEventListener("gesturestart", (e) => e.preventDefault());
  window.addEventListener("gesturechange", (e) => e.preventDefault());
  window.addEventListener("gestureend", (e) => e.preventDefault());

  // Prevent zooming with Ctrl+scroll (on laptops)
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

disableZoom();

function pinchZoomSetup() {
  //pinch zoom handler
  const pinchTarget = document.querySelector(".p5Canvas");
  pinchTarget.onpointerdown = pointerdownHandler;
  pinchTarget.onpointermove = pointermoveHandler;

  // Use same handler for pointer{up,cancel,out,leave} events since
  // the semantics for these events - in this app - are the same.
  pinchTarget.onpointerup = pointerupHandler;
  pinchTarget.onpointercancel = pointerupHandler;
  pinchTarget.onpointerout = pointerupHandler;
  pinchTarget.onpointerleave = pointerupHandler;
}

function pointerdownHandler(ev) {
  // The pointerdown event signals the start of a touch interaction.
  // This event is cached to support 2-finger gestures
  evCache.push(ev);
  log("pointerDown", ev);
}

function pointermoveHandler(ev) {
  // This function implements a 2-pointer horizontal pinch/zoom gesture.
  log("pointerMove", ev);

  // Find this event in the cache and update its record with this event
  const index = evCache.findIndex(
    (cachedEv) => cachedEv.pointerId === ev.pointerId
  );
  evCache[index] = ev;

  // If two pointers are down, check for pinch gestures
  if (evCache.length === 2) {
    // Calculate the distance between the two pointers
    const curDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);

    if (prevDiff > 0) {
      if (curDiff > prevDiff) {
        // The distance between the two pointers has increased
        log("Pinch moving OUT -> Zoom in", ev);
      }
      if (curDiff < prevDiff) {
        // The distance between the two pointers has decreased
        log("Pinch moving IN -> Zoom out", ev);
      }
    }

    // Cache the distance for the next move event
    prevDiff = curDiff;
  }
}

function removeEvent(ev) {
  // Remove this event from the target's cache
  const index = evCache.findIndex(
    (cachedEv) => cachedEv.pointerId === ev.pointerId
  );
  evCache.splice(index, 1);
}

function pointerupHandler(ev) {
  log(ev.type, ev);
  // Remove this pointer from the cache and reset the target's
  // background and border
  removeEvent(ev);
  ev.target.style.background = "white";
  ev.target.style.border = "1px solid black";

  // If the number of pointers down is less than two then reset diff tracker
  if (evCache.length < 2) {
    prevDiff = -1;
  }
}

function handleZoom(event) {
  if (document.querySelector(".move").checked == true) {
    targetScale = constrain(
      event.deltaY > 0 ? currentScale * 0.9 : currentScale * 1.1,
      minScale,
      maxScale
    );

    targetOrigin = getScaledOrigin(
      {
        x: mouseX,
        y: mouseY,
      },
      currentScale,
      targetScale
    );
  }
}

function getScaledOrigin(center, currentScale, newScale) {
  // the center position relative to the scaled/shifted scene
  let viewCenterPos = {
    x: center.x - currentOrigin.x,
    y: center.y - currentOrigin.y,
  };

  // determine the new origin
  let originShift = {
    x: (viewCenterPos.x / currentScale) * (newScale - currentScale),
    y: (viewCenterPos.y / currentScale) * (newScale - currentScale),
  };

  return {
    x: currentOrigin.x - originShift.x,
    y: currentOrigin.y - originShift.y,
  };
}

window.addEventListener(
  "error",
  function (e) {
    if (e.target.tagName === "IMG") {
      console.error("Image failed to load:", e.target.src);
      console.error("Stack trace:", new Error().stack);
    }
  },
  true
);

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.mouseWheel(handleZoom);
  textFont(font);
  // textSize(36);

  // for (let i = 0; i < 160; i++) {
  //   let loadedImg = loadImage("../../img/bgmap/bgmap" + i + ".png");
  //   bgImg.push(loadedImg);
  // }
  // fetchBgJson();

  loadBgImgJson();
  loadAllMapJson();
  fetchMarkers();

  pinchZoomSetup();
}

function markerSwitch(type) {
  switch (type) {
    case "castle":
      return castleFlag;
    case "column":
      return columnFlag;
    case "train":
      return trainFlag;
    case "ship":
      return shipFlag;
    // default:
    //   typeImg = castleFlag;
  }
}

let markerPxSize = 40;
let markerSize;
let drawnMarkers = [];
function drawMarkers() {
  if (document.querySelector("#markerToggle").checked == true) {
    drawnMarkers = [];
    markers.forEach((item, i) => {
      let marker = realWorldToMapCoords(item.x, item.y);

      // console.log(clickedMarker, item);
      let drawActiveMarker =
        clickedMarker &&
        clickedMarker.some((clicked) => {
          return clicked.item.name == item.name;
        });
      if (drawActiveMarker) {
        markerSize = (markerPxSize / currentScale) * 1.5;
      } else {
        markerSize = markerPxSize / currentScale;
      }

      if (
        !drawnMarkers.some((drawnMarker) => {
          let distance = dist(
            drawnMarker.x + markerSize / 2,
            drawnMarker.y + markerSize / 2,
            marker.x,
            marker.y
          );
          return distance < markerSize;
        }) ||
        drawActiveMarker
      ) {
        push();
        fill("red");
        // circle(marker.x, marker.y, markerSize);
        let currFlag = markerSwitch(item.type);
        image(
          currFlag,
          marker.x + -markerSize / 2,
          marker.y + -markerSize,
          markerSize,
          markerSize
        );
        pop();
        drawnMarkers.push({
          x: marker.x + -markerSize / 2,
          y: marker.y + -markerSize,
          item,
        });
      }
    });
  }
}

function drawSliceGrid(imgArrayIndex, check) {
  let top = -5 * sliceHeight * zoom;
  let left = -8 * sliceWidth * zoom;
  let sliceSize = { w: sliceWidth * zoom, h: sliceHeight * zoom };
  let rowCount = 0;
  let colCount = 0;
  let imgArray;
  if (imgArrayIndex === -1) {
    //check if hi res is available

    imgArray = bgImg;
  } else {
    imgArray = atlas[imgArrayIndex];
  }
  if (check === false) {
    for (let i = 0; i < 160; i++) {
      fill("gray");
      colCount = i % 16;

      image(
        imgArray[i],
        left + colCount * sliceSize.w,
        top + rowCount * sliceSize.h,
        sliceSize.w,
        sliceSize.h
      );

      if (i % 16 == 15) {
        rowCount++;
      }
    }
  } else {
    // console.log("CHECKING IMAGE EXISTANCE");
    // console.log(loadedIndexes);
    for (let i = 0; i < 160; i++) {
      fill("gray");
      colCount = i % 16;
      //find in correct year of mapYears
      const loadedImageInfo = loadedIndexes[imgArrayIndex].find(
        (imageIndex) => imageIndex.data === i
      );
      if (loadedImageInfo) {
        if (loadedImageInfo.loading === false) {
          // Image should be loaded
          const img = imgArray[i];
          // console.log(
          //   `Drawing slice ${i}: exists=${!!img}, dimensions=${
          //     img ? img.width : 0
          //   }x${img ? img.height : 0}`
          // );

          if (img && img.width > 1 && img.height > 1) {
            // Image is valid, draw it
            image(
              img,
              left + colCount * sliceSize.w,
              top + rowCount * sliceSize.h,
              sliceSize.w,
              sliceSize.h
            );
          } else {
            // Image is invalid, draw a placeholder
            push();
            fill("red");
            stroke("black");
            rect(
              left + colCount * sliceSize.w,
              top + rowCount * sliceSize.h,
              sliceSize.w,
              sliceSize.h
            );
            text(
              i,
              left + colCount * sliceSize.w + 5,
              top + rowCount * sliceSize.h + 20
            );
            pop();
          }
        } else {
          // Image is still loading
          push();
          fill("rgba(255,255,255,.1)");
          rect(
            left + colCount * sliceSize.w,
            top + rowCount * sliceSize.h,
            sliceSize.w,
            sliceSize.h
          );
          pop();
        }
      } else {
        // console.log("image not needed");
      }

      if (i % 16 == 15) {
        rowCount++;
      }
    }
  }
}

function drawTest() {
  push();
  fill("white");
  test.forEach((item) => {
    circle(item.x, item.y, 10);
  });
  pop();
}

function drawActiveViewport() {
  if (activeViewport.startX) {
    // First subtract the initial translation (currentOrigin)
    let adjustedX = mouseX - currentOrigin.x;
    let adjustedY = mouseY - currentOrigin.y;

    // Then account for the scale
    adjustedX = adjustedX / currentScale;
    adjustedY = adjustedY / currentScale;

    // Finally subtract the center translation
    adjustedX -= width / 2;
    adjustedY -= height / 2;

    //new viewport
    activeViewport.endX = adjustedX;
    activeViewport.endY = adjustedY;
    push();
    noFill();
    stroke("white");
    quad(
      activeViewport.startX,
      activeViewport.startY,
      activeViewport.startX,
      activeViewport.endY,
      activeViewport.endX,
      activeViewport.endY,
      activeViewport.endX,
      activeViewport.startY
    );
  }
}

function drawViewportButtons(viewport) {
  fill("#ff203e");
  //viewport buttons
  let buttonSize = buttonPxSize / currentScale;
  if (buttonSize * 6 > viewport.endX - viewport.startX) {
    //draw all from left
    //move
    rect(
      viewport.startX + buttonSize * 4,
      viewport.startY - buttonSize,
      buttonSize,
      buttonSize
    );
    image(
      moveIcon,
      viewport.startX + buttonSize * 4,
      viewport.startY - buttonSize,
      buttonSize,
      buttonSize
    );
    //close
    rect(
      viewport.startX + buttonSize * 5,
      viewport.startY - buttonSize,
      buttonSize,
      buttonSize
    );
    image(
      closeIcon,
      viewport.startX + buttonSize * 5,
      viewport.startY - buttonSize,
      buttonSize,
      buttonSize
    );
  } else {
    //draw split
    //move
    rect(
      viewport.endX - buttonSize * 2,
      viewport.startY - buttonSize,
      buttonSize,
      buttonSize
    );
    image(
      moveIcon,
      viewport.endX - buttonSize * 2,
      viewport.startY - buttonSize,
      buttonSize,
      buttonSize
    );
    //close
    rect(
      viewport.endX - buttonSize,
      viewport.startY - buttonSize,
      buttonSize,
      buttonSize
    );
    image(
      closeIcon,
      viewport.endX - buttonSize,
      viewport.startY - buttonSize,
      buttonSize,
      buttonSize
    );
  }

  //timeline
  rect(
    viewport.startX,
    viewport.startY - buttonSize,
    buttonSize * 4,
    buttonSize
  );
  image(
    arrowLeftIcon,
    viewport.startX,
    viewport.startY - buttonSize,
    buttonSize,
    buttonSize
  );
  // title
  push();
  fill("white");
  textSize(buttonSize * 0.8);
  textAlign(CENTER, CENTER);
  text(
    mapYears[viewport.time],
    viewport.startX + buttonSize,
    viewport.startY - buttonSize * 1.25,
    buttonSize * 2,
    buttonSize
  );
  pop();

  image(
    arrowRightIcon,
    viewport.startX + buttonSize * 3,
    viewport.startY - buttonSize,
    buttonSize,
    buttonSize
  );
}

function drawViewports() {
  push();
  fill("white");
  viewports.forEach((item, i) => {
    //viewport mask
    push();
    clip(mask);
    function mask() {
      quad(
        item.startX,
        item.startY,
        item.startX,
        item.endY,
        item.endX,
        item.endY,
        item.endX,
        item.startY
      );
    }
    drawSliceGrid(item.time, true);
    pop();
  });
  pop();
}

function drawViewportUI() {
  push();
  fill("white");
  viewports.forEach((item, i) => {
    push();
    stroke("#ff203e");
    noFill();
    //viewport border
    quad(
      item.startX,
      item.startY,
      item.startX,
      item.endY,
      item.endX,
      item.endY,
      item.endX,
      item.startY
    );
    drawViewportButtons(item);
    pop();
  });
  pop();
}

function draw() {
  if (!hiResLoading) {
    loadHiResBgImgJson();
    hiResLoading = true;
  }

  clear();

  /*
  if (currentScale < targetScale) {
    currentScale += 0.01
  } else if (currentScale > targetScale) {
    currentScale -= 0.01
  } */

  // By making all of the changing components part of a vector and normalizing it we can ensure that the we reach our target origin and scale at the same point
  let offset = createVector(
    targetOrigin.x - currentOrigin.x,
    targetOrigin.y - currentOrigin.y,
    // Give the change in scale more weight so that it happens at a similar rate to the translation. This is especially noticable when there is little to no offset required
    (targetScale - currentScale) * 500
  );
  if (offset.magSq() > 0.01) {
    // Multiplying by a larger number will move faster
    offset.normalize().mult(100);
    currentOrigin.x += offset.x;
    currentOrigin.y += offset.y;
    currentScale += offset.z / 500;

    // We need to make sure we do not over shoot or targets
    if (offset.x > 0 && currentOrigin.x > targetOrigin.x) {
      currentOrigin.x = targetOrigin.x;
    }
    if (offset.x < 0 && currentOrigin.x < targetOrigin.x) {
      currentOrigin.x = targetOrigin.x;
    }
    if (offset.y > 0 && currentOrigin.y > targetOrigin.y) {
      currentOrigin.y = targetOrigin.y;
    }
    if (offset.y < 0 && currentOrigin.y < targetOrigin.y) {
      currentOrigin.y = targetOrigin.y;
    }
    if (offset.z > 0 && currentScale > targetScale) {
      currentScale = targetScale;
    }
    if (offset.z < 0 && currentScale < targetScale) {
      currentScale = targetScale;
    }
  }

  translate(currentOrigin.x, currentOrigin.y);
  scale(currentScale);

  background(0);
  noStroke();
  translate(width / 2, height / 2);
  push();
  // translate(offset.x, offset.y);

  drawSliceGrid(-1, false);
  strokeWeight(strokeWidth / currentScale);

  //get tiles visible in viewports
  //returns array of indexes per mapyear
  let requiredImageIndexes = getRequiredImageIndexes();
  //start loading recently added tiles
  loadNewRequiredImages(requiredImageIndexes);
  //draw tiles (draw nothing when tile isnt loaded yet)
  drawViewports(requiredImageIndexes);

  //draw markers from JSON
  drawMarkers();

  //draw viewport borders
  drawViewportUI();

  //if drawing a new viewport, preview its shape
  drawActiveViewport();
  let cursorTracker = screenToWorldCoords(mouseX, mouseY);
  fill("pink");
  // circle(cursorTracker.x, cursorTracker.y, 10);
  checkMarkerHover(mouseX, mouseY);
  pop();
}
