import React, { useState, useEffect, useRef, useContext } from 'react'
import { getFileSrc, getPackagePath, file_map, objCopy, package_map } from "./data/extra-test-data.js"
// import { getFileSrc } from "./data/test-data.js"
import { createStyle, QStyle } from './data/spring.js'
import { useSpring, animated, config } from 'react-spring'
import { pageContext } from './App.js'
import PackageInfo, { createPackageInfoList } from './class/package-info.js'
import FileInfo from './class/file-info.js'
import './LoadingP.css'
import './LoadingP.style-04.css'
import './LoadingP.style-12.css'

function preload(dat, callback) {
  // let img = new Image();
  // img.onload = function () {
  //   img.onload = null;
  //   callback(img);
  // }
  // img.onerror = function () {
  //   callback(undefined);
  // }
  // img.src = src;
  callback(dat);
}
// const test_zip_path = "http://projecta-resource.com/extra_test_active/test.zip";
const [PHASE_WAITING, PHASE_LOADING, PHASE_LOADED, PHASE_EXITING, PHASE_EXITED]
  = ["waiting", "loading", "loaded", "exiting", "exited"];

const phase_style_delta = {};
phase_style_delta[PHASE_WAITING] = {
  pageStyle: createStyle(QStyle.WD("calc(0rem + 3rem)"), QStyle.BGC_000_0, QStyle.OP_1, QStyle.CFG_A, QStyle.LF("-3rem")),
  bodyStyle: createStyle(QStyle.WD("calc(0rem + 1rem)"), QStyle.CFG_A),
  barStyle: createStyle({ width: `${0}%` }, QStyle.CFG_A),
  bodyInnerStyle: createStyle(QStyle.OP_0, QStyle.CFG_A),
  textStyle: createStyle(QStyle.OP_0),
  tipStyle: createStyle(QStyle.OP_0, QStyle.LF("-0.16rem")),
  msgStyle: createStyle(QStyle.OP_0, QStyle.RG("-0.16rem"), QStyle.CFG_A),
},
  phase_style_delta[PHASE_LOADING] = {
    pageStyle: createStyle(QStyle.WD("calc(16rem + 3rem)"), QStyle.LF("0rem")),
    bodyStyle: createStyle(QStyle.WD("calc(16rem + 1rem)")),
    barStyle: createStyle(QStyle.FT_B100),
    bodyInnerStyle: createStyle(QStyle.OP_1, QStyle.FT_B100),
    textStyle: createStyle(QStyle.OP_1),
    tipStyle: createStyle(QStyle.OP_1, QStyle.LF("0rem")),
    msgStyle: createStyle(QStyle.OP_1, QStyle.RG("0rem")),
  },
  phase_style_delta[PHASE_LOADED] = {
    pageStyle: createStyle(QStyle.RG("0rem"), QStyle.CFG_A),
    bodyStyle: null,
    barStyle: createStyle(QStyle.FT_B120),
    bodyInnerStyle: createStyle(QStyle.OP_0, QStyle.FT_B80),
    textStyle: createStyle(QStyle.OP_0, QStyle.LF("-0.16rem"))
  },
  phase_style_delta[PHASE_EXITING] = {
    pageStyle: createStyle(QStyle.WD("calc(0rem + 3rem)"), QStyle.RG("-3rem")),
    bodyStyle: createStyle(QStyle.WD("calc(0rem + 1rem)")),
    barStyle: null,
  },
  phase_style_delta[PHASE_EXITED] = {
    pageStyle: null,
    bodyStyle: null,
    barStyle: null,
  };
