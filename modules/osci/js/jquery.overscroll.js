/*!
 * Overscroll v1.4.2
 *  A jQuery Plugin that emulates the iPhone scrolling experience in a browser.
 *  http://azoffdesign.com/overscroll
 *
 * Intended for use with the latest jQuery
 *  http://code.jquery.com/jquery-latest.js
 *
 * Copyright 2011, Jonathan Azoff
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *  http://jquery.org/license
 *
 * For API documentation, see the README file
 *  https://github.com/azoff/Overscroll/blob/master/README.md
 *
 * Date: Thursday, February 17th 2011
 */
(function(l,n,f,c){c=f.fn.overscroll=function(a){return this.each(function(){c.init(f(this),a)})};f.extend(c,{events:{wheel:"mousewheel DOMMouseScroll",start:"select mousedown touchstart",drag:"mousemove touchmove",end:"mouseup mouseleave touchend",ignored:"dragstart drag"},div:"<div/>",noop:function(){return false},constants:{driftFrequency:40,driftSequences:22,driftDecay:1.15,timeout:400,captureThreshold:3,wheelDelta:20,scrollDelta:15,thumbThickness:8,thumbOpacity:0.7,boundingBox:1E6},checkIosDevice:function(){if(c.isIOS=== undefined){var a=["iPhone","iPad","iPod"],b;for(b=0;b<a.length;b++)if(navigator.platform.indexOf(a[b])>=0)return c.isIOS=true;return c.isIOS=false}return c.isIOS},init:function(a,b,d){d={sizing:c.getSizing(a)};b=f.extend({showThumbs:true,wheelDirection:"vertical",cursor:"move",wheelDelta:c.constants.wheelDelta,scrollDelta:c.constants.scrollDelta,direction:"multi",cancelOn:"",onDriftEnd:f.noop},b||{});b.scrollDelta=n.abs(b.scrollDelta);b.wheelDelta=n.abs(b.wheelDelta);a.css({position:"relative",overflow:"hidden", cursor:b.cursor}).bind(c.events.wheel,d,c.wheel).bind(c.events.start,d,c.start).bind(c.events.end,d,c.stop).bind(c.events.ignored,c.noop);if(b.showThumbs){d.thumbs={};if(d.sizing.container.scrollWidth>0&&b.direction!=="vertical"){d.thumbs.horizontal=f(c.div).css(c.getThumbCss(d.sizing.thumbs.horizontal)).fadeTo(0,0);a.prepend(d.thumbs.horizontal)}if(d.sizing.container.scrollHeight>0&&b.direction!=="horizontal"){d.thumbs.vertical=f(c.div).css(c.getThumbCss(d.sizing.thumbs.vertical)).fadeTo(0,0);a.prepend(d.thumbs.vertical)}}d.target= a;d.options=b},toggleThumbs:function(a,b){if(a.thumbs)if(b){a.thumbs.vertical&&a.thumbs.vertical.stop(true,true).fadeTo("fast",c.constants.thumbOpacity);a.thumbs.horizontal&&a.thumbs.horizontal.stop(true,true).fadeTo("fast",c.constants.thumbOpacity)}else{a.thumbs.vertical&&a.thumbs.vertical.fadeTo("fast",0);a.thumbs.horizontal&&a.thumbs.horizontal.fadeTo("fast",0)}},setPosition:function(a,b,d){b.x=a.pageX;b.y=a.pageY;b.index=d;return b},wheel:function(a,b){c.clearInterval();if(a.wheelDelta)b=a.wheelDelta/ (l.opera?-120:120);if(a.detail)b=-a.detail/3;if(!a.data.wheelCapture){a.data.wheelCapture={timeout:null};c.toggleThumbs(a.data,true);a.data.target.stop(true,true).data("dragging",true)}b*=a.data.options.wheelDelta;if(a.data.options.wheelDirection==="horizontal")this.scrollLeft-=b;else this.scrollTop-=b;c.moveThumbs(a,this.scrollLeft,this.scrollTop);a.data.wheelCapture.timeout&&clearTimeout(a.data.wheelCapture.timeout);a.data.wheelCapture.timeout=setTimeout(function(){a.data.wheelCapture=undefined; c.toggleThumbs(a.data,false);a.data.target.data("dragging",false);a.data.options.onDriftEnd.call(a.data.target,a.data)},c.constants.timeout);return false},moveThumbs:function(a,b,d,g,e,h,i){if(a.data.options.showThumbs){g=a.data.thumbs;e=a.data.sizing;if(g.horizontal){h=b*(1+e.container.width/e.container.scrollWidth);i=d+e.thumbs.horizontal.top;g.horizontal.css("margin",i+"px 0 0 "+h+"px")}if(g.vertical){h=b+e.thumbs.vertical.left;i=d*(1+e.container.height/e.container.scrollHeight);g.vertical.css("margin", i+"px 0 0 "+h+"px")}}},start:function(a){c.clearInterval();if(!f(a.target).is(a.data.options.cancelOn)){c.normalizeEvent(a);a.data.target.bind(c.events.drag,a.data,c.drag).stop(true,true).data("dragging",false);a.data.position=c.setPosition(a,{});a.data.capture=c.setPosition(a,{},2);return false}},drag:function(a){c.normalizeEvent(a);a.data.target.data("dragging")||c.toggleThumbs(a.data,true);if(a.data.options.direction!=="vertical")this.scrollLeft-=a.pageX-a.data.position.x;if(a.data.options.direction!== "horizontal")this.scrollTop-=a.pageY-a.data.position.y;c.moveThumbs(a,this.scrollLeft,this.scrollTop);c.setPosition(a,a.data.position);if(--a.data.capture.index<=0){a.data.target.data("dragging",true);c.setPosition(a,a.data.capture,c.constants.captureThreshold)}return true},normalizeEvent:function(a){if(c.checkIosDevice()){var b=a.originalEvent.changedTouches[0];a.pageX=b.pageX;a.pageY=b.pageY}},stop:function(a){if(a.data.position){a.data.target.unbind(c.events.drag,c.drag);a.data.target.data("dragging")? c.drift(this,a,function(b){b.target.data("dragging",false);b.options.onDriftEnd.call(b.target,b);c.toggleThumbs(b,false)}):c.toggleThumbs(a.data,false);a.data.capture=a.data.position=undefined}return!a.data.target.data("dragging")},clearInterval:function(){c.driftInterval&&l.clearInterval(c.driftInterval)},setInterval:function(a){c.driftInterval=a},drift:function(a,b,d){c.normalizeEvent(b);var g=b.data.options.scrollDelta*(b.pageX-b.data.capture.x),e=b.data.options.scrollDelta*(b.pageY-b.data.capture.y), h=a.scrollLeft,i=a.scrollTop,j=g/c.constants.driftSequences,k=e/c.constants.driftSequences,o=c.constants.driftDecay;if(b.data.options.direction!=="vertical")h-=g;if(b.data.options.direction!=="horizontal")i-=e;c.setInterval(l.setInterval(function(){var m=true;if(k>1&&a.scrollTop>i||k<-1&&a.scrollTop<i){m=false;a.scrollTop-=k;k/=o}if(j>1&&a.scrollLeft>h||j<-1&&a.scrollLeft<h){m=false;a.scrollLeft-=j;j/=o}c.moveThumbs(b,a.scrollLeft,a.scrollTop);if(m){c.clearInterval();d.call(null,b.data)}},c.constants.driftFrequency))}, getSizing:function(a,b){b={};b.container={width:a.width(),height:a.height()};a.scrollLeft(c.constants.boundingBox).scrollTop(c.constants.boundingBox);b.container.scrollWidth=a.scrollLeft();b.container.scrollHeight=a.scrollTop();a.scrollTop(0).scrollLeft(0);b.thumbs={horizontal:{width:b.container.width*b.container.width/b.container.scrollWidth,height:c.constants.thumbThickness,corner:c.constants.thumbThickness/2,left:0,top:b.container.height-c.constants.thumbThickness},vertical:{width:c.constants.thumbThickness, height:b.container.height*b.container.height/b.container.scrollHeight,corner:c.constants.thumbThickness/2,left:b.container.width-c.constants.thumbThickness,top:0}};b.container.width-=b.thumbs.horizontal.width;b.container.height-=b.thumbs.vertical.height;return b},getThumbCss:function(a){return{position:"absolute","background-color":"black",width:a.width+"px",height:a.height+"px",margin:a.top+"px 0 0 "+a.left+"px","-moz-border-radius":a.corner+"px","-webkit-border-radius":a.corner+"px","border-radius":a.corner+ "px"}}})})(window,Math,jQuery);