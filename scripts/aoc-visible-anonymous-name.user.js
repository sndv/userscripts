// ==UserScript==
// @name        AoC visible anonymous name
// @namespace   https://github.com/sndv/userscripts
// @match       https://adventofcode.com/*/leaderboard/private/view/*
// @match       https://adventofcode.com/*/leaderboard
// @match       https://adventofcode.com/*/leaderboard/day/*
// @grant       none
// @version     0.2.0
// @author      sndv
// @description Show your own name in color if it's anonymous in Advent of Code leaderboards
// @run-at      document-end
// ==/UserScript==

"use strict";

const LOG_PREFIX = "[AoC-anon] ";

const NAME_SELECTOR = "header div.user";
const MAIN_BOARD_NAME_SELECTOR = "span.privboard-name";
const MEDAL_TABLE_NAME_SELECTOR = "#aoc-extension-medals table > tr > td:first-child";
const PERDAY_TABLE_NAME_SELECTOR = "#aoc-extension-perDayLeaderBoard table > tr > td:first-child";
const CHART_NAME_SELECTOR = "#chart svg > text.label:is(.left, .right)";

const GLOBAL_LEADERBOARD_NAME_SELECTOR = "div.leaderboard-entry > span.leaderboard-anon";


function getUser() {
  let nameElement = document.querySelector(NAME_SELECTOR);
  let name = "";
  if (nameElement && nameElement.firstChild && nameElement.firstChild.data) {
    name = nameElement.firstChild.data.trim();
  } else {
    console.log(`${LOG_PREFIX}Not logged in!`);
    return;
  }
  if (name.includes("(anonymous user #")) {
    console.log(`${LOG_PREFIX}Using name: '${name}'`);
    return {
      name: name,
      nameNoNumSign: name.replace("#", ""),
    };
  }
  console.log(`${LOG_PREFIX}Not anonymous! name: '${name}'`);
}


function updatePrivateLeaderboard() {

  let user = getUser();
  if (!user) {
    return;
  }

  let mainBoardUpdated = "no";
  document.querySelectorAll(MAIN_BOARD_NAME_SELECTOR).forEach(el => {
    if (el.firstChild && el.firstChild.data == user.name) {
      el.style.color = "orange";
      mainBoardUpdated = "yes";
    }
  });

  let medalsTableUpdated = "no";
  document.querySelectorAll(MEDAL_TABLE_NAME_SELECTOR).forEach(el => {
    if (el.firstChild && el.firstChild.data == user.nameNoNumSign) {
      el.style.color = "orange";
      medalsTableUpdated = "yes";
    }
  });

  let perdayTableUpdated = "no";
  document.querySelectorAll(PERDAY_TABLE_NAME_SELECTOR).forEach(el => {
    if (el.firstChild && el.firstChild.data.includes(user.nameNoNumSign)) {
      el.style.color = "orange";
      perdayTableUpdated = "yes";
    }
  });

  let chartUpdated = "no";
  document.querySelectorAll(CHART_NAME_SELECTOR).forEach(el => {
    if (el.firstChild && el.firstChild.data == user.name) {
      el.style.fontWeight = "bold";
      el.style.textDecoration = "underline";
      chartUpdated = "yes";
    }
  });

  console.log(`${LOG_PREFIX}Finished, updated main board: ${mainBoardUpdated}, medals table: ${medalsTableUpdated}, per-day table: ${perdayTableUpdated}, chart: ${chartUpdated}`);
}


function updateGlobalLeaderboard() {
  let user = getUser();
  if (!user) {
    return;
  }

  let updated = "no";
  document.querySelectorAll(GLOBAL_LEADERBOARD_NAME_SELECTOR).forEach(el => {
    if (el.firstChild && el.firstChild.data == user.name) {
      el.style.color = "orange";
      el.style.opacity = 1;
      updated = "yes";
    }
  });

  console.log(`${LOG_PREFIX}Finished, leaderboard updated: ${updated}`);
}


if (window.location.href.includes("private")) {
  console.log(`${LOG_PREFIX}Updating private leaderboard`);
  updatePrivateLeaderboard();
  // Run again later for extension data
  setTimeout(updatePrivateLeaderboard, 1000);
  setTimeout(updatePrivateLeaderboard, 2500);
} else {
  console.log(`${LOG_PREFIX}Updating global leaderboard`);
  updateGlobalLeaderboard();
}
