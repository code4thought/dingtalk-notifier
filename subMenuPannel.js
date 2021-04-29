const { ipcRenderer } = require('electron')

const observeConfig = {
    childList: true,
    attributes: true,
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

                // Only notify message when the mute icon had been hidden
                if (value.target.parentNode.nextElementSibling.children[0].className.includes('ng-hide')) {
                    const greatGrandParent = value.target.parentNode.parentNode.parentNode;
                    const title = greatGrandParent.children[0].children[0].children[0].innerText
                    console.log(`subMenuPannel - ${title}: ${newMessage}`)
                    ipcRenderer.invoke('notify-message', title, newMessage, false)
                }
            }
        }

        if (value.type === 'attributes' && value.target.parentNode.nodeName === 'CONV-ITEM'
            && value.target.className.includes('active')) {

            if (value.target.children.length >= 4 && value.target.children[3].children.length >= 2
                && value.target.children[3].children[1].children.length >= 2
                && value.target.children[3].children[1].children[1].children.length >= 1) {

                isMuted = !value.target.children[3].children[1].children[1].children[0].className
                    .includes('ng-hide')

                ipcRenderer.invoke('active-conversation', isMuted)
            }
        }
    })
})

module.exports = {
    subMenuPannelObserve: (subMenuPannel) => {
        observer.observe(subMenuPannel, observeConfig)
    }
}