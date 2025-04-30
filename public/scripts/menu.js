let moveButton = document.querySelector(".bewegen");
let cutButton = document.querySelector(".knippen");
let pinsButton = document.querySelector(".pins");
let timelineButton = document.querySelector(".tijdlijn");
let guideButton = document.querySelector(".gids");
let linksButton = document.querySelector(".links");

let moveToggle = true;
let pinsVisibility = true;
let timelineVisibility = false;

let timelineBase;

console.log("gamer");

let guideWindow = document.querySelector(".guide");

guideButton.addEventListener("click", () => {
  guideWindow.classList.toggle("guide--active");
});

document.querySelector(".guide__close").addEventListener("click", () => {
  guideWindow.classList.toggle("guide--active");
});

document.querySelector(".guide__confirm").addEventListener("click", () => {
  guideWindow.classList.toggle("guide--active");
});

let linkWindow = document.querySelector(".sources");

linksButton.addEventListener("click", () => {
  linkWindow.classList.toggle("sources--active");
});

document.querySelector(".sources__close").addEventListener("click", () => {
  linkWindow.classList.toggle("sources--active");
});

function fetchSources() {
  fetch("/sources.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      sources = data.sources;
      console.log(data);
      sources.forEach((item, i) => {
        let source = document.createElement("li");
        let sourceLink = document.createElement("a");

        source.append(sourceLink);

        sourceLink.textContent = item.name + "↗";
        sourceLink.href = item.url;

        document.querySelector(".sources__list").append(source);
      });
    })
    .catch((error) => console.error("Failed to fetch data:", error));
}

moveButton.addEventListener("click", () => {
  moveToggle = true;
  moveButton.src = "./img/ui/Bewegen_active.svg";
  cutButton.src = "./img/ui/Knippen.svg";

  document.querySelector(".cut").checked = false;
  document.querySelector(".move").checked = true;
});

cutButton.addEventListener("click", () => {
  moveToggle = false;
  cutButton.src = "./img/ui/Knippen_active.svg";
  moveButton.src = "./img/ui/Bewegen.svg";

  document.querySelector(".cut").checked = true;
  document.querySelector(".move").checked = false;
});

pinsButton.addEventListener("click", () => {
  pinsVisibility = !pinsVisibility;
  pinsVisibility
    ? (pinsButton.src = "./img/ui/Pins_active.svg")
    : (pinsButton.src = "./img/ui/Pins.svg");
  document.querySelector("#markerToggle").checked = pinsVisibility;
});

timelineButton.addEventListener("click", () => {
  timelineVisibility = !timelineVisibility;
  timelineVisibility
    ? (timelineButton.src = "./img/ui/Tijdlijn_active.svg")
    : (timelineButton.src = "./img/ui/Tijdlijn.svg");
  document.querySelector("#timelineToggle").checked = timelineVisibility;
});

document.querySelector(".timeline__close").addEventListener("click", () => {
  document
    .querySelectorAll(".timeline")
    .forEach((item) => item.classList.remove("timeline--active"));
  document
    .querySelector(".timeline__close")
    .classList.remove("timeline__close--active");
  removeTimelineHighlight();
});

function removeTimelineHighlight() {
  document.querySelectorAll(".timeline__event").forEach((item, i) => {
    item.classList.remove("timeline__event--active");
  });
}

function setTimelineDetails(event) {
  console.log(event);
  let img = document.querySelector(".timeline__event__img");

  document.querySelector(".timeline__event__year").textContent = event.time;
  if (event.title) {
    document.querySelector(".timeline__event__title").textContent = event.title;
    document.querySelector(".timeline__event__desc").textContent = event.desc;

    img.src = event.img.url;
    img.alt = event.img.alt;
  } else {
    document.querySelector(".timeline__event__title").textContent =
      event.flagTitle;
    document.querySelector(".timeline__event__desc").textContent = event.info;

    img.src = event.flagImg.url;
    img.alt = event.flagImg.alt;
  }
}

