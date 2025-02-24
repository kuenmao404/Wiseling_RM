import React, { useState, useEffect, useRef } from 'react'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { IconButton, Box, CardMedia } from '@mui/material';

export default function Carousel({
  imgs = null,
  sec = 5,
  ...props
}) {
  const [idx, setIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false) // 單張就不autoPlay
  const [isPlaying, setPlaying] = useState(false) // 是否自動撥放
  const [isLoad, setIsLoad] = useState(false)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(null)
  const carouselEl = useRef(null)
  const wrapperEl = useRef(null)

  useEffect(() => {
    (!!imgs && imgs?.length > 0) ? setAutoPlay(true) : setAutoPlay(false)
    setIdx(0)
  }, [imgs])

  const changeImg = (index = idx + 1) => {
    let len = imgs?.length
    let newIdx = (index >= len ? 0 : index < 0 ? len - 1 : index)
    setIdx(newIdx)
  }

  useInterval(() => {
    changeImg()
  }, !!isPlaying ? 1000 * sec : null)

  const onResize = () => {
    let w = wrapperEl.current.getBoundingClientRect().width;
    setWidth(w)
    setHeight(carouselEl?.current?.getBoundingClientRect()?.height)
  }

  useEventListener("resize", onResize);

  useEffect(() => {
    onResize()
  }, [wrapperEl?.current?.getBoundingClientRect().width])

  useEffect(() => {
    setHeight(carouselEl?.current?.getBoundingClientRect()?.height)
  }, [width])

  return (
    <Box
      sx={{ flex: "1 1 auto", position: "relative", minHeight: height }}
      ref={wrapperEl}
    >
      <Box
        sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            flex: "1 1 auto",
            overflowX: "clip",
            width: "100%"
          }}
          onMouseEnter={e => setPlaying(false)}
          onMouseLeave={e => setPlaying(true)}
          ref={carouselEl}
        >
          {imgs?.length > 1 &&
            <>
              <IconButton
                sx={{ zIndex: 4, left: "2px", ...carousel_btn_sx, visibility: !!autoPlay && !isPlaying ? "visible" : "hidden", transition: "all .1s" }}
                onClick={e => changeImg(idx - 1)}
              >
                <ArrowBackIosNewIcon sx={{ color: "rgba(255, 255, 255, .9)" }} />
              </IconButton>
              <IconButton
                sx={{ zIndex: 4, right: "2px", ...carousel_btn_sx, visibility: !!autoPlay && !isPlaying ? "visible" : "hidden", transition: "all .1s" }}
                onClick={e => changeImg(idx + 1)}
              >
                <ArrowForwardIosIcon sx={{ color: "rgba(255, 255, 255, .9)" }} />
              </IconButton>
              <Box className="page_wrapper" sx={{ visibility: !!autoPlay && !isPlaying ? "visible" : "hidden", transition: "all .1s" }}>
                {
                  !!imgs && imgs?.filter(f => !f.hide).map((m, i) =>
                    <div key={i} className={`page_index ${i == idx ? "page_select" : ""}`}
                      onClick={e => changeImg(i)}></div>
                  )
                }
              </Box>
            </>
          }
          <Box
            sx={{ ...carousel_imgs_sx, transform: `translate(${-width * idx}px)` }}
          // className="carousel_imgs"
          >
            {
              !!imgs && imgs?.filter(f => !f.hide).map((img, index) =>
                <Box key={img?.src} sx={{ width: `${width}px`, backgroundColor: "#000000bd" }} className="flex aic jcc">
                  <CardMedia
                    sx={{ maxHeight: "100%", maxWidth: "100%" }}
                    onLoad={() => (onResize(), setPlaying(true))}
                    component="img"
                    image={`${img?.src}`}
                  />
                </Box>
              )
            }
          </Box>
        </Box>
      </Box>
    </Box >
  )
}

const carousel_imgs_sx = {
  display: "flex",
  flexDirection: "row",
  transition: "transform 400ms ease-in-out",
  height: "100%",
}

const carousel_btn_sx = {
  position: "absolute !important",
  backgroundColor: "rgba(0, 0, 0, .03)"
}


export { useInterval, useEventListener }

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}