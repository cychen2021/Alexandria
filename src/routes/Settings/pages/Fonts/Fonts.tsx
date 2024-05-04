import React, { useEffect, useState } from "react"
import { Virtuoso } from 'react-virtuoso'

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import styles from './Fonts.module.scss'

import SaveIcon from '@resources/iconmonstr/iconmonstr-save-14.svg'
import TashIcon from '@resources/feathericons/trash-2.svg'
import CloudIcon from '@resources/iconmonstr/iconmonstr-cloud-download-thin.svg'
import ComputerIcon from '@resources/iconmonstr/iconmonstr-computer-10.svg'
import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { platform } from '@tauri-apps/api/os';



import webfonts from '@resources/Alexandria-Assets/webfonts.json'
import toast from "react-hot-toast";
import { useAppSelector } from "@store/hooks";
const myStyle = webfonts.items.map((item) => { return {name:item.family, link:item.files.regular,menu:item.menu, files: item.files}})


const defaultMarks = [100,200,300,400,500,600,700,800].reduce((a, v)=>{
  
  return {...a, ...{
    [v]:{label: <div style={{fontWeight:v}}>{v}</div>}
  }}
  
},{})
type ListFontsType =  {[key: string]: boolean} ;
const FontManager = (props:any)=>{

  const [textFiltered, setTextFilter] = useState("")
  const [fontList, setFontList] = useState<{[key: string]: boolean}>({})

  const [availableMarks, setAvailableMarks] = useState(defaultMarks)
  const [selectedFont, setSelectedFont] = useState("Roboto")
  const [selectedWeight, setSelectedWeight] = useState(500)
  const [currentDataList, setCurrentDataList] = useState(myStyle)

 
  const localFontList = useAppSelector((state)=> state.appState.state.localSystemFonts || {})
  const [localFontListFiltered, SetLocalFontsListFiltered] = useState(localFontList)

  useEffect(()=>{
    platform().then((result)=>{
      let IS_LINUX = false
      if(result == "linux"){
        IS_LINUX = true
      }

      invoke("list_fonts").then((response)=>{
        const typedResponse = response as ListFontsType
        setFontList(typedResponse)
        Object.keys(typedResponse).forEach((item)=>{
          // If not true, meaning a system font, continue
          if(!typedResponse[item]){
            return
          }
          invoke("get_font_urls", {name: item}).then((paths)=>{
            const typedPaths = paths as [string]
            const newPath = typedPaths.find((path)=> path.includes("400.ttf"))
            if(newPath == undefined){
              console.log("font was not found")
              return
            }
            console.log(newPath)
            // if(!path) return
            // // this means if the name has an extension like .ttf
            // if(item.includes(".")){
            const fontName = item.split(".")[0].replaceAll(" ", "_")
            let fontSource = convertFileSrc(newPath)
            if(IS_LINUX){
              fontSource = encodeURI("http://127.0.0.1:16780/" + newPath.split('/').slice(-4).join("/"))
            }
            const font = new FontFace(fontName, `url("${fontSource}") format('truetype')`);
            //   // wait for font to be loaded
            font.load().then(()=>{
              document.fonts.add(font);
            }).catch((e)=>{
              console.log("Caught font load error")
              console.log(e)
            });
            // }
  
          })
        })
  
        
  
      })
    })

  }, [])
  const localFontListKeys = Object.keys(localFontListFiltered)
  const installedFonts = Object.keys(fontList)
  const installedFontsLength = textFiltered == "" ? installedFonts.length: 0
  return (
    <div className={styles.themeContainer}>
      
      {/* 
      Disabled for now, we will look into this in the future
      <div onClick={()=>{
        console.log("Placeholder install from device")
      }}>Install From Device</div> */}


      <div className={styles.fontPreviewText}>Font Preview: </div>
      <div className={styles.fontRow}>
        <div></div>
        <div style={{fontFamily:selectedFont, fontWeight: selectedWeight, fontSize:28}}>{selectedFont}</div>
        <div></div>
      </div>

      <div className={styles.sliderContainer}>
        {(selectedFont in localFontListFiltered)?<div></div>:
          <link href={`https://fonts.googleapis.com/css2?family=${selectedFont}:wght@${Object.keys(availableMarks).reduce((a, v)=>{return (a==""? a + v: a + ";" + v)},"")}&display=swap`} rel="stylesheet"></link>
      
        }
      
        <div style={{height:25, "visibility":Object.keys(availableMarks).length == 1?"hidden":"visible"}}>
          <Slider
            marks={availableMarks}
            min={Math.min(...Object.keys(availableMarks).map((item)=> parseInt(item)))}
            className={styles.slider}
            step={null}
            onChange={(e)=>{
              if(typeof e === "number"){
                setSelectedWeight(e)
              }

            }}
            value={selectedWeight}
            max={Math.max(...Object.keys(availableMarks).map((item)=> parseInt(item)))}/>
        </div>

      </div>
    

    
      <div className={styles.comboContainer}>
        <div className={styles.comboContainerText}>Font Name</div>
        <input onChange={(e)=>{
          console.log(e.target.value,e.target.value.length)
          setTextFilter(e.target.value)
          setCurrentDataList(myStyle.filter((item)=>item.name.toLowerCase().includes(e.target.value.toLowerCase())))
          
          type objType = typeof localFontList
          const filterObjects = (obj:objType, predicate:any) =>  Object.fromEntries(Object.entries(obj).filter(predicate));
          SetLocalFontsListFiltered(
            filterObjects(localFontList, ([key, value])=>{
              return key.toLowerCase().includes(e.target.value.toLowerCase())
            }
          
            ))
          
        }} value={textFiltered} style={{display:"block"}} className={styles.comboTextBox}/>
      </div>

      {/* <div style={{backgroundColor:"white"}}>Installed & Enabled Fonts</div> */}
      <div className={styles.listContainer}>
        <Virtuoso style={{ height: '100%' }} totalCount={installedFontsLength + Object.keys(localFontListFiltered).length + currentDataList.length} itemContent={index => {



          const mappedFontName = installedFonts[index]
          
          if(index < installedFontsLength){
            return (<div className={styles.localThemeContainer}>
              <div className={styles.localButtonsContainer}>
                <TashIcon onClick={()=>{
                  const filtered = Object.fromEntries(Object.entries(fontList).filter(([k,v]) => k != mappedFontName));

                  setFontList(filtered)


                  invoke("delete_font", {name: mappedFontName}).then(()=>{
                    console.log("Font deleted")
                  })
                }} className={styles.trash}/>     

              </div>
              <div className={`${styles.fontNameBox} ${styles.label}`} style={{fontFamily:mappedFontName.split(".")[0].replaceAll(" ", "_") + "," + mappedFontName}}>{mappedFontName}</div>
              <div className={styles.remoteButtonsContainer}> 
                {/* <SaveIcon/> */}
              </div>
            </div>)

          }else if (index < installedFontsLength + Object.keys(localFontListFiltered).length){
            
            const localFontFamily = localFontListKeys[index - installedFontsLength]
            // console.log(localFontFamily, localFontFamily, index)

            return (

              <div onClick={()=> {
                setSelectedFont(localFontFamily)
                console.log(localFontList[localFontFamily])
                const mapped = localFontList[localFontFamily].reduce((a, v)=>{
                  if(v.includes("italic")){
                    return a
                  }
                  return {...a, ...{
                    [v=="regular"?400:v]:{label: <div style={{fontWeight:v}}>{v}</div>}
                  }}
                  
                },{})
                console.log(mapped)
                setAvailableMarks(mapped)
                setSelectedWeight(400)
              }} className={styles.localThemeContainer} style={
                {
                  // fontWeight:(selectedFont == localFontFamily? "bold":""), 
                  backgroundColor:(selectedFont == localFontFamily? "var(--background-secondary)":""), 
                  // border:(selectedFont == currentDataList[modifiedIndex].name? "2px solid var(--background-primary)":""), 
                  // fontFamily:localFontFamily
                }
                
              }>
                <div className={styles.localButtonsContainer}>
                  {!installedFonts.includes(localFontFamily)?<ComputerIcon className={styles.sourceIcon}/>:<div></div>}

                </div>
                <div className={`${styles.fontNameBox}`} style={{fontFamily:localFontFamily}}>{localFontFamily} </div>
                <div className={styles.remoteButtonsContainer}> 
                  {(selectedFont == localFontFamily) && !Object.keys(fontList).includes(selectedFont)? 
                    <SaveIcon style={{marginRight:30}} onClick={async ()=>{

                      invoke("add_system_font",{name: localFontFamily})
                      const cloned = {...fontList}
                      cloned[localFontFamily] = true
                      setFontList(cloned)
        
                    }}/>
                
                    :Object.keys(fontList).includes(localFontFamily)?<div style={{fontFamily:"noto sans"}}>Font Saved</div>:<div/>}
                </div>
              </div>
            )
          }else{
            const modifiedIndex = index - (installedFontsLength + Object.keys(localFontListFiltered).length)
            return (<div onClick={()=> {
              setSelectedFont(currentDataList[modifiedIndex].name)
              console.log(Object.keys(currentDataList[modifiedIndex].files))
              const mapped = Object.keys(currentDataList[modifiedIndex].files).reduce((a, v)=>{
                if(v.includes("italic")){
                  return a
                }
                return {...a, ...{
                  [v=="regular"?400:v]:{label: <div style={{fontWeight:v}}>{v}</div>}
                }}
                
              },{})
              console.log(mapped)
              setAvailableMarks(mapped)
              setSelectedWeight(400)
            }} className={styles.localThemeContainer} style={
              {
                fontWeight:(selectedFont == currentDataList[modifiedIndex].name? "bold":""), 
                backgroundColor:(selectedFont == currentDataList[modifiedIndex].name? "var(--background-secondary)":""), 
                // border:(selectedFont == currentDataList[modifiedIndex].name? "2px solid var(--background-primary)":""), 
                fontFamily:currentDataList[modifiedIndex].name}
              
            }>
              <div className={styles.localButtonsContainer}> {Object.keys(fontList).includes(currentDataList[modifiedIndex].name)?<div/>:<CloudIcon className={styles.sourceIcon}/>}</div>
              <div className={styles.fontNameBox}>
                {currentDataList[modifiedIndex].name}
                <style>
                  {`@font-face {
      font-family: ${currentDataList[modifiedIndex].name};
      src: url(${currentDataList[modifiedIndex].menu.replace("http","https")});
  }`}
                </style>
                {/* <link href={`https://fonts.googleapis.com/css2?family=${currentDataList[index].name.replace(" ","+")}&display=swap`} rel="stylesheet"></link> */}
              </div>
              <div className={styles.remoteButtonsContainer}> 
                {(selectedFont == currentDataList[modifiedIndex].name) && !Object.keys(fontList).includes(selectedFont)? 
                  <SaveIcon style={{marginRight:30}} onClick={async ()=>{

                    const found = currentDataList.find(element => element.name == selectedFont);
                    console.log("Hi")
                    const myFiles = {...found.files};
                    if (myFiles["regular"] != undefined){
                      myFiles["400"] = myFiles["regular"]
                      delete myFiles["regular"]
                    }
        
                    console.log(myFiles)
                    let promiseResolve:any, promiseReject:any;
        
                    const toastPromise = new Promise(function(resolve, reject){
                      promiseResolve = resolve;
                      promiseReject = reject;
                    });
                    toast.promise(toastPromise, {
                      loading: 'Downloading Font',
                      success: 'Font Downloaded Successfully',
                      error: 'Error occurred when fetching',
                    });
                    const myFileKeys = Object.keys(myFiles)
                    let myFileCount = myFileKeys.filter((item)=> !item.includes("italic")).length;
      
                    for(const weight of myFileKeys){
                      if(weight.includes("italic")) {continue}

                      console.log("Starting Font Download", myFileCount,weight, myFiles[weight])

                      try {
                        await invoke("download_font", {url:myFiles[weight], name: selectedFont, weight: "" + weight})
                      } catch (error) {
                        console.log("Font Download Failed:", e)
                        promiseReject()
                        continue
                      }

                      console.log("Font Download Success", myFileCount)
                      
                      myFileCount -= 1
                      if(myFileCount == 0){
                        promiseResolve()
                        const cloned = {...fontList}
                        cloned[selectedFont] = true
                        setFontList(cloned)

                      }
                    }
        
        
        
                    // invoke("download_font", {url:fontUrl, name: selectedFont, weight: "" + selectedWeight})
        
                  }}/>
                
                  :Object.keys(fontList).includes(currentDataList[modifiedIndex].name)?<div style={{fontFamily:"noto sans"}}>Font Saved</div>:<div/>}
              </div>
            </div>)
          }

        
        
        }} />
        
      </div>
    </div>

    

  )
}

export default FontManager