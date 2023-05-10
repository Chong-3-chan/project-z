import JSZip from 'jszip'
import JSZipUtils from '../jszip-utils-forWorker/index'
export const blobType = {
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    png: 'image/png',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    mp3: 'audio/mpeg',
    aac: 'audio/aac',
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    json: 'application/json',
    abw: 'application/x-abiword',
    arc: 'application/x-freearc',
    avi: 'video/x-msvideo',
    azw: 'application/vnd.amazon.ebook',
    bin: 'application/octet-stream',
    bmp: 'image/bmp',
    bz: 'application/x-bzip',
    bz2: 'application/x-bzip2',
    csh: 'application/x-csh',
    eot: 'application/vnd.ms-fontobject',
    epub: 'application/epub+zip',
    htm: 'text/html',
    ico: 'image/vnd.microsoft.icon',
    ics: 'text/calendar',
    jar: 'application/java-archive',
    jsonld: 'application/ld+json',
    mid: 'audio/midi audio/x-midi',
    midi: 'audio/midi audio/x-midi',
    mjs: 'text/javascript',
    mpeg: 'video/mpeg',
    mpkg: 'application/vnd.apple.installer+xml',
    odp: 'application/vnd.oasis.opendocument.presentation',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odt: 'application/vnd.oasis.opendocument.text',
    oga: 'audio/ogg',
    ogg: 'audio/ogg',
    ogv: 'video/ogg',
    ogx: 'application/ogg',
    otf: 'font/otf',
    rar: 'application/x-rar-compressed',
    rtf: 'application/rtf',
    sh: 'application/x-sh',
    svg: 'image/svg+xml',
    swf: 'application/x-shockwave-flash',
    tar: 'application/x-tar',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    ttf: 'font/ttf',
    txt: 'text/plain',
    vsd: 'application/vnd.visio',
    wav: 'audio/wav',
    weba: 'audio/webm',
    webm: 'video/webm',
    webp: 'image/webp',
    woff: 'font/woff',
    woff2: 'font/woff2',
    xhtml: 'application/xhtml+xml',
    xml: 'text/xml',
    xul: 'application/vnd.mozilla.xul+xml',
    zip: 'application/zip',
}
async function d(zip_path) {
    try {
        const a = await new JSZip.external.Promise(function (resolve, reject) {
            self.postMessage({ state: "downloading", resourcePath: zip_path, percent: 0 });
            JSZipUtils.getBinaryContent(zip_path, {
                callback: function (err, data) {
                    if (err) reject(err);
                    else resolve(data);
                },
                progress: e => self.postMessage({ state: "downloading", resourcePath: zip_path, percent: e.percent })
            });
        }).catch(err => { throw err });
        self.postMessage({ state: "loading", loaded: 0, total: null });
        const b = await JSZip.loadAsync(a);
        let fileNameList = Object.keys(b.files), loaded = 0, total = fileNameList.length, files = {};
        self.postMessage({ state: "loading", loaded: loaded, total: total });
        const c = await Promise.allSettled(
            fileNameList.map((e) => b.file(e).async('base64')
                .then((code) => {
                    files[e] = {};
                    const suffix = e.slice(e.lastIndexOf('.') + 1);
                    console.log(suffix,blobType[suffix], "bbbb")
                    if (!blobType[suffix]) throw suffix + ':未定义的后缀';
                    files[e].type = blobType[suffix];
                    files[e].data = `data:${files[e].type};base64,${code}`;
                    self.postMessage({ state: "loading", loaded: ++loaded, total: total });
                }))
        );
        self.postMessage({ state: "done", data: files, total });
    } catch (err) {
        self.postMessage({ state: "error", error: err });
        throw err;
    }
};
onmessage = e => d(e.data.path)