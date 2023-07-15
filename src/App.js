import React, { useState, useEffect, useContext } from 'react'
import LoadingP from './LoadingP.js'
import HomeP from './HomeP.js'
import MainP from './MainP.js'
import './a.css'
import { objCopy, resource_base_path, DEFAULT_PAGESTATE, preload_group, activePage_map } from './data/extra-test-data.js'
// import { resource_base_path, BOOK, DEFAULT_PAGESTATE, preload_group, activePage_map } from './data/test-data.js'
const BOOK = {};
function Mission() {
  this.list = [];
}// 功能：可以在加载完成前添加内容显示任务，并在加载完成时执行之
Mission.prototype.do = function () { return this.list.map(e => e()) }
Mission.prototype.clear = function () { this.list = [] }
Mission.prototype.finish = function () { return this.do().length && this.clear() }
Mission.prototype.add = function (...funs) { return funs.forEach((fun) => typeof fun == 'function' ? this.list.push(fun) : (() => { throw "try to add a non-function." })()) }
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
  tips: null,
  title: "基本资源加载",
  options: {
    // 设置相关
  },
  lastStyle: "",
  nowStyle: "style-12",
  now: {
    book: null,
    story: null,
    sentence: null,
    to: null,
  },
  next: {
    book: "Book1",
    story: "1-1",
    sentence: "00000"
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
  const [activePage, setActivePage] = useState(state.activePage);
  const [loadList, setLoadList] = useState(state.loadList);
  const [tips, setTips] = useState(state.tips);
  const [title, setTitle] = useState(state.title);
  const [loadPhase, setLoadPhase] = useState(state.loadPhase);
  pageAction.setLoadPhase = setLoadPhase;
  const [options, setOptions] = useState(state.options);
  const [nowStyle, setNowStyle] = useState(state.nowStyle);
  useEffect(() => { state.activePage = activePage }, [activePage]);
  useEffect(() => { state.loadList = loadList }, [loadList]);
  useEffect(() => { state.tips = tips }, [tips]);
  useEffect(() => { state.title = title }, [title]);
  useEffect(() => { state.loadPhase = loadPhase }, [loadPhase]);
  useEffect(() => { state.options = options }, [options]);
  useEffect(() => { state.nowStyle = nowStyle }, [nowStyle]);
  useEffect(() => {
    console.log({ BOOK });
    // pageAction.setActivePage("home");
    pageAction.setActivePage("main");
    // action.setNext(state.next.book, state.next.story, state.next.sentence)
  }, []);
  const [nowBook, setNowBook] = useState(null);
  const [nowStory, setNowStory] = useState(null);
  const [nowSentence, setNowSentence] = useState(null);
  const [nextBook, setNextBook] = useState(null);
  const [nextStory, setNextStory] = useState(null);
  const [nextSentence, setNextSentence] = useState(null);
  const [to, setTo] = useState(state.now.to);
  useEffect(() => { state.now.to = to }, [to]);
  useEffect(() => {
    if (!nextStory) return;
    pageAction.loadStroy(nextStory);
    action.onLoaded_add(() => {
      if (nextBook) {
        setNowBook(nextBook);
        setNextBook(null);
        state.now.book = state.next.book;
        state.next.book = null;
      }
      setNowStory(nextStory);
      setNextStory(null);
      state.now.story = state.next.story;
      state.next.story = null;

      setNowSentence(nextSentence);
      setNextSentence(null);
      state.now.sentence = state.next.sentence;
      state.next.sentence = null;
    })
  }, [nextBook, nextStory]);
  useEffect(() => {
    if (nextSentence && !nextStory) {
      setNowSentence(nextSentence);
      setNextSentence(null);
      state.now.sentence = state.next.sentence;
      state.next.sentence = null;
    }
  }, [nextSentence])

  pageAction.setTo = function (value_OR_function) {
    if (typeof value_OR_function != "function") {
      const _value = value_OR_function;
      console.log("setTo", _value);
      setTo(_value);
    }
    else {
      const _function = value_OR_function;
      setTo(_function(to));
    }
  }
  pageAction.setNext = function (BookName, StoryId, SentenceId) {
    if (loadPhase) {
      console.log({ loadPhase })
      return false;
    }
    console.log(objCopy({ nowBook, BookName, StoryId, SentenceId }))
    let nextBook, nextStory, nextSentence;
    if (BookName) {
      // 111 100
      nextBook = BOOK.data[BookName];
      if (StoryId && SentenceId) {
        // 111
        nextStory = nextBook.data[StoryId];
        nextSentence = nextStory.data[SentenceId];
        setNextBook(nextBook);
        setNextStory(nextStory);
        setTo(nextStory.to.default);
        setNextSentence(nextSentence);
        state.next.book = BookName;
        state.next.story = StoryId;
        state.next.sentence = SentenceId;

        setNowStyle(nextStory.style ?? nextBook.style ?? "");
      }
      else if (!(StoryId || SentenceId)) {
        // 100
        nextStory = nextBook.data[nextBook.start];
        nextSentence = nextStory.data[nextStory.start];
        setNextBook(nextBook);
        setNextStory(nextStory);
        setTo(nextStory.to.default);
        setNextSentence(nextSentence);
        state.next.book = BookName;
        state.next.story = nextBook.start;
        state.next.sentence = nextStory.start;

        setNowStyle(nextStory.style ?? nextBook.style ?? "");
      }
    }
    else if (StoryId) {
      nextStory = nowBook.data[StoryId];
      if (!SentenceId) {
        // 010
        nextSentence = nextStory.data[nextStory.start];
        setNextStory(nextStory);
        setTo(nextStory.to.default);
        setNextSentence(nextSentence);
        state.next.story = StoryId;
        state.next.sentence = nextStory.start;

        setNowStyle(nextStory.style ?? nowBook.style ?? "");
      }
    }
    else if (SentenceId) {
      // 001 *no load!
      nextSentence = nowStory.data[SentenceId];
      setNextSentence(nextSentence);
      state.next.sentence = SentenceId;
    }
    return { nextBook, nextStory, nextSentence };
  }
  pageAction.toNextSentence = function toNextSentence() {
    if (nowStory.end.indexOf(state.now.sentence) == -1) {
      return pageAction.setNext(undefined, undefined,
        ((parseInt(state.now.sentence) + 1).toString()).padStart(state.now.sentence.length, "0"));
    } else {
      // console.log("到达end");
      if (to) {
        setTo(null);
        return pageAction.setNext(undefined, to)
      }
      else if (state.now.story in nowBook.end) {
        console.log("book end:", nowBook.end[state.now.story]);
        return;
      }
      else {
        console.log("book end", "other");
        return;
      }
    }
  }
  pageAction.getNow = () => ({ book: nowBook, story: nowStory, sentence: nowSentence })
  pageAction.destroyLoadingP = function () {
    setLoadPhase(null);
    setTitle(null);
    setTips(null);
    setLoadList(null);
  }
  pageAction.load = function (loadList, title = "", tips = []) {
    console.log(objCopy(loadList, title, tips))
    if (loadPhase) {
      console.log("有加载进行中！");
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
    console.log(np);
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