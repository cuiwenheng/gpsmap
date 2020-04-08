/*
获取标签模块
*/

import axios from '@/request/http';

const fence = {
  //
  getFenceList(params){
    return axios.get('/gpsfence/list',{params:params});
  },
  getFenceType(params){
    return axios.get('/model/list?model=fence_type',{params:params});
  },
  saveFence(params){
    return axios.post('/gpsfence/save',params);
  },
  delFence(params){
    return axios.post('/gpsfence/del',params);
  },
};

export default fence;
