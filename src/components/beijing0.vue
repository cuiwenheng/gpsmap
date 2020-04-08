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
      <div class="biaoqiancontent" v-bind:class="{'hideFlag':!biaoQianFlag}">
      <!--<div class="biaoqiancontent" v-if="biaoQianFlag">-->
        <div>
          <el-input
            v-model="search"
            size=""
            placeholder="输入关键字搜索">
          </el-input>
        </div>
        <div class="tagcontent">
          <template>
            <el-table
            ref="multipleTable"
            :data="tagList.filter(data => !search || ((data.mac||'').toLowerCase().includes(search.toLowerCase())||(data.alias||'').toLowerCase().includes(search.toLowerCase())))"
            tooltip-effect="dark"
            style="width: 100%"
            @select="toSelectTag"
            @select-all="toSelectAllTag"
            max-height="600">
              <!--@selection-change="handleSelectionChange"-->
              <el-table-column
                type="selection"
                :selectable="tagSelectable"
                width="55">
              </el-table-column>
              <el-table-column
                prop="mac"
                label="mac"
                width="120">
              </el-table-column>
              <el-table-column
                prop="alias"
                label="别名"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="power"
                label="电量"
                show-overflow-tooltip>
              </el-table-column>
              <!--<el-table-column-->
                <!--prop=""-->
                <!--label="在线"-->
                <!--show-overflow-tooltip>-->
              <!--</el-table-column>-->
            </el-table>
          </template>
        </div>
      </div>
      <div class="weilancontent" v-bind:class="{'hideFlag':!weiLanFlag}">
        <template>
          <el-table
            ref="multipleFenceTable"
            :data="showFenceList.filter(data => !search || ((data.cname||'').toLowerCase().includes(search.toLowerCase())))"
            tooltip-effect="dark"
            style="width: 100%"
            @select="toSelectFence"
            @select-all="toSelectAllFence"
            max-height="600">
            <!--:selectable="fenceSelectable"-->
            <!--@selection-change="handleFenceSelectionChange"-->
            <el-table-column
              type="selection"


              width="55">
            </el-table-column>
            <el-table-column
              prop="cname"
              label="名称"
              width="120">
            </el-table-column>
            <el-table-column
              prop="ftypeIdName"
              label="类型"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="trifName"
              label="触发"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="tagCatName"
              label="标签组"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="siren"
              label="报警器"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="Email"
              label="邮箱"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="fenceDesc"
              label="描述"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="isActiveName"
              label="激活"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              fixed="right"
              label="操作"
              width="50">
              <template slot-scope="scope">
                <el-button
                  @click.native.prevent="deleteRow(scope.$index, scope.row, showFenceList)"
                  type="text"
                  size="small">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </div>
    <div id="fenceForm"  v-bind:class="{'hideFlag':!fenceFormFlag}">
      <span class="closePng" @click="hideFenceForm"><img :src="require('../assets/popup_close.png')"></span>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px" class="demo-ruleForm">
        <el-form-item label="名 称" prop="cname">
          <el-input v-model="ruleForm.cname"></el-input>
        </el-form-item>
        <el-form-item label="类 型" prop="ftypeId" label-width="80px">
          <el-select v-model="ruleForm.ftypeId" placeholder="请选择类型"  style="width: 100%;">
            <el-option v-for="(item, i) in fenceTypeList" :label="item.cname" :value="item.id" :key="i" v-bind:style="{ color: item.color}"></el-option>
            <!--<el-option label="危险区" value="1"></el-option>-->
            <!--<el-option label="警告区" value="2"></el-option>-->
            <!--<el-option label="通知区" value="3"></el-option>-->
            <!--<el-option label="特定区" value="6"></el-option>-->
          </el-select>
        </el-form-item>
        <el-form-item label="触 发" prop="trif" label-width="80px">
          <el-select v-model="ruleForm.trif" placeholder="请选择触发条件"  style="width: 100%;">
            <el-option label="进入触发" value="i"></el-option>
            <el-option label="出去触发" value="o"></el-option>
            <el-option label="进出触发" value="io"></el-option>
            <el-option label="内部触发" value="in"></el-option>
            <el-option label="外部触发" value="out"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="间 隔" prop="tipInterval" v-show="ruleForm.tipIntervalFlag">
          <el-input v-model="ruleForm.tipInterval"></el-input>
        </el-form-item>
        <el-form-item label="标签组" prop="tagCat" label-width="80px">
          <el-select v-model="ruleForm.tagCat" placeholder="请选择标签组" multiple  style="width: 100%;">
            <el-option v-for="(item, i) in tagCatList" :label="item.cname" :value="item.id" :key="i" v-bind:style="{ color: item.color}"></el-option>
            <!--<el-option label="蓝组" value="1"></el-option>-->
            <!--<el-option label="橙组" value="2"></el-option>-->
            <!--<el-option label="黄组" value="3"></el-option>-->
            <!--<el-option label="绿组" value="4"></el-option>-->
          </el-select>
        </el-form-item>
        <el-form-item label="报警器" prop="siren">
          <el-input v-model="ruleForm.siren"></el-input>
        </el-form-item>
        <el-form-item label="邮 箱" prop="Email">
          <el-input v-model="ruleForm.Email"></el-input>
        </el-form-item>
        <el-form-item label="描 述" prop="fenceDesc">
          <el-input v-model="ruleForm.fenceDesc"></el-input>
        </el-form-item>
        <el-form-item label="激 活" prop="isActive">
          <el-radio-group v-model="ruleForm.isActive">
            <el-radio label="是"></el-radio>
            <el-radio label="否"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item style="margin-right: 60px;">
          <el-button type="primary" @click="submitForm('ruleForm')">确定</el-button>
          <el-button @click="hideFenceForm">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
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
import Feature from 'ol/Feature.js'
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import Point from 'ol/geom/Point.js'
import Select from 'ol/interaction/Select.js'
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js'
import Stamen from 'ol/source/Stamen.js'
import VectorSource from 'ol/source/Vector.js'
import {Icon, Style,Text,Fill,Stroke} from 'ol/style.js'
import XYZ from  'ol/source/XYZ.js'
import {addProjection, addCoordinateTransforms, transform} from 'ol/proj.js'
import Overlay from 'ol/Overlay.js'
import {fromLonLat} from 'ol/proj';
import drawFence from '../lib/drawfence.js'
import Measure from '../lib/measure.js'
import 'ol/ol.css';

