BCCF
====

Browser CSS Compatibility Fix

从css定义,解析出兼容性JSON结构,生成新的兼容版本和配套的js文件,目前只考虑IE兼容性问题.

javascript 版本,需要jQuery支持

jquery.js 基于1.7.2 版本的修改,增加了pseudoNode属性的判断

html5.js 引入了 pseudo 自定义元素,为了解决css伪元素

bccf.js BCCF 执行期部分,解析期也需要加载

bccp.js BCCF 解析部分,执行期不是必须的

index.html 一个简单的转换页面,请在FF或者Chrome下执行

ie.html 测试用页面模版,复制于 [bootswatch](http://bootswatch.com/simplex/) bootstrap.js文件需要您自己引入,

版权协议 (license)
===========

[New BSD License](http://www.opensource.org/licenses/bsd-license.php)