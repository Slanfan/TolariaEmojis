import { CommonModule } from '@angular/common'
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PickerModule } from '@ctrl/ngx-emoji-mart'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faTrophy, faAt, faFaceSmile, faFaceGrinTongueSquint, faMask } from '@fortawesome/free-solid-svg-icons'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { deckStackIcon } from 'public/web/assets/font-icons/deck-stack-icon'
import { tolFormat } from 'public/web/assets/font-icons/format'
import { tolFormatSelected } from 'public/web/assets/font-icons/format-selected'
import { tolSend } from 'public/web/assets/font-icons/send'

import Quill from 'quill'
import TolariaEmojiBlot from './emoji-blot'
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji'
import { QuillModule } from 'ngx-quill'
import 'quill-emoji/dist/quill-emoji.js'
import 'quill-mention'

const Parchment = Quill.import('parchment')
const NewBlock = Parchment.query('block')
NewBlock.tagName = 'DIV'
Quill.register(NewBlock, true)
Quill.register({ 'formats/emoji': TolariaEmojiBlot })

@Component({
  selector: 'app-quill-form',
  templateUrl: './quill-form.component.html',
  styleUrls: ['./quill-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuillModule,
    FontAwesomeModule,
    PickerModule,
    NgbModule,
  ]
})
export class QuillFormComponent implements OnInit {
  @ViewChild('emojiPicker', { static: false }) emojiPicker!: ElementRef
  @ViewChild('emojiPickerButton', { static: false }) emojiPickerButton!: ElementRef

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.showEmojiPicker && !this.emojiPickerButton.nativeElement.contains(event.target) && !this.emojiPicker.nativeElement.contains(event.target)) {
      this.showEmojiPicker = false
    }
  }

  private emojiNative = true
  public emojiCustom = [
    {
      name: 'Party Parrot',
      shortNames: ['parrot'],
      shortName: 'tol_parrot',
      keywords: ['party'],
      imageUrl: './assets/images/parrot.gif',
    },
    {
      name: 'Octocat',
      shortNames: ['octocat'],
      shortName: 'tol_octocat',
      keywords: ['github'],
      imageUrl: 'https://github.githubassets.com/images/icons/emoji/octocat.png',
    },
    {
      name: 'Squirrel',
      shortNames: ['shipit', 'squirrel'],
      shortName: 'tol_squirrel',
      keywords: ['github'],
      imageUrl: 'https://github.githubassets.com/images/icons/emoji/shipit.png',
    },
  ]

  private editorInstance: any

  public editorFocused: boolean = false
  private _editorToolbar: any = [
    ['bold', 'italic', 'underline', 'strike'],
    ['link'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote'],
    ['code', 'code-block'],
  ]

  public message: string = ''
  public showFormatting: boolean = false
  public showEditorBottomBorder: boolean = false
  public showEmojiPicker: boolean = false
  public silentMode: boolean = false
  public hoverEmoji: boolean = false

  public messageContent: any = 'Custom message here'
  public content = ''
  public editMode = false
  public viewerModules = {
    toolbar: false,
  }
  public editorModules = {
    'emoji-toolbar': true,
    'emoji-shortname': {
      // emojiList: emojiList,
      fuse: {
        shouldSort: true,
        threshold: 0.1,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          "shortname"
        ]
      },
      onOpen: () => {
        console.log('emoji short list opened')
      },
      onClose: (emojiListItem: any) => {
        console.log('emoji short list, item selected', emojiListItem)
      }
    },
    toolbar: this._editorToolbar,
  }

  constructor() {
  }

  ngOnInit(): void {
    console.log('QuillForm:: ngOnInit')
  }

  public toggle(): void {
    this.editMode = !this.editMode
  }

  public onEditorChanged(): void {

  }

  public onEditorCreated(editorInstance: any): void {

    // set editor instance
    console.log(editorInstance)
    this.editorInstance = editorInstance

    if (typeof this.messageContent === 'string' && this.editorInstance.getText().length === 1) {
      this.editorInstance.insertText(0, this.messageContent)
    }

    // get keyboard to manipulate keys
    const keyboard = editorInstance.getModule('keyboard')

    // get default ENTER key
    const enterKey = keyboard.bindings[13].filter((i:any) => i.handler.name === 'handleEnter')[0]

    // add shift key to be true as the default ENTER needs to send the message
    enterKey.shiftKey = true

    // remove any unwanted bindings to the ENTER key
    keyboard.bindings[13] = keyboard.bindings[13].filter((i:any) => i.format !== undefined || i.handler.name === 'bound selectHandler')

    // add new default ENTER key that will send the message
    keyboard.addBinding({
      key: 13,
      handler: () => {
        this.sendMessage()
      }
    })

    // add the adjusted default ENTER key that will create new lines, now by pressing Shift + Enter
    keyboard.addBinding(enterKey)

    // add scroll listener to the editor element to add or remove the top border of the custom toolbar at the bottom
    document.getElementsByClassName('ql-editor')[0].addEventListener('scroll', (event: any) => {
      const reachedEnd = (event.target.scrollHeight - event.target.scrollTop) === event.target.clientHeight
      this.showEditorBottomBorder = !reachedEnd
    })

  }

  public insertEmoji(): void {
    // const emoji = this.editorInstance.getModule('emoji')
    // console.log(emoji)
    const element = document.getElementsByClassName('textarea-emoji-control')[0] as any
    console.log(element)
    element.click()
  }

  public insertDeck(): void {
    this.editorInstance.insertText(this.editorIndex, '[Deck will be added]')
  }

  public insertEventInfo(): void {
    this.editorInstance.insertText(this.editorIndex, '[Event Information]')
  }

  public mentionSomeone(): void {
    this.editorInstance.getModule('mention').openMenu('@')
  }

  public sendMessage(): void {
    if (this.hasMessage) {
      const htmlString = this.content.replace(/(^([ ]*<p><br><\/p>)*)|((<p><br><\/p>)*[ ]*$)/gi, '')
      const messageContent = this.editorInstance.getContents()
      console.log({
        htmlString,
        messageContent,
      })
    }
  }

  public onEmojiSelected(event: any) {
    let emojiEvent = event as EmojiEvent
    let selection = this.editorInstance.getSelection()
    console.log('QuillForm:: insert emoji', {
      emoji: emojiEvent.emoji.shortName,
      index: selection.index,
    })
    // this.editorInstance.insertEmbed(selection.index, 'emoji', event.emoji.shortName)
    this.editorInstance.insertEmbed(selection.index, 'emoji', 'grinning_face')
    this.editorInstance.setSelection(selection.index + 1)
  }

  public get hasMessage(): boolean {
    return this.content !== '' && this.content !== null && this.editorInstance.getText().trim().length > 0
  }

  private get editorIndex(): number {
    return this.editorInstance.getSelection() !== null
      ? this.editorInstance.getSelection().index
      : 0
  }

  public icon = {
    send: tolSend,
    deck: deckStackIcon,
    event: faTrophy,
    format: tolFormat,
    formatSelected: tolFormatSelected,
    at: faAt,
    emoji: faFaceSmile,
    emojiHover: faFaceGrinTongueSquint,
    silent: faMask,
  }

}
