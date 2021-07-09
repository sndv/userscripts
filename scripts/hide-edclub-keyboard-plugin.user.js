// ==UserScript==
// @name        Hide EdClub on-screen keyboard
// @namespace   https://github.com/sndv/userscripts
// @match       https://www.edclub.com/*
// @grant       none
// @version     0.1.0
// @author      sndv
// @description Hide the on-screen keyboard during typing practice on EdClub/TypingClub
// @run-at      document-end
// ==/UserScript==

"use strict";

const KEYBOARD_ELEMENT_SELECTOR = "div.keyboard-plugin";


function hide_keyboard_element() {

  let keyboard_elements = document.querySelectorAll(KEYBOARD_ELEMENT_SELECTOR);

  if (keyboard_elements.length > 1) {
    console.log("WARNING: Found more than one keyboard plugin elements, hiding all");
  }

  keyboard_elements.forEach(el => {
    try {
      if (el.style.opacity !== "0") {
        el.style.opacity = "0";
        console.log("Keyborad plugin successfully hidden.");
      }
    } catch(err) {
      console.log("Hiding keyboard plugin element failed: " + err);
    }
  });

}


setTimeout(hide_keyboard_element, 1000)
setTimeout(hide_keyboard_element, 2000)
setTimeout(hide_keyboard_element, 3000)
