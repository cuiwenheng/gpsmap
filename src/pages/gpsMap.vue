<template>
  <div id="father">
    <div id="map" class="map" style=""></div>

    <div class="mapbt" @click="changeMap">
      <div v-if="onemap"><span class="">地图</span></div>
      <div v-if="!onemap"><span class="">影像</span></div>
    </div>
    <div id="right-top">
      <div id="mytool">
        <div class="toolflex fengexian" v-on:click="changeBiaoQianFlag"  v-bind:class="{'colorFlag':biaoQianFlag}">
          <div class="spanimg" v-bind:class="{'hideFlag':!biaoQianFlag}">
            <img class="toolimg" :src="require('../assets/biaoqian32.png')">
          </div>
          <div class="spanimg" v-bind:class="{'hideFlag':biaoQianFlag}">
            <img class="toolimg" :src="require('../assets/biaoqian32_gray.png')">
          </div>
          <div class="spantext">标签</div>
        </div>
        <div class="toolflex fengexian"  v-on:click="changeWeiLanFlag" v-bind:class="{'colorFlag':weiLanFlag}">
          <div class="spanimg" v-bind:class="{'hideFlag':!weiLanFlag}">
            <img class="toolimg" :src="require('../assets/fence32.png')">
          </div>
          <div class="spanimg" v-bind:class="{'hideFlag':weiLanFlag}">
            <img class="toolimg" :src="require('../assets/fence32_gray.png')">
          </div>
          <div class="spantext">围栏</div>
        </div>
        <div class="toolflex fengexian" @click="drawingPolygonFence" v-bind:class="{'colorFlag':huaWeiLanFlag}">
          <div class="spanimg" v-bind:class="{'hideFlag':!huaWeiLanFlag}">
            <img class="toolimg" :src="require('../assets/draw32.png')">
          </div>
          <div class="spanimg" v-bind:class="{'hideFlag':huaWeiLanFlag}">
            <img class="toolimg" :src="require('../assets/draw32_gray.png')">
          </div>
          <div class="spantext">画围栏</div>
        </div>
        <div class="toolflex"  v-on:click="measureDis" v-bind:class="{'colorFlag':measureDisFlag}">
          <div class="spanimg" v-bind:class="{'hideFlag':!measureDisFlag}">
            <img class="toolimg" :src="require('../assets/measure32.png')">
          </div>
          <div class="spanimg" v-bind:class="{'hideFlag':measureDisFlag}">
            <img class="toolimg" :src="require('../assets/measure32_gray.png')">
          </div>
          <div class="spantext">测量</div>
        </div>
      </div>
      <div class="jianxi"></div>
      <tag-list v-bind:class="{'hideFlag':!biaoQianFlag}" ref="comTag"></tag-list>
      <fence-list v-bind:class="{'hideFlag':!weiLanFlag}" ref="comFenceList" :drawFence="drawFence"></fence-list>
    </div>
    <fence-form  v-bind:class="{'hideFlag':!fenceFormFlag}" ref="comFenceForm" :drawFence="drawFence" @hideFenceForm="hideFenceForm"></fence-form>
    <div id="popup" class="tagOverlayInfo">
      <ul>
        <li class="code">编号：</li>
        <li class="alias">别名：</li>
        <li class="batteryPercent">电量：</li>
      </ul>
    </div>
  </div>
</template>
<script>
import {defaults as defaultControls, ZoomToExtent,FullScreen,MousePosition,OverviewMap,ScaleLine,ZoomSlider} from 'ol/control'
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js'
import VectorSource from 'ol/source/Vector.js'
import XYZ from  'ol/source/XYZ.js'
import {addProjection, addCoordinateTransforms, transform} from 'ol/proj.js'
import drawFence from '../lib/drawfence.js'
import Measure from '../lib/measure.js'
import drawTag from '../lib/drawTag.js'
import websocket from '../lib/websocket.js'
import api from '../request/api/index.js'
import 'ol/ol.css';
import TagList from "../components/tagList.vue";
import FenceList from "../components/fenceList.vue";
import FenceForm from "../components/fenceForm.vue";

