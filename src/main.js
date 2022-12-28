import React from 'react'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import App from './App.js'
import FileInfo from './class/file-info.js'
import PackageInfo from './class/package-info.js'
import { chara_map, file_map, package_map, packageSampleUsing, BOOK, STORY, write, b, s, writeRe, bookIds } from './data/extra-test-data'
import { ResourceView } from './ResourceView.js'
document.ondragstart = function () { return false }
document.oncontextmenu = function () { return false }
const ROOT = createRoot(document.getElementById('app'));
if (!packageSampleUsing && window !== window.parent) {
    // try {
    //     removeEventListener("message", getData);
    // } catch (e) { };;
    addEventListener("message", function getData({ data: { from, data } }) {
        function _getData({ data: { from, data } }) {
            return new Promise((resolve, reject) => {
                if (!from?.startsWith("weimu")) return;
                console.log("child get msg", { from, data });
                resolve(data);;
            })
        }
        _getData({ data: { from, data } }).then((data) => {
            function co(oldobj, newobj) {
                for (let i in oldobj) delete oldobj[i];
                console.log("old", oldobj);
                for (let i in newobj) oldobj[i] = newobj[i];
                console.log("old", oldobj);
            }
            if (data.chara_map && data.file_map && data.package_map) {
                co(chara_map, data.chara_map);
                co(file_map, data.file_map);
                co(package_map, data.package_map);
                // 反馈的包不全（待修改）
            }
            if (data.bookIds) {
                co(bookIds,data.bookIds);
                co(b, data.b);
                co(s, data.s);
                data.bookIds.forEach((bookId) => {
                    write(bookId);
                    co(BOOK[bookId] ?? (BOOK[bookId]={}), writeRe[bookId].BOOK);
                    co(STORY[bookId] ?? (STORY[bookId]={}), writeRe[bookId].STORY);
                })
            }
        }).then(() =>
            ROOT.render(
                <React.Fragment>
                    <App></App>
                    {/* <ResourceView></ResourceView> */}
                </React.Fragment>
            ))
    });
    parent.postMessage({ from: "weimu", data: { msg: "ready" } }, "*");
}
else {
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

