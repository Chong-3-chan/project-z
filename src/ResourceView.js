import React, { useEffect, useState } from 'react'
import { file_map, getFileSrc } from "./data/extra-test-data.js"
import JSZip from 'jszip'
import JSZipUtils from 'jszip-utils'
export const test_zip_path = "http://projecta-resource.com/extra_test_active/test.zip";
export function ResourceView() {
    // console.log(Object.keys(file_map));
    // new JSZip();
    const [idata, setiData] = useState(null);
    useEffect(() => {
        new JSZip.external.Promise(function (resolve, reject) {
            JSZipUtils.getBinaryContent(test_zip_path, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }).then(function (data) {
            return JSZip.loadAsync(data);
        }).then(e => e.file('tati_040402.png').async('base64'))
            .then(e => {
                // console.log(<img src={"data:image/png;base64,"+e}></img>)
                setiData(e)
            }).catch(err=>console.log(err));
    }, [])
    return <div className="ResourceView">
        {/* {Object.keys(file_map).map((e, i) =>
            <div className="viewBox" key={i}>
                <a href='#!'>
                    <img src={getFileSrc(e)}></img>
                    <p>{e}</p>
                </a>
            </div>
        )} */}
        {idata && <img src={"data:image/png;base64," + idata}></img>}
    </div>
}