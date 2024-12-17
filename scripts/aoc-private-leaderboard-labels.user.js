// ==UserScript==
// @name        AoC private leaderboard labels
// @namespace   https://github.com/sndv/userscripts
// @match       https://adventofcode.com/*/leaderboard/private
// @grant       none
// @version     0.3.1
// @author      sndv
// @description Add custom labels to Advent of Code private leaderboards
// @run-at      document-end
// ==/UserScript==

"use strict";


const LOG_PREFIX = "[AoC-labels] ";

const LEADERBOARD_VIEW_A_SELECTOR = 'form > div > a[href*="/leaderboard/private/view/"]';
const LB_P_SELECTOR = "main > article > form:nth-of-type(2) > p:nth-of-type(1)";

const LABELS_LABEL = "Labels: ";
const EDIT_BUTTON_TEXT = "[Edit]";
const SAVE_BUTTON_TEXT = "[Save]";
const IMPORT_APPLY_BUTTON_TEXT = "[Apply]";
const CANCEL_BUTTON_TEXT = "[Cancel]";
const IMPORT_BUTTON_TEXT = "[Import]";
const EXPORT_BUTTON_TEXT = "[Export]";
const LABEL_PLACEHOLDER = "...";

const LOCAL_STORAGE_LABELS_KEY = "aoc-private-leaderboard-labels";


let labelMap = {};
let labelElements = [];
let controlsDiv;


function readLabelMap() {
  let labelMapFromStorage;
  try {
    labelMapFromStorage = JSON.parse(localStorage[LOCAL_STORAGE_LABELS_KEY]);
  } catch (err) {
    console.log(`${LOG_PREFIX}No label map found in local storage.`);
    localStorage[LOCAL_STORAGE_LABELS_KEY]=JSON.stringify({});
    return;
  }
  labelMap = labelMapFromStorage;
  console.log(`${LOG_PREFIX}Label map read from local storage.`);
}

function writeLabelMap() {
  localStorage[LOCAL_STORAGE_LABELS_KEY]=JSON.stringify(labelMap);
  console.log(`${LOG_PREFIX}Label map saved to local storage.`);
}

function updateLabels() {
  for (let label of labelElements) {
    let labelValue = labelMap[label.leaderboard] || LABEL_PLACEHOLDER;
    label.inner.textContent = labelValue;
    if (labelValue == LABEL_PLACEHOLDER) {
      label.label.style.display = "none";
    } else {
      label.label.style.display = "inline";
    }
  }
}


function addLabels() {
  let labelsCreated = 0;
  document.querySelectorAll(LEADERBOARD_VIEW_A_SELECTOR).forEach(el => {
    let leaderboardUrl = el.href;
    let leaderboardCode = leaderboardUrl.substring(leaderboardUrl.lastIndexOf("/") + 1);
    if (/^\d+$/.test(leaderboardCode) && leaderboardCode.length < 12) {
      const labelSpan = document.createElement("span");
      labelSpan.style.display = "none";
      const innerSpan = document.createElement("span");
      const leftOuterSpan = document.createElement("span");
      const rightOuterSpan = document.createElement("span");
      leftOuterSpan.textContent = "  (";
      rightOuterSpan.textContent = ")";
      labelSpan.style.color = "dimgray";
      labelSpan.appendChild(leftOuterSpan)
      labelSpan.appendChild(innerSpan)
      labelSpan.appendChild(rightOuterSpan)
      el.parentNode.appendChild(labelSpan);
      labelElements.push({
        leaderboard: leaderboardCode,
        label: labelSpan,
        leftOuter: leftOuterSpan,
        inner: innerSpan,
        rightOuter: rightOuterSpan,
      });
      labelsCreated += 1;
    } else {
      console.log(`${LOG_PREFIX}Href does not look like leaderboard code, not using: ${leaderboardCode}`);
    }
  });
  updateLabels();
  console.log(`${LOG_PREFIX}Created ${labelsCreated} labels.`);
}

function createControlLabel() {
  let controlsLabel = document.createElement("span");
  controlsLabel.textContent = LABELS_LABEL;
  controlsLabel.style.color = "dimgray";
  return controlsLabel;
}

function createButton(text, hidden) {
  let button = document.createElement("a");
  button.textContent = text;
  button.style.color = "dimgray";
  button.style.cursor = "pointer";
  button.style.marginLeft = "2px";
  button.addEventListener("mouseenter", function() {
    button.style.color = "lightgray";
  });
  button.addEventListener("mouseleave", function() {
    button.style.color = "dimgray";
  });
  button.addEventListener("click", onclick);
  if (hidden) {
    button.style.display = "none";
  }
  return button;
}

function createLabelsJsonArea() {
  let importArea = document.createElement("textarea");
  importArea.style.display = "block";
  importArea.style.display = "none";
  importArea.style.marginTop = "10px";
  importArea.disabled = true;
  importArea.rows = 12;
  importArea.cols = 54;
  return importArea;
}


function createSeparator() {
  let separator = document.createElement("span");
  separator.style.display = "block";
  separator.style.margin = "16px";
  return separator;
}

