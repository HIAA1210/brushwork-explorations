/*global d3*/

//---- Configuration + Constants + Data
    const paintingHeight = 2048;
    const paintingScale = 0.5;
    const paintingDisplayHeight = paintingHeight * paintingScale;
    const paintingMargin = 40 * 4;
    const paintingCascadeLength = 236 * 4;

    const minScale = 0.05;
    const maxScale = 2;

    const durationShort = 500;
    const durationMed = 750;
    const durationLong = 1000;
    const durationVLong = 2000;
    const defaultEase = d3.easeCubicInOut;

    const mainPaintings = [{
      painting: {
        painter: "Zhao Lingrang",
        name: "Winter Landscape",
        key: "painting-zhaolingrang-risd",
        fullUrl: "assets/img/Zhao_Lingrang/Zhao_Lingrang_RISD_full_optimized.png"
      },
      visualTour: {
        key: "visual-tour-zhaolingrang-risd",
        steps: [{
          html: encodeURI("These tree trunks are painted with more noticeable outlines than the tree trunks in Whiling Away the Summer by a Lakeside Retreat. In that painting, the tree trunks appear to be painted with single wet brushstrokes rather than with multiple brushstrokes. This method of painting, lacking outlines, is called the “boneless method.”"),
          bounds: [{
            x: 1684,
            y: 138,
            width: 1096,
            height: 685
          }]
        }, {
          html: encodeURI("In Winter Landscape, delicate tree branches extend above leafy trees. We see similar kinds of delicate branches extending above leaves in pieces attributed to Zhao Lingrang, such as in Whiling Away the Summer by a Lakeside Retreat and in River Village in Autumn."),
          bounds: [{
            x: 1984,
            y: 162,
            width: 770,
            height: 342
          }]
        }, {
          html: encodeURI("Some of the leaves in Whiling Away the Summer by a Lakeside Retreat are painted similarly to the leaves in Winter Landscape. But, as is common in comparisons between the two paintings, the leaves in Whiling away the Summer are more random and organic than the leaves in Winter Landscape that form more of a repeating pattern than an organic mass."),
          bounds: [{
            x: 1461,
            y: 490,
            width: 504,
            height: 234
          }]
        }]
      }
    }, {
      painting: {
        painter: "Zhao Boju",
        name: "Landscape with Buildings",
        key: "painting-zhaoboju-risd",
        fullUrl: "assets/img/Zhao_Boju/Zhao_Boju_RISD_optimized.png"
      },
      visualTour: {
        key: "visual-tour-zhaoboju-risd",
        steps: []
      }
    }, {
      painting: {
        painter: "Mi Youren",
        name: "Mountain Mists",
        key: "painting-miyouren-risd",
        fullUrl: "assets/img/Mi_Youren/Mi_Youren_RISD_optimized.png"
      },
      visualTour: {
        key: "visual-tour-miyouren-risd",
        steps: []
      }
    }];



    //---- Initialize
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
    }

    //---- Zooming
    var zoom = d3.zoom()
      .scaleExtent([minScale, maxScale])
      .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed() {
      root.attr("transform", d3.event.transform);
      //TODO: scale-independent step outlines
    }

    function zoomContain(d, i, nodes) {
      var t = d3.transition()
        .duration(durationLong)
        .ease(defaultEase);

      var bounds = this.parentNode.getBBox(),
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

    function zoomCoverVerticalRight(d, i, nodes) {
      var t = d3.transition()
        .duration(durationLong)
        .ease(defaultEase);

      var bounds = this.parentNode.getBBox(),
        dx = bounds.width,
        dy = bounds.height,
        x = (bounds.x + bounds.width),
        y = (bounds.y + bounds.height / 2),
        scale = Math.max(minScale, Math.min(maxScale, 1 / (dy / height))),
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
        scale = Math.max(minScale, Math.min(maxScale, 1 / Math.max(dx / width, dy / height))),
        translateX = (width / 2) / scale - x,
        translateY = (height / 2) / scale - y;

      function transform() {
        return d3.zoomIdentity.scale(scale).translate(translateX, translateY);
      }

      svg.transition(t)
        .call(zoom.transform, transform);
    }

    function rezoom() {
      if (state.activePainting === undefined) {
        zoomContain.bind(svg.select("#frame-splash").node())();
      } else {
        if (state.activeTour === undefined) {
          zoomCoverVerticalRight.bind(state.activePainting.node)();
        } else {
          zoomTourStep.bind(d3.select(state.activeTour.node).select(".painting-step.step-" + state.activeTour.step).node())();
        }
      }
    }

    //  --Paintings
    const paintingsContainer = svg.select(".paintings");
    var paintings;

    function paintingIsInactive(d) {
      if (state.activePainting !== undefined) {
        return d.painting.key !== state.activePainting.data.painting.key;
      } else {
        return false;
      }
    }

    function tourIsActive(d) {
      if (state.activeTour !== undefined) {
        return d.key === state.activeTour.key;
      } else {
        return false;
      }
    }

    function stepIsActive(d, i) {
      if (state.activeTour !== undefined) {
        return state.activeTour.step === i;
      } else {
        return false;
      }
    }

    //---- Transforms
    function transformCascaded(d, i) {
      return "translate(" + (i * paintingCascadeLength) + "," + (i * (paintingDisplayHeight + paintingMargin)) + ")";
    }

    function transformAlignRight(d, i) {
      return "translate(" + (-this.getBBox().width) + "," + (i * (paintingDisplayHeight + paintingMargin)) + ")";
    }

    function transformConditional(d, i) {
      if (state.showSplash) {
        return transformCascaded.bind(this)(d, i);
      } else {
        return transformAlignRight.bind(this)(d, i);
      }
    }

    //---- State
    var state = {
      activePainting: undefined,
      activeTour: undefined,
      showSplash: true //TODO
    };

    //---- Master Render
    function render() {
      renderPaintings();
      renderInterface();
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

      var newPaintingBases = newPaintingContainers.append("image")
        .attr("class", "painting-base")
        .attr("xlink:href", function(d) {
          return d.painting.fullUrl;
        })
        .attr("height", paintingHeight)
        .attr("transform", "scale(" + paintingScale + ")");

      var newPaintingTour = newPaintingContainers.append("g")
        .attr("class", "painting-tour-container");

      renderPaintingTour(newPaintingTour);

      newPaintingContainers.attr("transform", transformConditional);

      //Exit
      var exitingPaintings = paintings.exit();
      exitingPaintings.remove();

      //All
      var allPaintings = newPaintings.merge(paintings);
      allPaintings.classed("inactive", paintingIsInactive);
      if (!state.showSplash && state.activePainting === undefined) {
        allPaintings.select(".painting-container").on("click", selectPainting);
      } else {
        allPaintings.select(".painting-container").on("click", null);
      }
    }

    function renderPaintingTour(paintingTourSelection) {
      //Rebind
      var paintingTours = paintingTourSelection
        .selectAll("g")
        .data(function(d) {
          if (tourIsActive(d)) {
            return d.visualTour.steps;
          } else {
            return [];
          }
        });

      //Modification

      //Entry
      var newPaintingTours = paintingTours.enter()
        .append("g")
        .attr("class", function(d, i) {
          return "painting-step step-" + i
        });


      //Exit
      paintingTours.exit().remove();

      //All
      var allPaintingTours = newPaintingTours.merge(paintingTours)

      //Tour Bounds
      var tourBounds = allPaintingTours
        .selectAll("rect")
        .data(function(d, i) {
          if (stepIsActive(d, i)) {
            return d.bounds;
          } else {
            return [];
          }
          //TODO: conditionally render based on step visibility

        })

      //Entry
      var newTourBounds = tourBounds
        .enter()
        .append("rect")
        .attr("x", function(d) {
          return d.x
        })
        .attr("y", function(d) {
          return d.y
        })
        .attr("height", function(d) {
          return d.height
        })
        .attr("width", function(d) {
          return d.width
        });

      //Exit
      tourBounds.exit().remove();
    }

    function renderInterface() {
      d3.select(".overlay")
      .classed("active", function() {
          return state.activeTour !== undefined;
        })
      d3.select("#tour-text")
        .html(function() {
          if (state.activeTour !== undefined) {
            return decodeURI(state.activeTour.data.steps[state.activeTour.step].html);
          }
        })

      d3.select(".intro-page")
        .classed("active", function() {
          return state.showSplash;
        })
    }

    //---- Interaction
    function resetHome() {
      state.activePainting = undefined;
      state.activeTour = undefined;
      state.showSplash = false;
      render();
      rezoom();
    }

    function selectPainting(d, i, nodes) {
      //TODO set drag zoom constraints
      state.activePainting = {
        data: d,
        i: i,
        node: this
      };
      render();
      rezoom();
    }

    function selectVisualAnalysis() {
      console.log(state.activePainting);
      if (state.activePainting !== undefined) {
        selectTour(state.activePainting.data.visualTour, 0); //TODO
      }
    }

    function selectTour(tour, step) {
      console.log(tour);
      //TODO Nodes bound to current active painting
      state.activeTour = {
        data: tour,
        step: step,
        node: d3.select(state.activePainting.node).select(".painting-tour-container").node()
      }
      render();
      rezoom();
    }

    function nextTourStep() {
      if (state.activeTour !== undefined && state.activeTour.step < (state.activeTour.data.steps.length - 1)) {
        state.activeTour.step++;
        render();
        rezoom();
      }
    }

    function prevTourStep() {
      if (state.activeTour !== undefined && state.activeTour.step > 0) {
        state.activeTour.step--;
        render();
        rezoom();
      }
    }


    d3.select("#button-begin").on("click", resetHome);
    d3.select("#button-start-visual-analysis").on("click", function() {
      selectVisualAnalysis();
    });
    d3.select("#button-next").on("click", function() {
      nextTourStep();
    })
    d3.select("#button-prev").on("click", function() {
      prevTourStep();
    })

    //---- Main
    resize();
    render();
    rezoom();