import { Rendition as EPUBRendition } from "@btpf/epubjs";
import { assert } from "console";
import { PDFPageProxy } from "pdfjs-dist";
import { DisplayedLocation } from "./ReaderView/Book";

export class PDFRendition {
  page: Promise<PDFPageProxy>
  canvas: HTMLCanvasElement

  constructor(page: Promise<PDFPageProxy>, canvas: HTMLCanvasElement) {
    this.page = page
    this.canvas = canvas
  }

  display(target: string | number | undefined = undefined): Promise<void> {
    assert(target === undefined, "PDFjs does not support displaying to a specific target.")

    return this.page.then((page) => {
      const naturalPdfSize = page.getViewport({scale: 1})
      const naturalPdfRatio = naturalPdfSize.width / naturalPdfSize.height
      const appSize = {width: this.canvas.width, height: this.canvas.height}
      const appRatio = appSize.width / appSize.height
      const pdfToAppRatio = naturalPdfRatio / appRatio
      const scale = devicePixelRatio * pdfToAppRatio
      const viewpoint = page.getViewport({scale: scale})
      page.render({canvasContext: this.canvas.getContext("2d")!!, viewport: viewpoint}).promise.then()

      // TODO: Complete this
      this._currentLocation = {
        index: 0,
        href: "",
        cfi: "",
        location: 0,
        percentage: 0,
        displayed: {
          page: page.pageNumber,
          total: 0,
        }
      }
    })
  }

  clear() {
    this.page.then((page) => {
      page.cleanup() 
    })
  }

  _currentLocation: DisplayedLocation | undefined

  currentLocation(): DisplayedLocation {
    return this._currentLocation!!
  }
}

export class Rendition {
  private rendition: EPUBRendition | PDFRendition

  constructor(rendition: EPUBRendition | PDFRendition) {
    this.rendition = rendition;
  }

  display(target? : string | number) : Promise<void> {
    if (target === undefined) {
      return this.rendition.display()
    } else if (typeof target === "number") {
      return this.rendition.display(target)
    } else {
      return this.rendition.display(target)
    }
  }

  destroy() {
    if (this.rendition instanceof PDFRendition) {
      // We don't really destroy the page, but instead clean up some settings.
      //  The destroy of a page can only be done by the document that contains it.
      this.rendition.clear()
    } else {
      this.rendition.destroy()
    }
  }

  clear() {
    if (this.rendition instanceof PDFRendition) {
      this.rendition.clear()
    } else {
      this.rendition.clear()
    }
  }

  //  FIXME
  currentLocation() {
    if (this.rendition instanceof PDFRendition) {
      return this.rendition.currentLocation()
    } else {
      return this.rendition.currentLocation()
    }
  }
}
