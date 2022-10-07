import React, { useState, useEffect, useContext } from 'react'
import LoadingP from './LoadingP.js'
import HomeP from './HomeP.js'
import MainP from './MainP.js'
import './a.css'
import { resource_base_path, sample1, DEFAULT_PAGESTATE, preload_group, activePage_map } from './data/test-data.js'

/******************* -extra function- *********************/
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
function Mission() {
  let list = [];
  this.__proto__.do = () => list.map(e => e());
  this.__proto__.clear = () => { list = [] };
  this.__proto__.add = (...funs) => funs.forEach((fun) => typeof fun == 'function' ? list.push(fun) : (() => { throw "try to add a non-function." })());
  this.__proto__.finish = () => this.do().length && this.clear();
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
/******************* -extra function- END *********************/

// 关于存档
// 本地方案：
// window.localStorage 所有长期存档
// window.sessionStorage 页面实时状态存档 防止刷新等误操作退出流程
// 服务端方案：
// session
// 注册-登录-存档


const pageState = {//default values
  activePage: null,
  loadPhase: null,
  tips: DEFAULT_PAGESTATE.tips,
  title: "基本资源加载",
  options: {
    //...
  },
  lastStyle: "",
  nowStyle: "style-1",
  now: {
    book: null,
    story: null,
    sentence: null,
    to: null,
  },
  next: {
    book: "Book1",
    story: "1-1",
    sentence: "00002"
  },

  // tips: [],
  // loadList: [],
  ...DEFAULT_PAGESTATE
};
const onLoadedMission = new Mission();
const pageAction = {
  onLoaded: () => onLoadedMission.finish(),
  onLoaded_add: (...funs) => onLoadedMission.add(...funs),
  load: null,
  setNext: null,
  setLoadPhase: null,
  toNextSentence: null,
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
  const [loadList, setLoadList] = useState(pageState.loadList);
  const [tips, setTips] = useState(pageState.tips);
  const [title, setTitle] = useState(pageState.title);
  const [loadPhase, setLoadPhase] = useState(pageState.loadPhase);
  pageAction.setLoadPhase = setLoadPhase;
  const [options, setOptions] = useState(pageState.options);
  const [nowStyle, setNowStyle] = useState(pageState.nowStyle);
  useEffect(() => { pageState.activePage = activePage }, [activePage]);
  useEffect(() => { pageState.loadList = loadList }, [loadList]);
  useEffect(() => { pageState.tips = tips }, [tips]);
  useEffect(() => { pageState.title = title }, [title]);
  useEffect(() => { pageState.loadPhase = loadPhase }, [loadPhase]);
  useEffect(() => { pageState.options = options }, [options]);
  useEffect(() => { pageState.nowStyle = nowStyle }, [nowStyle]);
  useEffect(() => {
    log(sample1);
    // pageAction.setActivePage("home");
    pageAction.setActivePage("main");
    // action.setNext(pageState.next.book, pageState.next.story, pageState.next.sentence)
  }, []);
  const [nowBook, setNowBook] = useState(sample1.data[pageState.now.book]);
  const [nowStory, setNowStory] = useState(nowBook?.data[pageState.now.story]);
  const [nowSentence, setNowSentence] = useState(nowStory?.data[pageState.now.sentence]);
  const [nextBook, setNextBook] = useState(null);
  const [nextStory, setNextStory] = useState(null);
  const [nextSentence, setNextSentence] = useState(null);
  const [to, setTo] = useState(pageState.now.to);
  useEffect(() => { pageState.now.to = to }, [to]);
  useEffect(() => {
    if (!nextStory) return;
    pageAction.loadStroy(nextStory);
    action.onLoaded_add(() => {
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

      setNowSentence(nextSentence);
      setNextSentence(null);
      pageState.now.sentence = pageState.next.sentence;
      pageState.next.sentence = null;
    })
  }, [nextBook, nextStory]);
  useEffect(() => {
    if (nextSentence && !nextStory) {
      setNowSentence(nextSentence);
      setNextSentence(null);
      pageState.now.sentence = pageState.next.sentence;
      pageState.next.sentence = null;
    }
  }, [nextSentence])

  pageAction.setTo = function (value_OR_function) {
    if (typeof value_OR_function != "function") {
      const _value = value_OR_function;
      log("setTo", _value);
      setTo(_value);
    }
    else {
      const _function = value_OR_function;
      setTo(_function(to));
    }
  }
  pageAction.setNext = function (BookName, StoryId, SentenceId) {
    if (loadPhase) {
      log(loadPhase)
      return false;
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
    return { nextBook, nextStory, nextSentence };
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
    // if (parseInt(nowStory.end) > parseInt(pageState.now.sentence))
    if (nowStory.end.indexOf(pageState.now.sentence) == -1) {
      return pageAction.setNext(undefined, undefined, ((parseInt(pageState.now.sentence) + 1).toString()).padStart(5, "0"));
    } else {
      // log("到达end");
      if (to) {
        setTo(null);
        return pageAction.setNext(undefined, to)
      }
      else if (pageState.now.story in nowBook.end) {
        log("book end:", nowBook.end[pageState.now.story]);
        return;
      }
      else {
        log("book end", "other");
        return;
      }
    }
  }
  pageAction.getNow = () => ({ book: nowBook, story: nowStory, sentence: nowSentence })


  // useEffect(() => { log("更新ps:", pageState) });
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
      return false;
    }
    setTitle(title);
    setTips(tips);
    setLoadList(loadList);
    return true;
  }
  useEffect(() => { title && tips && loadList && setLoadPhase("waiting"); }, [title, tips, loadList])
  pageAction.loadStroy = function (story) {
    action.load(story.preload, story.title, story.tips);
  }


  pageAction.setActivePage = function (nextActivePageName) {
    const np = activePage_map[nextActivePageName];
    // if(!np) return false;
    log(np);
    action.onLoaded_add(() => {
      setActivePage(np.name);
    })
    nextActivePageName != "main" ?
      pageAction.load(np.preload, `进入${np.ch}`, np.tips)
      : pageAction.setNext("Book1");// *或读取存档！
  }
  return (
    <>
      {getActivePageDOM(activePage)}
      {loadPhase && <LoadingP></LoadingP>}
    </>
  )
}

export default App