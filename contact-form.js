(()=>{
  const form=document.querySelector('[data-contact-form]');
  if(!form)return;
  const tokenInput=form.querySelector('[name="token"]');
  const status=form.querySelector('[data-contact-status]');
  const submit=form.querySelector('button[type="submit"]');
  const category=form.querySelector('[name="category"]');
  const requested=new URLSearchParams(location.search).get('type');
  if(requested&&[...category.options].some(option=>option.value===requested))category.value=requested;

  const setStatus=(message,type='')=>{
    status.textContent=message;
    status.dataset.state=type;
  };
  const loadToken=async()=>{
    try{
      const response=await fetch('/api/contact-token',{cache:'no-store',headers:{Accept:'application/json'}});
      const data=await response.json();
      if(!response.ok||!data.token)throw new Error('token');
      tokenInput.value=data.token;
      submit.disabled=false;
      setStatus('');
    }catch{
      submit.disabled=true;
      setStatus('現在フォームを利用できません。時間をおいて再度お試しください。','error');
    }
  };

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    submit.disabled=true;
    setStatus('送信しています…','sending');
    const values=Object.fromEntries(new FormData(form).entries());
    values.consent=form.elements.consent.checked;
    try{
      const response=await fetch('/api/contact',{
        method:'POST',
        headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify(values)
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.message||'送信できませんでした。');
      form.reset();
      setStatus('お問い合わせを受け付けました。内容を確認のうえ、順次ご連絡します。','success');
      await loadToken();
      setStatus('お問い合わせを受け付けました。内容を確認のうえ、順次ご連絡します。','success');
    }catch(error){
      const message=error.message||'送信できませんでした。時間をおいて再度お試しください。';
      await loadToken();
      setStatus(message,'error');
    }
  });

  submit.disabled=true;
  loadToken();
})();
