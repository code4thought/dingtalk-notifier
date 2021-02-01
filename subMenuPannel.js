const { ipcRenderer } = require('electron')

const observeConfig = {
    childList: true,
    attributes: false,
    characterData: false,
    subtree: true,
    attributeOldValue: false,
    characterDataOldValue: false
}

const observer = new MutationObserver((mutationsList, observer) => {

    mutationsList.forEach((value) => {

        if (value.type === 'childList' && value.target.nodeName === 'SPAN') {
            var newMessage = null
            const ngBindHtml = value.target.attributes.getNamedItem('ng-bind-html')
            if (ngBindHtml && ngBindHtml.value === 'convItem.conv.lastMessageContent|emoj') {
                newMessage = value.target.innerText
            }
            if (newMessage && value.target.parentNode.nextElementSibling
                && value.target.parentNode.nextElementSibling.children.length > 1) {
                const greatGrandParent = value.target.parentNode.parentNode.parentNode;
                const title = greatGrandParent.children[0].children[0].children[0].innerText
                console.log(`subMenuPannel - ${title}: ${newMessage}`)
                ipcRenderer.invoke('notify-message', title, newMessage, false)
            }
        }
    })
})

module.exports = {
    subMenuPannelObserve: (subMenuPannel) => {
        observer.observe(subMenuPannel, observeConfig)
    }
}