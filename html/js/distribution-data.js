(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.DistributionData=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const regions=[['china','中国区','China'],['north-america','北美区','North America'],['europe','欧洲区','Europe']];
  function points(value){if(Array.isArray(value))return value;try{const parsed=JSON.parse(value||'[]');return Array.isArray(parsed)?parsed:[];}catch(_){return [];}}
  function region(point){if(regions.some(r=>r[0]===point.region))return point.region;const name=point.name||'';if(/美国|墨西哥|密苏里|CNBC|United States|U\.S\.|Mexico|Missouri|Chamber/i.test(name))return 'north-america';if(/匈牙利|卢森堡|IAESTE|爱因斯特|米什科尔茨|Hungar|Luxembourg|Miskolc/i.test(name))return 'europe';return Number(point.x)<40?'north-america':Number(point.x)<68?'europe':'china';}
  const names={'笠偲咨询总部（烟台）':'Yantai Headquarters','深圳分公司':'Shenzhen Office','香港分公司':'Hong Kong Office','济南分支机构':'Jinan Branch','上海分支机构':'Shanghai Branch','美国分公司':'United States Office','墨西哥分公司':'Mexico Office','美国国际商会（洛杉矶）':'American International Chamber of Commerce (Los Angeles)','密苏里州立大学':'Missouri State University','匈牙利分公司':'Hungary Office','爱因斯特（IAESTE，卢森堡）':'IAESTE (Luxembourg)','米什科尔茨大学（匈牙利）':'University of Miskolc (Hungary)','科锐国际':'Career International'};
  function name(point,english){return english?(names[point.name]||point.name):point.name;}
  function type(point,english){const types=english?{headquarters:'Headquarters',branch:'Branch / Office',partner:'Partner'}:{headquarters:'总部',branch:'分支机构',partner:'合作伙伴'};return types[point.type]||types.branch;}
  return {regions,points,region,name,type};
});