export default {
  name: 'gpsMap',
  components: {
    FenceForm,
    FenceList,
    TagList
  },
  data () {
    return {
//      ajaxHost: "http://127.0.0.1:8082",
//      api_token:"projAdmin_b935280d0262efa69c83f63c3f7e433ccc34700e",
//      userData:true,
//      websocketUrl:'ws://127.0.0.1:8093/websocket?',
      //上面是测试 下面是生产
//      ajaxHost: "http://"+location.host+":8082",
      api_token:localStorage.getItem('api_token'),
      userData:localStorage.getItem('userData'),
      websocketUrl:"ws://gps.ubitraq.com:8093/websocket?",
//      //-------
      host: location.host,
      onemap:true,
      map: null,
      layera1:null,
      layera2:null,
      layerb1:null,
      layerb2:null,
      taglayer: null,
      tagInfoOverlay:null,
      websocket:null,
      projectId:null,
      projectCode:null,
      onLineTags:{},
      fenceFormData:{},
      tagShowObj:{},
      drawFence:null,
      Measure:null,
      drawTag:null,
      biaoQianFlag:false,
      weiLanFlag:false,
      huaWeiLanFlag:false,
      measureDisFlag:false,
      fenceFormFlag:false,

      loadedTagCat:false,
      loadedFtype:false,
    }
  },
  mounted () {
    this.checkSession(this.intPage);
  },
  methods: {
    //循环判断标签是否在线。
    isTagsOnline(){
      var that = this;
      window.setInterval(function () {
        var nowTime = Date.now();
        for(var code in that.onLineTags){
          if(nowTime - that.onLineTags[code].lastTime>600000){
            that.delTagFeatrue(code);
            delete that.onLineTags[code];
          }
        }
      },60000);
    },
    hideFenceForm(){
      this.fenceFormFlag=false;
    },
    getTheTag(id){
      return this.$refs.comTag.getTheTag(id);
    },
    delTagFeatrue(code){
      this.drawTag.delTagFeatrue(code);
    },
    //操作事件
    changeBiaoQianFlag(){
      this.weiLanFlag = false;
      this.biaoQianFlag = !this.biaoQianFlag;
    },
    changeWeiLanFlag(){
      this.biaoQianFlag = false;
      this.weiLanFlag = !this.weiLanFlag;
    },
    measureDis(){
      this.biaoQianFlag = false;
      this.weiLanFlag = false;
      this.measureDisFlag = !this.measureDisFlag;
      if(this.measureDisFlag) {
        this.Measure.addInteraction();
      }else {
        this.Measure.closeMeasure();
        this.Measure.rmMeasures();
      }
    },
    //地图相关事件
    drawingPolygonFence(){
      this.biaoQianFlag = false;
      this.weiLanFlag = false;
      this.huaWeiLanFlag = !this.huaWeiLanFlag;
      if(this.huaWeiLanFlag) {
        if(!this.drawFence.getLayerVisible()){
          this.drawFence.showLayer();
        }
        this.drawFence.drawingFence('Polygon',this.dealDrawEnd);
      }else {
        this.cancelDraw();
      }
    },
    dealDrawEnd(points,id){
      this.huaWeiLanFlag = !this.huaWeiLanFlag;
      this.fenceFormFlag = !this.fenceFormFlag;
      this.$refs.comFenceForm.drawEndFence(points,id);
    },
    cancelDraw(){
      this.drawFence.closeDraw();
    },


    checkSession:function (callback) {
      var that =this;
      var loginUrl = "http://"+this.host+"/login/index.html";
      if(!this.userData){
        location.href = loginUrl;
      }else{
        api.checkTokenApi.check({api_token:this.api_token}).then(function (reps) {
          if(reps.data&&reps.data.projectId!==undefined){
            that.projectId = reps.data.projectId;
            that.projectCode = reps.data.projectCode || "";
            if(callback) {
              callback();
            }
          }else{
            location.href = loginUrl;
          }
        }, function (err) {
          console.log(err);
        });
      }
    },
    intPage:function () {
      this.$refs.comTag.getProjectTag();
      this.$refs.comFenceList.getProjectTagCat();
      this.$refs.comFenceList.getProjectFenceType();
      this.loadMap();
    },


    loadMap:function () {
      var that = this;
      that.changeWebsocketUrl("projectCode="+this.projectCode);
//      that.changeWebsocketUrl("projID="+1);
//      that.changeWebsocketUrl("projectCode="+this.projectCode);
      that.taglayer = new VectorLayer({
        source: new VectorSource()
      });
//      that.tagInfoOverlay = that.createOverlay();
      that.layera1 = new TileLayer({
        visible: true,
        source: new XYZ({
          url: 'http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=7299bea1003c3d205305217f150816f2'
        })
      });
      that.layera2 = new TileLayer({
        visible: true,
        source: new XYZ({
          url: 'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=7299bea1003c3d205305217f150816f2'
        })
      });
      that.layerb1 = new TileLayer({
        visible: false,
        source: new XYZ({
          url: 'http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=7299bea1003c3d205305217f150816f2'
        })
      });
      that.layerb2 = new TileLayer({
        visible: false,
        source: new XYZ({
          url: 'http://t0.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=7299bea1003c3d205305217f150816f2'
        })
      });
      that.map = new Map({
        controls: defaultControls().extend([
          new FullScreen(),
//          new MousePosition(),
//          new OverviewMap(),
          new ScaleLine(),
//          new ZoomSlider(),
//          new ZoomToExtent()
        ]),
        layers: [
          that.layera1,
          that.layera2,
          that.layerb1,
          that.layerb2,
          that.taglayer
        ],
        target: document.getElementById('map'),
        view: new View({
          center: transform([116.40, 39.90], "EPSG:4326", "EPSG:3857"),
          zoom: 14,
          minZoom: 3,
          maxZoom: 18
        })
      });
//      that.map.addControl(new ZoomSlider());
      that.mapListen();
      that.drawFence = new drawFence(that.map);
      that.Measure = new Measure(that.map);
      that.drawTag = new drawTag({
        map:that.map,
        taglayer:that.taglayer,
        tagInfoOverlayId:'popup',
        getTheTag:that.getTheTag
      });
    },
    changeMap(){
      this.onemap = !this.onemap;
      if(this.onemap){
        this.layerb1.setVisible(false);
        this.layerb2.setVisible(false);
        this.layera1.setVisible(true);
        this.layera2.setVisible(true);
      }else{
        this.layera1.setVisible(false);
        this.layera2.setVisible(false);
        this.layerb1.setVisible(true);
        this.layerb2.setVisible(true);
      }
    },
    mapListen:function () {
      var that = this;
      // 监听地图层级变化
      that.map.getView().on('change:resolution', function(){

      });
      //鼠标移动
      that.map.on('pointermove', function(e) {
        that.drawTag.pointerMoveHandler(e);
      });
    },

    changeWebsocketUrl:function (params) {
//      this.websocketUrl="ws://127.0.0.1:8093/websocket?projID=141&tagID=00001ed3";
//      this.websocketUrl="ws://127.0.0.1:8093/websocket?projID=141";
      this.websocketUrl=this.websocketUrl+params;
//      this.websocketUrl="ws://gps.ubitraq.com:8093/websocket?"+params;
    },
    dealWsData:function (tag) {
//      var that = this;
       if(tag.code && tag.longitude && tag.latitude && tag.battery) {
         if (this.$refs.comTag.tagShowObj[tag.code] && this.$refs.comTag.tagShowObj[tag.code].toHide) {
           return;
         }
         this.onLineTags[tag.code] = {
           lastTime: Date.now()
         };
         this.drawTag.setTagPosition(tag);
       }
    }

  },
  watch:{
    websocketUrl:function (newurl,oldurl) {
      var that = this;
      if(this.websocket){
        if(this.websocket.timeId){
          clearTimeout(this.websocket.timeId);
        }
        this.websocket.closeWebSocket();
        this.websocket=null;
      }else{
        this.websocket = new websocket({websocketUrl:newurl,callback:that.dealWsData});
      }
    },

    biaoQianFlag:function (newVal) {
      if(newVal){
        this.$nextTick(() => {
          this.$refs.comTag.isTagSelect(this.$refs.comTag.tagList);
        })
      }
    },
    weiLanFlag:function (newVal) {
      if(newVal){
        this.$nextTick(() => {
          this.$refs.comFenceList.isFenceSelect(this.$refs.comFenceList.showFenceList);
        })
      }
    },

  }
}

