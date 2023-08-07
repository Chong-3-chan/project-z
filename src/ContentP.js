import React, { useContext, useEffect, useRef, useState } from "react";
import './ContentP.css';
import { QStyle, createStyle } from "./data/spring";
import { useSpring, animated } from "react-spring";
import { homeResource_map } from "./HomeP";
import { getFileSrc } from "./data/extra-test-data";
import { classNames, pageContext } from "./App";

let closing = null;
function ContentP() {
  const { pageAction: action, pageState } = useContext(pageContext);
  const [index, setIndex] = useState(0)
  const [moving, setMoving] = useState(false)
  const [footerText, setFooterText] = useState("");
  const [bookList, mini, maxi] = ((e) => [e.current, 0, e.current.length - 1])(useRef(Object.entries(homeResource_map.booksCover)))
  const [wrapperStyle, ws_api] = useSpring(() => createStyle(QStyle.LF("0rem"), QStyle.CFG_B))
  const [displayState, setDisplayState] = useState("in");
  useEffect(() => {
    closing && (clearTimeout(closing), closing = null);
    displayState == "in" && setTimeout(() => setDisplayState("default"), 200);
    displayState == "out" && (closing = setTimeout(() => (action.setCoverPage(null), clearTimeout(closing)), 200));
  }, [displayState])
  useEffect(() => {
    ws_api.start(createStyle(QStyle.LF(`${-6 * index}rem`),
      { onRest: () => setMoving(false) }))
  }, [index])
  useEffect(() => {
    if (moving) return;
    if (bookList[index][1].disable) {
      setFooterText("未解锁")
    }
    else setFooterText("从这里开始")
  }, [moving])
  function handlePrev() {
    index > mini && (setIndex(index - 1),
      setMoving(true))
  }
  function handleNext() {
    index < maxi && (setIndex(index + 1),
      setMoving(true))
  }
  function handleDot(i) {
    setIndex(i)
  }
  return (
    <div className={classNames("ContentP", displayState == "out" && "out")}
      onClickCapture={(e) => displayState != "default" && e.stopPropagation()}>
      <div className="header">{bookList[index][0]}</div>
      <div className={"container"}>
        <div className="viewer">
          <animated.div className="wrapper" style={wrapperStyle}>
            {
              bookList.map(([bookId, { fileKey, disable }], i) => {
                return <div className={classNames("img-box", i === index && "active", disable && "locked")} key={i} >
                  <img src={getFileSrc(fileKey)} alt=""
                    onClickCapture={() => !moving && !disable && action.setActivePage("main", { bookName: bookId })} />
                </div>
              })
            }
          </animated.div>
        </div>
        <div className="btn left" onClickCapture={handlePrev}></div>
        <div className="btn right" onClickCapture={handleNext}></div>
        <div className=""></div>
        {/* <div className="dots">
        {
          imgList.map((item, i) => {
            return <span key={i} className={i === index ? 'active' : ''} onClick={() => handleDot(i)}></span>
          })
        }
      </div> */}
      </div>
      <div className={classNames("footer", moving && "hide")} >
        {footerText}
      </div>
      <div className='fixed-buttons-bar'>
        <div className='close' onClickCapture={() => setDisplayState("out")}></div>
      </div>
    </div>
  )
}
export default ContentP;