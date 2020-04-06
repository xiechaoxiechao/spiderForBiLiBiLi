function Config(){
    //搜索关键字
    this.searchKey='蕾姆',
    /*目标板块 
    1  => 专栏    
    2  => 相簿
    默认专栏
    */
    this.aimSection=2,
    //检索页数，一般一页包含20个项目
    this.pageCount=1,
    /*
    搜索排序方式 
      if(目标板块为专栏){
        1 => 默认排序
        2 => 最新发布
        3 => 最多阅读
        4 => 最多喜欢
        5 => 最多评论
      }else
      if(目标板块为相簿){
        1 => 默认排序
        2 => 最多收藏
        3 => 最新发布
       }
    */
    this.orderType=1,
    /*
    目标分区
    if(目标板块为专栏){
        1 => 全部分区
        2 => 动画
        3 => 游戏
        4 => 影视
        5 => 生活
        6 => 兴趣
        7 => 轻小说
        8 => 科技
    }else
    if(目标板块为相簿){
        1 => 全部分区
        2 => 画友
        3 => 摄影
    }
    */
    this.aimZone=1,
    /*
    最大下载连接数
    */
    this.maxConnectCount=5,
    /*
    下载批次延时
    */
    this.downloadDelay=0,
    /*
    控制是否间断性暂停
      1 => 是
      2 => 否
    */
    this.globalDelay=1


}
module.exports=Config;