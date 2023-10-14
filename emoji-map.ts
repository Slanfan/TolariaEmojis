import { emojis } from './emojis'

const emojiMap: any = {}

emojis.forEach((category: any) => {
  category.icons.forEach((icon: any) => {
    emojiMap[icon.name] = icon
  })
})

export default emojiMap
