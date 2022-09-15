import React, { useState, useEffect } from 'react'
import LoadingP from './LoadingP.js'

import {tips} from './data/test-data.js'

export const base_path = "http://pixiv.miunachan.top/img/"
// export const base_path = "http://projecta-resource.com/img/";
const fileList = [
  "1.png",
  "bg1.png",
  "logo.png",
  "chara/gelin.png",
  "chara/gelin_head.png",
  // "chara/lin.png",
  // "chara/lin_head.png"
  // "weapon/2.png",
];
function App(props) {
  const [state, setState] = useState("loading");
  function destroy() {
    setState("loaded");
    setTimeout(() => {
      setState("home");
    }, 4000);
  }
  // document.body.style.backgroundImage=`url(${base_path + fileList[1]})`;
  return (
    <>
      {state != "loading" && <div className='full-page' style={{
        fontSize:"50vh",
        lineHeight:"100vh",
      }}>kkkk</div>}
      {state != "home" && <LoadingP fileList={fileList} destroy={destroy} tips={tips.A.concat(tips.B)}></LoadingP>}
    </>
  )
}

export default App