import { Book as EPUBBook } from '@btpf/epubjs';
import EPUBLocations  from '@btpf/epubjs/types/locations'
import { RenditionOptions, DisplayedLocation as EPUBDisplayedLocation } from '@btpf/epubjs/types/rendition';
import { PDFDocumentProxy } from 'pdfjs-dist'
import { PDFRendition as PDFRendition, Rendition } from '../wrapper'

export class DisplayedLocation {
  private inner: EPUBDisplayedLocation | null
  constructor(raw: EPUBDisplayedLocation) {
    this.inner = raw
  }
}

export class Book {
  private book: EPUBBook | PDFDocumentProxy
  renderTo(element: string, settings: RenditionOptions) : Rendition {
    if (this.book instanceof EPUBBook) {
      return new Rendition(this.book.renderTo(element, settings))
    } else { 
      let anchor = document.getElementById(element) as HTMLCanvasElement | null
      if (anchor === null) {
        anchor = document.createElement("canvas")
        anchor.id = element
        document.body.appendChild(anchor)
      }
      const page = this.book.getPage(1)
      return new Rendition(new PDFRendition(page, anchor))
    }
  }

  constructor(book: EPUBBook | PDFDocumentProxy) {
    this.book = book
  }

  destroy() : void {
    if (this.book instanceof EPUBBook) {
      this.book.destroy()
    } else {
      //TODO
    }
  }

  get ready() : Promise<void> {
    if (this.book instanceof EPUBBook) {
      return this.book.ready
    } else {
      // TODO
      throw new Error("PDF does not support ready")
    }
  }

  get locations() : EPUBLocations {
    if (this.book instanceof EPUBBook) {
      return this.book.locations
    } else {
      // TODO
      throw new Error("PDF does not support locations")
    }
  }
}
