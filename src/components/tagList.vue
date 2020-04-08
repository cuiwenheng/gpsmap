<template>
  <div class="biaoqiancontent">
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
</template>
<script>
  import api from '../request/api/index'
  export default {
    name: 'tagList',
    data () {
      return{
        search:'',
        tagList:[],
        tagShowObj:{},
      }
    },
    methods: {
      getProjectTag:function () {
        var that =this;
        api.tagApi.getTagList().then(function (reps) {
//        console.log(reps);
          if(Object.prototype.toString.call(reps.data)== '[object Array]') {
            that.tagList = reps.data;
            that.isTagSelect(that.tagList);
          }
        }, function (err) {
          console.log(err);
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
      tagSelectable(row,index){
        if(row&&row.hide){
          return false
        } else{
          return true;
        }
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
      toSelectTag(selection, row){
        this.tagShowObj[row.mac].toHide=!this.tagShowObj[row.mac].toHide;
        if(this.tagShowObj[row.mac].toHide){
          this.$parent.delTagFeatrue(row.mac);
        }
      },
      toSelectAllTag(selection){
        if(selection.length>0){
          for(var i=0;i<this.tagList.length;i++){
            this.tagShowObj[this.tagList[i].mac].toHide=false;
          }
        }else{
          for(var i=0;i<this.tagList.length;i++){
            this.tagShowObj[this.tagList[i].mac].toHide=true;
            this.$parent.delTagFeatrue(this.tagList[i].mac);
          }
        }
      },
    }
  }
</script>
<style scoped>

</style>