let timeline = document.querySelector(".timeline__container");
function fetchTimeline() {
  fetch("./timelineBase.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      events = data.events;

      // console.log(data);
      timelineBase = events;
      renderTimeline(events, 0);
    })
    .catch((error) => console.error("Failed to fetch data:", error));
}

let flagInfo;
function fetchFlagInfo() {
  fetch("./info.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      flagInfo = data.markers;
    })
    .catch((error) => console.error("Failed to fetch data:", error));
}

function getTimelinePos(event, e, pastEvent, min, max) {
  let timelinePos = (event - min) / (max - min);

  if (pastEvent !== null && timelinePos - pastEvent <= 0.015 && e != 0) {
    timelinePos = pastEvent + 0.017;
  }
  return timelinePos;
}

function renderTimeline(events, type) {
  let timelineLimits;

  let timelineBaseEvents = timelineBase.filter((item) => item.type == "event");

  if (type == 0) {
    timelineLimits = timelineBaseEvents;
  } else {
    timelineLimits = events.timeline;
  }

  let minRange = timelineLimits.reduce((minObject, currentObject) => {
    return currentObject.time < minObject.time ? currentObject : minObject;
  }, timelineLimits[0]);

  let maxRange = timelineLimits.reduce((maxObject, currentObject) => {
    return currentObject.time > maxObject.time ? currentObject : maxObject;
  }, timelineLimits[0]);

  centuryMarkers(minRange.time, maxRange.time);

  let filterEvents;
  if (type == 0) {
    filterEvents = events.filter((event, e) => event.type == "event");
  } else {
    filterEvents = events.timeline.concat(timelineBaseEvents);
    filterEvents.sort((a, b) => a.time - b.time);
  }

  timeline.querySelectorAll(".timeline__event").forEach((event) => {
    event.remove();
  });

  let pastEventPos = undefined;
  filterEvents.map((event, e) => {
    let currEvent = document.createElement("div");
    currEvent.classList.add("timeline__event");
    if (event.icon) {
      currEvent.classList.add("timeline__event--" + event.icon);
      if (type !== 0) {
        currEvent.classList.add("timeline__event--faded");
      }
    } else {
      currEvent.classList.add("timeline__event--culture");
    }

    event.icon;

    if (event.type == "event" || type == 1) {
      // let timelinePos =
      //   (event.time - minRange.time) / (maxRange.time - minRange.time);

      // if (
      //   pastEventPos !== null &&
      //   timelinePos - pastEventPos <= 0.015 &&
      //   e != 0
      // ) {
      //   timelinePos = pastEventPos + 0.017;
      // }

      let timelinePos = getTimelinePos(
        event.time,
        e,
        pastEventPos,
        minRange.time,
        maxRange.time
      );
      currEvent.style.left = timelinePos * 100 + "%";
      currEvent.setAttribute("name", event.title);
      currEvent.setAttribute("index", e);

      currEvent.addEventListener("click", () => {
        if (type !== 0) {
          event.flagImg = events.img;
          event.flagTitle = events.title;
        }

        setTimelineDetails(event);
        const timelineBot = document.querySelector(".timeline--bot");
        const timelineWidth = timelineBot.parentElement.offsetWidth;
        const botWidth = timelineBot.offsetWidth;

        // Calculate raw position
        let rawPos = timelinePos * 100 + "%";

        // Calculate the minimum and maximum allowed positions
        const minPos = "0px";
        const maxPos = timelineWidth - botWidth + "px";

        // Apply position with boundaries
        timelineBot.style.left = `max(${minPos}, min(calc(${rawPos} - 12.5vw), ${maxPos}))`;

        document
          .querySelectorAll(".timeline")
          .forEach((item) => item.classList.add("timeline--active"));
        document
          .querySelector(".timeline__close")
          .classList.add("timeline__close--active");
        removeTimelineHighlight();
        currEvent.classList.add("timeline__event--active");
      });
      pastEventPos = timelinePos;
    }
    timeline.appendChild(currEvent);
  });
}

