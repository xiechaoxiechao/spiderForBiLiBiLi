var request = require('request');
var cheerio = require('cheerio');
request = request.defaults({
    jar: true
})
var Config = require('./config');
var config = new Config();
var fs = require('fs');
var eventProxy = require('eventproxy');
var ep = new eventProxy();
var pageCount = config.pageCount;
var failCount = 0;
var doneCount = 0;
var pageIdArr = [];
var add = 0;
var beginTime = new Date();
var searchKey = encodeURI(config.searchKey);
var searchAim = "article";
var orderType = "totalrank";
var aimZone = 0;
var nowCount = -1;
if (config.aimSection == 1) {
    searchAim = "article";
    switch (config.orderType) {
        case 1:
            orderType = "totalrank";
            break;
        case 2:
            orderType = "pubdate";
            break;
        case 3:
            orderType = "click";
            break;
        case 4:
            orderType = "attention";
            break;
        case 5:
            orderType = "scores";
            break;
        default:
            orderType = "attention";
    }
    switch (config.aimZone) {
        case 1:
            aimZone = 0;
            break;
        case 2:
            aimZone = 2;
            break;
        case 3:
            aimZone = 1;
            break;
        case 4:
            aimZone = 28;
            break;
        case 5:
            aimZone = 3;
            break;
        case 6:
            aimZone = 29;
            break;
        case 7:
            aimZone = 16;
            break;
        case 8:
            aimZone = 17;
            break;
        default:
            aimZone = 0;
            break;
    }
} else {
    searchAim = "photo";
    switch (config.orderType) {
        case 1:
            orderType = "totalrank";
        case 2:
            orderType = "stow";
        case 3:
            orderType = 'pubdate';
        default:
            orderType = "stow";
    }
    switch (config.aimZone) {
        case 1:
            aimZone = 0;
            break;
        case 2:
            aimZone = 1;
            break;
        case 3:
            aimZone = 2;
            break;
        default:
            aimZone = 0;
    }
}
var userAgent = [
    'User-Agent:Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.94 Safari/537.36',
    'User-Agent:Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) CriOS/27.0.1453.10 Mobile/10B350 Safari/8536.25',
    'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36',
    'User-Agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.11 (KHTML, like Gecko)Ubuntu/11.10 Chromium/27.0.1453.93 Chrome/27.0.1453.93 Safari/537.36',
    'User-Agent:Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27',
    'User-Agent:Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
    'User-Agent:Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
    'User-Agent:Mozilla/5.0 (Android; Mobile; rv:14.0) Gecko/14.0 Firefox/14.0',
    'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:21.0) Gecko/20100101 Firefox/21.0',
    'User-Agent:Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:21.0) Gecko/20130331 Firefox/21.0',
    'User-Agent:Mozilla/5.0 (Windows NT 6.2; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0',
    'User-Agent:Opera/9.80 (Windows NT 6.1; WOW64; U; en) Presto/2.10.229 Version/11.62'
]
var tips = '[==================================================]';
var readyTips = tips.split('');
console.log('开始页面索引…');
var begin = function (start) {
    ep.after('done', 8, function (num) {
        begin(start + 8);
    })
    var q = 0;
    for (var i = start; i <= pageCount; i++) {
        if (q >= 8) {
            break;
        }
        q++;
        var aimUrl = 'https://search.bilibili.com/' + searchAim + '?keyword=' + searchKey + '&order=' + orderType + '&category_id=' + aimZone + '&page=' + i;
        var random = Math.floor(Math.random() * 11);
        var user_agent = userAgent[random];
        request({
            url: aimUrl,
            headers: {
                'Accept': 'text/html, application/xhtml+xml, application/xml; q=0.9, */*; q=0.8',
                'Accept-Language': 'zh-CN',
                'Cache-Control': 'max-age=0',
                'Host': 'search.bilibili.com',
                'User-Agent': user_agent
            }
        }, function (err, res, body) {
            if (err) {
                failCount++;
                console.log('连接错误[' + failCount + ']!');
                var percent = Math.floor(((doneCount + failCount) / pageCount) * 50);
                if (nowCount != percent) {
                    nowCount = percent;
                    for (let i = 1; i <= nowCount; i++) {
                        readyTips[i] = "#";
                    }
                    console.log(readyTips.toString().replace(/\,/g, ''));
                }
                add++;
                if (add == pageCount) {
                    setTimeout(() => {
                        var doneTime = new Date();
                        console.log('页面索引完成，共搜索' + pageCount + '个页面，找到' + pageIdArr.length + '个栏目，耗时' + (doneTime - beginTime) + 'ms。');
                        createDir(pageIdArr);
                    }, 200)
                }
                ep.emit('done');
            } else {
                var type = 'getSingleTypeList-jump-category_id-' + aimZone + '-keyword-' + config.searchKey + '-order-' + orderType + '-search_type-' + searchAim;
                var $ = cheerio.load(body);
                var data = JSON.parse($('script')[7].children[0].data.slice(25, -122)).flow[type].result;
                for (let j = 0; j < data.length; j++) {
                    pageIdArr.push(data[j].id);
                    if (j == data.length - 1) {
                        doneCount++;
                        var percent = Math.floor(((doneCount + failCount) / pageCount) * 50);
                        if (nowCount != percent) {
                            nowCount = percent;
                            for (let i = 1; i <= nowCount; i++) {
                                readyTips[i] = "#";
                            }
                            console.log(readyTips.toString().replace(/\,/g, ''));
                        }
                        ep.emit('done');
                    }
                }
                add++;
                if (add == pageCount) {
                    setTimeout(() => {
                        var doneTime = new Date();
                        console.log('页面索引完成，共搜索' + pageCount + '个页面，找到' + pageIdArr.length + '个栏目，耗时' + (doneTime - beginTime) + 'ms。');
                        createDir(pageIdArr);
                    }, 200)
                }
            }
        })
    }
}
begin(1);
function createDir(arr) {
    console.log('开始创建目录…')
    var nameArr = beginTime.toString().split('');
    var downloadDir = './' + config.searchKey + nameArr[11] + nameArr[12] + nameArr[13] + nameArr[14] + nameArr[16] + nameArr[17] + nameArr[19] + nameArr[20] + nameArr[22] + nameArr[23] + '/';
    fs.mkdir(downloadDir, (err) => {
        if (!err) {
            var doneCount1 = 0;
            for (var i = 0; i < arr.length; i++) {
                fs.mkdir(downloadDir + arr[i].toString() + '/', (err) => {
                    if (err) {
                        doneCount1++;
                        if (doneCount1 == arr.length) {
                            console.log('开始解析栏目资源…');
                            getImgUrl(arr, downloadDir);
                        }
                    } else {
                        doneCount1++;
                        if (doneCount1 == arr.length) {
                            console.log('开始解析栏目资源…');
                            getImgUrl(arr, downloadDir);
                        }
                    }
                });
            }
        } else {
            console.log('文件夹创建失败！')
        }
    }); //创建与当前时间有关的文件夹
}
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var eventProxy = require('eventproxy');
var ep = new eventProxy();
var Config = require('./config');
var config = new Config();
var getImgUrl = function (idArr, downloadDir) {
    var tips = '[--------------------------------------------------]';
    var readyTips = tips.split('');
    var urlArr = [];
    var dirArr = [];
    var witch = 0;
    var haveDone = 0;
    var doneCount = 0;
    var nowPercent = -1;
    var beginTime = new Date();
    var aim = Math.floor(idArr.length / 6);
    var finDone = idArr.length - aim * 6;
    var stateNum = 0;
    if (idArr.length < 6) {
        witch = 1;
    }
    var beginCatch = function (start) {
        ep.after('done', 6, function (list) {
            haveDone = 0;
            stateNum++;
            if (idArr.length % 6 == 0) {
                if (stateNum == aim) {
                    var doneTime = new Date();
                    console.log('共解析到' + urlArr.length + '张图片，耗时' + (doneTime - beginTime) + 'ms。')
                    console.log("开始下载…");
                    download(urlArr, dirArr, downloadDir);
                }
            }
            if (stateNum == aim) {
                witch = 1;
            }
            beginCatch(start + 6);
        })
        var q = 0
        for (let i = start; i < idArr.length; i++) {
            if (q >= 6) {
                break;
            }
            q++;
            var random = Math.floor(Math.random() * 11);
            var user_agent = userAgent[random];
            if (config.aimSection == 2) {
                var aimUrl = 'https://api.vc.bilibili.com/link_draw/v1/doc/detail?doc_id=' + idArr[i];
            } else {
                var aimUrl = 'https://www.bilibili.com/read/cv' + idArr[i];
            }
            request({
                'url': aimUrl,
                headers: {
                    'Accept': 'text/html, application/xhtml+xml, application/xml; q=0.9, */*; q=0.8',
                    'Accept-Language': 'zh-CN',
                    'Connection': 'Keep-Alive',
                    'User-Agent': user_agent
                }
            }, function (err, res, body) {
                if (config.aimSection == 2) {
                    var data = JSON.parse(body).data.item.pictures;
                    for (let j = 0; j < data.length; j++) {
                        dirArr.push(idArr[i]);
                        urlArr.push(data[j].img_src);
                    }
                    haveDone++;
                    if (witch == 1 && haveDone == finDone) {
                        var doneTime = new Date();
                        console.log('共解析到' + urlArr.length + '张图片，耗时' + (doneTime - beginTime) + 'ms。')
                        console.log("开始下载…");
                        download(urlArr, dirArr, downloadDir)
                    }
                    doneCount++;
                    var percent = Math.floor((doneCount / idArr.length) * 50);
                    if (nowPercent != percent) {
                        nowPercent = percent;
                        for (let i = 1; i <= nowPercent; i++) {
                            readyTips[i] = "#";
                        }
                        console.log(readyTips.toString().replace(/\,/g, ''));
                    }
                    ep.emit('done');
                } else {
                    var $ = cheerio.load(body);
                    $('div.article-holder figure img').each((ind, ele) => {
                        var readyUrl = $(ele).attr('data-src');
                        if (readyUrl.match('1e610b682b8636764fe50ed.png') == null) {
                            if (readyUrl.match('https') == null) {
                                var realUrl = "https:" + readyUrl;
                            }
                            dirArr.push(idArr[i]);
                            urlArr.push(realUrl);
                        }
                    })
                    doneCount++;
                    var percent = Math.floor((doneCount / idArr.length) * 50);
                    if (nowPercent != percent) {
                        nowPercent = percent;
                        for (let i = 1; i <= nowPercent; i++) {
                            readyTips[i] = "#";
                        }
                        console.log(readyTips.toString().replace(/\,/g, ''));
                    }
                    haveDone++;
                    if (witch == 1 && haveDone == finDone) {
                        var doneTime = new Date();
                        console.log('共解析到' + urlArr.length + '张图片，耗时' + (doneTime - beginTime) + 'ms。')
                        console.log("开始下载…");
                        download(urlArr, dirArr, downloadDir);
                    }
                    ep.emit('done');
                }
            })
        }
    }
    beginCatch(0);
}
var request = require('request');
var fs = require('fs');
var eventProxy = require('eventproxy');
var http = require('http');
var stream = require('stream');
var beginTime = new Date();
var request = request.defaults({
    jar: true
})
var download = function (url, path, dirPath) {
    var tips = '[--------------------------------------------------]';
    var readyTips = tips.split('');
    var nowCount = -1;
    var Config = require('./config');
    var config = new Config();
    var model = config.aimSection;
    var maxConnectCount = config.maxConnectCount;
    var downloadDelay = config.downloadDelay;
    var control = Math.round(Math.floor(url.length / maxConnectCount) / 4);
    var successCount = 0;
    var failCount = 0;
    var doneCount = 0;
    var beginTime = new Date();
    var nowPercent = -1;
    var addCount = 0;
    var batchCount = 0;
    var beginDownload = function (start) {
        var ep = new eventProxy();
        ep.after('done', maxConnectCount, () => {
            addCount = 0;
            batchCount++;
            beginDownload(start + maxConnectCount);
        });
        var q = 0;
        for (let i = start; i < url.length; i++) {
            if (q >= maxConnectCount) {
                break;
            }
            if (url[i] === undefined) {
                continue;
            }
            var newFileName = dirPath + path[i] + '/' + url[i].slice(50);
            var random = Math.floor(Math.random() * 11);
            var user_agent = userAgent[random];
            const fileStream = fs.createWriteStream(newFileName);
            const internetStream = request({
                url: url[i],
                headers: {
                    'Accept': 'text/html, application/xhtml+xml, application/xml; q=0.9, */*; q=0.8',
                    'Accept-Language': 'zh-CN',
                    'Connection': 'Keep-Alive',
                    'Host': 'i0.hdslb.com',
                    'User-Agent': user_agent
                }
            });
            internetStream.pipe(fileStream);
            fileStream.on('finish', (src) => {
                addCount++;
                if (addCount == maxConnectCount && config.globalDelay == 1) {
                    if (batchCount == control) {
                        batchCount = 0;
                        downloadDelay = 5000;
                        addCount = 0;
                        console.log('下载延时中，5s后恢复下载');
                        setTimeout(() => {
                            downloadDelay = config.downloadDelay;
                        }, 5010)
                    }
                }
                setTimeout(() => {
                    ep.emit("done");
                    doneCount++;
                    successCount++;
                    var percent = Math.floor((doneCount / url.length) * 50);
                    if (nowPercent != percent) {
                        nowPercent = percent;
                        for (let i = 1; i <= nowPercent; i++) {
                            readyTips[i] = "#";
                        }
                        console.log(readyTips.toString().replace(/\,/g, ''));
                    }
                    if (doneCount == url.length) {
                        var doneTime = new Date();
                        console.log('下载完成,共下载图片' + url.length + '张，成功下载' + successCount + '张，失败' + failCount + '张，共耗时' + (doneTime - beginTime) + 'ms。');
                    }
                }, downloadDelay);
            });
            fileStream.on('error', (src) => {
                if (addCount == maxConnectCount && config.globalDelay == 1) {
                    if (batchCount == control) {
                        batchCount = 0;
                        downloadDelay = 5000;
                        addCount = 0;
                        console.log('下载延时中，5s后恢复下载');
                        setTimeout(() => {
                            downloadDelay = config.downloadDelay;
                        }, 5010)
                    }
                }
                setTimeout(() => {
                    ep.emit('done', );
                    failCount++;
                    doneCount++;
                    var percent = Math.floor((doneCount / url.length) * 50);
                    if (nowPercent != percent) {
                        nowPercent = percent;
                        for (let i = 1; i <= nowPercent; i++) {
                            readyTips[i] = "#";
                        }
                        console.log(readyTips.toString().replace(/\,/g, ''));
                    }
                    if (doneCount == url.length) {
                        var doneTime = new Date();
                        console.log('下载完成,共下载图片' + url.length + '张，成功下载' + successCount + '张，失败' + failCount + '张，共耗时' + (doneTime - beginTime) + 'ms。');
                    }
                }, downloadDelay);
            });
            q++;
        }
    }
    beginDownload(0);
}