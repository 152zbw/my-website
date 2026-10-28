(function(){
  'use strict';
  const form=document.getElementById('applicationForm');
  if(!form)return;
  const career=document.getElementById('applicationCareer');
  const direction=document.getElementById('applicationDirection');
  const status=document.getElementById('applicationStatus');
  const queryId=new URL(location.href).searchParams.get('careerId');
  if(queryId && [...career.options].some(option=>option.value===queryId))career.value=queryId;
  else if(queryId)status.textContent='该岗位当前未开放，您仍可通过开放申请提交资料。';
  function choose(){if(career.value)direction.value=career.selectedOptions[0].textContent;}
  choose();career.addEventListener('change',choose);
  document.querySelectorAll('[data-apply-career]').forEach(link=>link.addEventListener('click',()=>{
    career.value=link.dataset.applyCareer;choose();
  }));
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const button=form.querySelector('button[type=submit]');
    if(button.disabled)return;
    const file=form.elements.resume.files[0];
    status.className='application-status';status.textContent='';
    if(file && (file.size>5*1024*1024 || !/\.pdf$/i.test(file.name))){status.className+=' error';status.textContent='请选择不超过 5MB 的 PDF 简历。';return;}
    const data=new FormData(form);data.set('consent',form.elements.consent.checked?'true':'false');
    button.disabled=true;button.textContent='正在提交…';
    try{
      const response=await fetch('/api/applications',{method:'POST',body:data});
      const result=await response.json().catch(()=>({message:'提交未完成，请稍后重试。'}));
      if(!response.ok)throw new Error(result.message);
      form.reset();status.className+=' success';status.textContent=result.message;status.focus();
    }catch(error){status.className+=' error';status.textContent=error.message==='Failed to fetch'?'网络连接中断，请检查网络后重试。已填写内容仍保留。':error.message;status.focus();}
    finally{button.disabled=false;button.textContent='提交个人资料';}
  });
})();
