// ==UserScript==
// @name        No iherb codes in links
// @namespace   https://github.com/sndv/userscripts
// @match       *://*/*
// @grant       none
// @version     0.1.0
// @author      sndv
// @description Remove promotion and coupon codes from iherb.com links
// @run-at      document-end
// ==/UserScript==

"use strict";

const LINK_CSS_SELECTOR = 'a[href*="iherb.com"]';

// Set timeout to allow any other link fixes to be done first
setTimeout(function(){
  let fixedCount = 0;
  document.querySelectorAll(LINK_CSS_SELECTOR).forEach(el => {
    try {
      let url = new URL(el.href);
      if (url.host.endsWith("iherb.com")) {
        url.searchParams.delete("pcode");
        url.searchParams.delete("pcodes");
        url.searchParams.delete("rcode");
        url.searchParams.delete("rcodes");
        if (el.href != url.href) {
          el.href = url.href;
          fixedCount += 1;
        }
      }
    } catch(err) {
      console.log("Cleaning iherb links failed: " + err);
    }
  });
  console.log(`Cleaned ${fixedCount} iherb links (${location.href})`);
}, 300);
