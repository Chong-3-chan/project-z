import React, { useState, useEffect, useRef } from 'react'
import { base_path } from "./App.js"
import { createStyle, QStyle } from './data/spring.js'
import { useSpring, animated, config } from 'react-spring'
import './a.css'
function preload(src, callback) {
  let img = new Image();
  img.onload = function () {
    img.onload = null;
    callback(img);
  }
  img.onerror = function () {
    callback(undefined);
  }
  img.src = src;
}
const load_phase = ["waiting", "loading", "loaded", "exiting", "exited"];

function LoadingP(props) {
  const { fileList, destroy, tips } = props;
  console.log(tips);
  const [tipNo, setTipNo] = useState(0);
  function changeTip() {
    let nextNo = ~~(Math.random() * (tips.length - 1));
    tps_api.start(createStyle(QStyle.OP_0, QStyle.LF("-16px"),
      {
        onRest: () => {
          setTipNo((nextNo < tipNo) ? nextNo : (nextNo + 1));
          tps_api.start(createStyle(QStyle.OP_1, QStyle.LF("0px")));
        }
      }));
  }
  const [num, setNum] = useState(0);
  const [errorNum, setErrorNum] = useState(0);
  const [phase, setPhase] = useState("waiting");
  const phase_style_delta = {
    "waiting": {
      pageStyle: createStyle(QStyle.WD("calc(0vw + 450px)"), QStyle.BGC_000_0, QStyle.OP_1, QStyle.CFG_A, QStyle.LF("-450px")),
      bodyStyle: createStyle(QStyle.WD("calc(0vw + 150px)"), QStyle.CFG_A),
      barStyle: createStyle({ width: `${0}%` }, QStyle.CFG_A),
      bodyInnerStyle: createStyle(QStyle.OP_0, QStyle.CFG_A),
      textStyle: createStyle(QStyle.OP_0),
      tipStyle: createStyle(QStyle.OP_0, QStyle.LF("-16px")),
    },
    "loading": {
      pageStyle: createStyle(QStyle.WD("calc(100vw + 450px)"), QStyle.LF("0px")),
      bodyStyle: createStyle(QStyle.WD("calc(100vw + 150px)")),
      barStyle: createStyle(QStyle.FT_B100),
      bodyInnerStyle: createStyle(QStyle.OP_1, QStyle.FT_B100),
      textStyle: createStyle(QStyle.OP_1),
      tipStyle: createStyle(QStyle.OP_1, QStyle.LF("0px")),
    },
    "loaded": {
      pageStyle: createStyle(QStyle.RG("0px"), QStyle.CFG_A),
      bodyStyle: null,
      barStyle: createStyle(QStyle.FT_B120),
      bodyInnerStyle: createStyle(QStyle.OP_0, QStyle.FT_B80),
      textStyle: createStyle(QStyle.OP_0, QStyle.LF("-16px"))
    },
    "exiting": {
      pageStyle: createStyle(QStyle.WD("calc(0vw + 450px)"), QStyle.RG("-450px")),
      bodyStyle: createStyle(QStyle.WD("calc(0vw + 150px)")),
      barStyle: null,
    },
    "exited": {
      pageStyle: null,
      bodyStyle: null,
      barStyle: null,
    }
  }
  const [pageStyle, ps_api] = useSpring(() => phase_style_delta[phase].pageStyle);
  const [bodyStyle, bds_api] = useSpring(() => phase_style_delta[phase].bodyStyle);
  const [barStyle, bs_api] = useSpring(() => phase_style_delta[phase].barStyle);
  const [bodyInnerStyle, bdis_api] = useSpring(() => phase_style_delta[phase].bodyInnerStyle);
  const [textStyle, ts_api] = useSpring(() => phase_style_delta[phase].textStyle);
  const [tipStyle, tps_api] = useSpring(() => phase_style_delta[phase].tipStyle)
  function phase_style_update() {
    phase_style_delta[phase].pageStyle && ps_api.start(phase_style_delta[phase].pageStyle);
    phase_style_delta[phase].bodyStyle && bds_api.start(phase_style_delta[phase].bodyStyle);
    phase_style_delta[phase].barStyle && bs_api.start(phase_style_delta[phase].barStyle);
    phase_style_delta[phase].bodyInnerStyle && bdis_api.start(phase_style_delta[phase].bodyInnerStyle);
    phase_style_delta[phase].textStyle && ts_api.start(phase_style_delta[phase].textStyle);
    phase_style_delta[phase].tipStyle && tps_api.start(phase_style_delta[phase].tipStyle);
  }
  useEffect(() => {
    console.log(num);
    // (num === fileList.length) && setTimeout(()=>setPhase("loaded"),2000);
    bs_api.start(createStyle({ width: `${100 * num / fileList.length}%` }));
  }, [num])
  useEffect(() => {
    console.log("load phase:", phase)
    phase_style_update();
    switch (phase) {
      case "waiting":
        console.log("load start", fileList)
        setTimeout(() => setPhase("loading"), 0);
        fileList.forEach(path => {
          preload(base_path + path, img => {
            if (img !== undefined) console.log(img);
            else {
              console.log("failed:get", `"${path}"`);
              setErrorNum(n => n + 1);
            }
            setNum(n => n + 1);
          });
        });
        return;
      case "loading":
        return;
      case "loaded":
        setTimeout(() => setPhase("exiting"), 500);
        console.log(errorNum, num);

        // ps_api.pause();
        // bds_api.pause();
        // bdis_api.pause();
        // bs_api.pause();
        // ts_api.pause();
        return;
      case "exiting":
        setTimeout(() => setPhase("exited"), 1000);
        return;
      case "exited":
        return;
      default:
        return;
    }
  }, [phase])

  return (
    <animated.div className={`LoadingP ${(phase.indexOf("exit") != -1) ? "exit" : (phase.indexOf("load") != -1) ? "in" : ""} style-0`} style={pageStyle}>
      <animated.div className={`body`} style={bodyStyle} onMouseUp={changeTip}>

        <animated.div className={`body-inner`} style={bodyInnerStyle}>
          <div className={`logo-mask`}>
            <animated.div className={`loading-back`} style={barStyle}></animated.div>
          </div>
        </animated.div>

        <animated.div className={`header`}></animated.div>
        <animated.div className={`footer`}></animated.div>
        <animated.div className={"word"} style={textStyle}>
          <div className={`title`}>{"第一章 我考虑下"}</div>
          <animated.div className={'tip-title'} style={tipStyle}>{tips[tipNo].title}</animated.div>
          <animated.div className={'tip-text'} style={tipStyle}>{tips[tipNo].text}</animated.div>
          <div className={'message'}>{`资源加载 ${num} / ${fileList.length}`}</div>
        </animated.div>

      </animated.div>
    </animated.div>
  )
}

export default LoadingP