function LoadingP(props) {
  const { pageState: state, pageAction: action } = useContext(pageContext);
  const { loadList, title } = state;
  const { current: tips } = useRef(state.tips.flat(1));
  const [tipNo, setTipNo] = useState(0);
  function changeTip() {
    if (tips.length <= 1) return;
    let nextNo = ~~(Math.random() * (tips.length - 1));
    // 可选改进：播放列表方式
    tps_api.start(createStyle(QStyle.OP_0, QStyle.LF("-0.16rem"),
      {
        onRest: () => {
          setTipNo((nextNo < tipNo) ? nextNo : (nextNo + 1));
          tps_api.start(createStyle(QStyle.OP_1, QStyle.LF("0rem")));
        }
      }));
  }
  const [downloadedPackageNum, setDownloadedPackageNum] = useState(0);
  const [loadedFileNum, setLoadedFileNum] = useState(0);
  const [loadedpartNum, setLoadedPartNum] = useState(0);
  const [nowPartNo, setNowPartNo] = useState(0);
  const [getErrorMsg, setErrorMsg] = ((e) => [() => e.current, (value) => e.current = value])(useRef());
  const [getPackages, setPackages] = ((e) => [() => e.current, (value) => e.current = value])(useRef());
  const [getLoadingProgress, setLoadingProgress] = ((e) => [() => e.current, (value) => e.current = value])(useRef());
  const [getFile_total, setFile_total] = ((e) => [() => e.current, (value) => e.current = value])(useRef());
  useEffect(() => {
    // packages:{}(key为packageName.value为new packageInfo())
    setPackages(createPackageInfoList(Object.fromEntries(Array.from(new Set((loadList.map(e => e.data)).flat(1).map(e => file_map[e]?.packageKey))).map(e => [e, getPackagePath(e)]))));
    setLoadingProgress(loadList.map(e => ({ done: 0, total: e.data.length })));
    console.log(getLoadingProgress(), setLoadingProgress(loadList.map(e => ({ done: 0, total: e.data.length }))))
    setFile_total(eval(getLoadingProgress().map(e => e.total).join('+')) ?? 0);
  }, []);
  const [errorTotal, setErrorTotal] = useState(0);
  const [phase, setPhase] = useState(PHASE_WAITING);
  useEffect(() => { action.setLoadPhase(phase) }, [phase])

  const [pageStyle, ps_api] = useSpring(() => phase_style_delta[phase].pageStyle);
  const [bodyStyle, bds_api] = useSpring(() => phase_style_delta[phase].bodyStyle);
  const [barStyle, bs_api] = useSpring(() => phase_style_delta[phase].barStyle);
  const [bodyInnerStyle, bdis_api] = useSpring(() => phase_style_delta[phase].bodyInnerStyle);
  const [textStyle, ts_api] = useSpring(() => phase_style_delta[phase].textStyle);
  const [tipStyle, tps_api] = useSpring(() => phase_style_delta[phase].tipStyle);
  const [msgStyle, ms_api] = useSpring(() => phase_style_delta[phase].msgStyle);
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
    if (phase != PHASE_LOADING) return;
    // console.log(file_total);
    const stop = false;
    if (!stop && (loadedFileNum === getFile_total())) setTimeout(() => setPhase(PHASE_LOADED), 2000);
    // bs_api.start(createStyle({ width: `${getFile_total() ? (100 * loadedFileNum / getFile_total()) : (100)}%` }));
    bs_api.start(createStyle({ width: `${95 + (getFile_total() ? (5 * loadedFileNum / getFile_total()) : (5))}%` }));
  }, [loadedpartNum, phase])
  const [getFinishNowPartLoading, setFinishNowPartLoading] = ((e) => [() => e.current, (value) => e.current = value])(useRef(null));
  useEffect(() => {
    if (loadedFileNum && getLoadingProgress().length) {
      if (getLoadingProgress()[nowPartNo].done === getLoadingProgress()[nowPartNo].total) {
        getFinishNowPartLoading() && getFinishNowPartLoading()();
      }
    }
  }, [loadedFileNum])
  useEffect(() => {
    // console.log(loadingProgress)
  }, [nowPartNo])
  async function loadAll() {
    for (let i = 0; i < loadList.length; i++) {
      const nowFileList = loadList[i].data;
      setNowPartNo(i);
      await new Promise((resolve, reject) => {
        setFinishNowPartLoading(() => {
          setFinishNowPartLoading(null);
          resolve();
        })
        nowFileList.forEach(key => {
          preload(getFileSrc(key), (dat) => {
            if (dat !== undefined) {
              // console.log(img);
              // console.log("successed:get", `"${key}" "${getFileSrc(key)}"`);
            }
            else {
              console.log("failed:get", `"${key}" "${getFileSrc(key)}"`);
              setErrorTotal(n => n + 1);
            }
            setLoadedFileNum(n => n + 1);
            getLoadingProgress()[i].done++;
          });
        });
      })
      setLoadedPartNum(n => n + 1);
    }
  }
  useEffect(() => {
    // console.log("load phase:", phase)
    phase_style_update();
    switch (phase) {
      case PHASE_WAITING:
        console.log("load start", loadList, getPackages())
        setTimeout(() => setPhase(PHASE_LOADING), 0);
        const packageDownloadingPercent = Object.fromEntries(Object.keys(getPackages()).map(e => [e, 0]));
        Promise.allSettled(Object.entries(getPackages()).map(([packageName, e]) =>
          e.load((msg) => {
            console.log(objCopy({ msg, packageName }), "now loading package");
            switch (msg.state) {
              case "downloading":
                packageDownloadingPercent[packageName] = msg.percent;
                bs_api.start(createStyle({ width: `${0.95 * Object.values(packageDownloadingPercent).reduce((a, b) => a + b) / Object.values(packageDownloadingPercent).length}%` }));
                break;
              case "done":
                let fileNameList = Object.entries(file_map).filter(([, { packageKey }]) => packageKey == packageName).map(([, { fileName }]) => fileName);
                console.log(msg.data, "done msgdata", package_map,fileNameList);
                Object.entries(msg.data).forEach(([fileName, { type, data }]) => {
                  // console.log(packageName, fileName, type, data,"new FileInfo");
                  let index = fileNameList.indexOf(fileName);
                  if (index != -1) {
                    e.data[fileName] = new FileInfo(packageName, fileName, type, data);
                    fileNameList.splice(index, 1);
                  }
                });
                setDownloadedPackageNum(n => n + 1 + 0);
                break;
              case "loading":
                break;
              case "error":
                console.log("load error", {
                  ...(getErrorMsg() ?? {}),
                  packageLoading: { ...(getErrorMsg()?.packageLoading ?? {}), ...(Object.fromEntries([[packageName, msg.error.toString()]])) }
                })
                setErrorMsg({
                  ...(getErrorMsg() ?? {}),
                  packageLoading: { ...(getErrorMsg()?.packageLoading ?? {}), ...(Object.fromEntries([[packageName, msg.error.toString()]])) }
                })
                setDownloadedPackageNum(n => n + 1);
                break;
              default:
                break;
            }
          }).then((re) => {
            console.log(re, packageName, getPackages()[packageName], "file load done");
          })
        )).then(() => loadAll());

        return;
      case PHASE_LOADING:
        return;
      case PHASE_LOADED:
        setTimeout(() => setPhase(PHASE_EXITING), 500);
        // console.log(action.onLoaded);
        action.onLoaded();
        // console.log(errorTotal, loadedFileTotal);
        // ps_api.pause();
        // bds_api.pause();
        // bdis_api.pause();
        // bs_api.pause();
        // ts_api.pause();
        return;
      case PHASE_EXITING:
        setTimeout(() => setPhase(PHASE_EXITED), 1000);
        return;
      case PHASE_EXITED:
        action.destroyLoadingP();
        return;
      default:
        return;
    }
  }, [phase])
  const [loadedPersentage, lp_api] = useSpring(() => ({ persentage: 0 }))
  function getLoadMessage() {
    // removeChiLd 错误偶发！
    // console.log(loadingProgress)
    lp_api.start({ persentage: getFile_total() ? (100 * loadedFileNum / getFile_total()) : (100.0) })
    return <>
      <animated.p>{loadedPersentage.persentage.to(n => {
        if (getErrorMsg()) return `加载出错:${JSON.stringify(getErrorMsg())}`
        if (phase == PHASE_LOADED) return <>就绪！&nbsp;&nbsp;&nbsp;</>;
        else {
          if (loadedpartNum == 0) {
            if (downloadedPackageNum == 0) {
              return `资源包下载中...`;
            }
            else {
              const packageTotal = Object.keys(getPackages()).length;
              if (downloadedPackageNum < packageTotal) {
                return `资源包下载中... ${downloadedPackageNum} / ${packageTotal}`;
              }
              else {
                return `准备部署资源...`;
              }
            }
          }
          return `${loadedpartNum < loadList.length ? loadList[nowPartNo].name : ""} ${(~~(n * 100) / 100).toFixed(n < 10 ? 3 : n < 100 ? 2 : 1)} %`
        }
      })}</animated.p>
      {/* <p>{`加载完成度 ${(100*loadedFileTotal/file_total).toFixed(1)} %`}</p> */}
      {/* <p>{`${loadList[nowPartNo].name} ${loadingProgress[nowPartNo].done} / ${loadingProgress[nowPartNo].total}`}</p> */}
      {/* <p>{`完成部分 ${partTotal} / ${loadList.length}`}</p> */}
    </>
  }
  return (
    <animated.div className={`LoadingP ${state.nowStyle} ${(phase.indexOf("exit") != -1) ? "exit" : (phase.indexOf("load") != -1) ? "in" : ""}`} style={pageStyle}>
      <animated.div className={`body`} style={bodyStyle} onMouseUp={changeTip}>
        <animated.div className={`header`}></animated.div>
        <animated.div className={`footer`}></animated.div>
        <animated.div className={`body-inner`} style={bodyInnerStyle}>
          <div className={`logo-mask`}>
            <animated.div className={`loading-back`} style={barStyle}></animated.div>
          </div>
          <animated.div className={"word"} style={textStyle}>
            <div className={`title`}>{title}</div>
            {tips.length > 0 && <><animated.div className={'tip-title'} style={tipStyle}>{tips[tipNo].title}</animated.div>
              <animated.div className={'tip-text'} style={tipStyle}>{tips[tipNo].text}</animated.div></>}
            {/* <animated.div className={'message'} style={msgStyle}>{getLoadMessage()}</animated.div> */}
          </animated.div>
        </animated.div>
      </animated.div>
    </animated.div>
  )
}

export default LoadingP