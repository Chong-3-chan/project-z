import React, { useState, useEffect, useContext } from 'react'
import LoadingP from './LoadingP.js'
import HomeP from './HomeP.js'
import MainP from './MainP.js'

import { resource_base_path, sample1, DEFAULT_PAGESTATE, preload_group, activePage_map } from './data/test-data.js'

function objCopy(obj) {
  if (obj == null) { return null }
  var result = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object') {
        result[key] = objCopy(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}
function log(...args) {
  console.log(...args.map(e => typeof e == "object" ? objCopy(e) : e))
}


const pageState = {//default values
  activePage: null,
  loadPhase: null,
  tips: DEFAULT_PAGESTATE.tips,
  title: "基本资源加载",
  options: {
    //...
  },
  nowStyle: "",
  now: {
    book: "Book1",
    story: "1-1",
    sentence: "00000",
  },
  next: {
    book: "Book1",
    story: "1-1",
    sentence: "00002"
  },
  to: null,

  // tips: [],
  // loadList: [],
  ...DEFAULT_PAGESTATE
};
const pageAction = {
  load: null,
  setNext: null,
  setLoadPhase: null,
  toNextSentence: null,
  onLoaded: null,
  getNow: null,
  destroyLoadingP: null,
  load: null,
  loadStroy: null,
  setTo: null,
  setActivePage: null
}

export const pageContext = React.createContext({ pageState: pageState, pageAction: pageAction });
function App(props) {
  const action = pageAction, state = pageState;

  const [activePage, setActivePage] = useState(pageState.activePage);
  useEffect(() => { pageState.activePage = activePage }, [activePage]);

  const [loadList, setLoadList] = useState(pageState.loadList);
  useEffect(() => { pageState.loadList = loadList }, [loadList]);

  const [tips, setTips] = useState(pageState.tips);
  useEffect(() => { pageState.tips = tips }, [tips]);

  const [title, setTitle] = useState(pageState.title);
  useEffect(() => { pageState.title = title }, [title]);

  const [loadPhase, setLoadPhase] = useState(pageState.loadPhase);
  pageAction.setLoadPhase = setLoadPhase;
  useEffect(() => { pageState.loadPhase = loadPhase }, [loadPhase]);

  const [options, setOptions] = useState(pageState.options);
  useEffect(() => { pageState.options = options }, [options]);

  const [nowStyle, setNowStyle] = useState(pageState.nowStyle);
  useEffect(() => { pageState.nowStyle = nowStyle }, [nowStyle]);

  useEffect(() => {
    log(sample1);
    // action.setNext(pageState.next.book, pageState.next.story, pageState.next.sentence)
  }, [])
  const [nowBook, setNowBook] = useState(sample1.data[pageState.now.book]);
  const [nowStory, setNowStory] = useState(nowBook.data[pageState.now.story]);
  // useEffect(() => { pageAction.loadStroy(nowStory) }, [nowStory]);
  const [nowSentence, setNowSentence] = useState(nowStory.data[pageState.now.sentence]);

  const [nextBook, setNextBook] = useState(null);
  const [nextStory, setNextStory] = useState(null);
  const [nextSentence, setNextSentence] = useState(null);
  useEffect(() => { nextStory && pageAction.loadStroy(nextStory) }, [nextStory]);
  useEffect(() => {
    if (!nextStory) return;
    action.onLoaded = () => {
      if (nextBook) {
        setNowBook(nextBook);
        setNextBook(null);
        pageState.now.book = pageState.next.book;
        pageState.next.book = null;
      }
      setNowStory(nextStory);
      setNextStory(null);
      pageState.now.story = pageState.next.story;
      pageState.next.story = null;
      action.onLoaded = null;

      setNowSentence(nextSentence);
      setNextSentence(null);
      pageState.now.sentence = pageState.next.sentence;
      pageState.next.sentence = null;
    }
  }, [nextBook, nextStory]);
  useEffect(() => {
    if (nextSentence && !nextStory) {
      setNowSentence(nextSentence);
      setNextSentence(null);
      pageState.now.sentence = pageState.next.sentence;
      pageState.next.sentence = null;
    }
  }, [nextSentence])

  pageAction.setNext = function (BookName, StoryId, SentenceId) {
    if (loadPhase) {
      log(loadPhase)
      return;
    }
    log(nowBook, BookName, StoryId, SentenceId)
    let nextBook, nextStory, nextSentence;
    if (BookName) {
      // 111 100
      nextBook = sample1.data[BookName];
      if (StoryId && SentenceId) {
        // 111
        nextStory = nextBook.data[StoryId];
        nextSentence = nextStory.data[SentenceId];
        setNextBook(nextBook);
        setNextStory(nextStory);
        setNextSentence(nextSentence);
        pageState.next.book = BookName;
        pageState.next.story = StoryId;
        pageState.next.sentence = SentenceId;
      }
      else if (!(StoryId || SentenceId)) {
        // 100
        nextStory = nextBook.data[nextBook.start];
        nextSentence = nextStory.data[nextStory.start];
        setNextBook(nextBook);
        setNextStory(nextStory);
        setNextSentence(nextSentence);
        pageState.next.book = BookName;
        pageState.next.story = nextBook.start;
        pageState.next.sentence = nextStory.start;
      }
    }
    else if (StoryId) {
      nextStory = nowBook.data[StoryId];
      if (!SentenceId) {
        // 010
        nextSentence = nextStory.data[nextStory.start];
        setNextStory(nextStory);
        setNextSentence(nextSentence);
        pageState.next.story = StoryId;
        pageState.next.sentence = nextStory.start;
      }
    }
    else if (SentenceId) {
      // 001 *no load!
      nextSentence = nowStory.data[SentenceId];
      setNextSentence(nextSentence);
      pageState.next.sentence = SentenceId;
    }
  }

  // pageAction.setNow = function setNow(BookName, StoryId, SentenceId) {
  //   log(nowBook, BookName, StoryId, SentenceId)
  //   let nextBook, nextStory, nextSentence;
  //   if (BookName) {
  //     // 111 100
  //     nextBook = sample1.data[BookName];
  //     if (StoryId && SentenceId) {
  //       // 111
  //       nextStory = nextBook.data[StoryId];
  //       nextSentence = nextStory.data[SentenceId];
  //       setNowBook(nextBook);
  //       setNowStory(nextStory);
  //       setNowSentence(nextSentence);
  //       pageState.now.book = BookName;
  //       pageState.now.story = StoryId;
  //       pageState.now.sentence = SentenceId;
  //     }
  //     else if (!(StoryId || SentenceId)) {
  //       // 100
  //       nextStory = nextBook.data[nextBook.start];
  //       nextSentence = nextStory.data[nextStory.start];
  //       setNowBook(nextBook);
  //       setNowStory(nextStory);
  //       setNowSentence(nextSentence);
  //       pageState.now.book = BookName;
  //       pageState.now.story = nextBook.start;
  //       pageState.now.sentence = nextStory.start;
  //     }
  //   }
  //   else if (StoryId) {
  //     nextStory = nowBook.data[StoryId];
  //     if (!SentenceId) {
  //       // 010
  //       nextSentence = nextStory.data[nextStory.start];
  //       setNowStory(nextStory);
  //       setNowSentence(nextSentence);
  //       pageState.now.story = StoryId;
  //       pageState.now.sentence = nextStory.start;
  //     }
  //   }
  //   else if (SentenceId) {
  //     // 001 *no load!
  //     nextSentence = nowStory.data[SentenceId];
  //     setNowSentence(nextSentence);
  //     pageState.now.sentence = SentenceId;
  //   }
  // }
  pageAction.toNextSentence = function toNextSentence() {
    if (parseInt(nowStory.end) > parseInt(pageState.now.sentence))
      pageAction.setNext(undefined, undefined, ((parseInt(pageState.now.sentence) + 1).toString()).padStart(5, "0"));
    else {
      // log("到达end");
      if (to) {
        setTo(null);
        pageAction.setNext(undefined, to)
      }
      else if (pageState.now.story in nowBook.end) {
        log("book end:", nowBook.end[pageState.now.story]);
      }
      else {
        log("book end", "other");
      }
    }
  }
  pageAction.getNow = () => ({ book: nowBook, story: nowStory, sentence: nowSentence })

  const [to, setTo] = useState(pageState.to);
  useEffect(() => { pageState.to = to }, [to]);
  pageAction.setTo = function (to_StoryId) {
    log("setTo", to_StoryId);
    setTo(to_StoryId);
  }

  useEffect(() => { log("更新ps:", pageState) });
  pageAction.destroyLoadingP = function () {
    setLoadPhase(null);
    setTitle(null);
    setTips(null);
    setLoadList(null);
  }
  pageAction.load = function (loadList, title = "", tips = []) {
    log(loadList, title, tips)
    if (loadPhase) {
      log("有加载进行中！");
      return;
    }
    setTitle(title);
    setTips(tips);
    setLoadList(loadList);
  }
  useEffect(() => { title && tips && loadList && setLoadPhase("waiting"); }, [title, tips, loadList])
  pageAction.loadStroy = function (story) {
    action.load(story.preload, story.title, story.tips);
  }

  function getActivePageDOM(activePage) {
    switch (activePage) {
      case "home":
        return <HomeP></HomeP>
      case "main":
        return <MainP></MainP>
      default:
        return <></>
    }
  }
  pageAction.setActivePage = function (nextActivePageName) {
    const np = activePage_map[nextActivePageName]
    log(np);
    pageAction.load(np.preload, `进入${np.ch}`, np.tips)
    action.onLoaded = () => {
      setActivePage(np.name);
    }
  }
  useEffect(() => { pageAction.setActivePage("home") }, [])
  // document.body.style.backgroundImage = `url(${resource_base_path + preload_group._H.data[0]})`;
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