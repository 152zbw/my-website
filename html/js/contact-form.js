(function () {
  'use strict';

  function bind(form) {
    if (form.dataset.contactBound) return;
    const button = form.querySelector('[type="submit"]');
    if (!button) return;
    form.dataset.contactBound = '1';
    let pending = false;
    const english = () => document.documentElement.lang.toLowerCase().startsWith('en');
    const text = (zh, en) => english() ? en : zh;
    let feedback = form.querySelector('#successMessage');
    if (!feedback) { feedback = document.createElement('div'); form.append(feedback); }
    feedback.removeAttribute('data-i18n');
    feedback.className = 'contact-form-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.tabIndex = -1;
    function show(message, state) {
      feedback.textContent = message;
      feedback.dataset.state = state;
      feedback.style.display = 'block';
      feedback.focus({preventScroll:true});
      feedback.scrollIntoView({block:'nearest', behavior:'smooth'});
    }
    const value = name => form.elements.namedItem(name)?.value.trim() || '';
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (pending) return;
      const payload = {
        name: [value('firstName'), value('lastName')].filter(Boolean).join(' '),
        email: value('email'), phone: value('phone'),
        subject: value('subject') || text('咨询', 'Inquiry'), message: value('message')
      };
      if (!payload.name || !payload.email || !payload.message) {
        show(text('请填写姓名、电子邮箱和留言内容。', 'Please enter your name, email and message.'), 'error');
        return;
      }
      if (!form.checkValidity()) {
        show(text('请检查邮箱格式和填写内容。', 'Please check your email and form entries.'), 'error');
        form.reportValidity(); return;
      }
      pending = true;
      const original = button.innerHTML;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      button.textContent = text('发送中…', 'Sending…');
      show(text('正在发送，请稍候…', 'Sending your message…'), 'pending');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch('/api/contacts', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify(payload), signal:controller.signal
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || text('发送失败，请稍后重试。', 'Unable to send. Please try again later.'));
        if (!result.contact?.id) throw new Error(text('暂未确认收到留言，请稍后联系我们核实。', 'We could not confirm receipt. Please contact us to check.'));
        form.reset();
        show(text('留言已发送成功！我们会尽快与您联系。', 'Your message has been received. We will contact you soon.'), 'success');
      } catch (error) {
        const message = error.name === 'AbortError' || error instanceof TypeError
          ? text('网络连接中断或超时，暂未确认是否收到。填写内容已保留，请稍后重试或通过电话、邮箱联系我们。', 'The connection was interrupted or timed out. Receipt is unconfirmed. Your entries are retained; please retry later or contact us by phone or email.')
          : error.message;
        show(message, 'error');
      } finally {
        clearTimeout(timeout); pending = false;
        button.disabled = false; button.removeAttribute('aria-busy'); button.innerHTML = original;
      }
    });
  }
  function init() { document.querySelectorAll('#contactForm').forEach(bind); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
