import React, { useState, useEffect, useContext } from 'react'
import LoadingP from './LoadingP.js'
import HomeP from './HomeP.js'

import { resource_base_path, sample1, DEFAULT_PAGESTATE, preload_group } from './data/test-data.js'

const pageState = {//default values
  activePage: "home",
  loadPhase: "waiting",
  tips: DEFAULT_PAGESTATE.tips,
  title: "基本资源加载",
  options: {
    //...
  },
  nowStyle: "",
  //main nowStory,nowBook...
  nowBook:sample1.Book,
  nowStory:sample1.Book.data[sample1.Book.start],

  // tips: [],
  // loadList: [],
  ...DEFAULT_PAGESTATE
};
const pageAction = {
  load: null,
  setLoadPhase: null,
  destroyLoadingP: null,
}

export const pageContext = React.createContext({ pageState: pageState, pageAction: pageAction });
function App(props) {

  const [loadPhase, setLoadPhase] = useState(pageState.loadPhase);
  pageAction.setLoadPhase = setLoadPhase;
  useEffect(() => { pageState.loadPhase = loadPhase }, [loadPhase]);

  const [loadList, setLoadList] = useState(pageState.loadList);
  useEffect(() => { pageState.loadList = loadList }, [loadList]);

  const [tips, setTips] = useState(pageState.tips);
  useEffect(() => { pageState.tips = tips }, [tips]);

  const [title, setTitle] = useState(pageState.title);
  useEffect(() => { pageState.title = title }, [title]);

  const [options, setOptions] = useState(pageState.options);
  useEffect(() => { pageState.options = options }, [options]);

  const [nowStyle, setNowStyle] = useState(pageState.nowStyle);
  useEffect(() => { pageState.nowStyle = nowStyle }, [nowStyle]);

  const [activePage, setActivePage] = useState(pageState.activePage);
  useEffect(() => { pageState.activePage = activePage }, [activePage]);

  useEffect(() => { console.log(pageState) });
  const [state, setState] = useState("loading");
  pageAction.destroyLoadingP = function destroyLoadingP() {
    setLoadPhase(null);
  }
  pageAction.load = function load(loadList, title = pageState.title, tips = pageState.tips) {
    if (loadPhase) console.log("有加载进行中！")
    setTitle(title);
    setTips(tips);
    setLoadList(loadList);
    setLoadPhase("waiting");
  }


  function getActivePageDOM(activePage) {
    switch (activePage) {
      case "home":
        return <HomeP></HomeP>
      default:
        return <HomeP></HomeP>
    }
  }
  document.body.style.backgroundImage = `url(${resource_base_path + preload_group._H.data[0]})`;
  return (
    <>
      {getActivePageDOM(activePage)}
      {loadPhase && <LoadingP></LoadingP>}
    </>
  )
  return (
    <>
      {state != "loading" && <div className='full-page' style={{
        fontSize: "50vh",
        lineHeight: "100vh",
      }}>kkkk</div>}
      {state != "home" && <LoadingP fileList={fileList} destroy={destroy} tips={tips.A.concat(tips.B)}></LoadingP>}
    </>
  )
}

export default App