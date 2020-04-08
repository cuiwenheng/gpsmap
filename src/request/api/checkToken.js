/*
检测token模块
*/

import axios from '@/request/http';

const checkToken = {
  //检测
  check(params){
    return axios.get('/user/getCurrentUser',{params:params});
  },
};

export default checkToken;
