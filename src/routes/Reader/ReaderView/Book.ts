import { Book as EPUBBook, Rendition as EPUBRendition } from '@btpf/epubjs';
import EPUBLocations  from '@btpf/epubjs/types/locations'
import { DisplayedLocation, RenditionOptions } from '@btpf/epubjs/types/rendition';
import { PDFDocumentProxy } from 'pdfjs-dist'

export class Rendition {
  private rendition: EPUBRendition | {
    canvas: HTMLCanvasElement,
    pdf: PDFDocumentProxy,
  }

  constructor(rendition: EPUBRendition | {canvas: HTMLCanvasElement, pdf: PDFDocumentProxy}) {
    this.rendition = rendition;
  }
  display(target? : string | number) : Promise<void> {
    if (this.rendition instanceof EPUBRendition) {
      if (target === undefined) {
        return this.rendition.display()
      } else if (typeof target === "number") {
        return this.rendition.display(target)
      } else {
        return this.rendition.display(target)
      }
    } else {
      // TODO: Mock `target` for PDF
      const canvas = this.rendition.canvas;
      return this.rendition.pdf.getPage(1).then((page) => {
        const viewport = page.getViewport({scale: 1})
        const context = canvas.getContext("2d") ?? new CanvasRenderingContext2D()
        canvas.height = viewport.height
        canvas.width = viewport.width
        page.render({canvasContext: context, viewport: viewport})
      })
    }
  }

  destroy() : void {
    if (this.rendition instanceof EPUBRendition) {
      this.rendition.destroy()
    } else {
      //TODO
    }
  }

  clear() : void {
    if (this.rendition instanceof EPUBRendition) {
      this.rendition.clear()
    } else {
      //TODO
    }
  }
  
  currentLocation() : DisplayedLocation | undefined {
    if (this.rendition instanceof EPUBRendition) {
      return this.rendition.currentLocation()
    } else {
      //TODO
    }
  }
}

export class Book {
  private book: EPUBBook | PDFDocumentProxy
  renderTo(element: string, settings: RenditionOptions) : Rendition {
    if (this.book instanceof EPUBBook) {
      return new Rendition(this.book.renderTo(element, settings))
    } else { 
      let canvas = document.getElementById(element) as HTMLCanvasElement | null
      if (canvas === null) {
        canvas = document.createElement("canvas")
        canvas.id = element
      }
      return new Rendition({canvas: canvas, pdf: this.book})
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
