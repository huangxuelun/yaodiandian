//index.js
//获取应用实例
const app = getApp();
const rxwx = require('../../utils/RxWX.js');

Page({
  data: {
    //轮播图
    imgUrls: [
      '../../images/1.png',
      '../../images/3.png',
      '../../images/4.png'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000
  },
  onLoad: function () {

    rxwx.Rx.Observable.from(['a', 'b', 'c']).subscribe(name => {
      console.log(name);
    });
    rxwx.setStorageSync('test-rxwx', '123456')
      .catch((e) => console.error('RxWX发现错误'))
      .subscribe((resp) => console.log(resp))

  },
  golist: function () {
    wx.navigateTo({
      // url: '../list/list'
      // 模拟扫描贵云山庄二维码
      url: '../list/list?scene=gysz'
    })
  },
})
