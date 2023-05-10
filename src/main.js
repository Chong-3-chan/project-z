import React from 'react'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import App from './App.js'
import FileInfo from './class/file-info.js'
import PackageInfo from './class/package-info.js'
import { chara_map, file_map, package_map, packageSampleUsing, BOOK, STORY, write, b, s, writeRe, bookIds, tips_group } from './data/extra-test-data'
import { ResourceView } from './ResourceView.js'
import { message_getData, message_getFile, message_getPackage, message_readyReload, message_readyResetDB } from './tools/message-helper.js'
import { DBgetAll } from './tools/IndexedDB-controller.js'
document.ondragstart = function () { return false }
document.oncontextmenu = function () { return false }
const ROOT = createRoot(document.getElementById('app'));
function co(oldobj, newobj) {
    for (let i in oldobj) delete oldobj[i];
    console.log("old", oldobj);
    for (let i in newobj) oldobj[i] = newobj[i];
    console.log("old", oldobj);
}
function useData(data) {
    if (data.chara_map && data.file_map && data.package_map && data.tips_group && data.bookIds) {
        co(chara_map, data.chara_map);
        co(file_map, data.file_map);
        co(package_map, data.package_map);
        co(tips_group, data.tips_group);
        // 反馈的包不全（待修改）
        co(bookIds, data.bookIds);
        co(b, data.b);
        co(s, data.s);
        data.bookIds.forEach((bookId) => {
            write(bookId);
            for (let i in BOOK) {
                if (!BOOK[i]) delete BOOK[i];
            }
            for (let i in STORY) {
                if (!STORY[i]) delete STORY[i];
            }
            co(BOOK[bookId] ?? (BOOK[bookId] = {}), writeRe[bookId].BOOK);
            co(STORY[bookId] ?? (STORY[bookId] = {}), writeRe[bookId].STORY);
        })
        return true;
    }
    return false;
}
export const globalSave = {
    readStory: [],
    options: {}
};
if (!packageSampleUsing && window !== window.parent) {
    message_getData(null, async (data) => {
        const readGlobal = await DBgetAll("global").then((e) => Object.fromEntries(e.map(({ key, value }) => [key, value])));
        // co(globalSave, readGlobal);
        for (let i in readGlobal) globalSave[i] = readGlobal[i];
        useData(data);
        ROOT.render(
            <React.Fragment>
                <App></App>
                {/* <ResourceView></ResourceView> */}
            </React.Fragment>
        )
    });
    message_readyResetDB(null, () => location.reload());
    message_readyReload();
    // message_getPackage({packageKey:"C04"});
}
else {
    // if (packageSampleUsing) {
    //     if (window !== window.parent) message_readyResetDB(null, () => location.reload());
    //     fetch("https://chong-chan.cn/resource/sample/sample.json").then(e => e.json()).then(data => {
    //         // debugger;
    //         useData(data);
    //         ROOT.render(
    //             <React.Fragment>
    //                 <App></App>
    //                 <div style={{ position: "fixed", left: 0, bottom: 0 }}>packageSampleUsing</div>
    //                 {/* <ResourceView></ResourceView> */}
    //             </React.Fragment>
    //         )
    //     })
    // }
    if (packageSampleUsing) {
        ROOT.render(
            <React.Fragment>
                <App></App>
                <div style={{ position: "fixed", left: 0, bottom: 0 }}>packageSampleUsing</div>
                {/* <ResourceView></ResourceView> */}
            </React.Fragment>
        )
    }
    else {
        ROOT.render(
            <>提示： packageSampleUsing:false且没有parent</>
        )
    }
}
// if(parent.window.test_data)console.log('parent test data',parent.window.test_data)

