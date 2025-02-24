import React from 'react'
import { Box, Card, CardContent, CardMedia, Divider } from '@mui/material'
import MarkdownView from '../../elements/markdown/MarkdownView'
import Carousel from '../../elements/cards/Carousel'

const origin_host = window.location?.origin

export default function index({
  margin,
  width,
  md,
  ...props
}) {

  return (
    <Box sx={{ p: margin, backgroundColor: "#fff", position: "relative" }} className="flex-1-1">
      <MarkdownView source={Md} />
      <br />
      <LRCard
        text={
          <MarkdownView
            source={`## 影片筆記
使用者可以在此網站匯入YouTube影片來打造屬於自己的筆記。

可邊觀看影片邊依照時間點建立筆記，快速建立並找尋重點，並檢視專屬於自己的筆記本。`}
            backgroundColor={"inherit"}
          />
        }
        imgs={[{ src: `${origin_host}/imgs/help/note_1.png` }, { src: `${origin_host}/imgs/help/note_2.png` }, { src: `${origin_host}/imgs/help/note_3.png` }]}
        direction={!md ? "column" : "row"}
      />
      <br />
      <LRCard
        text={
          <MarkdownView
            source={`## 影片收藏
可自行分類影片的類型，在觀看影片介面把影片加入收藏清單，並可以從YouTube中加入新影片進入此系統。

設定好影片收藏清單後，便可以自動撥放整個清單內的影片，也能同步進行影片筆記功能。`}
            backgroundColor={"inherit"}
          />
        }
        imgs={[{ src: `${origin_host}/imgs/help/videolist_1.png` }, { src: `${origin_host}/imgs/help/videolist_2.png` },]}
        reverse={true}
        direction={!md ? "column" : "row"}
      />
      <br />
      <LRCard
        text={
          <MarkdownView
            source={`## 隨選播放
可從各部影片中挑選出重點筆記，並組合進隨選撥放清單，播放後會自動輪播筆記，輕鬆掌握學習重點。`}
            backgroundColor={"inherit"}
          />
        }
        imgs={[
          { src: `${origin_host}/imgs/help/notelist_1.png` },
          { src: `${origin_host}/imgs/help/notelist_2.png` },
        ]}
        direction={!md ? "column" : "row"}
      />
      <br />
      <LRCard
        text={
          <MarkdownView
            source={`## 課程
提供老師們開設課程，編排出自己的課程章節，開放學生加入學習。

可以觀看成員的學記紀錄，監督學生學習進度。`}
            backgroundColor={"inherit"}
          />
        }
        imgs={[
          { src: `${origin_host}/imgs/help/course_1.png` },
          { src: `${origin_host}/imgs/help/course_2.png` },
          { src: `${origin_host}/imgs/help/course_3.png` },
          { src: `${origin_host}/imgs/help/course_4.png` }
        ]}
        reverse={true}
        direction={!md ? "column" : "row"}
      />
    </Box>
  )
}

const LRCard = ({ text, imgs, reverse, direction = "row" }) => {


  return (
    <Card sx={{ display: 'flex', flexDirection: direction !== "column" ? (!reverse ? "row" : "row-reverse") : (!reverse ? "column" : "column-reverse"), position: "relative" }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: direction !== "column" ? "50%" : "100%", backgroundColor: "hsla(215, 15%, 97%, 0.5)", boxSizing: "border-box", p: 2 }}>
        {text}
      </Box>
      <Box sx={{ width: direction !== "column" ? "50%" : "100%", display: "flex", alignItems: "center", flex: "1 1 auto", backgroundColor: '#000000bd' }}>
        <Carousel
          imgs={imgs || [
            { src: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=400" },
            { src: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=400" },
            { src: "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=400&h=400" },
          ]}
        />
      </Box>
    </Card>
  )
}

const Md = `
# WiseLing - 智學記

<p align="center">
  <img src="${origin_host}/imgs/WISELING_Logo.png" title="WiseLing Logo" alt="WiseLing Logo" />
</p>

WiseLing的前身是 IT108 (已關站)，網站主軸以看影片寫筆記為主，影片來源為整合YouTube API技術透過時間點與筆記做結合，並延伸出影片筆記整合播放清單、課程系統、線上解題平台。正持續積極更新中….

WiseLing致力於提供一個完整且彈性的線上學習環境，記錄學習足跡，讓學習過程可視化，提升學習興趣與成就感，激發自主學習能力。
`