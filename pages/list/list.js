// pages/list/list.js
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
   *
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
    sumMonney: 0,
    cupNumber:0,
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
    console.log(sysinfo)
    wx.showLoading({
      title: '努力加载中',
    })
    //将本来的后台换成了easy-mock 的接口，所有数据一次请求完 略大。。
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
        console.log(res)
        that.setData({
          listData: res.data,
          loading: true
        })
      }
    })
  },
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
    if (e.currentTarget.dataset.type >= 0 && e.currentTarget.dataset.index >= 0) {
      var type = e.currentTarget.dataset.type;
      var index = e.currentTarget.dataset.index;
      console.log('type + index');
      console.log(type, index);
      this.setData({
        showModalStatus: this.data.listData[type].dishesList[index].tastes ? !this.data.showModalStatus : false,
        currentType: type,
        currentIndex: index,
        sizeIndex: 0,
        sugarIndex: 0,
        temIndex: 0
      });
    } else {
      this.setData({
        showModalStatus: false
      });
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
  addToCart: function () {
    var a = this.data
    var addItem = {
      "name": a.listData[a.currentType].dishesList[a.currentIndex].dishesName,
      "price": a.listData[a.currentType].dishesList[a.currentIndex].price,
      "detail": a.size[a.sizeIndex] + "+" + a.sugar[a.sugarIndex] + "+" + a.tem[a.temIndex],
      "number": 1,
      "sum": a.listData[a.currentType].dishesList[a.currentIndex].price,
    }
    var sumMonney = a.sumMonney + a.listData[a.currentType].dishesList[a.currentIndex].price;
    var cartList = this.data.cartList;
    cartList.push(addItem);
    this.setData({
      cartList: cartList,
      showModalStatus: false,
      sumMonney: sumMonney,
      cupNumber: a.cupNumber + 1
    });
    console.log(this.data.cartList)
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
      sumMonney: 0
    });
  },
  /**
   * 增加数量
   * @param {[type]} e [description]
   */
  addNumber: function (e) {
    var index = e.currentTarget.dataset.index;
    console.log(index)
    var cartList = this.data.cartList;
    cartList[index].number++;
    var sum = this.data.sumMonney + cartList[index].price;
    cartList[index].sum += cartList[index].price;

    this.setData({
      cartList: cartList,
      sumMonney: sum,
      cupNumber: this.data.cupNumber+1
    });
  },
  /**
   * 减少数量
   * @param  {event} e 点击减少数量按钮
   * @return {[type]}   [description]
   */
  decNumber: function (e) {
    var index = e.currentTarget.dataset.index;
    console.log(index)
    var cartList = this.data.cartList;

    var sum = this.data.sumMonney - cartList[index].price;
    cartList[index].sum -= cartList[index].price;
    cartList[index].number == 1 ? cartList.splice(index, 1) : cartList[index].number--;
    this.setData({
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
      })
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
})
