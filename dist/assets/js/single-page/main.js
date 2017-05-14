"use strict";function getRootElementFontSize(){return parseFloat(getComputedStyle(document.documentElement).fontSize)}var paintingHeight=2048,paintingScale=.5,paintingDisplayHeight=paintingHeight*paintingScale,paintingThumbHeight=512,paintingThumbScale=paintingDisplayHeight/paintingThumbHeight,paintingMargin=160,paintingCascadeLength=944,paintingUIStaticWidthPadding=32,paintingUIWidthPadding=32,tourBoundsWidth=3,translateExtentBuffer=256,translateExtentTourBuffer=1024,minScale=.05,maxScale=2,durationShort=500,durationMed=750,durationLong=1e3,durationVLong=2e3,defaultEase=d3.easeCubicInOut,loaded=!1;d3.json("assets/json/paintings.json",function(t){function n(t){return new Promise(function(n,a){var e=new Image;e.onload=function(){n(e)},e.onerror=e.onabort=function(){a(t)},e.src=t})}function a(){for(var t=[],a=0;a<A.length;a++)t.push(n(A[a].painting.thumbUrl));return Promise.all(t)}function e(){var t=L.getBoundingClientRect();C=t.width,I=t.height}function i(){W.attr("transform",d3.event.transform),O.attr("transform","scale("+1/d3.event.transform.k+") translate(16, 0)"),Q.attr("stroke-width",tourBoundsWidth/d3.event.transform.k)}function r(t,n,a){function e(){return d3.zoomIdentity.scale(d).translate(l,g)}var i=d3.transition().duration(durationLong).ease(defaultEase),r=this.getBBox(),o=r.width,c=r.height,s=r.x+r.width/2,u=r.y+r.height/2,d=Math.max(minScale,Math.min(maxScale,1/Math.max(o/C,c/I))),l=C/2/d-s,g=I/2/d-u;D.transition(i).call(j.transform,e)}function o(t,n,a){function e(){return d3.zoomIdentity.scale(d).translate(p,h)}var i=d3.transition().duration(durationLong).ease(defaultEase),r=this.getBBox(),o=this.getElementsByClassName("base-container")[0].getBBox(),c=this.getElementsByClassName("painting-ui-container")[0].getBBox(),s=o.width,u=o.height,d=Math.max(minScale,Math.min(maxScale,1/(u/I))),l=r.x+s+c.width/d+2.5*paintingUIWidthPadding,g=r.y+u/2,p=C/d-l,h=I/2/d-g;D.transition(i).call(j.transform,e)}function c(t,n,a){function e(){return d3.zoomIdentity.scale(l).translate(g,p)}var i=d3.transition().duration(durationLong).ease(defaultEase),r=this.parentNode.parentNode.parentNode.getBBox(),o=this.getBBox(),c=o.width,s=o.height,u=o.x+o.width/2+r.x,d=o.y+o.height/2+r.y,l=Math.max(minScale,Math.min(maxScale,1/Math.max(c/C,s/I))),g=C/2/l-u,p=I/2/l-d;D.transition(i).call(j.transform,e)}function s(){if(loaded)if(void 0===q.activePainting)r.bind(D.select("#frame-splash").node())();else{var t=f().getBBox(),n=f().getElementsByClassName("base-container")[0].getBBox();void 0===q.activeTour?j.translateExtent([[t.x,t.y],[t.x+t.width,t.y+n.height]]):j.translateExtent([[t.x-translateExtentTourBuffer,t.y-translateExtentTourBuffer],[t.x+n.width+translateExtentTourBuffer,t.y+n.height+translateExtentTourBuffer]]);void 0===q.activeTour?translateExtentBuffer:translateExtentTourBuffer;void 0===q.activeTour?o.bind(f())():c.bind(d3.select(m()).select(".painting-step.step-"+q.activeTour.step).node())()}}function u(t){return void 0!==q.activePainting&&t.painting.key===q.activePainting.data.painting.key}function d(t){return void 0!==q.activePainting&&t.painting.key!==q.activePainting.data.painting.key}function l(t){return void 0!==q.activeTour&&t.painting.key===q.activePainting.data.painting.key}function g(t,n){return void 0!==q.activeTour&&q.activeTour.step===n}function p(t,n){return"translate("+n*paintingCascadeLength+","+n*(paintingDisplayHeight+paintingMargin)+")"}function h(t,n){return"translate("+-this.getElementsByClassName("base-container")[0].getBBox().width+","+n*(paintingDisplayHeight+paintingMargin)+")"}function v(t,n){return q.showSplash?p.bind(this)(t,n):h.bind(this)(t,n)}function f(){return void 0===q.activePainting.node&&(q.activePainting.node=d3.select("#"+q.activePainting.data.painting.key).node()),q.activePainting.node}function m(){return void 0===q.activeTour.node&&(q.activeTour.node=d3.select(f()).select(".painting-tour-container").node()),q.activeTour.node}function x(){var t=Url.parseQuery(),n=t.activePainting;if(n){var a=_.find(A,function(t){return t.painting.key===n});if(void 0!==a){q.showSplash=!1,q.activePainting={data:a};var e=t.activeTour;if(e){var i=_.find(q.activePainting.data.tours,function(t){return t.key===e});if(void 0!==i){q.activeTour={data:i,step:0};var r=parseInt(t.step);!isNaN(r)&&r>=0&&r<q.activeTour.data.steps.length&&(q.activeTour.step=r)}}}}}function T(){void 0!==q.activePainting?(Url.updateSearchParam("activePainting",q.activePainting.data.painting.key),void 0!==q.activeTour?(Url.updateSearchParam("activeTour",q.activeTour.data.key),Url.updateSearchParam("step",q.activeTour.step)):(Url.updateSearchParam("activeTour"),Url.updateSearchParam("step"))):(Url.updateSearchParam("activePainting"),Url.updateSearchParam("activeTour"),Url.updateSearchParam("step"))}function y(){loaded&&(P(),B())}function P(){var t=d3.transition().duration(durationVLong).ease(defaultEase);F=V.selectAll(".painting").data(A,function(t,n){return t.painting.key}),F.select(".painting-container").transition(t).attr("transform",v),b(F.select(".painting-tour-container"));var n=F.enter().append("g").attr("class","painting transform-container").attr("id",function(t){return t.painting.key}),a=n.append("g").attr("class","painting-container"),e=a.append("g").attr("class","base-container"),i=(e.append("image").attr("class","painting-thumb").attr("xlink:href",function(t){return t.painting.thumbUrl}).attr("width",paintingThumbHeight).attr("height",function(t){return t.painting.aspectRatio*paintingThumbHeight}).attr("transform",function(t){return"scale("+paintingThumbScale+") translate("+t.painting.aspectRatio*paintingThumbHeight+",0) rotate (90)"}),e.append("image").attr("class","painting-base").attr("xlink:href",function(t){return t.painting.fullUrl}).attr("width",paintingHeight).attr("height",function(t){return t.painting.aspectRatio*paintingHeight}).attr("transform",function(t){return"scale("+paintingScale+") translate("+t.painting.aspectRatio*paintingHeight+",0) rotate (90)"}),e.append("image").attr("class","painting-blur").attr("xlink:href",function(t){return t.painting.thumbUrl}).attr("width",paintingThumbHeight).attr("height",function(t){return t.painting.aspectRatio*paintingThumbHeight}).attr("transform",function(t){return"scale("+paintingThumbScale+") translate("+t.painting.aspectRatio*paintingThumbHeight+",0) rotate (90)"}),a.append("g").attr("class","painting-tour-container")),r=a.append("g").attr("class","painting-right-edge").attr("transform",function(t){return"translate("+t.painting.aspectRatio*paintingDisplayHeight+", 0)"}).append("g").attr("class","painting-ui-position-container");S(r),b(i),a.attr("transform",v);var o=F.exit();o.remove();var c=n.merge(F);c.classed("inactive",d).classed("active",u),q.showSplash||void 0!==q.activePainting?c.select(".painting-container").on("click",null):c.select(".painting-container").on("click",k)}function S(t){var n=t.append("g").attr("class","painting-ui-container");O=W.selectAll(".painting-ui-container");var a=n.append("text").attr("class","info").attr("y",2.5*N);a.append("tspan").attr("class","name header").attr("x",0).text(function(t){return t.painting.name}),a.append("tspan").attr("class","painter").attr("x",0).attr("dy",3*N).text(function(t){return"Attributed to "+t.painting.painter});var e=n.append("g").attr("class","painting-ui-contents-container"),i=6.5,r=i+.5,o=2;e.append("line").attr("class","divider").attr("x1",0).attr("y1",i*N).attr("x2",350).attr("y2",i*N);var c=e.append("g").attr("class","contents-entry visual-tour").on("click",E);c.append("text").text("Visual Analysis").attr("x",0).attr("y",(r+1*o)*N)}function b(t){t.classed("active",l);var n=t.selectAll("g").data(function(t){return l(t)?q.activeTour.data.steps:[]}),a=n.enter().append("g").attr("class",function(t,n){return"painting-step step-"+n});n.exit().remove();var e=a.merge(n),i=e.selectAll("rect").data(function(t,n){return g(t,n)?t.bounds:[]});i.enter().append("rect").attr("x",function(t){return t.x}).attr("y",function(t){return t.y}).attr("height",function(t){return t.height}).attr("width",function(t){return t.width}).attr("stroke-width",3).classed("outlined",function(t,n){return t.framed===!0});i.exit().remove(),Q=W.selectAll("rect.outlined")}function B(){var t=d3.select("#menu-painters").selectAll("li").data(A);t.enter().append("li").append("a").text(function(t){return t.painting.painter}).merge(t).classed("active",u).on("click",k.bind(void 0)),d3.select(".overlay").classed("active",function(){return void 0!==q.activeTour}),void 0!==q.activeTour&&(d3.select("#tour-header").html(function(){return decodeURI(q.activeTour.data.steps[q.activeTour.step].header)}),d3.select("#tour-text").html(function(){return decodeURI(q.activeTour.data.steps[q.activeTour.step].html)})),d3.select(".intro-page").classed("active",function(){return q.showSplash})}function w(){q.activePainting=void 0,q.activeTour=void 0,q.showSplash=!1,y(),s(),T()}function k(t,n,a){q.activePainting={data:t,i:n,node:void 0!==this?this.parentNode:void 0},q.activeTour=void 0,q.showSplash=!1,y(),s(),T()}function E(){void 0!==q.activePainting&&H(q.activePainting.data.tours.visualTour,0)}function H(t,n){q.activeTour={data:t,step:n},y(),s(),T()}function U(){void 0!==q.activeTour&&q.activeTour.step<q.activeTour.data.steps.length-1&&(q.activeTour.step++,y(),s(),T())}function R(){void 0!==q.activeTour&&q.activeTour.step>0&&(q.activeTour.step--,y(),s(),T())}function M(t){t=t||window.event,37===t.keyCode?(R(),t.preventDefault()):39===t.keyCode&&(U(),t.preventDefault())}var C,I,A=t.mainPaintings,N=getRootElementFontSize(),z=d3.select(".svg-container"),L=z.node(),D=d3.select(".svg-fullscreen"),W=D.select(".root");d3.select(window).on("resize",e);var j=d3.zoom().scaleExtent([minScale,maxScale]).on("zoom",i).filter(function(){return void 0!==q.activePainting&&!event.button});D.call(j);var F,V=W.select(".paintings"),O=W.selectAll(".painting-ui-container"),Q=W.selectAll("rect.outlined"),q={activePainting:void 0,activeTour:void 0,showSplash:!0};document.addEventListener("keydown",M),d3.select("#button-begin").on("click",w),d3.select("#menu-home").on("click",w),d3.select("#button-next").on("click",function(){U()}),d3.select("#button-prev").on("click",function(){R()}),x(),a().then(function(t){for(var n=0;n<t.length;n++)A[n].painting.aspectRatio=t[n].height/t[n].width;loaded=!0,y(),s()}),e()});