// pages/order/balance/balance.js
const rxwx = require('../../../utils/RxWX.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    channelId: '',
    cartList: [],
    sumMonney: 0,
    cutMonney: 0,
    cupNumber:0,
    goods: []
  },

  /**
   * 生命周期函数--监听页面加载
  * 商品 goodsC
   *   channelId
   *   dishesId
   *   dishesKindId
   *   className
   *   taste  === detail
   *   dishesCount === sum
   *   price
   *   dishesName
   *   goodsType: 0
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '订单详情' });
    this.setData({
      channelId: wx.getStorageSync('channelId'),
      cartList: wx.getStorageSync('cartList'),
      sumMonney: wx.getStorageSync('sumMonney'),
      // cutMonney: wx.getStorageSync('sumMonney') > 19 ? 3 : 0,
      cutMonney: 0,
      cupNumber: wx.getStorageSync('cupNumber'),
    });
    let goods = [];
    for (var i = this.data.cartList.length - 1; i >= 0; i--) {
      let item = {
        channelId: this.data.channelId,
        dishesId: this.data.cartList[i].id,
        dishesKindId: this.data.cartList[i].dishesKindId,
        className: 'GoodsC',
        taste: this.data.cartList[i].detail,
        dishesCount: this.data.cartList[i].number,
        price: this.data.cartList[i].price,
        dishesName: this.data.cartList[i].name,
        goodsType: 0
      };
      goods.push(item);
    }
    this.setData({ goods: goods });
  },
  gopay: function(){
    rxwx.request({
      url: 'http://localhost:3000/dishes',
      method: 'POST',
      data: { goods: this.data.goods},
      header: { 'Accept': 'application/json' }
    })
    .subscribe(res => {
      console.log(res);
      wx.navigateTo({ url: '../detail/detail' });
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
