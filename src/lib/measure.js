import 'ol/ol.css';
import Map from 'ol/Map';
import {unByKey} from 'ol/Observable';
import Overlay from 'ol/Overlay';
import {getArea, getLength} from 'ol/sphere';
import View from 'ol/View';
import {LineString, Polygon} from 'ol/geom';
import Draw from 'ol/interaction/Draw';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
class Measure {
  constructor(props) {
    this.map = props;
    this.typeSelect;
    this.sketch;
    this.helpTooltipElement;
    this.helpTooltip;
    this.measureTooltipElement;
    this.measureTooltip;
    this.continuePolygonMsg = '继续画多边形';
    this.continueLineMsg = '继续画线';
    this.source;
    this.fenceLayer;
    this.draw;
    this.measureNow;
    this.overlayIds;
    //样式

    this.init()
  }
  init() {
    var that = this;
    that.measureNow=false;
    that.overlayIds=[];
    //临时图层的数据源
    that.source = new VectorSource();
    //
    that.fenceStyle = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33'
        })
      })
    })
    //新建临时图层，并设置临时图层渲染各种要素的样式
    that.fenceLayer = new VectorLayer({
      source: that.source,
      style: that.fenceStyle
    });
    that.map.addLayer(that.fenceLayer)
    that.map.on('pointermove', that.pointerMoveHandler);

    that.map.getViewport().addEventListener('mouseout', function() {
      if(that.measureNow) {
        that.helpTooltipElement.classList.add('hidden');
      }
    });
    that.typeSelect = 'LineString';
  }
  createMeasureTooltip() {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
    }
    this.measureTooltipElement = document.createElement('div');
    this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    var id="measure_"+Date.now();
    this.measureTooltip = new Overlay({
      id:id,
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    });
    this.overlayIds.push(id);
    this.map.addOverlay(this.measureTooltip);
  }
  createHelpTooltip() {
    if (this.helpTooltipElement) {
      this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
    }
    this.helpTooltipElement = document.createElement('div');
    this.helpTooltipElement.className = 'ol-tooltip hidden';
    this.helpTooltip = new Overlay({
      element: this.helpTooltipElement,
      offset: [15, 0],
      positioning: 'center-left'
    });
    this.map.addOverlay(this.helpTooltip);
  }
  pointerMoveHandler (evt) {
    if (evt.dragging || !this.measureNow) {
      return;
    }
    /** @type {string} */
    var helpMsg = '点击开始画';

    if (this.sketch) {
      var geom = this.sketch.getGeometry();
      if (geom instanceof Polygon) {
        helpMsg = this.continuePolygonMsg;
      } else if (geom instanceof LineString) {
        helpMsg = this.continueLineMsg;
      }
    }

    this.helpTooltipElement.innerHTML = helpMsg;
    this.helpTooltip.setPosition(evt.coordinate);

    this.helpTooltipElement.classList.remove('hidden');
  }
  closeMeasure() {
    this.map.removeInteraction(this.draw);
  }
  rmMeasures(){
    var features = this.source.getFeatures();
    for(var i=0;i<features.length;i++){
      this.source.removeFeature(features[i]);
    }
    for(var j=0;j<this.overlayIds.length;j++){
      var theOverlay = this.map.getOverlayById(this.overlayIds[j]);
      if(theOverlay) {
        this.map.removeOverlay(theOverlay);
      }
    }
    this.overlayIds=[];
  }
  addInteraction() {
    var that =this;
    var type = that.typeSelect;
    this.draw = new Draw({
      source: that.source,
      type: type,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        })
      })
    });
    that.map.addInteraction(that.draw);

    that.createMeasureTooltip();
    that.createHelpTooltip();

    var listener;
    that.draw.on('drawstart',
      function(evt) {
        // set sketch
        that.sketch = evt.feature;
        that.measureNow = true;

        /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
        var tooltipCoord = evt.coordinate;

        listener = that.sketch.getGeometry().on('change', function(evt) {
          var geom = evt.target;
          var output;
          if (geom instanceof Polygon) {
            output = that.formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            output = that.formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          }
          that.measureTooltipElement.innerHTML = output;
          that.measureTooltip.setPosition(tooltipCoord);
        });
      });

    that.draw.on('drawend',
      function() {
        that.measureNow = false;
        that.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        that.measureTooltip.setOffset([0, -7]);
        // unset sketch
        that.sketch = null;
        // unset tooltip so that a new one can be created
        that.measureTooltipElement = null;
        that.createMeasureTooltip();
        unByKey(listener);
      });
  }
  formatArea(polygon) {
    var area = getArea(polygon);
    var output;
    if (area > 10000) {
      output = (Math.round(area / 1000000 * 100) / 100) +
        ' ' + 'km<sup>2</sup>';
    } else {
      output = (Math.round(area * 100) / 100) +
        ' ' + 'm<sup>2</sup>';
    }
    return output;
  }
  formatLength = function(line) {
    var length = getLength(line);
    var output;
    if (length > 100) {
      output = (Math.round(length / 1000 * 100) / 100) +
        ' ' + 'km';
    } else {
      output = (Math.round(length * 100) / 100) +
        ' ' + 'm';
    }
    return output;
  }
}
export default Measure;


