import React, { useState, useEffect, useContext } from 'react'
import LoadingP from './LoadingP.js'
import HomeP, { homeResource_map } from './HomeP.js'
import MainP from './MainP.js'
import './a.css'
import FileInfo, { FilePool } from './class/file-info.js'
import PackageInfo, { getPackagePool } from './class/package-info.js'
import { objCopy, resource_base_path, bookIds, BOOK, STORY, DEFAULT_PAGESTATE, preload_group, packageSampleUsing, tips_group, file_map, getFileSrc, information_map } from './data/extra-test-data.js'
import { message_readyGetNow, message_readySetNext } from './tools/message-helper.js'
import Sound, { player } from './tools/Sound.js'
import OptionsP from './OptionsP.js'
import { DBget, DBgetAll, DBput } from './tools/IndexedDB-controller.js'
import SaveP from './SaveP.js'
import LoadP from './LoadP.js'
import Dialog from './Dialog.js'
import { RE_check, globalSave, readGlobal } from './main.js'
import InformationP from './InformationP.js'
import ContentP from './ContentP.js'
export function classNames(...className) { return className.filter(e => e).join(" ") };
export let visitable_information_key_list = [];
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
    case "information":
      return <InformationP></InformationP>
    default:
      return <></>
  }
}
const activePage_map = {
  "home": {
    name: "home",
    getPreload: () => {
      readGlobal();
      homeResource_map.backgroundImage = homeResource_map.backgroundImageList.filter(
        e => RE_check(e)
      ).map(e => e.fileKey).reverse()[0] ?? homeResource_map.backgroundImage;
      // debugger;
      Object.keys(BOOK).filter((bookId) => BOOK[bookId].start)
        .forEach((bookId) => homeResource_map.booksCover[bookId] = {
          fileKey: BOOK[bookId].cover ?? null,
          disable: !RE_check(BOOK[bookId])
        });
      // console.log(homeResource_map.booksCover,BOOK["Book2"].check,RE_check({check:BOOK["Book2"].check}));
      return [{ name: "首页资源", data: [homeResource_map.backgroundImage, ...Object.values(homeResource_map.booksCover).filter(e => e.fileKey).map(e => e.fileKey)] }];
    },
    ch: "首页",
    tips: ["home"],
  },
  "main": {
    name: "main",
    ch: "主页面",
    tips: []
  },
  "information": {
    name: "information",
    getPreload: () => {
      visitable_information_key_list = Object.entries(information_map).filter(
        ([k, v]) => RE_check(v)
      ).sort(([, infoa], [, infob]) => infoa.order - infob.order).map(([k, v]) => k);
      console.log(visitable_information_key_list, "visitable_information_key_list")
      const fileKey_list = Object.values(information_map).filter(
        e => RE_check(e)
      ).map(e => e.data.filter(ee => ee.fileKey).map(ee => ee.fileKey)
      ).flat(1);
      // console.log(Object.values(information_map).filter(
      //   e => RE_check(e)
      // ))
      return [{ name: "档案资源", data: [homeResource_map.backgroundImage, ...fileKey_list] }];
    },
    ch: "档案",
    tips: ["information"]
  }
};
function getCoverPageDOM(coverPage) {
  switch (coverPage) {
    case "options":
      return <OptionsP></OptionsP>
    case "save":
      return <SaveP></SaveP>
    case "load":
      return <LoadP></LoadP>
    case "content":
      return <ContentP></ContentP>
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

const soundRoads = [
  {
    key: "BGM",
    options: ["loop", "fade"],
    audio: new Audio(),
    getVolume: () => pageState.options.volume_ALL * pageState.options.volume_BGM,
    display: {
      class: "BGM"
    }
  },
  {
    key: "voice",
    options: [],
    audio: new Audio(),
    state: null,
    getVolume: () => pageState.options.volume_ALL * pageState.options.volume_voice,
  }
]
export function getOptions() {
  return pageState.options;
}
export const options_Group = {
  volume: {
    ch: "声音设置",
    data: [
      ["volume_ALL", "全体音量", 0.5, { type: 'range', icon: "volume", max: 1, min: 0, step: 0.1 }],
      ["volume_BGM", "背景音乐音量", 1, { type: 'range', icon: "volume", max: 1, min: 0, step: 0.1 }],
      ["volume_voice", "语音音量", 1, { type: 'range', icon: "volume", max: 1, min: 0, step: 0.1 }],
      ["volume_effect", "音效音量", 0.2, { type: 'range', icon: "volume", max: 1, min: 0, step: 0.1 }]]
  },
  word: {
    ch: "文本设置",
    data: [
      ["text_appearSpeed", "文字出现速度", 6, { type: 'range', icon: "speed", max: 10, min: 1, step: 1 }],
      ["text_autoSpeed", "自动播放速度", 5, { type: 'range', icon: "speed", max: 10, min: 1, step: 1 }],
    ]
  }
}
export const options_List = Object.values(options_Group).map(e => e.data).flat(1);
const pageState = {//default values
  dialogData: null,
  activePage: null,
  coverPage: null,
  loadPhase: null,
  tips: null,
  title: "基本资源加载",
  options: {
    // 设置相关
    ...Object.fromEntries(options_List.map(([name, ch, defaultValue]) => [name, defaultValue])),
  },
  lastStyle: "",
  nowStyle: "style-12",
  nowSound: Object.fromEntries(soundRoads.map(e => [e.key, e])),
  now: {
    book: null,
    story: null,
    sentence: null,
    to: null,
  },
  next: {
    book: "Book1",
    story: "1_1",
    sentence: "00000"
  },
  baseSave: {
    nodes: {},
    time: (new Date()).getTime(),
    text: "新的开始"
  },
  ...DEFAULT_PAGESTATE
};


const onLoadEndMission = new Mission();
const onLoadStartMission = new Mission();
const pageAction = {
  onLoadStart: () => onLoadStartMission.finish(),
  onLoadStart_add: (...funs) => onLoadStartMission.add(...funs),
  onLoadEnd: () => onLoadEndMission.finish(),
  onLoadEnd_add: (...funs) => onLoadEndMission.add(...funs),
  load: null,
  setNext: null,
  setLoadPhase: null,
  toNextSentence: null,
  getNow: null,
  destroyLoadingP: null,
  loadStroy: null,
  setTo: null,
  setActivePage: null,
  setBGM: null,
  setVoice: null,
  updateOptions: null,
  setCoverPage: null,
  save: null,
  loadSave: null,
  callDialog: null,
  getSave: null,
  autoSave:null
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
  const [nowStyle, setNowStyle] = useState(state.nowStyle);
  const [nowSound, setNowSound] = useState(state.nowSound);
  const [options, setOptions] = useState({ ...state.options, ...globalSave.options });
  const [coverPage, setCoverPage] = useState(state.coverPage);
  const [baseSave, setBaseSave] = useState(state.baseSave);
  const [dialogData, setDialogData] = useState(state.dialogData);
  // useEffect(() => { state.options = options }, [options]);
  useEffect(() => { state.dialogData = dialogData }, [dialogData]);
  useEffect(() => { state.baseSave = baseSave }, [baseSave]);
  useEffect(() => { state.activePage = activePage }, [activePage]);
  useEffect(() => { state.coverPage = coverPage }, [coverPage]);
  useEffect(() => { state.loadList = loadList }, [loadList]);
  useEffect(() => { state.tips = tips }, [tips]);
  useEffect(() => { state.title = title }, [title]);
  useEffect(() => { state.loadPhase = loadPhase }, [loadPhase]);
  useEffect(() => { state.nowStyle = nowStyle }, [nowStyle]);
  useEffect(() => { state.nowSound = nowSound }, [nowSound]);
  useEffect(() => {
    console.log({ BOOK });
    pageAction.setActivePage("home");
    pageAction.updateOptions({});
    // pageAction.setActivePage("main");
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
    action.onLoadEnd_add(() => {
      if (nextBook) {
        setNowBook(nextBook);
        setNextBook(null);
        state.now.book = state.next.book;
        state.next.book = null;
        parent.postMessage({ from: "weimu", key: "returnData", data: { BOOK, STORY, pools: { file: FilePool.getFilePool(), package: getPackagePool() } } }, "*");
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
  pageAction.setNext = function (bookName, storyId, sentenceId) {
    // debugger;
    if (loadPhase) {
      console.log({ loadPhase })
      return null;
    }
    console.log(objCopy({ nowBook, bookName, storyId, sentenceId }))
    let nextBook, nextStory, nextSentence;
    if (bookName) {
      // 111 100
      console.log("BOOKK", BOOK);
      nextBook = BOOK[bookName];
      if (nextBook === undefined) return false;
      if (storyId && sentenceId) {
        // 111
        nextStory = nextBook.data[storyId];
        if (nextStory === undefined) return false;
        nextSentence = nextStory.data[sentenceId];
        if (nextSentence === undefined) return false;
        setNextBook(nextBook);
        setNextStory(nextStory);
        setTo(nextStory.to.default);
        setNextSentence(nextSentence);
        state.next.book = bookName;
        state.next.story = storyId;
        state.next.sentence = sentenceId;

        setNowStyle(nextStory.style ?? nextBook.style ?? "");
      }
      else if (!(storyId || sentenceId)) {
        // 100
        nextStory = nextBook.data[nextBook.start];
        nextSentence = nextStory.data[nextStory.start];
        setNextBook(nextBook);
        setNextStory(nextStory);
        setTo(nextStory.to.default);
        setNextSentence(nextSentence);
        state.next.book = bookName;
        state.next.story = nextBook.start;
        state.next.sentence = nextStory.start;

        setNowStyle(nextStory.style ?? nextBook.style ?? "");
      }
      return false;
    }
    else if (storyId) {
      nextStory = nowBook.data[storyId];
      if (nextStory === undefined) return false;
      if (!sentenceId) {
        // 010
        nextSentence = nextStory.data[nextStory.start];
        setNextStory(nextStory);
        setTo(nextStory.to.default);
        setNextSentence(nextSentence);
        state.next.story = storyId;
        state.next.sentence = nextStory.start;

        setNowStyle(nextStory.style ?? nowBook.style ?? "");
        return false;
      }
    }
    else if (sentenceId) {
      // 001 *no load!
      nextSentence = nowStory.data[sentenceId];
      if (nextSentence === undefined) return false;
      setNextSentence(nextSentence);
      state.next.sentence = sentenceId;
      return true;
    }
  }
  useEffect(() => {
    message_readySetNext(null, ({ bookName, storyId, sentenceId }) => pageAction.setNext(bookName, storyId, sentenceId));
  }, [])
  pageAction.toNextSentence = function toNextSentence() {
    if (nowStory.end.indexOf(state.now.sentence) == -1) {
      return pageAction.setNext(undefined, undefined,
        ((parseInt(state.now.sentence) + 1).toString()).padStart(state.now.sentence.length, "0"));
    } else {
      // console.log("到达end");
      console.log(nowStory)
      // debugger;
      const old_endedStory = globalSave.endedStory;
      !old_endedStory.some(e => e == `${nowBook.name}/${nowStory.id}`) && DBput("global", { key: "endedStory", value: globalSave.endedStory = [...old_endedStory, `${nowBook.name}/${nowStory.id}`] });
      if (to) {
        setTo(null);
        return pageAction.setNext(undefined, to);
      }
      else if (state.now.story in nowBook.end) {
        console.log("book end:", nowBook.end[state.now.story]);
        return { end: nowBook.end[state.now.story] };
      }
      else {
        console.log("book end", "other");
        return { end: null };
      }
    }
  }
  pageAction.getNow = () => ({ book: nowBook, story: nowStory, sentence: nowSentence })
  useEffect(() => {
    const { book, story, sentence } = pageAction.getNow();
    if (book && story && sentence)
      parent.postMessage({ from: "weimu", key: "getNow", data: ({ bookName: book.name, storyId: story.id, sentenceId: sentence.id }) }, "*")
  }, [nowSentence]);
  pageAction.destroyLoadingP = function () {
    setLoadPhase(null);
    setTitle(null);
    setTips(null);
    setLoadList(null);
  }
  pageAction.load = function (loadList, title = "", tips = []) {
    console.log(objCopy({
      loadList, title, tips, packageSampleUsing
    }), "action:load")
    if (loadPhase) {
      console.log("有加载进行中！");
      return false;
    }
    setTitle(title);
    setTips(tips.map(e => tips_group[e]).filter(e => e));
    setLoadList((packageSampleUsing || !nextBook) ? loadList : ((() => {
      // helper下一次性加载book下的全部资源包，仅使用的
      const re = {};
      Object.values(nextBook.data).map(e => Array.from(e.preload)).flat(1).forEach(({ name, data }) => {
        re[name] ?? (re[name] = { name: name, data: (new Set()) });
        // re[name].data.push(...data);
        data.forEach(e => re[name].data.add(e));
      });
      return Object.values(re).map(({ name, data }) => {
        return ({ name, data: Array.from(data.values()).sort((a, b) => a.localeCompare(b)) });
      });

      // helper下一次性加载book下的全部资源包，无论是否使用。
      // return [{ name: "all", data: Object.keys(file_map) }]
    })()));
    pageAction.onLoadStart_add(() => pageAction.setBGM(null));
    return true;
  }
  useEffect(() => { title && tips && loadList && setLoadPhase("waiting"); }, [title, tips, loadList])
  pageAction.loadStroy = function (story) {
    // debugger;
    action.load(story.preload, story.title, story.tips);
  }
  pageAction.setActivePage = function (nextActivePageName, data) {
    const np = activePage_map[nextActivePageName];
    // if(!np) return false;
    console.log("np", np, nextActivePageName);
    action.onLoadEnd_add(() => {
      setActivePage(np.name);
      pageAction.setCoverPage(null);
    })
    if (nextActivePageName == "main") {
      const { bookName, storyId, sentenceId } = data;
      pageAction.setNext(bookName ?? bookIds[0], storyId, sentenceId);// *或读取存档！
    }
    if (nextActivePageName == "home") {
      if(window !== window.parent){
        np.getPreload();//触发bookscover更新
        pageAction.load([{name:"all",data:Object.keys(file_map)}], `进入${np.ch}`, np.tips);
        pageAction.onLoadEnd_add(() => {
          pageAction.setBGM(homeResource_map.BGM);
          parent.postMessage({ from: "weimu", key: "returnData", data: { BOOK, STORY, pools: { file: FilePool.getFilePool(), package: getPackagePool() } } }, "*")
        });
        
      }
      else{
        pageAction.load(np.getPreload(), `进入${np.ch}`, np.tips);
        pageAction.onLoadEnd_add(() => pageAction.setBGM(homeResource_map.BGM));
      }
    }
    if (nextActivePageName == "information") {
      pageAction.load(np.getPreload(), `进入${np.ch}`, np.tips);
    }
  }
  pageAction.setCoverPage = function (coverPageName) {
    setCoverPage(coverPageName);
  }
  pageAction.callOptionsP = function () {
    pageAction.setCoverPage("options");
  }
  pageAction.callSaveP = function () {
    pageAction.setCoverPage("save");
  }
  pageAction.callLoadP = function () {
    pageAction.setCoverPage("load");
  }
  pageAction.setBGM = function (BGMfile) {
    setNowSound({
      ...nowSound,
      BGM: { ...nowSound.BGM, audioFile: BGMfile ? getFileSrc(BGMfile) : null, audioFileKey: BGMfile ?? null }
    })
  }
  window.fn = pageAction.setVoice = function (voicefile) {
    setNowSound({
      ...nowSound,
      voice: { ...nowSound.voice, audioFile: voicefile ? getFileSrc(voicefile) : null, audioFileKey: voicefile ?? null }
    })
  }
  pageAction.updateOptions = function (updatedOptions, writeDB) {
    const new_options = { ...options, ...updatedOptions };
    writeDB && DBput("global", { key: "options", value: globalSave.options = new_options });
    state.options = new_options;
    setOptions(new_options);
    player.setVolume(pageState.options.volume_ALL * pageState.options.volume_effect);
  }
  pageAction.setCoverPage = function (pageName) {
    setCoverPage(pageName);
  }
  pageAction.getSave = function (id) {
    const { book, story, sentence } = pageAction.getNow();
    if (book && story && sentence) {
      const time = (new Date()).getTime();
      const text = `${book.name}-${story.title}`;
      const nodes = objCopy(baseSave.nodes);
      nodes[book.name] = {
        bookName: book.name, storyId: story.id, sentenceId: sentence.id, to
      }
      const newSave = {
        id, nodes, time, text, nowBookName: book.name
      };
      return newSave;
    }
    return null;
  }
  pageAction.save = function (id) {
    const newSave = pageAction.getSave(id);
    return DBput("save", newSave);
  }
  pageAction.autoSave = function () {
    const newSave = pageAction.getSave("auto");
    return DBput("global", { key: "autoSave", value: newSave });
  }
  pageAction.loadSave = function (save) {
    const { nowBookName, nodes } = save;
    const { bookName, storyId, sentenceId, to } = nodes[nowBookName];
    pageAction.setTo(to);
    if (pageState.activePage != "main") pageAction.setActivePage("main", { bookName, storyId, sentenceId });
    else pageAction.setNext(bookName, storyId, sentenceId);
    pageAction.onLoadEnd_add(() => (setCoverPage(null), setDialogData(null)));
  }
  pageAction.callDialog = function (data) {
    if (!data) {
      setDialogData(null);
      return;
    }
    // let a = 5;
    // const data = {
    //   title: "TITLE",
    //   text: "TEXT...\nY OR N ?",
    //   buttons: [
    //     {
    //       ch: "确认",
    //       style:"green",
    //       fun: () => pageAction.save(a++)
    //     },
    //     {
    //       ch: "取消",
    //       style:"red",
    //       fun: null
    //     }
    //   ]
    // }
    setDialogData(data);
    // debugger;
  }
  return (
    <>
      {getActivePageDOM(activePage)}
      {Object.values(nowSound).map(((e) => <Sound {...e}></Sound>))}
      {getCoverPageDOM(coverPage)}
      {dialogData && <Dialog dialogData={dialogData}></Dialog>}
      {loadPhase && <LoadingP></LoadingP>}
    </>
  )
}

export default App