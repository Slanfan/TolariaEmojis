import Quill from 'quill'
import emojiMap from './emoji-map'

const Embed = Quill.import('parchment').Embed

export class TolariaEmojiBlot extends Embed {

  static create(value: any) {
    let node = super.create();
    if (typeof value === 'object') {
      TolariaEmojiBlot.buildSpan(value, node);
    }
    else if (typeof value === "string") {
      const valueObj = emojiMap[value];

      if (valueObj) {
        TolariaEmojiBlot.buildSpan(valueObj, node)
      }
    }
    return node
  }

  static value(node: any) {
    return node.dataset.name
  }

  static buildSpan(value: any, node: any) {
    console.log(value)
    node.setAttribute('data-name', value.name)
    let emojiContent = document.createElement('span')
    emojiContent.setAttribute('contenteditable', 'false')
    emojiContent.classList.add(TolariaEmojiBlot['emojiClass'])
    emojiContent.classList.add(TolariaEmojiBlot['emojiPrefix'] + value.name)
    // unicode can be '1f1f5-1f1ea',see emoji-list.js.
    // emojiContent.innerText = String.fromCodePoint(...TolariaEmojiBlot.parseUnicode(value.unicode))
    let emojiContentInner = document.createElement('img')
    emojiContentInner.src = `assets/emojis/${value.image}`
    emojiContent.appendChild(emojiContentInner)
    node.appendChild(emojiContent)
  }
  static parseUnicode(string: string) {
    return string.split('-').map(str => parseInt(str, 16))
  }

}

TolariaEmojiBlot['blotName'] = 'emoji'
TolariaEmojiBlot['classname'] = 'ql-emojiblot'
TolariaEmojiBlot['tagName'] = 'span'
TolariaEmojiBlot['emojiClass'] = 'tp'
TolariaEmojiBlot['emojiPrefix'] = 'tp-'

export default TolariaEmojiBlot
