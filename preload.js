// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { menuPannelObserve } = require('./menuPannel')
const { subMenuPannelObserve } = require('./subMenuPannel')
const { contentPannelObserve } = require('./contentPannel')

var currentMenuPannel = null;
var currentSubMenuPannel = null;
var currentContentPannel = null;

window.addEventListener('DOMContentLoaded', () => {
    const bodyConfig = {
        childList: true,
        attributes: false,
        characterData: false,
        subtree: false,
        attributeOldValue: false,
        characterDataOldValue: false
    };

    const onBodyChange = function (mutationsList, observer) {
        const menuPannel = document.getElementById("menu-pannel")
        if (menuPannel && currentMenuPannel !== menuPannel) {
            console.log("Found menu-pannel, observing ...")
            currentMenuPannel = menuPannel
            menuPannelObserve(currentMenuPannel)
        }

        const subMenuPannel = document.getElementById("sub-menu-pannel")
        if (subMenuPannel && currentSubMenuPannel !== subMenuPannel) {
            console.log("Found sub-menu-pannel, observing ...")
            currentSubMenuPannel = subMenuPannel
            subMenuPannelObserve(currentSubMenuPannel)
        }

        const contentPannel = document.getElementById("content-pannel")
        if (contentPannel && currentContentPannel !== contentPannel) {
            console.log("Found content-pannel, observing ...")
            currentContentPannel = contentPannel
            contentPannelObserve(currentContentPannel)
        }
    }
    const bodyObserver = new MutationObserver(onBodyChange)
    bodyObserver.observe(document.body, bodyConfig)
})