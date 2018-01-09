
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
};

// 下载指定地址的图片
const downloadImg = (url, callBack) => {
  console.log('downloadImg...');
  wx.downloadFile({
    url: url,
    type: 'image',
    success: function (res) {
      callBack(res.tempFilePath);
    },
    fail: function (error) {
      console.log(error)
    }
  });
};

module.exports = {
  formatTime: formatTime,
  downloadImg: downloadImg
}
