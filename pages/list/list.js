// pages/list/list.js

const BigNumber = require('../../utils/bignumber.js');
const util = require('../../utils/util.js');

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
    listData: [],  // 所有菜品列表
    activeIndex: 0,
    toView: 'a0',
    scrollTop: 100,
    screenWidth: 667,
    showModalStatus: false,  // 是否显示模态窗
    currentType: 0,  // 当前菜品类别
    currentIndex: 0,  // 当前菜品索引
    sizeIndex: 0,
    sugarIndex: 0,
    temIndex: 0,
    sugar: ['常规糖', '无糖', '微糖', '半糖', '多糖'],
    tem: ['常规冰', '多冰', '少冰', '去冰', '温', '热'],
    size: ['常规', '珍珠', '西米露'],
    cartList: [],
    goodsEntites: {}, // 对应 goodsEntities 字典
    sumMonney: 0,
    cupNumber: 0,
    showCart: false,  // 是否显示购物车
    loading: false  // 加载状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var scene = decodeURIComponent(options.scene);
    console.log('二维码所属：' + scene);

    var that = this;
    var sysinfo = wx.getSystemInfoSync().windowHeight;
    console.log(sysinfo);
    wx.showLoading({
      title: '努力加载中',
    });
    wx.request({
      url: 'http://localhost:3000/dishes',
      method: 'GET',
      data: {
        channelId: scene
      },
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data)
        that.setData({
          listData: res.data,
          loading: true
        });
        let dishesList = res.data[0].dishesList;
        // 下载第一类菜品的图片
        for (let i = 0; i < dishesList.length; i++ ) {
          console.log(dishesList[i].imgUrl);
          util.downloadImg(dishesList[i].imgUrl, function(result) {
            console.log(result);
          });
        }
      }
    });
  },
  /**
   * 选择菜品类别
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  selectMenu: function (e) {
    var index = e.currentTarget.dataset.index
    console.log(index)
    this.setData({
      activeIndex: index,
      toView: 'a' + index,
      // scrollTop: 1186
    })
    console.log(this.data.toView);
  },
  scroll: function (e) {
    console.log(e)
    var dis = e.detail.scrollTop
    if (dis > 0 && dis < 1189) {
      this.setData({
        activeIndex: 0,
      })
    }
    if (dis > 1189 && dis < 1867) {
      this.setData({
        activeIndex: 1,
      })
    }
    if (dis > 1867 && dis < 2180) {
      this.setData({
        activeIndex: 2,
      })
    }
    if (dis > 2180 && dis < 2785) {
      this.setData({
        activeIndex: 3,
      })
    }
    if (dis > 2785 && dis < 2879) {
      this.setData({
        activeIndex: 4,
      })
    }
    if (dis > 2879 && dis < 4287) {
      this.setData({
        activeIndex: 5,
      })
    }
    if (dis > 4287 && dis < 4454) {
      this.setData({
        activeIndex: 6,
      })
    }
    if (dis > 4454 && dis < 4986) {
      this.setData({
        activeIndex: 7,
      })
    }
    if (dis > 4986) {
      this.setData({
        activeIndex: 8,
      })
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
        this.setData({ showModalStatus: true });
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
    console.log(currentDish);
    if (currentDish.tastes) {
      // 如果菜品存在多种口味
    } else {
      let newListData = this.data.listData;
      if (currentDish.count > 1) { // 已经点过一份该菜品
        newListData[type].dishesList[index].count--;
        this.setData({ listData: newListData });
      } else {
        newListData[type].dishesList[index].count = undefined;
        this.setData({ listData: newListData })
      }
    }
  },
  /**
   * 选择指定商品
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  chooseSE: function (e) {
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    if (type == 0) {
      this.setData({
        sizeIndex: index
      });
    }
    if (type == 1) {
      this.setData({
        sugarIndex: index
      });
    }
    if (type == 2) {
      this.setData({
        temIndex: index
      });
    }
  },
  /*
   * 增加商品到购物车 =》 cartList
   */
  addToCart: function (type, index) {
    let vm = this.data;
    // 当前选中的菜品
    let currentDish = vm.listData[type].dishesList[index];
    console.log(currentDish);
    // 菜品重复标志
    let repeatFlag = -1;
    console.log('购物车', vm.cartList);
    for (let i = vm.cartList.length - 1; i >= 0; i--) {
      if (vm.cartList[i]['name'] === currentDish['dishesName']) {
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
        "name": currentDish.dishesName,
        "price": currentDish.price,
        "detail": vm.size[vm.sizeIndex] + "+" + vm.sugar[vm.sugarIndex] + "+" + vm.tem[vm.temIndex],
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
    // cartList[cartIndex].number--;
    // listData[type].dishesList[index].count--;

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
