<template>
  <div id="fenceForm">
    <span class="closePng" @click="hideFenceForm"><img :src="require('../assets/popup_close.png')"></span>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px" class="demo-ruleForm">
      <el-form-item label="名 称" prop="cname">
        <el-input v-model="ruleForm.cname"></el-input>
      </el-form-item>
      <el-form-item label="类 型" prop="ftypeId" label-width="80px">
        <el-select v-model="ruleForm.ftypeId" placeholder="请选择类型"  style="width: 100%;">
          <el-option v-for="(item, i) in fenceTypeList" :label="item.cname" :value="item.id" :key="i" v-bind:style="{ color: item.color}"></el-option>
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
</template>
<script>
  import api from '../request/api/index'
  import { EventBus } from "../lib/event-bus.js";
  export default {
    name: 'fenceForm',
    props:{
      drawFence:{
        type:Object
      }
    },
    data () {
      return{
        fenceTypeList:[],
        tagCatList:[],
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
    mounted () {
      this.addEventBus();
    },
    methods: {
      addEventBus(){
        var that =this;
        EventBus.$on('loadTagCat', param => {
          that.tagCatList = param;
        })
        EventBus.$on('loadFencType', param => {
          that.fenceTypeList = param;
        })
      },
      drawEndFence(points,id){
        this.ruleForm.points = JSON.stringify(points);
        this.ruleForm.fenceGenerId = id;
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
        var that = this;
        api.fenceApi.saveFence(fenceObj).then(function (reps) {
          if(reps.data&&reps.data.isOk){
            var color = that.getFenceColor(that.ruleForm.ftypeId);
            that.drawFence.setFenceStyle(that.ruleForm.fenceGenerId,color);
            that.hideFenceForm('ok');
            that.toShowFence(reps.data.id);
            that.getGpsFences();
          }else{
            alert('失败:'+reps.data.msg)
          }
        }, function (err) {
          console.log(err);
          alert('失败');
        });
      },
      getGpsFences(){
        EventBus.$emit("getGpsFences", '');
      },
      toShowFence(id){
        EventBus.$emit("showFence",id);
      },
      getFenceColor(ftypeId){
        for(var i=0;i<this.fenceTypeList.length;i++){
          if(ftypeId == this.fenceTypeList[i].id){
            return this.fenceTypeList[i].color;
          }
        }
      },

      hideFenceForm(msg){
//        this.fenceFormFlag = false;
        this.$emit("hideFenceForm", '');
        if(msg!='ok') {
          this.drawFence.removeFeature(this.ruleForm.fenceGenerId);
        }
        this.resetForm();
      },
    },
    watch:{
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
<style scoped>

</style>