</script>
<style>
  #map{
    height:100vh;
    width:100%;
    overflow: hidden;
  }
  #father{
    position: relative;
  }
  .tagOverlayInfo{
    background: rgba(0,0,0,0.5);
    color: #ebebeb;
    font-size: 12px;
    border-radius: 8px;
    border: none;
  }
  .tagOverlayInfo ul{
    list-style-type:none;
    padding-inline-start:5px;
  }
  #popup ul{
    padding:5px 10px;
  }
  #popup ul li{
    text-align: left;
  }
  #right-top {
    z-index: 4;
    position: absolute;
    top: 10px;
    right: 40px;
    background-color: rgba(255,255,255,0);
    width: 360px;
  }
  #mytool{
    height:42px;
    display:flex;
    border-radius:3px;
    background: #fff;
  }
  #mytool .toolflex{
    flex:1;
    margin-top:9px;
    height:24px;
    display: flex;
    justify-content:center;
    cursor:pointer;
    color: #666;
  }
  #mytool .toolflex.colorFlag{
    color:dodgerblue;
  }
  .toolflex .spanimg{
    width: 24px;
    height: 24px;
    /*padding: 5px 3px 3px 5px;*/
    padding: 0px 3px 0px 5px;
  }

  .toolflex .toolimg{
    width: 24px;
    height: 24px;
  }
  .toolflex .spantext{
    padding: 0px 5px 0px 0px;
    height: 24px;
    line-height: 24px;
    font-size: 14px;
    cursor: pointer;
  }
  #mytool .toolflex:hover{
    color:dodgerblue;
  }
  .toolflex.fengexian{
    border-right: 1px dashed gray ;
  }
  #right-top .jianxi{
    height: 5px;
  }
  #right-top .biaoqiancontent{
    position: relative;

    background-color: #ffffff;

    border-radius:3px;
    width:360px;
    min-height:200px;
    max-height: 600px;
  }

  #right-top .biaoqiancontent .tagcontent{
    /*position: absolute;*/
    /*top:42px;*/
    /*overflow: auto;*/

    /*overflow-x:hidden ;*/
  }
  #right-top .weilancontent{
    min-height:200px;
    max-height: 600px;
    background-color: #ffffff;
    border-radius:3px;
    overflow: auto;
  }
  .hideFlag{
    display:none;
  }
  #fenceForm{
    z-index: 8;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    background-color: rgba(255,255,255,1);
    width: 360px;
    padding: 25px 25px 5px 5px;
    border-radius: 5px;
    /*display: none;*/
  }
  #fenceForm .el-button{
    padding: 5px 10px;
  }
  #fenceForm .closePng{
    position: absolute;
    top: 5px;
    right: 6px;
    width: 12px;
    height: 12px;
    /*background: url(//webmap1.bdimg.com/wolfman/static/common/images/popup_close_15d2283.gif) no-repeat;*/
    border: 0;
    cursor: pointer;
    padding: 0;
  }
  #fenceForm .closePng img{
    width: 12px;
    height: 12px;
  }
  #tool-container {
    float: right;
    margin-right: 6px;
  }
  .mapbt{
    position: fixed;
    border: none;
    cursor: pointer;
    color:white;
    font-size: 12px;
    font-weight: bold;
    line-height: 28px;
    text-align: center;
    box-shadow: 3px 3px 6px rgba(0,0,0,.3);
    width: 33px;
    height: 28px;
    z-index: 3;
    bottom: 80px;
    right: 10px;
    /*background-color: white;*/
    background-color:rgba(0,60,136,0.5);
    border-radius: 5px;
  }
  .ol-tooltip {
    position: relative;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    color: white;
    padding: 4px 8px;
    opacity: 0.7;
    white-space: nowrap;
    font-size: 12px;
  }
  .ol-tooltip-measure {
    opacity: 1;
    font-weight: bold;
  }
  .ol-tooltip-static {
    background-color: #ffcc33;
    color: black;
    border: 1px solid white;
  }
  .ol-tooltip-measure:before,
  .ol-tooltip-static:before {
    border-top: 6px solid rgba(0, 0, 0, 0.5);
    border-right: 6px solid transparent;
    border-left: 6px solid transparent;
    content: "";
    position: absolute;
    bottom: -6px;
    margin-left: -7px;
    left: 50%;
  }
  .ol-tooltip-static:before {
    border-top-color: #ffcc33;
  }
</style>
 
