import React, { Fragment, useState, useEffect } from 'react'

const KeyPress = (props) => {
  const { keyList, onSuccess = () => { console.log('觸發') } } = props

  const [keypress, setKeyPress] = useState({})

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    }
  }, [keypress])

  const onKeyDown = (e) => {
    setKeyPress({ ...keypress, [e.keyCode]: true })
  }

  const onKeyUp = (e) => {

    if (!!keypress[keyList?.[0]] && e.keyCode == keyList?.[1]) {
      onSuccess()
    }
    setKeyPress({ ...keypress, [e.keyCode]: false })
  }

  return (
    <Fragment />
  )
}

export default KeyPress
export { EditorKeyPress, AddNoteKeyPress }

const EditorKeyPress = (props) => {
  const { player } = props

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keyup", onKeyUp);
    }
  }, [player])

  const onKeyUp = (e) => {
    if (e.ctrlKey) {
      switch (e.keyCode) {
        case 18: {  // Ctrl + Alt
          if (!!player && !!player?.playVideo && !!player.pauseVideo) {
            player.getPlayerState() == 1 ? player.pauseVideo() : player.playVideo();
          }
          break
        }
        case 37: { // Ctrl + 左邊
          if (!!player?.seekTo)
            player.seekTo((player?.getCurrentTime() - 5));
          break
        }
        case 39: { // Ctrl + 右邊
          if (!!player?.seekTo)
            player.seekTo((player?.getCurrentTime() + 5));
          break
        }
      }
    }
  }


  return (
    <Fragment />
  )
}

const AddNoteKeyPress = (props) => {
  const { handlePreAddNote } = props

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keyup", onKeyUp);
    }
  }, [])

  const onKeyUp = (e) => {
 
    if (e.ctrlKey) {
      switch (e.keyCode) {
        case 13: {  // Ctrl + Enter
          handlePreAddNote()
          break
        }
      }
    }
  }


  return (
    <Fragment />
  )
}