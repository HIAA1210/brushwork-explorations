/*global Image*/
/*global _*/
/*global d3*/
/*global Url*/


//---- Configuration + Constants + Data
const paintingHeight = 2048;
const paintingScale = 0.5;
const paintingDisplayHeight = paintingHeight * paintingScale;

const paintingThumbHeight = 512;
const paintingThumbScale = paintingDisplayHeight / paintingThumbHeight;

const paintingBlurHeight = 32;
const paintingBlurScale = paintingDisplayHeight / paintingBlurHeight;

const paintingMargin = 40 * 4;
const paintingCascadeLength = 236 * 4;

const paintingUIStaticWidthPadding = 32;
const paintingUIWidthPadding = 32;

const zoomTourMargin = 32;

const tourBoundsWidth = 3;

const translateExtentBuffer = 256;
const translateExtentTourBuffer = 1024;

const minScale = 0.05;
const maxScale = 2;

const durationShort = 500;
const durationMed = 750;
const durationLong = 1000;
const durationVLong = 2000;
const defaultEase = d3.easeCubicInOut;

//---- Utility
function getRootElementFontSize() {
  // Returns a number
  return parseFloat(
    // of the computed font-size, so in px
    getComputedStyle(
      // for the root <html> element
      document.documentElement
    )
    .fontSize
  );
}


