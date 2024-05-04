import React, { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import Trash from '@resources/feathericons/trash-2.svg'
import { ToggleBookmark } from '@store/slices/bookState'

import styles from './Bookmarks.module.scss'
import { CloseSidebarMenu } from '@store/slices/appState'
import { getChapterCFIMap } from '@shared/scripts/getChapterCfiMap'


interface Bookmark{
  cfi: string,
  title: string
}

const Bookmarks = ()=>{
  const dispatch = useAppDispatch()
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)

  const renditionInstance = useAppSelector((state) => state.bookState[selectedRendition]?.instance)
  const bookmarks = useAppSelector((state) => state.bookState[selectedRendition]?.data.bookmarks)
  const [orderedBookmarks, setOrderedBookmarks] = useState(Array<Bookmark>)


  useEffect(()=>{
    
    console.log(bookmarks)
    if(!bookmarks || !renditionInstance.book?.spine || !renditionInstance.book?.navigation?.toc){
      return
    }
    const workingBookmarks = Array.from(bookmarks)
  
  
  
    const allChapters = getChapterCFIMap(renditionInstance.book)

    
    const newOrderedBookmarks = workingBookmarks.map((cfi)=>{
      let titlename;
      for(const item in allChapters){
        if(!allChapters[item].cfi){
          continue
        }
        const comparison = renditionInstance.epubcfi.compare(cfi, allChapters[item].cfi)
        // In the case where the current chapter is ahead of our annotation, break before setting the title
        if (comparison < 0){
          break
        }
        titlename = allChapters[item].title.trim()
      }
      return {cfi, title:titlename}
    
    })

  
    // Sort annotations by location in book
    newOrderedBookmarks.sort((a, b)=>{
      return renditionInstance.epubcfi.compare(b.cfi, a.cfi)
    }
    )

    setOrderedBookmarks(newOrderedBookmarks)
  }, [bookmarks])

  return (
    <div>
      {orderedBookmarks.map((item)=>{
        return (
          <div key={item.cfi} className={styles.annotationContainer}>
            <div className={styles.AnnotationLeftSubContainer} onClick={()=>{
              renditionInstance.annotations.remove(item.cfi, "highlight")
              dispatch(ToggleBookmark({view: selectedRendition,bookmarkLocation:item.cfi}))
                
            }}> 
              <Trash/>
            </div>
            <div className={styles.AnnotationRightSubContainer} onClick={()=>{
              renditionInstance.display(item.cfi).then(()=>{
                renditionInstance.display(item.cfi)
              })
              dispatch(CloseSidebarMenu())
            }}> 
              <div className={styles.AnnotationChapter}>{item.cfi}</div>
                      
              <div className={styles.noteTextContainer}>{item.title}</div>
        
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Bookmarks