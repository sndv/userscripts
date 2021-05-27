// ==UserScript==
// @name        Skip bg-mamma reddirects
// @namespace   https://github.com/sndv/userscripts
// @match       https://www.bg-mamma.com/
// @grant       none
// @version     0.2.1
// @author      sndv
// @description Change bg-mamma.com/url.php links to go directly to their destination to prevent adding unwanted coupon codes and tracking
// @run-at      document-end
// ==/UserScript==

"use strict";

const REDIRECT_URL_IDENTIFIER = "bg-mamma.com/url.php";
const LINK_SPLIT_PATTERN = "^|";
const URL_PARAM_NAME = "u";
// const LINK_CSS_SELECTOR = "a.url-content";
const LINK_CSS_SELECTOR = "a";

var fixedCount = 0;

document.querySelectorAll(LINK_CSS_SELECTOR).forEach(el => {
  try {
    if (el.href.includes(REDIRECT_URL_IDENTIFIER)) {
      const url = new URL(el.href);
      const targetEncoded = url.searchParams.get(URL_PARAM_NAME);
      if (targetEncoded) {
        const targetFull = decodeURIComponent(atob(targetEncoded));
        if (targetFull.includes(LINK_SPLIT_PATTERN)) {
          const target = targetFull.split(LINK_SPLIT_PATTERN, 1)[0];
          // Rewrite the link target
          el.setAttribute("href", target);
          // Remove the onclick javascript which triggers the reddirect (is it needed?)
          el.removeAttribute("onclick");
        }
      }
    }
  } catch(err) {
    console.log("Fixing bg-mamma redirects failed: " + err);
  }
  fixedCount += 1;
});

console.log("Fixed " + fixedCount + " bg-mamma redirects.");
