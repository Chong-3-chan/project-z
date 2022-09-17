import React, { useState, useEffect, useRef, useContext } from 'react'
import { resource_base_path } from "./data/test-data.js"
import { createStyle, QStyle } from './data/spring.js'
import { useSpring, animated, config } from 'react-spring'
import { pageContext } from './App.js'
import './a.css'
import './style-1.css'
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
  const { pageState: state ,pageAction:action} = useContext(pageContext);
  const {
    loadList,
    title
  } = state;
  const { current: tips } = useRef(state.tips.flat(1));
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
  const [loadedFileTotal, setLoadedTotal] = useState(0);
  const [loadedpartTotal, setLoadedPartTotal] = useState(0);
  const [nowPartNo, setNowPartNo] = useState(0);
  const { current: loadingProgress } = useRef(loadList.map(e => ({ done: 0, total: e.data.length })));
  const { current: file_total } = useRef(eval(loadingProgress.map(e => e.total).join('+')))
  const [errorTotal, setErrorTotal] = useState(0);
  const [phase, setPhase] = useState("waiting");
  useEffect(()=>{action.setLoadPhase(phase)},[phase])
  const phase_style_delta = {
    "waiting": {
      pageStyle: createStyle(QStyle.WD("calc(0vw + 450px)"), QStyle.BGC_000_0, QStyle.OP_1, QStyle.CFG_A, QStyle.LF("-450px")),
      bodyStyle: createStyle(QStyle.WD("calc(0vw + 150px)"), QStyle.CFG_A),
      barStyle: createStyle({ width: `${0}%` }, QStyle.CFG_A),
      bodyInnerStyle: createStyle(QStyle.OP_0, QStyle.CFG_A),
      textStyle: createStyle(QStyle.OP_0),
      tipStyle: createStyle(QStyle.OP_0, QStyle.LF("-16px")),
      msgStyle: createStyle(QStyle.OP_0, QStyle.RG("-16px"), QStyle.CFG_A),
    },
    "loading": {
      pageStyle: createStyle(QStyle.WD("calc(100vw + 450px)"), QStyle.LF("0px")),
      bodyStyle: createStyle(QStyle.WD("calc(100vw + 150px)")),
      barStyle: createStyle(QStyle.FT_B100),
      bodyInnerStyle: createStyle(QStyle.OP_1, QStyle.FT_B100),
      textStyle: createStyle(QStyle.OP_1),
      tipStyle: createStyle(QStyle.OP_1, QStyle.LF("0px")),
      msgStyle: createStyle(QStyle.OP_1, QStyle.RG("0px")),
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
  const [tipStyle, tps_api] = useSpring(() => phase_style_delta[phase].tipStyle);
  const [msgStyle, ms_api] = useSpring(() => phase_style_delta[phase].msgStyle)
  function phase_style_update() {
    phase_style_delta[phase].pageStyle && ps_api.start(phase_style_delta[phase].pageStyle);
    phase_style_delta[phase].bodyStyle && bds_api.start(phase_style_delta[phase].bodyStyle);
    phase_style_delta[phase].barStyle && bs_api.start(phase_style_delta[phase].barStyle);
    phase_style_delta[phase].bodyInnerStyle && bdis_api.start(phase_style_delta[phase].bodyInnerStyle);
    phase_style_delta[phase].textStyle && ts_api.start(phase_style_delta[phase].textStyle);
    phase_style_delta[phase].tipStyle && tps_api.start(phase_style_delta[phase].tipStyle);
    phase_style_delta[phase].msgStyle && ms_api.start(phase_style_delta[phase].msgStyle);
  }
  useEffect(() => {
    // console.log(total);
    (loadedFileTotal === file_total) && setTimeout(() => setPhase("loaded"), 2000);
    bs_api.start(createStyle({ width: `${100 * loadedFileTotal / file_total}%` }));
  }, [loadedpartTotal])
  const finishNowPartLoading = useRef(null);
  useEffect(() => {
    if (loadingProgress[nowPartNo].done === loadingProgress[nowPartNo].total) {
      finishNowPartLoading.current();
    }
  }, [loadedFileTotal])
  useEffect(() => {
    console.log(loadingProgress)
  }, [nowPartNo])
  async function loadAll() {
    for (let i = 0; i < loadList.length; i++) {
      const nowFileList = loadList[i].data;
      setNowPartNo(i);
      await new Promise((resolve, reject) => {
        finishNowPartLoading.current = () => {
          finishNowPartLoading.current = null;
          resolve();
        }
        nowFileList.forEach(path => {
          preload(resource_base_path + path, img => {
            if (img !== undefined) console.log(img);
            else {
              console.log("failed:get", `"${path}"`);
              setErrorTotal(n => n + 1);
            }
            setLoadedTotal(n => n + 1);
            loadingProgress[i].done++;
          });
        });
      })
      setLoadedPartTotal(n => n + 1);
    }
  }
  useEffect(() => {
    console.log("load phase:", phase)
    phase_style_update();
    switch (phase) {
      case "waiting":
        console.log("load start", loadList)
        setTimeout(() => setPhase("loading"), 0);
        loadAll();
        return;
      case "loading":
        return;
      case "loaded":
        setTimeout(() => setPhase("exiting"), 500);
        console.log(errorTotal, loadedFileTotal);

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
        action.destroyLoadingP();
        return;
      default:
        return;
    }
  }, [phase])
  const [loadedPersentage, lp_api] = useSpring(() => ({ persentage: 0 }))
  function getLoadMessage() {
    // console.log(loadingProgress)
    lp_api.start({ persentage: (100 * loadedFileTotal / file_total) })
    return <>
      <animated.p>{loadedPersentage.persentage.to(n => {
        if (phase == "loaded") return <>就绪！&nbsp;&nbsp;&nbsp;</>;
        return `${loadedpartTotal < loadList.length ? loadList[nowPartNo].name : ""} ${(~~(n * 100) / 100).toFixed(n < 10 ? 3 : n < 100 ? 2 : 1)} %`
      }
      )}</animated.p>
      {/* <p>{`加载完成度 ${(100*loadedFileTotal/file_total).toFixed(1)} %`}</p> */}
      {/* <p>{`${loadList[nowPartNo].name} ${loadingProgress[nowPartNo].done} / ${loadingProgress[nowPartNo].total}`}</p> */}
      {/* <p>{`完成部分 ${partTotal} / ${loadList.length}`}</p> */}
    </>
  }
  return (
    <animated.div className={`LoadingP style-0 ${(phase.indexOf("exit") != -1) ? "exit" : (phase.indexOf("load") != -1) ? "in" : ""}`} style={pageStyle}>
      <animated.div className={`body`} style={bodyStyle} onMouseUp={changeTip}>

        <animated.div className={`body-inner`} style={bodyInnerStyle}>
          <div className={`logo-mask`}>
            <animated.div className={`loading-back`} style={barStyle}></animated.div>
          </div>
        </animated.div>

        <animated.div className={`header`}></animated.div>
        <animated.div className={`footer`}></animated.div>
        <animated.div className={"word"} style={textStyle}>
          <div className={`title`}>{title}</div>
          <animated.div className={'tip-title'} style={tipStyle}>{tips[tipNo].title}</animated.div>
          <animated.div className={'tip-text'} style={tipStyle}>{tips[tipNo].text}</animated.div>
          <animated.div className={'message'} style={msgStyle}>{getLoadMessage()}</animated.div>
        </animated.div>

      </animated.div>
    </animated.div>
  )
}

export default LoadingP