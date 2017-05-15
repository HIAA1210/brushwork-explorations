"use strict";function getRootElementFontSize(){return parseFloat(getComputedStyle(document.documentElement).fontSize)}var paintingHeight=2048,paintingScale=.5,paintingDisplayHeight=paintingHeight*paintingScale,paintingThumbHeight=512,paintingThumbScale=paintingDisplayHeight/paintingThumbHeight,paintingBlurHeight=32,paintingBlurScale=paintingDisplayHeight/paintingBlurHeight,paintingMargin=160,paintingCascadeLength=944,paintingUIStaticWidthPadding=32,paintingUIWidthPadding=32,tourBoundsWidth=3,translateExtentBuffer=256,translateExtentTourBuffer=1024,minScale=.05,maxScale=2,durationShort=500,durationMed=750,durationLong=1e3,durationVLong=2e3,defaultEase=d3.easeCubicInOut,loaded=!1;d3.json("assets/json/paintings.json",function(t){function n(t){return new Promise(function(n,a){var i=new Image;i.onload=function(){n(i)},i.onerror=i.onabort=function(){a(t)},i.src=t})}function a(){for(var t=[],a=0;a<N.length;a++)t.push(n(N[a].painting.thumbUrl));return Promise.all(t)}function i(){var t=D.getBoundingClientRect();A=t.width,M=t.height}function e(){W.attr("transform",d3.event.transform),O.attr("transform","scale("+1/d3.event.transform.k+") translate(16, 0)"),Q.attr("stroke-width",tourBoundsWidth/d3.event.transform.k)}function r(t,n,a){function i(){return d3.zoomIdentity.scale(d).translate(l,p)}var e=d3.transition().duration(durationLong).ease(defaultEase),r=this.getBBox(),o=r.width,c=r.height,s=r.x+r.width/2,u=r.y+r.height/2,d=Math.max(minScale,Math.min(maxScale,1/Math.max(o/A,c/M))),l=A/2/d-s,p=M/2/d-u;z.transition(e).call(j.transform,i)}function o(t,n,a){function i(){return d3.zoomIdentity.scale(d).translate(g,v)}var e=d3.transition().duration(durationLong).ease(defaultEase),r=this.getBBox(),o=this.getElementsByClassName("base-container")[0].getBBox(),c=this.getElementsByClassName("painting-ui-container")[0].getBBox(),s=o.width,u=o.height,d=Math.max(minScale,Math.min(maxScale,1/(u/M))),l=r.x+s+c.width/d+2.5*paintingUIWidthPadding,p=r.y+u/2,g=A/d-l,v=M/2/d-p;z.transition(e).call(j.transform,i)}function c(t,n,a){function i(){return d3.zoomIdentity.scale(l).translate(p,g)}var e=d3.transition().duration(durationLong).ease(defaultEase),r=this.parentNode.parentNode.parentNode.getBBox(),o=this.getBBox(),c=o.width,s=o.height,u=o.x+o.width/2+r.x,d=o.y+o.height/2+r.y,l=Math.max(minScale,Math.min(maxScale,1/Math.max(c/A,s/M))),p=A/2/l-u,g=M/2/l-d;z.transition(e).call(j.transform,i)}function s(){if(loaded)if(void 0===q.activePainting)r.bind(z.select("#frame-splash").node())();else{var t=f().getBBox(),n=f().getElementsByClassName("base-container")[0].getBBox();void 0===q.activeTour?j.translateExtent([[t.x,t.y],[t.x+t.width,t.y+n.height]]):j.translateExtent([[t.x-translateExtentTourBuffer,t.y-translateExtentTourBuffer],[t.x+n.width+translateExtentTourBuffer,t.y+n.height+translateExtentTourBuffer]]);void 0===q.activeTour?translateExtentBuffer:translateExtentTourBuffer;void 0===q.activeTour?o.bind(f())():c.bind(d3.select(m()).select(".painting-step.step-"+q.activeTour.step).node())()}}function u(t){return void 0!==q.activePainting&&t.painting.key===q.activePainting.data.painting.key}function d(t){return void 0!==q.activePainting&&t.painting.key!==q.activePainting.data.painting.key}function l(t){return void 0!==q.activeTour&&t.painting.key===q.activePainting.data.painting.key}function p(t,n){return void 0!==q.activeTour&&q.activeTour.step===n}function g(t,n){return"translate("+n*paintingCascadeLength+","+n*(paintingDisplayHeight+paintingMargin)+")"}function v(t,n){return"translate("+-this.getElementsByClassName("base-container")[0].getBBox().width+","+n*(paintingDisplayHeight+paintingMargin)+")"}function h(t,n){return q.showSplash?g.bind(this)(t,n):v.bind(this)(t,n)}function f(){if(console.log(q.activePainting.data),console.log(q.activePainting.node),void 0===q.activePainting.node&&(q.activePainting.node=W.select("#"+q.activePainting.data.painting.key).node(),null===q.activePainting.node))throw void 0===q.activePainting.node,"getActivePaintingNode(): Could not find active painting node";return q.activePainting.node}function m(){if(void 0===q.activeTour.node&&(q.activeTour.node=d3.select(f()).select(".painting-tour-container").node(),null===q.activeTour.node))throw void 0===q.activeTour.node,"getActiveTourNode: Could not find active tour node";return q.activeTour.node}function x(){var t=Url.parseQuery(),n=t.activePainting;if(n){var a=_.find(N,function(t){return t.painting.key===n});if(void 0!==a){q.showSplash=!1,q.activePainting={data:a};var i=t.activeTour;if(i){var e=_.find(q.activePainting.data.tours,function(t){return t.key===i});if(void 0!==e){q.activeTour={data:e,step:0};var r=parseInt(t.step,10);!isNaN(r)&&r>=0&&r<q.activeTour.data.steps.length&&(q.activeTour.step=r)}}}}}function T(){void 0!==q.activePainting?(Url.updateSearchParam("activePainting",q.activePainting.data.painting.key),void 0!==q.activeTour?(Url.updateSearchParam("activeTour",q.activeTour.data.key),Url.updateSearchParam("step",q.activeTour.step)):(Url.updateSearchParam("activeTour"),Url.updateSearchParam("step"))):(Url.updateSearchParam("activePainting"),Url.updateSearchParam("activeTour"),Url.updateSearchParam("step"))}function y(){loaded&&(b(),B())}function b(){var t=d3.transition().duration(durationVLong).ease(defaultEase);F=V.selectAll(".painting").data(N,function(t,n){return t.painting.key}),F.select(".painting-container").transition(t).attr("transform",h),k(F.select(".painting-tour-container"));var n=F.enter().append("g").attr("class","painting transform-container").attr("id",function(t){return t.painting.key}),a=n.append("g").attr("class","painting-container"),i=a.append("g").attr("class","base-container"),e=(i.append("rect").attr("class","painting-baserect").attr("id",function(t){return"baserect-"+t.painting.key}).attr("height",paintingDisplayHeight).attr("width",function(t){return t.painting.aspectRatio*paintingDisplayHeight}),i.append("image").attr("class","painting-thumb").attr("xlink:href",function(t){return t.painting.thumbUrl}).attr("width",paintingThumbHeight).attr("height",function(t){return t.painting.aspectRatio*paintingThumbHeight}).attr("transform",function(t){return"scale("+paintingThumbScale+") translate("+t.painting.aspectRatio*paintingThumbHeight+",0) rotate (90)"}),i.append("image").attr("class","painting-base").attr("xlink:href",function(t){return t.painting.fullUrl}).attr("width",paintingHeight).attr("height",function(t){return t.painting.aspectRatio*paintingHeight}).attr("transform",function(t){return"scale("+paintingScale+") translate("+t.painting.aspectRatio*paintingHeight+",0) rotate (90)"}),i.append("g").attr("class","painting-blur").append("image").attr("class","painting-blur-base").attr("xlink:href",function(t){return t.painting.thumbUrl}).attr("width",paintingBlurHeight).attr("height",function(t){return t.painting.aspectRatio*paintingBlurHeight}).attr("transform",function(t){return"scale("+paintingBlurScale+") translate("+t.painting.aspectRatio*paintingBlurHeight+",0) rotate (90)"}),a.append("g").attr("class","painting-tour-container")),r=a.append("g").attr("class","painting-right-edge").attr("transform",function(t){return"translate("+t.painting.aspectRatio*paintingDisplayHeight+", 0)"}).append("g").attr("class","painting-ui-position-container");P(r),k(e),a.attr("transform",h);var o=F.exit();o.remove();var c=n.merge(F);c.classed("inactive",d).classed("active",u),q.showSplash?c.select(".painting-container").on("click",null):void 0===q.activePainting?c.select(".painting-container").on("click",w):(c.select(".painting-container").on("click",null),void 0!==q.activeTour&&c.select(".painting-blur").classed("active",function(t){return u(t)&&l(t)}).attr("mask","url(#cutout-mask-"+q.activeTour.step+")"))}function P(t){var n=t.append("g").attr("class","painting-ui-container");O=W.selectAll(".painting-ui-container");var a=n.append("text").attr("class","info").attr("y",2.5*I);a.append("tspan").attr("class","name header").attr("x",0).text(function(t){return t.painting.name}),a.append("tspan").attr("class","painter").attr("x",0).attr("dy",3*I).text(function(t){return"Attributed to "+t.painting.painter});var i=n.append("g").attr("class","painting-ui-contents-container"),e=6.5,r=e+.5,o=2;i.append("line").attr("class","divider").attr("x1",0).attr("y1",e*I).attr("x2",350).attr("y2",e*I);var c=i.append("g").attr("class","contents-entry visual-tour").on("click",E);c.append("text").text("Visual Analysis").attr("x",0).attr("y",(r+1*o)*I)}function k(t){t.classed("active",l);var n=t.selectAll(".painting-step").data(function(t){return l(t)?q.activeTour.data.steps:[]});if(n.exit().remove(),void 0!==q.activePainting&&void 0!==q.activeTour){var a=n.enter().append("g").attr("class",function(t,n){return"painting-step step-"+n}),i=a.append("defs").attr("class","tour-def"),e=i.append("mask").attr("id",function(t,n){return"cutout-mask-"+n}),r=(i.append("g").attr("class","bounds-container").attr("id",function(t,n){return"bounds-container-"+n}),a.append("use").attr("xlink:href",function(t,n){return"#bounds-container-"+n}).attr("class","bounds-display-container"),a.merge(n)),o=r.select(".bounds-container").selectAll("rect").data(function(t,n){return p(t,n)?t.bounds:[]}),c=o.enter().append("rect").attr("id",function(t,n){return"bounds-"+n}).attr("x",function(t){return t.x}).attr("y",function(t){return t.y}).attr("height",function(t){return t.height}).attr("width",function(t){return t.width}).attr("stroke-width",3).attr("class","painting-bounds").classed("outlined",function(t,n){return t.framed===!0});c.transition().duration(1).on("end",function(){this.classList.add("active")}),o.exit().transition().duration(durationShort).on("start",function(){this.classList.remove("active")}).remove(),e.append("use").attr("xlink:href","#baserect-"+q.activePainting.data.painting.key).attr("fill","white"),e.append("use").attr("xlink:href",function(t,n){return"#bounds-container-"+n}).attr("fill","black")}Q=W.selectAll("rect.outlined")}function B(){var t=d3.select("#menu-painters").selectAll("li").data(N);t.enter().append("li").append("a").text(function(t){return t.painting.painter}).merge(t).classed("active",u).on("click",w.bind(void 0)),d3.select(".overlay").classed("active",function(){return void 0!==q.activeTour}),void 0!==q.activeTour&&(d3.select("#tour-header").html(function(){return decodeURI(q.activeTour.data.steps[q.activeTour.step].header)}),d3.select("#tour-text").html(function(){return decodeURI(q.activeTour.data.steps[q.activeTour.step].html)})),d3.select(".intro-page").classed("active",function(){return q.showSplash})}function S(){q.activePainting=void 0,q.activeTour=void 0,q.showSplash=!1,y(),s(),T()}function w(t,n,a){q.activePainting={data:t,i:n,node:void 0!==this?this.parentNode:void 0},q.activeTour=void 0,q.showSplash=!1,y(),s(),T()}function E(){void 0!==q.activePainting&&H(q.activePainting.data.tours.visualTour,0)}function H(t,n){q.activeTour={data:t,step:n},y(),s(),T()}function U(){void 0!==q.activeTour&&q.activeTour.step<q.activeTour.data.steps.length-1&&(q.activeTour.step++,y(),s(),T())}function R(){void 0!==q.activeTour&&q.activeTour.step>0&&(q.activeTour.step--,y(),s(),T())}function C(t){t=t||window.event,37===t.keyCode?(R(),t.preventDefault()):39===t.keyCode&&(U(),t.preventDefault())}var A,M,N=t.mainPaintings,I=getRootElementFontSize(),L=d3.select(".svg-container"),D=L.node(),z=d3.select(".svg-fullscreen"),W=z.select(".root");d3.select(window).on("resize",i);var j=d3.zoom().scaleExtent([minScale,maxScale]).on("zoom",e).filter(function(){return void 0!==q.activePainting&&!event.button});z.call(j);var F,V=W.select(".paintings"),O=W.selectAll(".painting-ui-container"),Q=W.selectAll("rect.outlined"),q={activePainting:void 0,activeTour:void 0,showSplash:!0};document.addEventListener("keydown",C),d3.select("#button-begin").on("click",S),d3.select("#menu-home").on("click",S),d3.select("#button-next").on("click",function(){U()}),d3.select("#button-prev").on("click",function(){R()}),x(),a().then(function(t){for(var n=0;n<t.length;n++)N[n].painting.aspectRatio=t[n].height/t[n].width;loaded=!0,y(),s()}),i()});