function createErrorMessage() {
  let errorMessage = document.createElement("span");
  errorMessage.style.display = "block";
  errorMessage.style.color = "red";
  errorMessage.style.marginTop = "10px";
  return errorMessage;
}

function addLabelControls() {
  let lederboardsMessageEl = document.querySelector(LB_P_SELECTOR);

  controlsDiv = document.createElement("div");
  controlsDiv.id = "labelControls";
  let editButton = createButton(EDIT_BUTTON_TEXT);
  let saveButton = createButton(SAVE_BUTTON_TEXT, true);
  let importApplyButton = createButton(IMPORT_APPLY_BUTTON_TEXT, true);
  let cancelEditButton = createButton(CANCEL_BUTTON_TEXT, true);
  let cancelImportExportButton = createButton(CANCEL_BUTTON_TEXT, true);
  let importButton = createButton(IMPORT_BUTTON_TEXT);
  let exportButton = createButton(EXPORT_BUTTON_TEXT);
  let errorMessage = createErrorMessage();
  let labelsJsonArea = createLabelsJsonArea();
  let buttons = [editButton, saveButton, importApplyButton, cancelEditButton,
    cancelImportExportButton, importButton, exportButton];
  controlsDiv.appendChild(createControlLabel());
  for (let button of buttons) {
    controlsDiv.appendChild(button);
  }
  controlsDiv.appendChild(errorMessage);
  controlsDiv.appendChild(labelsJsonArea);
  controlsDiv.appendChild(createSeparator());

  function resetViewToButtons() {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
    for (let button of buttons) {
      button.style.display = "none";
    }
    for (let arg of arguments) {
      arg.style.display = "inline";
    }
  };

  function showErrorMessage(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = "block";
  }

  editButton.addEventListener("click", function() {
    for (let label of labelElements) {
      label.inner.contentEditable = true;
      label.label.style.display = "inline";
    }
    resetViewToButtons(saveButton, cancelEditButton);
  });

  saveButton.addEventListener("click", function() {
    for (let label of labelElements) {
      label.inner.contentEditable = false;
      if (label.inner.textContent == "") {
        label.inner.textContent = LABEL_PLACEHOLDER;
      }
      if (label.inner.textContent == LABEL_PLACEHOLDER) {
        label.label.style.display = "none";
        delete labelMap[label.leaderboard]
      } else {
        labelMap[label.leaderboard] = label.inner.textContent;
      }
    }
    writeLabelMap();
    resetViewToButtons(editButton, importButton, exportButton);
  });

  cancelEditButton.addEventListener("click", function() {
    for (let label of labelElements) {
      label.inner.contentEditable = false;
      let labelValue = labelMap[label.leaderboard] || LABEL_PLACEHOLDER;
      label.inner.textContent = labelValue;
      if (label.inner.textContent == LABEL_PLACEHOLDER) {
        label.label.style.display = "none";
      }
    }
    resetViewToButtons(editButton, importButton, exportButton);
  });

  importButton.addEventListener("click", function() {
    labelsJsonArea.value = "";
    labelsJsonArea.disabled = false;
    labelsJsonArea.style.display = "block";
    resetViewToButtons(importApplyButton, cancelImportExportButton);
  });

  cancelImportExportButton.addEventListener("click", function() {
    labelsJsonArea.value = "";
    labelsJsonArea.style.display = "none";
    labelsJsonArea.disabled = true;
    resetViewToButtons(editButton, importButton, exportButton);
  });

  exportButton.addEventListener("click", function() {
    labelsJsonArea.value = JSON.stringify(labelMap, null, 4);
    labelsJsonArea.disabled = true;
    labelsJsonArea.style.display = "block";
    resetViewToButtons(cancelImportExportButton);
  });

  function parseLabelsJson(labelsJson) {
    let labels;
    try {
      labels = JSON.parse(labelsJson);
    } catch (err) {
      console.log(`${LOG_PREFIX}Failed to parse imoprt json`);
      showErrorMessage("Invalid JSON");
      return;
    }
    if (typeof labels !== "object" || Array.isArray(labels) || labels === null) {
      console.log(`${LOG_PREFIX}Import json does not contain an object`);
      showErrorMessage("Invalid labels JSON");
      return;
    }
    for (const [key, value] of Object.entries(labels)) {
      if (!typeof value === "string" || !/^\d+$/.test(key)) {
      console.log(`${LOG_PREFIX}Invalid import json`);
      showErrorMessage("Invalid labels JSON");
        return;
      }
    }
    return labels;
  }

  importApplyButton.addEventListener("click", function() {
    let parsedLabelMap = parseLabelsJson(labelsJsonArea.value);
    if (parsedLabelMap) {
      labelMap = parsedLabelMap;
      writeLabelMap();
      updateLabels();
      labelsJsonArea.style.display = "none";
      labelsJsonArea.disabled = true;
      labelsJsonArea.value = "";
      resetViewToButtons(editButton, importButton, exportButton);
    }
  });

  lederboardsMessageEl.insertAdjacentElement("afterend", controlsDiv);
}

readLabelMap();
addLabels();
addLabelControls();
