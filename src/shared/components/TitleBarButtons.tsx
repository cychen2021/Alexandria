import styles from './TitleBarButtons.module.scss'
import React from 'react'

import ExitIcon from '@resources/figma/Exit.svg'
import MaximizeIcon from '@resources/figma/Maximize.svg'
import UnMaximizeIcon from '@resources/figma/Unmaximize.svg'
import MinimizeIcon from '@resources/figma/Minimize.svg'
import { exit } from '@tauri-apps/api/process';
import { appWindow } from '@tauri-apps/api/window';
import { useAppSelector } from '@store/hooks'

interface TitleBarButtonsProps {
  disabled: boolean,
  remove: boolean
}

const defaultProps: TitleBarButtonsProps = {
  disabled: false,
  remove: false
}

const TitleBarButtons = (props:TitleBarButtonsProps)=>{
  
  const maximized = useAppSelector((state)=> state.appState.state.maximized)

  return (
    <div className={`${styles.titleBarButtonsContainer} ${props.remove?styles.remove:""} ${props.disabled?styles.disabled:""}`}>
      <MinimizeIcon onClick={async ()=>{
        await appWindow.minimize();
      }} viewBox="10 10 20 20"className={styles.titleBarButton} color="white"/>

      {!maximized?
        <MaximizeIcon onClick={async ()=>{
          await appWindow.maximize();
        }} viewBox="10 10 20 20" className={styles.titleBarButton}/>
        :
        <UnMaximizeIcon onClick={async ()=>{
          await appWindow.unmaximize();
        }} viewBox="10 10 20 20" className={styles.titleBarButton}/>}
      
      <ExitIcon onClick={async ()=>{
        await exit(1)
      }} viewBox="10 10 20 20" className={`${styles.titleBarButton} ${styles.titleBarExit}`}/>
    </div>
  )
}
TitleBarButtons.defaultProps = defaultProps

export default TitleBarButtons