//---- Load
var loaded = false;
d3.json("assets/json/paintings.json", function(paintingData) {
  const mainPaintings = paintingData.mainPaintings;
  const tourPaintings = paintingData.tourPaintings;

  function loadPainting(painting, wait) {
    return new Promise(function(resolve, reject) {
      if (painting.loaded) {
        resolve();
      }
      else {
        const thumb = new Image();
        const base = new Image();
        const loadBlurred = painting.blurredUrl !== undefined;
        thumb.onload = function() {
          painting.aspectRatio = thumb.height / thumb.width;
          painting.loaded = true;
          // console.log("loaded", painting, painting.key);
          resolve();
          base.src = painting.baseUrl;
        };
        thumb.onerror = thumb.onabort = function() {
          reject(thumb);
        }
        base.onerror = base.onabort = function() {
          reject(thumb);
        }
        thumb.src = painting.thumbUrl;
        if (loadBlurred) {
          const blurred = new Image();
          blurred.onerror = blurred.onabort = function() {
            reject(blurred);
          }
          blurred.src = painting.blurredUrl;
        }
        if (!wait) {
          resolve();
        }
      }
    });
  }

  function preloadMainPaintings() {
    const promises = [];
    for (var i = 0; i < mainPaintings.length; i++) {
      promises.push(loadPainting(mainPaintings[i].painting, true));
      // promises.push(loadImage(mainPaintings[i].painting.thumbUrl));
    }
    return Promise.all(promises);
  }

  function preloadTour(tour) {
    // console.log("preload tour", tour);
    if (tour.loaded) {
      return Promise.resolve();
    }
    else {
      const promises = [];
      for (var i = 0; i < tour.steps.length; i++) {
        const step = tour.steps[i];
        if (step.objects !== undefined) {
          const numObjects = step.objects.length;
          for (var j = 0; j < numObjects; j++) {
            if (step.objects[j].type == "painting") {
              promises.push(loadPainting(tourPaintings[step.objects[j].key], true));
            }
          }
        }

      }
      return Promise.all(promises).then(function() {
        tour.loaded = true;
      });
    }
  }

  function preloadTourStep(step) {
    // console.log("preload step", step);
    if (step.loaded) {
      console.log("step already loaded");
      return Promise.resolve();
    }
    else {
      const promises = [];
      if (step.objects !== undefined) {
        const numObjects = step.objects.length;
        for (var j = 0; j < numObjects; j++) {
          console.log(j, step.objects[j]);
          if (step.objects[j].type == "painting") {

            promises.push(loadPainting(tourPaintings[step.objects[j].key], true));
          }
        }
      }
      return Promise.all(promises).then(function() {
        // console.log("all loaded for the first time");
        step.loaded = true;
      });
    }
  }



  //---- Initialize
  var remToPixelRatio = getRootElementFontSize();
  const svgContainer = d3.select(".svg-container");
  const svgContainerNode = svgContainer.node();

  var width, height;

  const svg = d3.select(".svg-fullscreen");
  const root = svg.select(".root");


  //  --Resize
  d3.select(window).on("resize", resize);

  function resize() {
    const rect = svgContainerNode.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    if (state.showSplash) {
      rezoom();
    }
  }


  function zoomed() {
    // svgContainer.attr("style", "transform: " + d3.event.transform);
    root.attr("transform", d3.event.transform);
    paintingUIContainers.attr("transform", "scale(" + 1 / d3.event.transform.k + ") translate(16, 0)");
    paintingVisibleTourBounds.attr("stroke-width", tourBoundsWidth / d3.event.transform.k);
  }

  function zoomContain(d, i, nodes) {
    var t = d3.transition()
      .duration(durationLong)
      .ease(defaultEase);

    var bounds = this.getBBox(),
      dx = bounds.width,
      dy = bounds.height,
      x = (bounds.x + bounds.width / 2),
      y = (bounds.y + bounds.height / 2),
      scale = Math.max(minScale, Math.min(maxScale, 1 / Math.max(dx / width, dy / height))),
      translateX = (width / 2) / scale - x,
      translateY = (height / 2) / scale - y;

    function transform() {
      return d3.zoomIdentity.scale(scale).translate(translateX, translateY);
    }

    svg.transition(t)
      .call(zoom.transform, transform);
  }

  function zoomPaintingCoverVerticalRight(d, i, nodes) {
    var t = d3.transition()
      .duration(durationLong)
      .ease(defaultEase);

    var anchorBounds = this.getBBox(),
      paintingBounds = d3.select(this).select(".base-container").node().getBBox(),
      textBounds = d3.select(this).select(".painting-ui-container").node().getBBox(),
      dx = paintingBounds.width,
      dy = paintingBounds.height,
      scale = Math.max(minScale, Math.min(maxScale, 1 / (dy / height))),
      x = anchorBounds.x + dx + textBounds.width / scale + paintingUIWidthPadding * 2.5,
      y = (anchorBounds.y + dy / 2),
      translateX = (width) / scale - x,
      translateY = (height / 2) / scale - y;

    function transform() {
      return d3.zoomIdentity.scale(scale).translate(translateX, translateY);
    }

    svg.transition(t)
      .call(zoom.transform, transform);
  }

  function zoomTourStep(d, i, nodes) {
    var t = d3.transition()
      .duration(durationLong)
      .ease(defaultEase);

    var paintingBounds = this.parentNode.parentNode.parentNode.getBBox(),
      bounds = this.getBBox(),
      dx = bounds.width,
      dy = bounds.height,
      x = (bounds.x + bounds.width / 2) + paintingBounds.x,
      y = (bounds.y + bounds.height / 2) + paintingBounds.y,
      scale = Math.max(minScale, Math.min(maxScale, 1 / Math.max(dx / (width - 2 * zoomTourMargin), dy / (height - 2 * zoomTourMargin)))),
      translateX = (width / 2) / scale - x,
      translateY = (height / 2) / scale - y;

    function transform() {
      return d3.zoomIdentity.scale(scale).translate(translateX, translateY);
    }

    svg.transition(t)
      .call(zoom.transform, transform);
  }

  function rezoom() {
    if (loaded) {
      if (state.activePainting === undefined) {
        zoomContain.bind(svg.select("#frame-splash").node())();
      }
      else {
        const anchorBounds = getActivePaintingNode().getBBox();
        const paintingBounds = d3.select(getActivePaintingNode()).select(".base-container").node().getBBox();
        if (state.activeTour === undefined) {
          zoom.translateExtent([
            [anchorBounds.x, anchorBounds.y],
            [anchorBounds.x + anchorBounds.width, anchorBounds.y + paintingBounds.height]
          ]);
        }
        else {
          zoom.translateExtent([
            [anchorBounds.x - translateExtentTourBuffer, anchorBounds.y - translateExtentTourBuffer],
            [anchorBounds.x + anchorBounds.width + translateExtentTourBuffer, anchorBounds.y + anchorBounds.height + translateExtentTourBuffer]
          ]);
        }
        var extentBuffer = (state.activeTour === undefined) ? translateExtentBuffer : translateExtentTourBuffer;

        if (state.activeTour === undefined) {
          zoomPaintingCoverVerticalRight.bind(getActivePaintingNode())();
        }
        else {
          zoomTourStep.bind(d3.select(getActiveTourNode()).select(".painting-step.step-" + state.activeTour.step).node())();
        }
      }
    }
  }

  //  --Paintings
  const paintingsContainer = root.select(".paintings");
  var paintings;
  var paintingUIContainers = root.selectAll(".painting-ui-container");
  var paintingVisibleTourBounds = root.selectAll("rect.outlined");

  function paintingIsActive(mainPainting) {
    if (state.activePainting !== undefined) {
      return mainPainting.painting.key === state.activePainting.data.painting.key;
    }
    else {
      return false;
    }
  }

  function paintingIsInactive(mainPainting) {
    if (state.activePainting !== undefined) {
      return mainPainting.painting.key !== state.activePainting.data.painting.key;
    }
    else {
      return false;
    }
  }

  function tourIsActive(mainPainting) {
    if (state.activeTour !== undefined) {
      return mainPainting.painting.key === state.activePainting.data.painting.key;
    }
    else {
      return false;
    }
  }

  function stepIsActive(d, i) {
    if (state.activeTour !== undefined) {
      return state.activeTour.step === i;
    }
    else {
      return false;
    }
  }

  //---- Transforms
  function transformCascaded(d, i) {
    return "translate(" + (i * paintingCascadeLength) + "," + (i * (paintingDisplayHeight + paintingMargin)) + ")";
  }

  function transformAlignRight(d, i) {
    return "translate(" + (-d3.select(this).select(".base-container").node().getBBox().width) + "," + (i * (paintingDisplayHeight + paintingMargin)) + ")";
  }

  function transformConditional(d, i) {
    if (state.showSplash) {
      return transformCascaded.bind(this)(d, i);
    }
    else {
      return transformAlignRight.bind(this)(d, i);
    }
  }

  //---- State + URL Save/Load
  var state = {
    activePainting: undefined,
    activeTour: undefined,
    showSplash: true //TODO
  };

  function getActivePaintingNode() {
    if (state.activePainting.node === undefined) {
      state.activePainting.node = root.select("#" + state.activePainting.data.painting.key).node();
      if (state.activePainting.node === null) {
        state.activePainting.node === undefined;
        throw ("getActivePaintingNode(): Could not find active painting node");
      }

    }
    return state.activePainting.node;
  }

  function getActiveTourNode() {
    if (state.activeTour.node === undefined) {

      state.activeTour.node = d3.select(getActivePaintingNode()).select(".painting-tour-container").node();
      if (state.activeTour.node === null) {
        state.activeTour.node === undefined;
        throw ("getActiveTourNode: Could not find active tour node");
      }

    }
    return state.activeTour.node;
  }


  function loadFromUrl() {
    const queries = Url.parseQuery();
    const activePaintingKey = queries["activePainting"];
    if (activePaintingKey) {
      const activePaintingData = _.find(mainPaintings, function(mainPainting) {
        return mainPainting.painting.key === activePaintingKey;
      });
      if (activePaintingData !== undefined) {
        state.showSplash = false;
        state.activePainting = {
          data: activePaintingData
        };
        const activeTourKey = queries["activeTour"];
        if (activeTourKey) {
          const activeTourData = _.find(state.activePainting.data.tours, function(tour) {
            return tour.key === activeTourKey;
          });
          if (activeTourData !== undefined) {
            state.activeTour = {
              data: activeTourData,
              step: 0
            };
            const step = parseInt(queries["step"], 10);
            if (!isNaN(step) && step >= 0 && step < state.activeTour.data.steps.length) {
              state.activeTour.step = step;
            }
          }
        }
      }

    }
  }

  function updateUrl() {
    if (state.activePainting !== undefined) {
      Url.updateSearchParam("activePainting", state.activePainting.data.painting.key);
      if (state.activeTour !== undefined) {
        Url.updateSearchParam("activeTour", state.activeTour.data.key);
        Url.updateSearchParam("step", state.activeTour.step);
      }
      else {
        Url.updateSearchParam("activeTour");
        Url.updateSearchParam("step");
      }
    }
    else {
      Url.updateSearchParam("activePainting");
      Url.updateSearchParam("activeTour");
      Url.updateSearchParam("step");
    }
  }

  //---- Master Render
  function render() {
    if (loaded) {
      renderPaintings();
      renderInterface();
    }
  }

  function renderPaintings() {
    const t = d3.transition()
      .duration(durationVLong)
      .ease(defaultEase);

    //Rebind
    paintings = paintingsContainer.selectAll(".painting")
      .data(mainPaintings, function(d, i) {
        return d.painting.key;
      });

    //Modification
    paintings.select(".painting-container")
      .transition(t)
      .attr("transform", transformConditional);

    renderPaintingTour(paintings.select(".painting-tour-container"));

    //Entry
    var newPaintings = paintings.enter()
      .append("g")
      .attr("class", "painting transform-container")
      .attr("id", function(d) {
        return d.painting.key;
      });
    var newPaintingContainers = newPaintings
      .append("g")
      .attr("class", "painting-container");

    var newPaintingBaseContainers = newPaintingContainers
      .append("g")
      .attr("class", "base-container");

    var newPaintingBaseRect = newPaintingBaseContainers.append("rect")
      .attr("class", "painting-baserect")
      .attr("id", function(d) {
        return "baserect-" + d.painting.key;
      })
      .attr("height", paintingDisplayHeight)
      .attr("width", function(d) {
        return d.painting.aspectRatio * paintingDisplayHeight;
      });

    var newPaintingThumbImage = newPaintingBaseContainers.append("image")
      .attr("class", "painting-thumb")
      .attr("xlink:href", function(d) {
        return d.painting.thumbUrl;
      })
      .attr("width", paintingThumbHeight)
      .attr("height", function(d) {
        return d.painting.aspectRatio * paintingThumbHeight;
      })
      .attr("transform", function(d) {
        return "scale(" + paintingThumbScale + ") translate(" + d.painting.aspectRatio * paintingThumbHeight + ",0) rotate (90)";
      });

    var newPaintingFullImage = newPaintingBaseContainers.append("image")
      .attr("class", "painting-base")
      .attr("xlink:href", function(d) {
        return d.painting.baseUrl;
      })
      .attr("width", paintingHeight)
      .attr("height", function(d) {
        return d.painting.aspectRatio * paintingHeight;
      })
      .attr("transform", function(d) {
        return "scale(" + paintingScale + ") translate(" + d.painting.aspectRatio * paintingHeight + ",0) rotate (90)";
      });

    var newPaintingBlurImage = newPaintingBaseContainers
      .append("g")
      .attr("class", "painting-blur")
      .append("image")
      .attr("class", "painting-blur-base")
      .attr("xlink:href", function(d) {
        return d.painting.blurredUrl;
      })
      .attr("width", paintingBlurHeight)
      .attr("height", function(d) {
        return d.painting.aspectRatio * paintingBlurHeight;
      })
      .attr("transform", function(d) {
        return "scale(" + paintingBlurScale + ") translate(" + d.painting.aspectRatio * paintingBlurHeight + ",0) rotate (90)";
      });

    var newPaintingTour = newPaintingContainers.append("g")
      .attr("class", "painting-tour-container");

    newPaintingTour.append("g")
      .attr("class", "painting-current-step");

    var newPaintingUI = newPaintingContainers.append("g")
      .attr("class", "painting-right-edge")
      .attr("transform", function(d) {
        return "translate(" + d.painting.aspectRatio * paintingDisplayHeight + ", 0)";
      })
      .append("g")
      .attr("class", "painting-ui-position-container");

    renderPaintingUI(newPaintingUI);
    renderPaintingTour(newPaintingTour);

    newPaintingContainers.attr("transform", transformConditional);

    //Exit
    const exitingPaintings = paintings.exit();
    exitingPaintings.remove();

    //All
    const allPaintings = newPaintings.merge(paintings);
    allPaintings
      .classed("inactive", paintingIsInactive)
      .classed("active", paintingIsActive);

    const paintingBase = allPaintings.select(".base-container")
      .classed("hidden", function(d) {
        return paintingIsActive(d) && tourIsActive(d) && state.activeTour.data.steps[state.activeTour.step].hideMain;
      });

    const paintingBlur = allPaintings.select(".painting-blur")
      .classed("active", function(d) {
        return paintingIsActive(d) && tourIsActive(d) && state.activeTour.data.steps[state.activeTour.step].blurMain;
      });


    if (!state.showSplash) {
      if (state.activePainting === undefined) {
        allPaintings.select(".painting-container").on("click", selectPainting);
      }
      else {
        allPaintings.select(".painting-container").on("click", null);
        if (state.activeTour !== undefined) {
          paintingBlur.attr("mask", "url(#cutout-mask-" + state.activeTour.step + ")");
        }
      }
    }
    else {
      allPaintings.select(".painting-container").on("click", null);
    }
  }

  function renderPaintingUI(paintingUISelection) {
    const newPaintingUIContainer = paintingUISelection
      .append("g")
      .attr("class", "painting-ui-container");

    paintingUIContainers = root.selectAll(".painting-ui-container");

    const newInfoBlock = newPaintingUIContainer.append("text")
      .attr("class", "info prevent-zoom")
      .attr("y", 2.5 * remToPixelRatio); //"2.5rem");

    newInfoBlock.append("tspan")
      .attr("class", "name header prevent-zoom reset-cursor")
      .attr("x", 0)
      .text(function(d) {
        return d.painting.name;
      });

    newInfoBlock.append("tspan")
      .attr("class", "painter prevent-zoom reset-cursor")
      .attr("x", 0)
      .attr("dy", 3 * remToPixelRatio) //"3rem")
      .text(function(d) {
        return "Attributed to " + d.painting.painter;
      });

    const newContents = newPaintingUIContainer.append("g")
      .attr("class", "painting-ui-contents-container");

    const contentsYRem = 6.5;
    const contentsFirstItemYRem = contentsYRem + .5;
    const contentsItemHeightRem = 2;

    newContents.append("line")
      .attr("class", "divider")
      .attr("x1", 0)
      .attr("y1", contentsYRem * remToPixelRatio) //+ "rem")
      .attr("x2", 350)
      .attr("y2", contentsYRem * remToPixelRatio); //+ "rem");

    const newVisualTour = newContents.append("g")
      .attr("class", "contents-entry visual-tour-button prevent-zoom")
      .on("click", selectVisualAnalysis, true);

    newVisualTour
      .append("text").text("Visual Analysis")
      .attr("class", "prevent-zoom")
      .attr("x", 0)
      .attr("y", (contentsFirstItemYRem + 1 * contentsItemHeightRem) * remToPixelRatio); //+ "rem");
  }

  function renderPaintingTour(paintingTourSelection) {
    //Rebind
    paintingTourSelection.classed("active", tourIsActive);

    const paintingCurrentStepContainer = paintingTourSelection.select(".painting-current-step");
    renderPaintingTourObjects(paintingCurrentStepContainer);

    renderPaintingTourStep(paintingTourSelection);

    paintingVisibleTourBounds = root.selectAll("rect.outlined");
  }

  function renderPaintingTourObjects(paintingCurrentStepContainer) {
    const paintingTourObjects = paintingCurrentStepContainer.selectAll(".tour-object")
      .data(function(d) {

        if (tourIsActive(d)) {
          const currentObjects = state.activeTour.data.steps[state.activeTour.step].objects;
          return currentObjects !== undefined ? currentObjects : [];
        }
        else {
          return [];
        }
      }, function(d) {
        return d.key;
      });

    if (state.activeTour !== undefined) {
      preloadTourStep(state.activeTour.data.steps[state.activeTour.step])
        .then(function() {
          //Entry
          const newPaintingTourObjects = paintingTourObjects.enter()
            .append("g")
            .attr("class", "tour-object active")
            .append("g")
            .attr("class", "tour-object-base-container")
            .attr("transform", function(d) {
              return "translate(" + d.x + ", " + d.y + ")";
            });

          newPaintingTourObjects.append("image")
            .attr("class", "object-thumb")
            .attr("xling:href", function(d) {
              //TODO handle not found
              return tourPaintings[d.key].thumbUrl;
            })
            .attr("width", paintingThumbHeight)
            .attr("height", function(d) {
              return tourPaintings[d.key].aspectRatio * paintingThumbHeight;
            })
            .attr("transform", function(d) {
              if (tourPaintings[d.key].rotated) {
                return "scale(" + d.height / paintingThumbHeight + ") translate(" + tourPaintings[d.key].aspectRatio * paintingThumbHeight + ",0) rotate (90)";
              }
              else {
                // Thumbheight is actually the width of the unrotated painting
                const thumbHeightActual = tourPaintings[d.key].aspectRatio * paintingThumbHeight;
                return "scale(" + d.height / thumbHeightActual + ")";
              }
            })

          // newPaintingTourObjects.append("image")
          //   .attr("class", "object-base")
          //   .attr("xling:href", function(d) {
          //     console.log(d);
          //     //TODO handle not found
          //     return tourPaintings[d.key].baseUrl;
          //   });
          newPaintingTourObjects
            .transition()
            .duration(1)
            .on("end", function() {
              this.classList.add("active");
            });

          preloadTour(state.activeTour.data);
        }).catch(reason => {
          console.error("preload failed", reason)
        });
    }

    //Exit
    paintingTourObjects.exit()
      .transition()
      .duration(durationShort)
      // .style("opacity", 0)
      .on("start", function() {
        this.classList.remove("active");
      })
      .remove();
  }

  function renderPaintingTourStep(paintingTourSelection) {
    var paintingTours = paintingTourSelection
      .selectAll(".painting-step")
      .data(function(d) {
        if (tourIsActive(d)) {
          return state.activeTour.data.steps;
        }
        else {
          return [];
        }
      });

    //Exit
    paintingTours.exit().remove();

    if (state.activePainting !== undefined && state.activeTour !== undefined) {
      //Modification

      //Entry
      var newPaintingTours = paintingTours.enter()
        .append("g")
        .attr("class", function(d, i) {
          return "painting-step step-" + i;
        });

      ///Defs
      var defs = newPaintingTours
        .append("defs")
        .attr("class", "tour-def");


      var newBoundsContainer = defs.append("g")
        .attr("class", "bounds-container")
        .attr("id", function(d, i) {
          return "bounds-container-" + i;
        });

      var newBoundsDisplayContainer = newPaintingTours.append("use")
        .attr("xlink:href", function(d, i) {
          return "#bounds-container-" + i;
        })
        .attr("class", "bounds-display-container");

      //All
      var allPaintingTours = newPaintingTours.merge(paintingTours);

      //Tour Bounds
      var tourBoundsContainer = allPaintingTours
        .select(".bounds-container");

      renderPaintingTourBounds(tourBoundsContainer);

      var mask = defs
        .append("mask")
        .attr("id", function(d, i) {
          return "cutout-mask-" + i;
        });

      mask.append("use")
        .attr("xlink:href", "#baserect-" + state.activePainting.data.painting.key)
        .attr("fill", "white");

      mask.append("use")
        .attr("xlink:href", function(d, i) {
          return "#bounds-container-" + i;
        })
        .attr("fill", "black");
    }
  }

  function renderPaintingTourBounds(boundsContainer) {
    var tourBounds = boundsContainer
      .selectAll("rect")
      .data(function(d, i) {
        if (stepIsActive(d, i)) {
          return d.bounds;
        }
        else {
          return [];
        }

      });

    //Entry
    var newTourBounds = tourBounds
      .enter()
      .append("rect")
      .attr("id", function(d, i) {
        return "bounds-" + i;
      })
      .attr("x", function(d) {
        return d.x;
      })
      .attr("y", function(d) {
        return d.y;
      })
      .attr("height", function(d) {
        return d.height;
      })
      .attr("width", function(d) {
        return d.width;
      })
      .attr("stroke-width", 3)
      .attr("class", "painting-bounds")
      .classed("outlined", function(d, i) {
        return d.framed === true;
      });

    newTourBounds
      .transition()
      .duration(1)
      .on("end", function() {
        this.classList.add("active");
      });

    //Exit
    tourBounds.exit()
      .transition()
      .duration(durationShort)
      // .style("opacity", 0)
      .on("start", function() {
        this.classList.remove("active");
      })
      .remove();
  }

  function renderInterface() {
    var navMenu = d3.select("#menu-painters")
      .selectAll("li")
      .data(mainPaintings);

    navMenu.enter()
      .append("li").append("a").text(function(d) {
        return d.painting.painter;
      }).merge(navMenu).classed("active", paintingIsActive).on("click", selectPainting.bind(undefined));

    d3.select(".overlay")
      .classed("active", function() {
        return state.activeTour !== undefined;
      });
    if (state.activeTour !== undefined) {
      d3.select('#tour-header')
        .html(function() {
          return decodeURI(state.activeTour.data.steps[state.activeTour.step].header);
        });
      d3.select("#tour-text")
        .html(function() {
          return decodeURI(state.activeTour.data.steps[state.activeTour.step].html);
        });
    }


    d3.select(".intro-page")
      .classed("active", function() {
        return state.showSplash;
      });
  }

  //---- Interaction
  function resetHome() {
    state.activePainting = undefined;
    state.activeTour = undefined;
    state.showSplash = false;
    render();
    rezoom();
    updateUrl();
  }

  function selectPainting(d, i, nodes) {
    state.activePainting = {
      data: d,
      i: i,
      node: this !== undefined ? this.parentNode : undefined
    };
    state.activeTour = undefined;
    state.showSplash = false;
    render();
    rezoom();
    updateUrl();
  }

  function selectVisualAnalysis() {
    if (state.activePainting !== undefined) {
      selectTour(state.activePainting.data.tours.visualTour, 0); //TODO
    }
  }

  function selectTour(tour, step) {
    state.activeTour = {
      data: tour,
      step: step
    };
    render();
    rezoom();
    updateUrl();
  }

  function nextTourStep() {
    if (state.activeTour !== undefined && state.activeTour.step < (state.activeTour.data.steps.length - 1)) {
      state.activeTour.step++;
      render();
      rezoom();
      updateUrl();
    }
  }

  function prevTourStep() {
    if (state.activeTour !== undefined && state.activeTour.step > 0) {
      state.activeTour.step--;
      render();
      rezoom();
      updateUrl();
    }
  }

  function keyNav(evt) {
    evt = evt || window.event;

    if (evt.keyCode === 37) {
      prevTourStep();
      evt.preventDefault();
    }
    else if (evt.keyCode === 39) {
      nextTourStep();
      evt.preventDefault();
    }
  }

  document.addEventListener('keydown', keyNav);


  d3.select("#button-begin").on("click", resetHome, true);
  d3.select("#menu-home").on("click", resetHome, true);
  d3.select("#button-next").on("click", function() {
    nextTourStep();
  }, true);
  d3.select("#button-prev").on("click", function() {
    prevTourStep();
  }, true);

  //---- Zooming
  function unGrab(evt) {
    // console.log("ungrab");
    document.body.classList.remove("grabbing");
    document.removeEventListener("mouseup", unGrab);
  }

  var zoom = d3.zoom()
    .scaleExtent([minScale, maxScale])
    .on("zoom", zoomed)
    .filter(function() {
      const filter = state.activePainting !== undefined && !event.button && !event.target.classList.contains("prevent-zoom");
      // if (filter && event.type === "mousedown") {
      //   document.body.classList.add("grabbing");
      //   document.addEventListener("mouseup", unGrab, true);
      // }
      // console.log(event);
      // console.log(event.target, event.target.classList, !event.target.classList.contains("preventZoom"));
      return filter;
    });
  // zoom.clickDistance(2);

  svg.call(zoom);



  //---- Main
  loadFromUrl();
  preloadMainPaintings().then(function() {
    loaded = true;
    render();
    rezoom();
  });
  resize();
})