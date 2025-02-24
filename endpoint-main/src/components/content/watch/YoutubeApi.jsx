import React, { Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'

export default function YoutubeApi(props) {
  const { videoid, onPlayerReady, onPlayerStateChange, onPlaybackQualityChange, setPlayer, t, playerid, player } = props

  useEffect(() => {
    if (!player && !!videoid) {
      !!videoid && loadYTApi()
    }
  }, [videoid, player])

  useEffect(() => {
    !!player && !!player?.seekTo && !!t && player?.seekTo(parseFloat(t))
  }, [t, player?.seekTo])

  useEffect(() => {
    !!player && !!videoid && !!player?.loadVideoById && player?.loadVideoById({
      videoId: videoid,
      startSeconds: parseFloat(t || 0)
    })
  }, [videoid])

  const loadYTApi = async () => {
    if (!window.YT) { // If not, load the script asynchronously
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = loadVideo; // onYouTubeIframeAPIReady will load the video after the script is loaded
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else { // If script is already there, load the video directly
      loadVideo();
    }
  }

  const loadVideo = () => { // the Player object is created uniquely based on the id in props
    setPlayer(new YT.Player(playerid, {
      videoId: videoid,
      playerVars: {
        'start': parseFloat(t)
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onPlaybackQualityChange': onPlaybackQualityChange,
      },
    }))
  };


  return (
    <Fragment>
    </Fragment>
  )
}

YoutubeApi.defaultProps = {
  t: 0,
  playerid: 'player',
  player: null,
  onPlayerReady: (event) => { },
  onPlayerStateChange: (event) => { },
  onPlaybackQualityChange: (event) => { },
  setPlayer: (player) => { },
}
