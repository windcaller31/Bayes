/*
 先列公式 如果不算分母直接这样搞
 p(y=ck|x) = p(x1|y=ck)*p(x2|y=ck)*p(x3|y=ck)...*p(xM|y=ck)*p(y=ck)
 eg:
 若求: P(a=3,b=4|y=0)  的概率
 只需: p(y=0),P(a=3|y=0),p(b=4|y=0) 这仨再乘在一起

 假设样本值为对象
   [{
     yangben:[0,1,2,3],
     con:0
   },{
     yangben:[0,1,3,2],
     con:1
   }
  ...]
*/

var _ = require('lodash');

//传说中的过滤器
var filter = function (){
  var _this = this;

  //构建贝叶斯所需数据结构
  this.bayes = function(yangbens){
    //样本值总数
    var total = yangbens.length;

    //先算预测值有哪些并有多少个,
    var total_con = {};
    _.each(yangbens,function(yb){
      if(!total_con[yb.con]){
        total_con[yb.con] = 1;
      }else{
        total_con[yb.con] += 1;
      }
    });

    //每一个预测值的概率 p(y=ck)
    for(key in total_con){
      total_con[key] = total_con[key]/total;
    }

    //先求样本中特征值的数量
    //假设特征值的数量的都是相同的
    var sub_yb = yangbens[0].yangben.length;
    //先计算每种特征值所有的离散值有哪些，每种特征值命名为 0，1，2，3.。。。
    //并记录他们出现的次数对应预测值
    var total_yangben = {};
    for(var i=0;i<sub_yb;i++){
      var sub_total_yangben = {};
      _.each(yangbens,function(yb){
        var yb_con = yb.con;
        if(!sub_total_yangben[yb.yangben[i]]){
          sub_total_yangben[yb.yangben[i]] = {};
        }
        if(!sub_total_yangben[yb.yangben[i]][yb_con]){
          sub_total_yangben[yb.yangben[i]][yb_con] = 1;
        }else{
          sub_total_yangben[yb.yangben[i]][yb_con] += 1;
        }
      });
      total_yangben[i] = sub_total_yangben;
    }

    //计算每一个p(xn|y=ck)
    for(key in total_yangben){
      var tyk = total_yangben[key]
      for(key in tyk){
        var tykk = tyk[key];
        var total = 0;
        for(key in tykk){
          total += tykk[key];
        }
        for(key in tykk){
          tykk[key] = tykk[key]/total;
        }
      }
    }
    return {
      "final_yangben":total_yangben,
      "final_con":total_con
    };
  }
  /*
  bayes_module  根据贝叶斯公式得出的数据结构得出如下
  {
    "final_yangben": {   //这个就是那一堆 P(..)什么的玩意 :)
      "0": {             //这个0表示的是我给第一个样本属性起的名字，这里叫 0 和 1
        "0": {           //  样本值零的情况
          "0": 0.6,      // p(a=0|y=0)
          "1": 0.4       // p(a=0|y=1)
        },
        "1": {           //样本值一的情况
          "0": 0.6,      //正常 p(a=1|y=0)
          "1": 0.4       //垃圾 p(a=1|y=1)
        }
      },
      "1": {            //第二个属性
        "0": {          //  样本值0
          "0": 0.75,    // p(b=0|y=0)
          "1": 0.25     // p(b=0|y=1)
        },
        "1": {          //  样本值1
          "0": 0.5,     // p(b=1|y=0)
          "1": 0.5      // p(b=1|y=1)
        }
      }
    },
    "final_con": {
      "0": 0.6,         //正常 p(y=0)
      "1": 0.4          //垃圾 p(y=1)
    }
  }
  */

  //计算一个 没有使用中奖词汇a=1, 有金额的概率b=0 ,的邮件是不是垃圾账号
  //计算两种后验概率后取最大值
  // p(y=0)p(a=1|y=0)p(b=0|y=0)
  // p(y=1)p(a=1|y=0)p(b=0|y=0)
  this.predict = function(yangbens,predict_optiong){
    var bayes_struct = _this.bayes(yangbens);
    var result_option = {};
    var predict_yb = predict_optiong.yangben;
    for(key in bayes_struct.final_con){
      var py = bayes_struct.final_con[key];
      console.log(py);
      for(var i = 0;i<=predict_yb.length-1;i++){
        py = py*bayes_struct["final_yangben"][i.toString()][predict_yb[i].toString()][key];
      }
      result_option[key] = py;
    }
    console.log("后验概率结果集:",JSON.stringify(result_option));
    //取最大
    var max = 0;
    var expect = "";
    for(key in result_option){
      if(max < result_option[key]){
        max = result_option[key];
        expect = key;
      }
    }
    //返回期望的值yk
    return expect;
  };
}


//下面进行一波预测
// 在网上找了一个最简单的例子
// 分析样本：分析邮件是不是垃圾邮件，现在认为包含中奖的就是来及邮件
// yangben : 包含中奖 0  ， 不包含中奖 1
//           包含金额 0  ， 不包含金额 1
// con : 正常邮件 0 ， 垃圾邮件 1
// 样本值离散化如下
var bayes_yangben = [{
      yangben:[1,0],
      con:0
  },{
      yangben:[1,1],
      con:1
  },{
      yangben:[0,1],
      con:1
  },{
      yangben:[0,0],
      con:0
  },{
      yangben:[1,1],
      con:1
  },{
      yangben:[0,0],
      con:1
  },{
      yangben:[0,1],
      con:0
  },{
      yangben:[0,1],
      con:0
  },{
      yangben:[1,1],
      con:1
  },{
      yangben:[1,0],
      con:0
  }];

//计算一个 没有使用中奖词汇a=1, 有金额的概率b=0 ,的邮件是不是垃圾账号
//计算两种后验概率
// p(y=0)p(a=1|y=0)p(b=0|y=0)
// p(y=1)p(a=1|y=0)p(b=0|y=0)
var f = new filter();
var predict_optiong = {
      "yangben":[0,0]
};
console.log("预测结果为:",f.predict(bayes_yangben,predict_optiong))
