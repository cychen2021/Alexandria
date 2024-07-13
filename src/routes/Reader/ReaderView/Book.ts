import { Book as EPUBBook, EpubCFI } from '@btpf/epubjs';
import EPUBLocations  from '@btpf/epubjs/types/locations'
import { RenditionOptions, DisplayedLocation as EPUBDisplayedLocation } from '@btpf/epubjs/types/rendition';
import { PDFDocumentProxy } from 'pdfjs-dist'
import { PDFRendition as PDFRendition, Rendition } from '../wrapper'

// TODO: Fix this
export type DisplayedLocation = EPUBDisplayedLocation

// TODO: Fix this
class PDFLocations {
  load(_locations: string) {

  }

  generate(chars: number): Promise<Array<string>> {
    return Promise.resolve([])
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
      this.book.destroy()
    }
  }

  get ready() : Promise<void> {
    if (this.book instanceof EPUBBook) {
      return this.book.ready
    } else {
      return this.book.loadingTask.promise.then()
    }
  }

  get locations() : EPUBLocations | PDFLocations {
    if (this.book instanceof EPUBBook) {
      return this.book.locations
    } else {
      return new PDFLocations()
    }
  }
}
