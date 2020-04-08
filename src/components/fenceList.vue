<template>
  <div class="weilancontent">
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
</template>
<script>
  import api from '../request/api/index'
  import { EventBus } from "../lib/event-bus.js";
  export default {
    name: 'fenceList',
    props:{
      drawFence:{
        type:Object
      }
    },
    data () {
      return{
        search:'',
        fenceTypeList:[],
        fenceList:[],
        showFenceList:[],
        fenceShowObj:{},
        initFenceFirst:true,
        tagCatList:[],
        loadedTagCat:false,
        loadedFtype:false,
      }
    },
    mounted () {
      this.addEventBus();
    },
    methods: {
      addEventBus(){
        var that =this;
        EventBus.$on('getGpsFences', param => {
          that.getGpsFences();
        })
        EventBus.$on('showFence', param => {
          that.fenceShowObj[param]={
            toShow:true
          };
        })
      },
      deleteRow(index, row,rows){
        var id = rows[index].id;
        var theFence ={
//          api_token:this.api_token,
          id:id
        };
        var that = this;
        api.fenceApi.delFence(theFence).then(function (reps) {
          if(reps.data&&reps.data.isOk){
            delete that.fenceShowObj[id];
            that.drawFence.removeFeature(rows[index].fenceGenerId);
            rows.splice(index, 1);
            that.getGpsFences();
          }else{
            alert('失败:'+reps.data.msg)
          }
        }, function (err) {
          console.log(err);
          alert('失败');
        });
      },
      toSelectFence(selection, row){
        this.fenceShowObj[row.id].toShow=!this.fenceShowObj[row.id].toShow;
        if(this.fenceShowObj[row.id].toShow) {
          this.drawFence.showFeature(row.fenceGenerId,row.fenceColor);
        }else{
          this.drawFence.hideFeature(row.fenceGenerId);
        }
      },
      toSelectAllFence(selection){
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

      isFenceSelect(table){
        var that = this;
        table.forEach(row => {
          if(!that.fenceShowObj[row.id]){
            that.fenceShowObj[row.id]={}
            that.fenceShowObj[row.id].toShow=false;
          }
          if(that.fenceShowObj[row.id].toShow) {
            that.$refs.multipleFenceTable.toggleRowSelection(row,true);
          }else{
            that.$refs.multipleFenceTable.toggleRowSelection(row,false);
          }
        });
      },
      getProjectTagCat:function () {
        var that =this;
        api.tagApi.getTagCat().then(function (reps) {
//        console.log(reps);
          if(Object.prototype.toString.call(reps.data)== '[object Array]') {
            that.tagCatList = reps.data;
            that.loadedTagCat = true;
            EventBus.$emit("loadTagCat", that.tagCatList);
          }
        }, function (err) {
          console.log(err);
        });
      },
      getProjectFenceType:function (callback) {
        var that = this;
        api.fenceApi.getFenceType().then(function (reps) {
          if(Object.prototype.toString.call(reps.data)== '[object Array]') {
            that.fenceTypeList = reps.data;
            that.loadedFtype = true;
            EventBus.$emit("loadFencType", that.fenceTypeList);
          }
        }, function (err) {
          console.log(err);
        });
      },
      getGpsFences:function () {
        var that = this;
        api.fenceApi.getFenceList().then(function (reps) {
          if(reps.data.isOk &&Object.prototype.toString.call(reps.data.data)== '[object Array]') {
            let fenceList = reps.data.data;
            that.fenceList = fenceList;
            that.loadedFtype = true;
            that.showGpsFencesList(fenceList);
            that.isFenceSelect(that.showFenceList);
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
//      handleFenceSelectionChange(val,ddd){
//        this.multipleFenceSelection = val;
//      },
    },
    watch:{
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
    }
  }
</script>
<style scoped>

</style>
