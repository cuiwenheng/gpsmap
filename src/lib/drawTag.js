
import Feature from 'ol/Feature.js'
import Point from 'ol/geom/Point.js'
import {Icon, Style,Text,Fill,Stroke} from 'ol/style.js'
import {transform} from 'ol/proj.js'
import Overlay from 'ol/Overlay.js'
class drawTag {
  constructor(props) {
    this.map = props.map;
    this.tagInfoOverlayId = props.tagInfoOverlayId;
    this.taglayer = props.taglayer;
    this.getTheTag = props.getTheTag;
    this.tagInfoOverlay = null;
    this.tagImg = null;
    //样式
    this.init()
  }
  init() {
    var that = this;
    that.tagInfoOverlay = that.createOverlay(that.tagInfoOverlayId);
    that.tagImg = that.createTagImg();
  }
  pointerMoveHandler(e){
    var that =this
    if( that.map.hasFeatureAtPixel(e.pixel)) {
      that.map.forEachFeatureAtPixel(e.pixel, function (f) {
        var fId = f.getId() || '';
        if(fId && fId.indexOf("tag_")!=-1) {
          if (that.map.getOverlayById(that.tagInfoOverlayId)) {

            that.tagInfoOverlay.setPosition(e.coordinate);
          } else {
//                var fId = f.getId() || '';

            var featureId = f.getId().replace("tag_", "").replace("PW_", "");
            var theTag = that.getTheTag(featureId);
            var code = "";
            var alias = "";
            var batteryPercent = "";
            if (theTag) {
              code = theTag.code || '';
              alias = theTag.alias || '';
              batteryPercent = theTag.batteryPercent + "%" || '';
            }
            that.tagInfoOverlay.getElement().getElementsByClassName('code')[0].innerText = "编号：" + code;
            that.tagInfoOverlay.getElement().getElementsByClassName('alias')[0].innerText = "别名：" + alias;
            that.tagInfoOverlay.getElement().getElementsByClassName('batteryPercent')[0].innerText = "电量：" + batteryPercent;
            that.tagInfoOverlay.setPosition(e.coordinate);
            that.map.addOverlay(that.tagInfoOverlay);

          }
        }else{
          that.map.removeOverlay(that.tagInfoOverlay);
        }
      });
    }else{
      that.map.removeOverlay(that.tagInfoOverlay);
    }
  }
  createTagImg(){
    return new Icon({
      src:require('../assets/weizhi.png'),
      anchor: [0.5, 0.96],
      scale:0.2
    });
  }
  createTagStyle(tag){
    var that =this;
    return new Style({
      image:that.tagImg ,
      text: new Text({
        text: tag.code,
        fill: new Fill({
          color: 'red'
        }),
        stroke: new Stroke({ //边界样式
          color: '#319FD3',
          width: 3
        }),
        offsetY:-50
      })
    })
  }
  setTagPosition(tag) {
    var id = 'tag_'+tag.code;
    var tagFeatrue = this.taglayer.getSource().getFeatureById(id);
    if(!tagFeatrue){
      var geom = this.createTagGeometry(tag);
      tagFeatrue = this.createTagFeature(tag,geom);
      var powerFeature = this.createPowerFeature(tag,geom);
      this.taglayer.getSource().addFeature(tagFeatrue);
      this.taglayer.getSource().addFeature(powerFeature);
      this.setPowerStyle(tag);
    }else{
      var coordinate = this.transformPosition(tag);
      tagFeatrue.getGeometry().setCoordinates(coordinate);
      this.setPowerStyle(tag);
    }
  }
  createTagGeometry(tag) {
    var coordinate = this.transformPosition(tag);
    var geom = new Point(coordinate);
    return geom;
  }
  createPowerFeature(tag,geom) {
    var powerFeature = new Feature({
      geometry: geom
    });
    var id = 'tag_PW_'+tag.code;
    powerFeature.setId(id);
    return powerFeature;
  }
  setPowerStyle(tag) {
    var id = 'tag_PW_'+tag.code;
    var powerFeatrue = this.taglayer.getSource().getFeatureById(id);
    var style = this.createStyle(tag);
    powerFeatrue.setStyle(style);
  }
  createStyle(tag) {
    var img = this.drawImg(tag);
    return new Style({
      image: new Icon({
//          src:this.drawImg(),
        img:img,
        imgSize: img ? [img.width, img.height] : undefined,
        anchor: [0.5, 14],
        scale:0.45
      }),
    });
  }
  createTagFeature(tag,geom) {
    var that = this;
    var tagFeature = new Feature({
      geometry: geom
    });
    var id = 'tag_'+tag.code;
    tagFeature.setId(id);
    tagFeature.setStyle(that.createTagStyle(tag));
    return tagFeature;
  }
  createOverlay() {
    var that = this;
    var popup = document.getElementById(that.tagInfoOverlayId);
    var overlay = new Overlay({
      id:that.tagInfoOverlayId,
      element: popup,
      autoPan: false,
      autoPanAnimation: {
        duration: 250
      }
    });
    return overlay;
  }
  drawImg(tag){
//      var id = 'tag_'+tag.code;
    var theTag = this.getTheTag(tag.code);
    if(theTag){
      // theTag.batteryPercent = tag.battery * 100 /theTag.maxPower;
      // theTag.batteryPercent = theTag.batteryPercent.toFixed(2);
      theTag.batteryPercent = this.getPowerLevel(tag.battery);
      var stylePw1 = "rgba(76,217,108,0.4)";
      var stylePw2 = "rgba(76,217,108,1)";
      if(theTag.batteryPercent<30){
        stylePw1 = "rgba(235,51,36,0.4)";
        stylePw2 = "rgba(235,51,36,1)";
      }else if(theTag.batteryPercent<70){
        stylePw1 = "rgba(247,205,70,0.4)";
        stylePw2 = "rgba(247,205,70,1)";
      }else{
        stylePw1 = "rgba(76,217,108,0.4)";
        stylePw2 = "rgba(76,217,108,1)";
      }
    }
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 10;
    context.beginPath()
    context.rect(0,0,100,10);
    context.fillStyle = stylePw1;
    context.fill();
    context.closePath()
    context.beginPath()
    if(theTag) {
      var len = theTag.batteryPercent > 100 ? 100 : theTag.batteryPercent;
      context.rect(0, 0, len , 10);
    }else{
      context.rect(0, 0, 100, 10);
    }
    context.fillStyle = stylePw2;
    context.fill();
    context.closePath()
    return canvas;
  }
  transformPosition(tag) {
    var coordinate = transform([tag.longitude*1/10000000, tag.latitude*1/10000000], "EPSG:4326", "EPSG:3857");
    return coordinate;
  }
  delTagFeatrue(mac){
    var id = 'tag_'+mac;
    var tagFeatrue = this.taglayer.getSource().getFeatureById(id);
    if(tagFeatrue){
      this.taglayer.getSource().removeFeature(tagFeatrue);
      var pwId = 'tag_'+"PW_"+mac;
      var tagPwFeatrue = this.taglayer.getSource().getFeatureById(pwId);
      if(tagPwFeatrue){
        this.taglayer.getSource().removeFeature(tagPwFeatrue);
      }
    }
  }
  getPowerLevel(power) {
    if (!power) {
      // console.log('getPower: ', msg.mac, 'power='+power);
      return 92;
    }
    var PowerSch = [
      { v: 4200, l: 100 },
      { v: 4080, l: 90 },
      { v: 4000, l: 80 },
      { v: 3930, l: 70 },
      { v: 3870, l: 60 },
      { v: 3820, l: 50 },
      { v: 3790, l: 40 },
      { v: 3770, l: 30 },
      { v: 3730, l: 20 },
      { v: 3700, l: 15 },
      { v: 3680, l: 10 },
      { v: 3500, l: 5 },
      { v: 2500, l: 1 },
    ];
    //msg.power = pos.power/42
    if (power >= PowerSch[0].v) return PowerSch[0].l;

    var len = PowerSch.length;
    if (power < PowerSch[len - 1].v) return PowerSch[len - 1].l;

    for (var i = 0, j; i < len - 1; i++) {
      j = i + 1;
      if (power < PowerSch[i].v && power >= PowerSch[j].v) {
        return PowerSch[i].l;
      }
    }
  }
}
export default drawTag;
