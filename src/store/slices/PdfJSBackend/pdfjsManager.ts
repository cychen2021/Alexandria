import { createAsyncThunk } from "@reduxjs/toolkit";
import { setThemeThunk } from "../EpubJSBackend/data/theme/themeManager";
import { RootState } from "@store/store";
import { SyncedAddRenditionPayload } from "../backendTypes";
import { Rendition as PDFRendition } from "src/routes/Reader/wrapper";

export const SyncedAddRendition = createAsyncThunk(
  "bookState/SyncedAddRendition/pdf",
  async (renditionData: SyncedAddRenditionPayload, thunkAPI) => {
    if(renditionData.firstLoad){
      thunkAPI.dispatch(setThemeThunk({
        view: renditionData.UID,
        themeName: (thunkAPI.getState() as RootState).appState.selectedTheme
      }))

      return
    }
    if (window.__TAURI__) {
      const bookmarks = renditionData.saveData.data.bookmarks
      const highlights = renditionData.saveData.data.highlights
      
      const renditionInstance = renditionData.instance as PDFRendition

      // TODO: Support highlights
      // TODO: Support bookmarks
    }
    return true
  }
)
