import { Rendition as EPUBRendition } from "@btpf/epubjs";
import { assert } from "console";
import { PDFPageProxy } from "pdfjs-dist";

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
      page.render({canvasContext: this.canvas.getContext("2d") ?? new CanvasRenderingContext2D(), viewport: page.getViewport({scale: 1})})
    })
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
      return
    } else {
      this.rendition.destroy()
    }
  }

  //  FIXME
  currentLocation() {
    if (this.rendition instanceof PDFRendition) {
      return
    } else {
      return this.rendition.currentLocation()
    }
  }
}
