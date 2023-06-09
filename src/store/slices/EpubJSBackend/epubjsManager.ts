import { ActionReducerMapBuilder, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { invoke } from "@tauri-apps/api"
import { castDraft } from "immer"
import { CalculateBoxPosition, NOTE_MODAL_HEIGHT, NOTE_MODAL_WIDTH } from "src/routes/Reader/ReaderView/functions/ModalUtility"
// import { bookState } from "../bookStateSlice"
import { bookState } from "../bookState"



// import { bookState } from "../bookStateSlice"
import { BackendInstance, BookInstances } from "../bookStateTypes"
import { LOADSTATE } from "../constants"
import { bookStateStructure, expectedLoadData, loadProgressUpdate } from "./epubjsManager.d"

import { epubjs_reducer } from "@store/slices/EpubJSBackend/epubjsManager.d"



export const SyncedAddRendition = createAsyncThunk(
  'bookState/SyncedAddRendition',
  // if you type your function argument here
  async (renditionData: BackendInstance, thunkAPI) => {


    // console.log("ASYNC CALLED 1")
    if(window.__TAURI__){
      // invoke("get_books").then((data)=>{
      //   setBooks((data as BookData[]))
      // })
      
      // console.log(thunkAPI.getState())
      // thunkAPI.dispatch(AddHighlight(highlightData))
      // console.log(thunkAPI.getState())
      
      // Eventually, this should match bookStateStructure.data

            
      const result:expectedLoadData = await invoke("load_book_data", {checksum: renditionData.hash})
      console.log("ExpectedLoad", result)
         
      
      const bookmarks = result.data.bookmarks
      const highlights = result.data.highlights
      
      const renditionInstance = renditionData.instance
      
      for (const [cfiRange, value] of Object.entries(highlights)) {
        thunkAPI.dispatch(bookState.actions.AddHighlight({highlightRange:cfiRange, color:value.color, note:value.note, view:0}))
      
        renditionInstance.annotations.highlight(cfiRange,{}, (e:MouseEvent) => {
      
          // This will prevent page turning when clicking on highlight
          thunkAPI.dispatch(bookState.actions.SkipMouseEvent(0))
      
      
          const boundingBox = renditionInstance.getRange(cfiRange).getBoundingClientRect()
          const {x, y} = CalculateBoxPosition(
            renditionInstance?.manager?.container?.getBoundingClientRect(),
            boundingBox,
            NOTE_MODAL_WIDTH,
            NOTE_MODAL_HEIGHT)
                
          thunkAPI.dispatch(bookState.actions.SetModalCFI({view:0,selectedCFI:cfiRange}))
          thunkAPI.dispatch(bookState.actions.MoveNoteModal({
            view: 0,
            x,
            y,
            visible: true
          }))
      
                
        }, '', {fill:value.color});
      }
      
      bookmarks.forEach((bookmark)=>{
        thunkAPI.dispatch(bookState.actions.ToggleBookmark({
          view: 0,
          bookmarkLocation: bookmark
        }))
      })
      
      thunkAPI.dispatch(bookState.actions.SetProgress({view:0, progress:result.data.progress}))
            
      
    }
          
    return true
  }
)



export const builderFunc = (builder:ActionReducerMapBuilder<BookInstances>) =>{
  builder.addCase(SyncedAddRendition.pending, (state, action) => {
    console.log("PENDING CASE")
    const t:bookStateStructure = {
      title: action.meta.arg.title,
      instance: action.meta.arg.instance,
      UID: action.meta.arg.UID, 
      hash: action.meta.arg.hash,
      loadState:LOADSTATE.LOADING, 
      data:{
        progress: 0,
        highlights:{},
        bookmarks: new Set(), 
        theme:{
          font:"Helvetica, sans-serif", 
          fontSize:100,
          backgroundColor:'white',
          color:'grey'
        }
      }, 
      state:{
        sidebarMenuSelected: false,
        menuToggled: false, 
        themeMenuActive: false,
        skipMouseEvent: false,
        modals:{
          selectedCFI: "",
          quickbarModal: {visible: false, x:0, y:0},
          noteModal: {visible: false, x:0, y:0}
        }
      }}
    // https://github.com/immerjs/immer/issues/389
  
    state[action.meta.arg.UID] = castDraft(t)
  })
  
  builder.addCase(SyncedAddRendition.fulfilled, (state, action) => {
    console.log("Fulfulled Initial Load")
  })
}
  


const SetLoadState:epubjs_reducer = (state, action: PayloadAction<loadProgressUpdate>) =>{
  if (Object.keys(state).includes(String(action.payload.view))){
    state[action.payload.view].loadState = action.payload.state
  }

}

export const actions = {
  SetLoadState
}