function centuryMarkers(min, max) {
  timeline
    .querySelectorAll(".timeline__century--big")
    .forEach((item) => item.remove());
  timeline
    .querySelectorAll(".timeline__century--small")
    .forEach((item) => item.remove());
  timeline
    .querySelectorAll(".timeline__century--mini")
    .forEach((item) => item.remove());

  let timelineRange = max - min;
  console.log("timelineRange" + timelineRange);
  let timelineInterval;
  if (timelineRange <= 500) {
    timelineInterval = 50;
  } else if (timelineRange <= 250) {
    timelineInterval = 25;
  } else if (timelineRange <= 100) {
    timelineInterval = 10;
  } else {
    timelineInterval = 100;
  }
  let centuryMin = Math.ceil(min / timelineInterval);

  for (
    let timelineCount = 0;
    timelineCount < timelineRange;
    timelineCount += timelineInterval
  ) {
    let currCenturyMarker = document.createElement("p");
    // console.log(centuryMin, timelineCount);
    let currYear = centuryMin * timelineInterval + timelineCount;

    if (currYear % 500 == 0) {
      currCenturyMarker.classList.add("timeline__century--big");
      currCenturyMarker.textContent = currYear;
    } else if (currYear % 100 == 0) {
      currCenturyMarker.classList.add("timeline__century--small");
      let tinyDoubleZero = document.createElement("span");
      tinyDoubleZero.textContent = "00";
      tinyDoubleZero.classList.add("timeline__century--small00");
      currCenturyMarker.textContent = Math.floor(currYear / 100);
      currCenturyMarker.append(tinyDoubleZero);
    } else {
      currCenturyMarker.classList.add("timeline__century--mini");
      let tinyDoubleZero = document.createElement("span");
      tinyDoubleZero.textContent = currYear - Math.floor(currYear / 100) * 100;
      tinyDoubleZero.classList.add("timeline__century--small00");
      currCenturyMarker.textContent = Math.floor(currYear / 100);
      currCenturyMarker.append(tinyDoubleZero);
    }

    let timelinePos = (currYear - min) / (max - min);
    currCenturyMarker.style.left = timelinePos * 100 + "%";

    timeline.appendChild(currCenturyMarker);
  }

  // for (let currCentury = 0; currCentury < centuryCount; currCentury++) {
  //   let currCenturyYear = centuryMin + currCentury;
  //   if (currCenturyYear % 5 == 0) {
  //     currCenturyMarker.classList.add("timeline__century--big");
  //     currCenturyMarker.textContent = currCenturyYear * 100;
  //   } else {
  //     currCenturyMarker.classList.add("timeline__century--small");
  //     currCenturyMarker.textContent = currCenturyYear;
  //   }

  //   let timelinePos =
  //     (currCenturyYear * 100 - min.time) / (max.time - min.time);
  //   currCenturyMarker.style.left = timelinePos * 100 + "%";

  //
  // }
}

document.addEventListener("flagSelected", function (e) {
  const clickedFlag = e.detail;
  // console.log(clickedFlag[0].item.name);
  // console.log(flagInfo[0].name);

  let clickedInfo = flagInfo.find((item) => {
    return item.title == clickedFlag[0].item.name;
  });
  document.querySelector(".timeline--top").classList.add("timeline--flagged");
  document.querySelector(".timeline--top").classList.add("timeline--fadeIn");
  setTimeout(() => {
    renderTimeline(clickedInfo, 1);
    document
      .querySelector(".timeline--top")
      .classList.remove("timeline--fadeIn");
  }, 500);
});

document
  .querySelector(".timeline--flagged__close")
  .addEventListener("click", () => {
    document
      .querySelector(".timeline--top")
      .classList.remove("timeline--flagged");
    renderTimeline(timelineBase, 0);

    document
      .querySelectorAll(".timeline")
      .forEach((item) => item.classList.remove("timeline--active"));
    document
      .querySelector(".timeline__close")
      .classList.remove("timeline__close--active");
    removeTimelineHighlight();
  });

fetchTimeline();
fetchFlagInfo();
fetchSources();
