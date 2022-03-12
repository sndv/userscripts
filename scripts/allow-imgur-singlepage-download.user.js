// ==UserScript==
// @name        Allow Imgur SingleFile download
// @namespace   https://github.com/sndv/userscripts
// @match       https://imgur.com/*
// @grant       none
// @version     0.1.0
// @author      sndv
// @description Allow saving full Imgur pages using the SingleFile browser extension
// @run-at      document-idle
// ==/UserScript==

"use strict";

const observerCallback = function(mutationsList, observer, targetContentRoot) {
    mutationsList.forEach(function(mutation) {
        if (mutation.type !== "childList") {
            // console.log(`Unexpected imgur content div mutation: ${mutation.type}`);
            return;
        }
        mutation.addedNodes.forEach(function(node) {
            if (node.id === null || node.id === undefined) {
                console.log("Unexpected element without id added to imgur content div");
                return;
            }
            const newNode = node.cloneNode(true);
            const currEl = targetContentRoot.querySelector(`[id='${node.id}']`);
            if (currEl !== null) {
                const imgsInCurr = currEl.querySelectorAll("img[src*='/']");
                const imgsInNew = newNode.querySelectorAll("img[src*='/']");
                // Avoid replacing image with empty placeholder
                if (imgsInCurr.length <= imgsInNew.length) {
                    targetContentRoot.replaceChild(newNode, currEl);
                }
            } else {
                const nextEl = targetContentRoot.querySelector(`[id='${mutation.nextSibling.id}']`);
                if (nextEl !== null) {
                    targetContentRoot.insertBefore(newNode, nextEl);
                } else {
                    const prevEl = targetContentRoot.querySelector(`[id='${mutation.previousSibling.id}']`);
                    targetContentRoot.insertBefore(newNode, prevEl.nextSibling);
                }
                // newNode.querySelector("img.post-image-placeholder").style.opacity = 1;
            }
        });
    });
};


const createNewContentRoot = function(originalCR) {
    const newContentRoot = originalCR.cloneNode(true);
    newContentRoot.attributes.removeNamedItem("data-reactroot");
    newContentRoot.querySelector("div");

    // Clean empty space
    newContentRoot.querySelector("div").style.height = "0px";
    let nextDiv = newContentRoot.querySelector("div.js-post-truncated");
    if (nextDiv === null) {
        nextDiv = newContentRoot.querySelector("div.post-description");
    }
    nextDiv.previousSibling.style.height = "0px";

    // Fix "Load All" button
    const newLoadall = newContentRoot.querySelector(".post-loadall");
    const oldLoadall = originalCR.querySelector(".post-loadall");
    if (newLoadall !== null && oldLoadall !== null) {
        newLoadall.onclick = function() {
            oldLoadall.click();
            newLoadall.parentNode.parentNode.removeChild(newLoadall.parentNode);
        };
    }

    return newContentRoot;
};

const useOldDesign = function() {
    // This usrescript only works on old design so redirect to it
    const optOutBtn = document.querySelector("a.GalleryPage-betaOptOut");
    if (optOutBtn !== null) {
        console.log("This userscript only works on old imgur design, redirecting");
        optOutBtn.click();
    }
};

const initialSetup = function() {
    const originalContentRoot = document.querySelector("div.post-images > div[data-reactroot]");
    if (originalContentRoot === null) {
        console.error("Failed to find imgur content root div, SinglePage download will not work");
        return;
    }
    const newContentRoot = createNewContentRoot(originalContentRoot);
    originalContentRoot.style.display = "none";
    originalContentRoot.parentElement.appendChild(newContentRoot);
    const globalObserver = new MutationObserver(function(mutationsList, observer) {
        observerCallback(mutationsList, observer, newContentRoot);
    });
    const observerConfig = { attributes: false, childList: true, subtree: false };
    globalObserver.observe(originalContentRoot, observerConfig);
};



useOldDesign();
setTimeout(useOldDesign, 300);
setTimeout(useOldDesign, 900);
initialSetup();
