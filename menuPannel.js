const { ipcRenderer } = require('electron')

const observeConfig = {
    childList: true,
    attributes: false,
    characterData: true,
    subtree: true,
    attributeOldValue: false,
    characterDataOldValue: false
}

var unreadMessages = 0;

const observer = new MutationObserver((mutationsList, observer) => {

    mutationsList.forEach((value) => {

        if (value.type === 'characterData') {
            const greatGrandparent = value.target.parentNode.parentNode.parentNode;
            if (greatGrandparent.nodeName === 'ALL-CONV-UNREAD-COUNT') {
                var n = Number(value.target.textContent)
                if (n) {
                    unreadMessages = n
                    console.log('Msg: ' + value.target.textContent)
                    //TODO send update
                }
            }
        } else if (value.type === 'childList' && value.target.nodeName === 'ALL-CONV-UNREAD-COUNT') {
            value.removedNodes.forEach((value) => {
                if (value.nodeName === 'SPAN' && value.className === 'unread-num ng-scope'){
                    unreadMessages = 0
                    console.log('Msg: ' + 0)
                    //TODO send update
                }
            })
        }
    })
})

module.exports = {
    menuPannelObserve: (menuPannel) => {
        observer.observe(menuPannel, observeConfig)
    }
}