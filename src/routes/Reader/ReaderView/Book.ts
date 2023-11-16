import { Book as EPUBBook, Rendition as EPUBRendition } from '@btpf/epubjs'
import { PDFDocumentProxy } from 'pdfjs-dist'

export class Rendition {
  private rendition: EPUBRendition | {
    canvas: HTMLCanvasElement,
    pdf: PDFDocumentProxy,
  }

  constructor(rendition: EPUBRendition | {canvas: HTMLCanvasElement, pdf: PDFDocumentProxy}) {
    this.rendition = rendition;
  }

  display() : Promise<void> {
    if (this.rendition instanceof EPUBRendition) {
      return this.rendition.display()
    } else {
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
}

export class Book {
  private book: EPUBBook | PDFDocumentProxy
  renderTo(element: string) : Rendition {
    if (this.book instanceof EPUBBook) {
      return new Rendition(this.book.renderTo(element))
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
}