export default {
  name: 'beijing0',
  data () {
//    //表单验证
//    var checkTipInterval = (rule, value, callback) => {
//      var reg = /^[0-9]*$/;
//      if(reg.test(value)){
//        if(value<10){
//          callback(new Error('请输入大于10的数字'))
//        }
//      }else{
//        callback(new Error('请输入大于10的数字'))
//      }
//    };
//    var checkEmail = (rule, value, callback) => {
//      var reg = /^[0-9]*$/;
//      if(reg.test(value)){
//        if(value<10){
//          callback(new Error('请输入大于10的数字'))
//        }
//      }else{
//        callback(new Error('请输入大于10的数字'))
//      }
//    };
    return {
//      ajaxHost: "http://127.0.0.1:8082",
//      api_token:'projAdmin_efbee6b55a144edcd164d4830909d06d5f85c3b1',
//      userData:true,
//      websocketUrl:'ws://127.0.0.1:8093/websocket?',
      //上面是测试 下面是生产
      ajaxHost: "http://"+location.host+":8082",
      api_token:localStorage.getItem('api_token'),
      userData:localStorage.getItem('userData'),
      websocketUrl:"ws://gps.ubitraq.com:8093/websocket?",
      //-------
      host: location.host,
      logined:false,
      onemap:true,
      map: null,
      layera1:null,
      layera2:null,
      layerb1:null,
      layerb2:null,
      timeDifference:0,
      taglayer: null,
//      websocketUrl:'',
      tagInfoOverlay:null,
      hoverFeature:{},
      websocket:undefined,
      projectId:null,
      projectCode:null,
      tagLastTime:{},
      tagList:[],
      tagCatList:[],
      fenceTypeList:[],
      fenceList:[],
      showFenceList:[],
      multipleSelection: [],
      multipleFenceSelection:[],
      tagShowObj:{},
      fenceShowObj:{},
      initFenceFirst:true,
      timeId:null,
      search:'',
      drawFence:null,
      Measure:null,
      biaoQianFlag:false,
      weiLanFlag:false,
      huaWeiLanFlag:false,
      measureDisFlag:false,
      fenceFormFlag:false,
//      isToGetFenceFlag:false,
      loadedTagCat:false,
      loadedFtype:false,
      ruleForm: {
        cname: '',
        ftypeId: '',
        trif: 'i',
        tipInterval: '60',
        tagCat: '',
        fenceDesc: '',
        isActive: '是',
        siren:'',
        Email:'',
        points:'',
        fenceGenerId:'',
        tipIntervalFlag:false,
      },
      rules: {
        cname: [
          { required: true, message: '请输入名称', trigger: 'blur' },
//          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        ftypeId: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        trif: [
          { required: true, message: '请选择触发类型', trigger: 'change' }
        ],
//        tipInterval: [
////          { required: false, message: '60秒', trigger: 'blur' }
//          { validator: checkTipInterval, trigger: 'blur' }
//        ],
//        date1: [
//          { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
//        ],
//        date2: [
//          { type: 'date', required: true, message: '请选择时间', trigger: 'change' }
//        ],
//
//        resource: [
//          { required: true, message: '请选择活动资源', trigger: 'change' }
//        ],
//        describe: [
//          { required: true, message: '请填写描述', trigger: 'blur' }
//        ]
      }
    }
  },
  http:{
    headers: {
      api_token: this.api_token
    }
  },
  mounted () {
    this.checkSession(this.intPage);
//    Window.myvue = this;
//    this.isTagsOnline()
//    this.loadMap();
  },
  methods: {
    //循环判断标签是否在线。
    isTagsOnline(){
      var that = this;
      window.setInterval(function () {
        var nowTime = Date.now();
        for(var code in that.tagLastTime){
          if(that.tagLastTime[code].isOnline && nowTime - that.tagLastTime[code].lastTime>600000){
            that.tagLastTime[code].isOnline = false;
            that.delTagFeatrue(code);
          }
        }
      },300000);
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
//          alert('submit!');
          var fenceObj={
            cname: this.ruleForm.cname,
            ftypeId: this.ruleForm.ftypeId,
            trif: this.ruleForm.trif,
            tipInterval: this.ruleForm.tipInterval,
            tagCat: JSON.stringify(this.ruleForm.tagCat),
            fenceDesc: this.ruleForm.fenceDesc,
            isActive: this.ruleForm.isActive,
            points:this.ruleForm.points,
            siren:this.ruleForm.siren,
            Email:this.ruleForm.Email,
            fenceGenerId:this.ruleForm.fenceGenerId
          };
          this.saveFence(fenceObj);
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(){
      this.ruleForm.cname= '';
      this.ruleForm.ftypeId= '';
      this.ruleForm.trif= 'i';
      this.ruleForm.tipInterval= '60';
      this.ruleForm.tagCat= '';
      this.ruleForm.fenceDesc= '';
      this.ruleForm.siren= '';
      this.ruleForm.Email= '';
      this.ruleForm.isActive= '是';
      this.ruleForm.points= '';
      this.ruleForm.fenceGenerId= '';
      this.ruleForm.tipIntervalFlag= false
    },
    saveFence(fenceObj){
      var ajaxUrl = this.ajaxHost+"/gpsfence/save"
      this.$http.headers.common.api_token = this.api_token;
      fenceObj.api_token = this.api_token;
      this.$http.post(ajaxUrl,fenceObj,{emulateJSON: true}).then(function (reps) {
//        console.log(reps);
        if(reps.body&&reps.body.isOk){
//          this.$http.headers.common.api_token = this.api_token;
//          this.projectId = reps.body.projectId;
//          this.projectCode = reps.body.projectCode || "";
//          callback();
//          alert('ok');
//          console.log(reps.body);
          this.fenceShowObj[reps.body.id]={
            toShow:true
          };
          var color = this.getFenceColor(this.ruleForm.ftypeId);
          this.drawFence.setFenceStyle(this.ruleForm.fenceGenerId,color);
          this.hideFenceForm('ok');
          this.getGpsFences();
        }else{
//            location.href = loginUrl;
          alert('失败')
        }
      }, function (err) {
        console.log(err);
        alert('失败')
      });
    },

    getFenceColor(ftypeId){
      for(var i=0;i<this.fenceTypeList.length;i++){
        if(ftypeId == this.fenceTypeList[i].id){
          return this.fenceTypeList[i].color;
        }
      }
    },

    deleteRow(index, row,rows){
      var id = rows[index].id;
      var ajaxUrl = this.ajaxHost+"/gpsfence/del"
      this.$http.headers.common.api_token = this.api_token;
      var theFence ={
        api_token:this.api_token,
        id:id
      }
//      console.log(rows[index],row);
      this.$http.post(ajaxUrl,theFence,{emulateJSON: true}).then(function (reps) {
//        console.log(reps);
        if(reps.body&&reps.body.isOk){
//          this.$http.headers.common.api_token = this.api_token;
//          this.projectId = reps.body.projectId;
//          this.projectCode = reps.body.projectCode || "";
//          callback();
//          alert('ok');
//          console.log(reps.body);
          delete this.fenceShowObj[reps.body.id];
//          this.hideFenceForm('ok');
          this.drawFence.removeFeature(rows[index].fenceGenerId);
          rows.splice(index, 1);
          this.getGpsFences();
        }else{
//            location.href = loginUrl;
          alert('失败')
        }
      }, function (err) {
        console.log(err);
        alert('失败')
      });
    },
    hideFenceForm(msg){
      this.fenceFormFlag = false;
      if(msg!='ok') {
        this.drawFence.removeFeature(this.ruleForm.fenceGenerId);
      }
      this.resetForm();
    },
    //操作事件
    changeBiaoQianFlag(){
      this.weiLanFlag = false;
//      this.huaWeiLanFlag = false;
//      this.measureDisFlag = false;
      this.biaoQianFlag = !this.biaoQianFlag;
    },
    changeWeiLanFlag(){
      this.biaoQianFlag = false;
//      this.huaWeiLanFlag = false;
//      this.measureDisFlag = false;
      this.weiLanFlag = !this.weiLanFlag;
    },
    measureDis(){
      this.biaoQianFlag = false;
      this.weiLanFlag = false;
//      this.huaWeiLanFlag = false;
      this.measureDisFlag = !this.measureDisFlag;
//      this.cancelDraw();
////      this.map.getLayers();
//      this.drawFence.hideLayer();

      if(this.measureDisFlag) {
//        if(!this.Measure.getLayerVisible()){
//          this.Measure.showLayer();
//        }
        this.Measure.addInteraction();;
      }else {
        this.Measure.closeMeasure();
        this.Measure.rmMeasures();
      }
    },
    //地图相关事件
    drawingPolygonFence(){
      this.biaoQianFlag = false;
      this.weiLanFlag = false;
//      this.measureDisFlag = false;
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
      this.ruleForm.points = JSON.stringify(points);
      this.ruleForm.fenceGenerId = id;
//      console.log('need mydeal',points,id);
    },
    cancelDraw(){
      this.drawFence.closeDraw();
    },
    toSelectTag(selection, row){
//      console.log(selection);
//      this.$refs.multipleFenceTable.toggleRowSelection(row,!selection);
//      row.toHide = !row.toHide;
      this.tagShowObj[row.mac].toHide=!this.tagShowObj[row.mac].toHide;
      if(this.tagShowObj[row.mac].toHide){
        this.delTagFeatrue(row.mac);
      }
    },
    toSelectAllTag(selection){
//      console.log(selection);
      if(selection.length>0){
        for(var i=0;i<this.tagList.length;i++){
          this.tagShowObj[this.tagList[i].mac].toHide=false;
//          this.tagList[i].toHide=false;
        }
      }else{
        for(var i=0;i<this.tagList.length;i++){
//          this.tagList[i].toHide=true;
          this.tagShowObj[this.tagList[i].mac].toHide=true;
          this.delTagFeatrue(this.tagList[i].mac);
        }
      }
    },
    toSelectFence(selection, row){
//      console.log(selection)
//      this.$refs.multipleFenceTable.toggleRowSelection(row,!selection);
      this.fenceShowObj[row.id].toShow=!this.fenceShowObj[row.id].toShow;
//      row.toShow = !row.toShow;
      if(this.fenceShowObj[row.id].toShow) {
        this.drawFence.showFeature(row.fenceGenerId,row.fenceColor);
      }else{
        this.drawFence.hideFeature(row.fenceGenerId);
      }
    },
    toSelectAllFence(selection){
//      console.log(selection)
      if(selection.length>0){
        for(var i=0;i<this.showFenceList.length;i++){
//          this.showFenceList[i].toShow=true;
          this.fenceShowObj[this.showFenceList[i].id].toShow=true;
          this.drawFence.showFeature(this.showFenceList[i].fenceGenerId,this.showFenceList[i].fenceColor);
        }
      }else{
        for(var i=0;i<this.showFenceList.length;i++){
//          this.showFenceList[i].toShow=false;
          this.fenceShowObj[this.showFenceList[i].id].toShow=false;
          this.drawFence.hideFeature(this.showFenceList[i].fenceGenerId);
        }
      }
    },
    handleSelectionChange(val,ddd) {
      if(!this.biaoQianFlag){
        return;
      }
      this.multipleSelection = val;
    },
    handleFenceSelectionChange(val,ddd){
      this.multipleFenceSelection = val;
    },
    tagSelectable(row,index){
      if(row&&row.hide){
        return false
      } else{
        return true;
      }
    },
    fenceSelectable(row,index){
      if(row&&row.hide){
        return false
      } else{
        return true;
      }
    },
    allFenceSelection(){
//      this.$refs.multipleFenceTable.toggleAllSelection();
    },
    allSelection() {
//      this.$refs.multipleTable.toggleAllSelection();
    },
    isTagSelect(table){
      table.forEach(row => {
//        if(row.toHide) {
        if(!this.tagShowObj[row.mac]){
          this.tagShowObj[row.mac]={}
          this.tagShowObj[row.mac].toHide=false;
        }
        if(this.tagShowObj[row.mac].toHide) {
          this.$refs.multipleTable.toggleRowSelection(row,false);
        }else{
          this.$refs.multipleTable.toggleRowSelection(row,true);
        }
      });
    },
    isFenceSelect(table){
      table.forEach(row => {
//        if(row.toShow) {
        if(!this.fenceShowObj[row.id]){
          this.fenceShowObj[row.id]={}
          this.fenceShowObj[row.id].toShow=false;
        }
        if(this.fenceShowObj[row.id].toShow) {
          this.$refs.multipleFenceTable.toggleRowSelection(row,true);
        }else{
          this.$refs.multipleFenceTable.toggleRowSelection(row,false);
        }
      });
    },
    checkSession:function(callback){

      var loginUrl = "http://"+this.host+"/login/index.html";
//      var userData = localStorage.getItem('userData');
//      this.userData = userData;
      if(!this.userData){
        location.href = loginUrl;
      }else{
//        var ajaxHost = "http://"+host+":8082";
//        var ajaxHost = "http://127.0.0.1:8082";
//        var ajaxHost = "http://track.ubitraq.com:8082";
//        var api_token = localStorage.getItem('api_token');
//        var api_token = "projAdmin_7632f1821a9634ade6a644e3cdc3e952b4cc3237";
        var ajaxUrl = this.ajaxHost+"/user/getCurrentUser"
        this.$http.get(ajaxUrl,{params:{api_token:this.api_token}}).then(function (reps) {
//          console.log(reps);
          if(reps.body&&reps.body.code){
            this.$http.headers.common.api_token = this.api_token;
            this.projectId = reps.body.projectId;
            this.projectCode = reps.body.projectCode || "";
            callback();
          }else{
            location.href = loginUrl;
          }
        }, function (err) {
          console.log(err);
        });
      }
    },
    intPage:function () {
      this.getProjectTag();
      this.getProjectTagCat();
      this.getProjectFenceType();
//      this.getGpsFences();
      this.loadMap();
    },
    getProjectTag:function () {
//      var host = location.host;
//      var ajaxHost = "http://127.0.0.1:8082";
//      var ajaxHost = "http://track.ubitraq.com:8082";
//      var ajaxHost = "http://"+host+":8082";
      var ajaxUrl = this.ajaxHost + "/project/tag/list";
//      var api_token = "projAdmin_7632f1821a9634ade6a644e3cdc3e952b4cc3237";
//      var api_token = localStorage.getItem('api_token');
      this.$http.get(ajaxUrl,{headers:{api_token:this.api_token}}).then(function (reps) {
//        console.log(reps);
        if(Object.prototype.toString.call(reps.body)== '[object Array]') {
          this.tagList = reps.body;
          this.allSelection();
        }
      }, function (err) {
        console.log(err);
      });
    },
    getProjectTagCat:function () {
      var ajaxUrl = this.ajaxHost + "/model/list?model=tag_category";
      this.$http.get(ajaxUrl,{headers:{api_token:this.api_token}}).then(function (reps) {
//        console.log(reps);
        if(Object.prototype.toString.call(reps.body)== '[object Array]') {
          this.tagCatList = reps.body;
          this.loadedTagCat = true;
        }
      }, function (err) {
        console.log(err);
      });
    },
    getProjectFenceType:function (callback) {
      var ajaxUrl = this.ajaxHost + "/model/list?model=fence_type";
      this.$http.get(ajaxUrl,{headers:{api_token:this.api_token}}).then(function (reps) {
//        console.log(reps);
        if(Object.prototype.toString.call(reps.body)== '[object Array]') {
          this.fenceTypeList = reps.body;
          this.loadedFtype = true;
        }
      }, function (err) {
        console.log(err);
      });
    },
    getGpsFences:function () {

      var ajaxUrl = this.ajaxHost + "/gpsfence/list";
      this.$http.get(ajaxUrl,{headers:{api_token:this.api_token}}).then(function (reps) {
//        console.log(reps);
        if(reps.body.isOk &&Object.prototype.toString.call(reps.body.data)== '[object Array]') {
          let fenceList = reps.body.data;
//          this.allSelection();
          this.fenceList = fenceList
          this.showGpsFencesList(fenceList);
        }
      }, function (err) {
        console.log(err);
      });
    },
    showGpsFencesList:function(fenceList)  {
      let tagCatObj={};
      let fenceTypeObj={};
      let fenceTypeColorObj={};
      let trifObj={
        i:'进入触发',
        o:'出去触发',
        io:'进出触发',
        in:'内部触发',
        out:'外部触发'
      };
      let tagCatList = this.tagCatList;
      let fenceTypeList = this.fenceTypeList;
      for(var m=0;m<this.tagCatList.length;m++){
        tagCatObj[tagCatList[m].id] = tagCatList[m].cname;
      }
      for(var n=0;n<this.fenceTypeList.length;n++){
        fenceTypeObj[fenceTypeList[n].id] = fenceTypeList[n].cname;
        fenceTypeColorObj[fenceTypeList[n].id] = fenceTypeList[n].color;
      }
      let showFenceList = JSON.parse(JSON.stringify(fenceList));
      for(var i=0;i<showFenceList.length;i++){
        showFenceList[i].ftypeIdName = fenceTypeObj[showFenceList[i].ftypeId];
        showFenceList[i].fenceColor = fenceTypeColorObj[showFenceList[i].ftypeId];
        var catIdList = JSON.parse(showFenceList[i].tagCat);
        var tagCatName=[];
        for(var j=0;j<catIdList.length;j++){
          tagCatName.push(tagCatObj[catIdList[j]]);
        }
        showFenceList[i].tagCatName = JSON.stringify(tagCatName);
        showFenceList[i].trifName = trifObj[showFenceList[i].trif];
        showFenceList[i].isActiveName = showFenceList[i].isActive?"是":"否";
      }
      this.showFenceList = showFenceList;
      if(this.initFenceFirst) {
        this.mapInitFences(showFenceList);
        this.initFenceFirst=false;
      }
    },
    mapInitFences(showFenceList){
      for(var i=0;i<showFenceList.length;i++){
        this.drawFence.toAddFence(showFenceList[i].fenceGenerId,showFenceList[i].points,showFenceList[i].fenceColor);
        this.drawFence.hideFeature(showFenceList[i].fenceGenerId);
      }
    },
    loadMap:function () {
      var that = this;
      that.changeWebsocketUrl("projectCode="+this.projectCode);
//      that.changeWebsocketUrl("projID="+1);
//      that.changeWebsocketUrl("projectCode="+this.projectCode);
      that.taglayer = new VectorLayer({
        source: new VectorSource()
      });
      that.tagInfoOverlay = that.createOverlay();
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
      this.map = new Map({
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
        if( that.map.hasFeatureAtPixel(e.pixel)) {
          that.map.forEachFeatureAtPixel(e.pixel, function (f) {
            var fId = f.getId() || '';
            if(fId && fId.indexOf("tag_")!=-1) {
              if (that.map.getOverlayById("popup")) {

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
      });
    },
    getTheTag:function (id) {
      for(var i=0;i<this.tagList.length;i++){
        if(id == this.tagList[i].code){
          return this.tagList[i];
        }
      }
      return null;
    },
    changeWebsocketUrl:function (params) {
//      this.websocketUrl="ws://127.0.0.1:8093/websocket?projID=141&tagID=00001ed3";
//      this.websocketUrl="ws://127.0.0.1:8093/websocket?projID=141";
      this.websocketUrl=this.websocketUrl+params;
//      this.websocketUrl="ws://gps.ubitraq.com:8093/websocket?"+params;
    },
    newWebsocket:function (newUrl) {
      var that = this;
      if(that.websocket&&that.websocket.close) {
        that.websocket.close();
      }
      that.websocket = new WebSocket(newUrl);
      that.websocket.onopen = that.onOpen;
      that.websocket.onclose = that.onClose;
      that.websocket.onerror = that.socketError;
      that.websocket.onmessage = that.socketMessage;
    },
    onOpen: function (event) {
//      console.log(event);
      console.log('socket success');
    },
    onClose: function (event) {
      console.log(event);
    },
    socketError: function (event) {
      var that = this;
      console.log(event);
      //错误重连
      if(that.timeId) {
        clearTimeout(that.timeId);
      }
      that.timeId = setTimeout(function () {
        that.newWebsocket(that.websocketUrl)
      }, 4000);
    },
    socketMessage: function (event) {
//      console.log(event);
      var tag = JSON.parse(event.data);
      if(tag.code && tag.longitude && tag.latitude && tag.battery) {
        if (this.tagShowObj[tag.code] && this.tagShowObj[tag.code].toHide) {
          return;
        }
        this.tagLastTime[tag.code] = {
          lastTime: Date.now(),
          isOnline: true
        };
        this.setTagPosition(tag);
      }
    },
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
    },
    setTagPosition:function (tag) {
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
    },
    createTagGeometry: function (tag) {
      var coordinate = this.transformPosition(tag);
      var geom = new Point(coordinate);
      return geom;
    },
    createPowerFeature: function (tag,geom) {
      var powerFeature = new Feature({
        geometry: geom
      });
      var id = 'tag_PW_'+tag.code;
      powerFeature.setId(id);
      return powerFeature;
    },
    setPowerStyle:function (tag) {
      var id = 'tag_PW_'+tag.code;
      var powerFeatrue = this.taglayer.getSource().getFeatureById(id);
      var style = this.createStyle(tag);
      powerFeatrue.setStyle(style);
    },
    createStyle: function (tag) {
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
    },
    createTagFeature: function (tag,geom) {
      var tagFeature = new Feature({
        geometry: geom
      });
      var id = 'tag_'+tag.code;
      tagFeature.setId(id);
      tagFeature.setStyle(new Style({
        image: new Icon({
//          src:'/gps/static/weizhi.png',
//          src:'/static/weizhi.png',
          src:require('../assets/weizhi.png'),
          anchor: [0.5, 0.96],
          scale:0.2
        }),
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
      }));
      return tagFeature;
    },
    createOverlay: function (tag) {
      var popup = document.getElementById("popup");
      var overlay = new Overlay({
        id:"popup",
        element: popup,
        autoPan: false,
        autoPanAnimation: {
          duration: 250
        }
      });
      return overlay;
    },
    drawImg: function(tag){
//      var id = 'tag_'+tag.code;
      var theTag = this.getTheTag(tag.code);
      if(theTag){
        theTag.batteryPercent = tag.battery * 100 /theTag.maxPower;
        theTag.batteryPercent = theTag.batteryPercent.toFixed(2);
      }
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.width = 100;
      canvas.height = 10;
      context.beginPath()
      context.rect(0,0,100,10);
      context.fillStyle="#722";
      context.fill();
      context.closePath()
      context.beginPath()
      if(theTag) {
        var len = theTag.batteryPercent > 100 ? 100 : theTag.batteryPercent;
        context.rect(0, 0, len , 10);
      }else{
        context.rect(0, 0, 100, 10);
      }
      context.fillStyle="green";
      context.fill();
      context.closePath()
      return canvas;
    },
    transformPosition:function(tag) {
      var coordinate = transform([tag.longitude*1/10000000, tag.latitude*1/10000000], "EPSG:4326", "EPSG:3857");
      return coordinate;
    }
  },
  watch:{
    logined:function (newurl,oldurl) {
      if(newurl){

      }else{

      }
    },
    websocketUrl:function (newurl,oldurl) {
      if(this.timeId){
        clearTimeout(this.timeId);
        this.timeId = null;
      }
      this.newWebsocket(newurl);
    },
    loadedTagCat:function (newVal) {
      if(this.loadedFtype&&this.loadedTagCat) {
        this.getGpsFences();
      }
    },
    loadedFtype:function (newVal) {
      if(this.loadedFtype&&this.loadedTagCat) {
        this.getGpsFences();
      }
    },
    biaoQianFlag:function (newVal) {
      if(newVal){
        this.$nextTick(() => {
          this.isTagSelect(this.tagList);
        })
      }
    },
    weiLanFlag:function (newVal) {
      if(newVal){
        this.$nextTick(() => {
          this.isFenceSelect(this.showFenceList);
        })
      }
    },
    "ruleForm.trif":function (newval,oldval) {
      if(newval == "in"||newval == "out"){
          this.ruleForm.tipIntervalFlag = true;
      }else{
        this.ruleForm.tipIntervalFlag = false;
      }
    }
  }
}

</script>
<style>
  #map{
    /*width:77vw;*/
    height:100vh;
    /*float: left;*/
    width:100%;
    /*height: 95%;*/
    overflow: hidden;
  }
  #father{
    position: relative;
  }
  /*#taglist{*/
    /*width:20vw;*/
    /*height:95vh;*/
    /*float: right;*/
    /*overflow: scroll;*/
    /*border-left: 1px solid gray;*/
  /*}*/
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
    /*padding: 4px 9px 4px 0px;*/
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
    /*overflow-y: auto;*/
    /*overflow-x:scroll;*/
    width:360px;
    min-height:200px;
    max-height: 600px;
  }
  /*#right-top .biaoqiancontent.heightF{*/
    /*height: 0px;*/
  /*}*/
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
    /*overflow-y: auto;*/
    /*overflow-x:scroll;*/
    overflow: auto;
  }
  /*#right-top .weilancontent.heightF{*/
    /*height: 0px;*/
  /*}*/
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
