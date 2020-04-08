
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import VectorSource from 'ol/source/Vector.js'
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js'
import {Draw, Modify, Snap} from 'ol/interaction';
import {addProjection, addCoordinateTransforms, transform} from 'ol/proj.js'
import Feature from 'ol/Feature.js'
import {Circle as geomCircle, Polygon as geomPolygon, LineString as geomLineString} from 'ol/geom.js'
class drawFence {
  constructor(props) {
    //这里初始化class的时候需要传map对象进来
    this.map = props;
    this.source;
    this.fenceLayer;
    this.draw;
    this.callback;
    //样式
    this.fenceStyle = new Style({
      fill: new Fill({
        color: 'rgba(255, 67, 50, 0.4)'
      }),
      stroke: new Stroke({
        color: '#ff4332',
        width: 2
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33'
        })
      })
    })
    this.fenceStyle2 = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0)'
      }),
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0)',
        width: 0
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0)'
        })
      })
    })
    this.init()
  }
  init() {
    //临时图层的数据源
    this.source = new VectorSource();
    //新建临时图层，并设置临时图层渲染各种要素的样式
    this.fenceLayer = new VectorLayer({
      source: this.source,
      // style: this.fenceStyle
      style: null
    });
    this.fenceLayer.set('layerTypeId','fenceLayer');
    this.map.addLayer(this.fenceLayer)
  }
  showLayer(){
    this.fenceLayer.setVisible(true);
  }
  hideLayer(){
    this.fenceLayer.setVisible(false);
  }
  getLayerVisible(){
    this.fenceLayer.getVisible();
  }
  hideFeature(id){
    var theFeature = this.source.getFeatureById(id);
    theFeature.setStyle(this.fenceStyle2);
  }
  showFeature(id,color){
    var theFeature = this.source.getFeatureById(id);
    if(color) {
      let style = this.getFenceStyle(color);
      theFeature.setStyle(style);
    }else {
      theFeature.setStyle(this.fenceStyle);
    }
  }
  removeFeature(id){
    var theFeature = this.source.getFeatureById(id);
    this.source.removeFeature(theFeature);
  }
  setFenceStyle(id,color){
    var theFeature = this.source.getFeatureById(id);
    var style = this.getFenceStyle(color);
    theFeature.setStyle(style);
  }
  getFenceStyle(color){
    var rgba = this.toRgba(color);
    return new Style({
      fill: new Fill({
        color: rgba
      }),
      stroke: new Stroke({
        color: color,
        width: 2
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: color
        })
      })
    })
  }
  toRgba(color,a){
    var r=parseInt(color[1]+color[2],16);
    var g=parseInt(color[3]+color[4],16);
    var b=parseInt(color[5]+color[6],16);
    a = a?a:0.4;
    var rgba = "rgba("+r+","+g+","+b+","+a+")";
    return rgba;
  }
  drawingEnd(evt) {
    let geo = evt.feature.getGeometry()
    let id = parseInt(Math.random()*10000)+"_"+Date.now();
    evt.feature.setId(id);
    console.log("id:"+id);
    evt.feature.setStyle(this.fenceStyle);
    let type = geo.getType(); //获取类型
    // console.log(geo)
    //根据不同的类型执行不同的操作
    const handle = {
      'Circle': () => {
          //获取中心点和半径
          let center = geo.getCenter()
          let radius = geo.getRadius()
          // console.log(center, radius)
      },
      'Polygon': () => {
        //获取坐标点
        let points = geo.getCoordinates()
        // console.log(points)
        this.callback(points,id);
      },
      'LineString': () => {
        let points = geo.getCoordinates()
        // console.log(points)
      }
    }
    if (handle[type]) handle[type]()
    this.closeDraw()
  }
  closeDraw() {
    this.map.removeInteraction(this.draw);
  }
  //画图
  drawingFence(type,callback) {
    this.callback = callback;
    this.draw = new Draw({
      source: this.source, //设置要素源，绘制结束后将绘制的要素添加到临时图层
      type: type, //绘制的类型
    });
    this.map.addInteraction(this.draw);
    const that = this;
    //绘图结束事件回调
    this.draw.on('drawend', function (evt) {
      that.drawingEnd(evt)
    });
  }
  //转换坐标点（多）
  transPoints(points) {
    let arr = points.split(';');
    let point = [];
    arr.forEach(item => {
      let newPoint = item.split(',');
      point.push(newPoint)
    })
    let _points = point.map(item => {
      item = [parseFloat(item[0]), parseFloat(item[1])]
      item = transform(item, 'EPSG:4326', 'EPSG:3857');
      return item;
    })
    return _points;
  }
  //转换圆的
  transPoint(point) {
    let item = point.split(',')
    item = [parseFloat(item[0]), parseFloat(item[1])]
    let _point = transform(item, 'EPSG:4326', 'EPSG:3857');
    return _point;
  }
  /**
   *
   * @param {*} fenceId 围栏id
   * @param {*} center 中心坐标
   * @param {*} radius 半径
   * @param {*} name 围栏名
   */
  showCircle(fenceId, center, radius, name) {

    let centerPoint = this.transPoint(center)
    radius = parseFloat(radius)
    var circleFeature = new Feature({ //路线
      geometry: new geomCircle(centerPoint, radius),
    });
    circleFeature.setId(fenceId)
    //将所有矢量图层添加进去
    this.source.addFeature(circleFeature);
  }
  /**
   *
   * @param {*} fenceId 围栏id
   * @param {*} points 多边形坐标点
   * @param {*} name 围栏名
   */
  showPolygon(fenceId, points, name) {
    let _points = this.transPoints(points)
    _points = [_points]
    //多边形的数据格式是[[[lng,lat],[lng,lat]……]]外围两个中括号
    var polygonFeature = new Feature({ //路线
      geometry: new geomPolygon(_points)

    });
    polygonFeature.setId(fenceId)
    this.source.addFeature(polygonFeature);
    // console.log(this.source.getFeatures())
  }
  toAddFence(fenceId, points,color, name) {
    var theFeature = this.source.getFeatureById(fenceId);
    if(theFeature){
      return;
    }
    let _points = JSON.parse(points);
    // _points = [_points]
    //多边形的数据格式是[[[lng,lat],[lng,lat]……]]外围两个中括号
    var polygonFeature = new Feature({ //路线
      geometry: new geomPolygon(_points)

    });
    // var polygonFeature = new Feature(new geomPolygon(_points));
    let style = this.getFenceStyle(color);
    polygonFeature.setStyle(style);
    polygonFeature.setId(fenceId)
    this.source.addFeature(polygonFeature);
    // console.log(this.source.getFeatures())
  }
  /**
   *
   * @param {*} fenceId 围栏id
   * @param {*} points 线型的点坐标
   * @param {*} name 围栏名字
   */
  showPolyline(fenceId, points, name) {

    let _points = this.transPoints(points)
    var lineFeature = new Feature({ //路线
      geometry: new geomLineString(_points, 'XY'),
    });
    lineFeature.setId(fenceId)

    //将所有矢量图层添加进去
    this.source.addFeature(lineFeature);
  }
  //回显围栏
  showFence(obj) {
    let {
      fenceId,
      name,
      type,
      center,
      radius,
      points
    } = obj;
    if (type == 'polygon') {
      this.showPolygon(fenceId, points, name)
    }
    if (type == 'circle') {
      this.showCircle(fenceId, center, radius, name)
    }
    if (type == 'polyline') this.showPolyline(fenceId, points, name)
  }
}

// module.export.drawFence = drawFence;
export default drawFence;
