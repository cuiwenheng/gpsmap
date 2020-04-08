/*
获取标签模块
*/

import axios from '@/request/http';

const tag = {
  //检测
  getTagList(params){
    return axios.get('/project/tag/list',{params:params});
  },
  getTagCat(params){
    return axios.get('/model/list?model=tag_category',{params:params});
  },
};

export default tag;
