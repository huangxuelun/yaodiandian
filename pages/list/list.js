// pages/list/list.js

const BigNumber = require('../../utils/bignumber.js');
const util = require('../../utils/util.js');
// const rxjs = require('../../utils/Rx.js');
const rxwx = require('../../utils/RxWX.js');

Page({

  /**
   * 页面的初始数
   *
   * 菜品类别列表
   *   菜品列表
   *     菜品类别ID
   *     名称
   *     单价
   *     ？口味列表
   *
   * 商品 goodsC
   *   channelId
   *   className
   *   dishesId
   *   taste
   *   dishesCount
   *   price
   *   dishesName
   *   dishesKindId
   *   goodsType: 0
   *
   * 订单 orderC
   *   channelId
   *   className
   *   orderNum 订单序号
   *   serialNum 序列号
   *   printFlag = 0
   *   allPrice
   *   createTime
   *   orderTime = 1
   *   deviceType = 2
   *   orderType = 0
   *   goodsList
   *   areaName
   *   tableName
   *   tableNo
   */

  data: {
    channelId: '',
    listData: [],  // 所有菜品列表
    activeIndex: 0,
    toView: 'a0',
    scrollTop: 100,
    screenWidth: 667,
    showModalStatus: false,  // 是否显示模态窗
    currentType: 0,  // 当前菜品类别
    currentIndex: 0,  // 当前菜品索引
    tasteIndex: 0,
    cartList: [],
    sumMonney: 0,
    cupNumber: 0,
    showCart: false,  // 是否显示购物车
    loading: false  // 加载状态
  },

  /**
   * 生命周期函数--监听页面加载
   * 页面加载时，读取所扫描二维码中的场景值，根据场景值请求加载商家菜单、缓存第一类菜品图片
   */
  onLoad: function (options) {
    let scene = decodeURIComponent(options.scene);
    console.log('dev@二维码所属：' + scene);

    let that = this;
    // var sysinfo = wx.getSystemInfoSync().windowHeight;
    // console.log('dev@sysinfo', sysinfo);
    wx.showLoading({ title: '努力加载中', });
    rxwx.request({
      url: 'http://localhost:3000/dishes',
      method: 'GET',
      data: { channelId: scene },
      header: { 'Accept': 'application/json' }
    })
    .map(res => res.data)
    .subscribe(result => {
      wx.hideLoading();
      console.log('dev@listData=res.data:', result)
      that.setData({ loading: true, channelId: scene });

      // 下载菜品的图片, 过滤不存在的图片，更新视图模型
      for (let i = 0; i < result.length; i++ ) {
        for (let j = 0; j < result[i].dishesList.length; j++) {
          util.downloadImg(result[i].dishesList[j].imgUrl)
            .filter(response => response.statusCode === 200)
            .map(item => item.tempFilePath)
            .do(element => console.log('subscribe tmpPath :', element))
            .subscribe(tmpPath => {
              // result[i].dishesList[j].imgUrl = tmpPath;
              let param = {};
              let string = `listData[${i}].dishesList[${j}].imgUrl`;
              param[string] = tmpPath;
              // that.setData({
                // listData[i].dishesList[j].imgUrl: tmpPath
                // `listData[${i}].dishesList[${j}].imgUrl`: tmpPath
                // listData: result
              // });
              that.setData(param);
            });
        }
      }

      // for (let i = 0; i < result.length; i++ ) {
      //   for (let j = 0; j < result[i].dishesList.length; j++) {
      //     util.downloadImg(result[i].dishesList[j].imgUrl, response => {
      //       if (response.statusCode === 200) {
      //         console.log('subscribe tmpPath :', response.tempFilePath);
      //         result[i].dishesList[j].imgUrl = tmpPath;
      //         that.setData({listData: result});
      //       }
      //     })
      //   }
      // }

      // 计算生成 每类菜品的锚点位置数组
      let disArea = [];
      for (let i = 0; i < result.length; i++ ) {
        if (i === 0 ) {
          disArea[0] = 0;
        } else {
          disArea[i] = disArea[i-1] + result[i-1].dishesList.length * 73;
        }
      }
      that.setData({ disArea: disArea, listData: result });
    });
    // wx.request({
    //   url: 'http://localhost:3000/dishes',
    //   method: 'GET',
    //   data: { channelId: scene },
    //   header: { 'Accept': 'application/json' },
    //   success: function (res) {
    //     wx.hideLoading();
    //     console.log('dev@listData=res.data:', res.data)
    //     that.setData({
    //       listData: res.data,
    //       loading: true
    //     });
    //     let dishesList = res.data[0].dishesList;
    //     let disArea = [];
    //     // 下载第一类菜品的图片
    //     for (let i = 0; i < dishesList.length; i++ ) {
    //       console.log('dev@dishesList-imgUrl', dishesList[i].imgUrl);
    //       util.downloadImg(dishesList[i].imgUrl, function(result) {
    //         console.log(result);
    //       });
    //     }
    //     // 计算生成 每类菜品的锚点位置数组
    //     for (let i = 0; i < res.data.length; i++ ) {
    //       if (i === 0 ) {
    //         disArea[0] = 0;
    //       } else {
    //         disArea[i] = disArea[i-1] + res.data[i-1].dishesList.length * 73;
    //       }
    //     }
    //     that.setData({
    //       disArea: disArea
    //     });
    //   }
    // });
  },
  /**
   * 选择菜品类别
   * @param  {[event]} e [event]
   * 点击菜品类别，获取菜品类别的位置索引，设置视图模型中激活的位置索引、锚点位置索引
   */
  selectMenu: function (e) {
    var index = e.currentTarget.dataset.index
    console.log('dev@菜品类别位置索引为：', index)
    this.setData({
      activeIndex: index,
      toView: 'a' + index,
    });
    console.log('dev@对应菜品列表锚点',this.data.toView);
  },
  /**
   * 菜单滚动
   * @param  {event} e 滚动菜单时触发的事件
   * @return {undefined}
   *
   *  每个菜品元素高度为 72
   *
   */
  scroll: function (e) {
    let dis = e.detail.scrollTop;
    console.log('dev@滚动', dis);
    let disArea = this.data.disArea;
    for (var i = disArea.length - 1; i >= 0; i--) {
      if ( dis > disArea[i] ) {
        this.setData({activeIndex: i});
        break;
      }
    }
  },
  /**
   * 选择商品详情：口味（显示模态窗） 或 直接加入购物车
   * @param e: event
   * @return
   */
  selectInfo: function (e) {
    // 如果选中了商品，会携带 菜品类别索引（type）和 菜品索引（index）
    if (e.currentTarget.dataset.type >= 0 && e.currentTarget.dataset.index >= 0) {
      let type = e.currentTarget.dataset.type;
      let index = e.currentTarget.dataset.index;
      let currentDish = this.data.listData[type].dishesList[index];
      console.log('type + index', type, index);
      this.setData({ currentType: type, currentIndex: index, });
      // 如果菜品有多种口味则显示模态窗, 待用户选择口味后再加入购物车
      if (currentDish.tastes) {
        return this.setData({ showModalStatus: true });
      } else {
        // 如果菜品没有多种口味，则直接增加数量到购物车
        let newListData = this.data.listData;
        if (currentDish.count) { // 已经点过一份该菜品
          newListData[type].dishesList[index].count++;
          this.setData({ listData: newListData });
          this.addToCart(type, index);
        } else { // 没有点过该菜品, 视图模型中该数据模型为 undefined
          newListData[type].dishesList[index].count = 1;
          this.setData({ listData: newListData });
          this.addToCart(type, index);
        }
      }
    } else {
      this.setData({ showModalStatus: false });
    }
  },
  /**
   * 减少选中的菜品数量
   * @param  {event} e [description]
   * @return {[type]}   [description]
   */
  decCount: function(e) {
    let type = e.currentTarget.dataset.type;
    let index = e.currentTarget.dataset.index;
    let currentDish = this.data.listData[type].dishesList[index];
    console.log('dev@decCountFunc', currentDish);
    if (currentDish.tastes) {
      // 如果菜品存在多种口味
      console.log('dev@decCount,菜品存在多种口味')
      this.setData({ showModalStatus: true});
      return;
    } else {
      let newListData = this.data.listData;
      let newCartList = this.data.cartList;
      let sum = this.data.sumMonney.minus(currentDish.price);
      if (currentDish.count > 1) { // 已经点过一份该菜品
        newListData[type].dishesList[index].count--;
        for (let i = newCartList.length - 1; i >= 0; i--) {
          if (newCartList[i].name === currentDish.dishesName) {
            newCartList[i].number--; break;
          }
        }
        this.setData({
          cupNumber: this.data.cupNumber-1,
          listData: newListData,
          cartList: newCartList,
          sumMonney: sum,
        });
      } else {
        let cartIndex = undefined;
        newListData[type].dishesList[index].count = undefined;
        for (let i = newCartList.length - 1; i >= 0; i--) {
          if (newCartList[i].name === currentDish.dishesName) {
            cartIndex = i; break;
          }
        }
        newCartList.splice(cartIndex, 1);
        this.setData({ listData: newListData, cartList: newCartList, cupNumber: this.data.cupNumber - 1, sumMonney: sum });
      }
    }
  },
  /**
   * 选择商品口味
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  chooseSE: function (e) {
    var tasteIndex = e.currentTarget.dataset.index;
    this.setData({tasteIndex: tasteIndex});
  },
  /**
   * 增加商品到购物车 =》 cartList
   * @param {[number]} type  [菜品类别索引]
   * @param {[number]} index [菜品索引]
   */
  addToCart: function (type, index) {
    let vm = this.data;
    console.log(type, index);
    // 有口味的菜品
    if (!Number.isInteger(type)) {
      type = this.data.currentType;
      index = this.data.currentIndex;
      let newListData = vm.listData;
      if (newListData[type].dishesList[index].count) {
        newListData[type].dishesList[index].count++;
      } else {
        newListData[type].dishesList[index].count = 1;
      }
      this.setData({listData: newListData});
    }
    // 当前选中的菜品
    let currentDish = vm.listData[type].dishesList[index];
    console.log(currentDish);
    // 菜品重复标志
    let repeatFlag = -1;
    console.log('购物车', vm.cartList);
    for (let i = vm.cartList.length - 1; i >= 0; i--) {
      if ( !currentDish.tastes && vm.cartList[i]['name'] === currentDish['dishesName']) {
        repeatFlag = i;
        console.log('repeatFlag', repeatFlag);
        break;
      }
      if ( currentDish.tastes && vm.cartList[i]['name'] === currentDish['dishesName']
        && vm.cartList[i]['detail'] && vm.cartList[i]['detail'] === currentDish.tastes[this.data.tasteIndex]) {
        repeatFlag = i;
        console.log('repeatFlag', repeatFlag);
        break;
      }
    }
    let sumMonney = new BigNumber(vm.sumMonney).plus(currentDish.price);
    let cartList = vm.cartList;
    if (repeatFlag !== -1) {
        vm.cartList[repeatFlag]['number'] ++;
        vm.cartList[repeatFlag]['sum'] = new BigNumber(vm.cartList[repeatFlag]['sum']).plus(currentDish.price);
    } else {
      let addItem = {
        "id": currentDish.id,
        "dishesKindId": vm.listData[type].id,
        "name": currentDish.dishesName,
        "price": currentDish.price,
        "detail": currentDish.tastes ? currentDish.tastes[this.data.tasteIndex] : '无其他口味',
        "number": 1,
        "sum": new BigNumber(currentDish.price),
        "type": type,
        "index": index,
      }
      cartList.push(addItem);
    }
    this.setData({
      cartList: cartList,
      showModalStatus: false,
      sumMonney: sumMonney,
      cupNumber: vm.cupNumber + 1
    });
    console.log('购物车', vm.cartList)
  },
  /**
   * [显示购物车]
   * @return {[type]} [description]
   */
  showCartList: function () {
    console.log(this.data.showCart)
    if (this.data.cartList.length != 0) {
      this.setData({
        showCart: !this.data.showCart,
      });
    }
  },
  /**
   *  清空购物车
   * @return {[type]} [description]
   */
  clearCartList: function () {
    this.setData({
      cartList: [],
      showCart: false,
      sumMonney: 0,
      cupNumber: 0,
    });
  },
  /**
   * 增加商品数量
   * @param {[type]} e [description]
   */
  addNumber: function (e) {
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    var cartIndex = e.currentTarget.dataset.cartIndex;
    console.log(type, index, cartIndex);
    var cartList = this.data.cartList;
    var listData = this.data.listData;
    cartList[cartIndex].number++;
    listData[type].dishesList[index].count++;
    var sum = this.data.sumMonney.plus(cartList[cartIndex].price);
    cartList[cartIndex].sum = cartList[cartIndex].sum.plus(cartList[cartIndex].price);
    this.setData({
      listData: listData,
      cartList: cartList,
      sumMonney: sum,
      cupNumber: this.data.cupNumber+1
    });
  },
  /**
   * 减少指定商品的数量
   * @param  {event} e 点击减少数量按钮
   * @return {[type]}   [description]
   */
  decNumber: function (e) {
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    var cartIndex = e.currentTarget.dataset.cartIndex;
    console.log(type, index, cartIndex);
    var cartList = this.data.cartList;
    var listData = this.data.listData;

    var sum = this.data.sumMonney.minus(cartList[cartIndex].price);
    cartList[cartIndex].sum = cartList[cartIndex].sum.minus(cartList[cartIndex].price);
    cartList[cartIndex].number == 1 ? cartList.splice(cartIndex, 1) : cartList[cartIndex].number--;
    if (listData[type].dishesList[index].count == 1 ) {
      listData[type].dishesList[index].count = undefined;
    } else {
      listData[type].dishesList[index].count--;
    }
    this.setData({
      listData: listData,
      cartList: cartList,
      sumMonney: sum,
      showCart: cartList.length == 0 ? false : true,
      cupNumber: this.data.cupNumber-1
    });
  },
  /**
   * 去结算
   * @return {[type]} [description]
   */
  goBalance: function () {
    if (this.data.sumMonney != 0) {
      wx.setStorageSync('cartList', this.data.cartList);
      wx.setStorageSync('sumMonney', this.data.sumMonney);
      wx.setStorageSync('cupNumber', this.data.cupNumber);
      wx.setStorageSync('channelId', this.data.channelId);
      wx.navigateTo({
        url: '../order/balance/balance'
      });
    }
  },
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
});
