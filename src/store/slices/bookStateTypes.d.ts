// import { Rendition as EPUBRendition, Rendition } from '@btpf/epubjs'
import { LOADSTATE } from './constants'
import { bookStateStructure } from "./EpubJSBackend/epubjsManager.d.ts"
import { Rendition } from 'src/routes/Reader/wrapper'

interface BackendInstance{
  instance: Rendition
  UID: number,
  hash: string,
  initialLoadState?: LOADSTATE
}

export interface BookInstances {
  [key: string]: bookStateStructure | unknown // some other rendering backend
}