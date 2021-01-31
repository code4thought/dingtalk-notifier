const observeConfig = {
    childList: true,
    attributes: false,
    characterData: false,
    subtree: true,
    attributeOldValue: false,
    characterDataOldValue: false
}

var historyLoadingDone = false;
var needSkipOne = false;
var convTitle = null;

const observer = new MutationObserver((mutationsList, observer) => {

    mutationsList.forEach((value) => {

        // Check if the history loading done
        if (!historyLoadingDone && value.target.className === 'msg-items') {
            var msgItem = null;
            value.addedNodes.forEach((addedNode) => {
                if (addedNode === value.target.lastElementChild) {
                    msgItem = addedNode
                }
            })
            if (msgItem) {
                historyLoadingDone = true
                convTitle = value.target.parentNode.parentNode.previousElementSibling.children[1]
                    .children[0].children[0].children[0].innerText
                if (msgItem.querySelector('user-name')) {
                    needSkipOne = true
                }
                console.log(value)
                return // Skip the history
            }
        }

        if (historyLoadingDone && value.target.parentNode.nodeName === 'USER-NAME') {
            const chatItemDiv = value.target.parentNode.parentNode.parentNode.parentNode.parentNode

            //Get message title and content
            const userName = value.target.innerText
            const contentElement = chatItemDiv.querySelector("div.msg-content-wrapper.ng-isolate-scope");
            if (!contentElement) {
                return //This element is another <user-name></user-name> tag, but not we need
            }

            //Check if the message is history message
            const msgBoxDiv = chatItemDiv.parentNode
            if (msgBoxDiv.parentNode.lastElementChild !== msgBoxDiv) {
                return //History message, skip
            }

            if (needSkipOne) {
                needSkipOne = false
                return //When the last message of history is not send by self, skip one
            }

            const messageContent = getMessageContentText(contentElement)
            const message = userName === convTitle ? messageContent : `${userName}: ${messageContent}`


            //TODO send notification
            console.log(`${convTitle}: ${message}`)
        }

    })
})

function getMessageContentText(htmlContent) {
    if (htmlContent.children.length < 1) {
        return '[无内容节点]'
    }

    const bubbleDiv = htmlContent.children[0];
    const ngSwitchWhen = bubbleDiv.attributes.getNamedItem('ng-switch-when')
    if (!ngSwitchWhen) {
        return '[未知内容类型]'
    }
    switch (ngSwitchWhen.value) {
        case 'msg-text':
            return bubbleDiv.children[0].innerText
        case 'msg-img':
            return '[图片]'
        case 'msg-img-text':
            return '[图文内容]'
        case 'msg-audio':
            return '[语音内容]'
        case 'msg-voip':
            return '[VOIP]'
        case 'msg-file':
        case 'msg-space-file':
            return '[文件]'
        case 'msg-share':
            return '[分享内容]'
        case 'msg-card':
            return '[名片内容]'
        case 'msg-mail':
            return '[邮件内容]'
        case 'msg-err':
            return '[不支持消息内容]'
        case 'msg-oa':
            return '[OA消息]'
        case 'ding-text':
        case 'ding-audio':
            return '[钉提醒]'

        default:
            return `[未知内容类型: ${ngSwitchWhen.value}]`
    }
}

module.exports = {
    contentPannelObserve: (contentPannel) => {
        observer.observe(contentPannel, observeConfig)
        historyLoadingDone = false
        convTitle = null;
    }
}