
function urlPar(url, res) {

    let video_patt = /\/vod-play-/g;

    if (video_patt.test(url)) {
        VideoPlayFunction(url,res);
    }
}

function fitUrl(url) {
    let video_patt = /\/vod-play-/g;

    if (video_patt.test(url)) {
        return true;
    }
    return false;
}


function VideoPlayFunction(url,res) {
    console.log("正在爬取",url);

    let $ = res.$;
    // console.log(res.body);
    // language=JQuery-CSS
    let videoMessage = $('#players script:nth-child(1)').html();

    let videourl = videoMessage.match(/unescape\('(\S*)'\);/)[1];   //截取url
    videourl = unescape(videourl);                                  //翻译url
    videourl = videourl.match(/\$(\S*)/)[1];                        //再次截取url

    let videoTitle = videoMessage.match(/mac_name='(\W*)'/)[1];    //截取名称

    console.log(videourl);
    console.log(videoTitle)
}

function XiaosuoFunction(url,res) {

}

function PictureFunction(url,res) {

}

module.exports ={
    urlPar,
    fitUrl,
};
