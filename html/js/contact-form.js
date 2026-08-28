(function () {
  function hideSuccessMessage(form) {
    const successMessage = form.querySelector('#successMessage');
    if (successMessage) successMessage.style.display = 'none';
  }

  async function submitContact(payload) {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时，请检查服务器是否可用')), 15000);
    });

    return await Promise.race([
      window.API.Contacts.create(payload),
      timeout,
    ]);
  }

  function bindContactForm(form) {
    if (!form || form.dataset.contactBound === '1') return;
    const submitBtn = form.querySelector('#submitBtn');
    if (!submitBtn) return;

    form.dataset.contactBound = '1';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const firstNameEl = form.querySelector('#contact-first-name');
      const lastNameEl = form.querySelector('#contact-last-name');
      const emailEl = form.querySelector('#contact-email');
      const phoneEl = form.querySelector('#contact-phone');
      const subjectEl = form.querySelector('#contact-subject');
      const messageEl = form.querySelector('#contact-message');

      const firstName = firstNameEl ? firstNameEl.value.trim() : '';
      const lastName = lastNameEl ? lastNameEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const phone = phoneEl ? phoneEl.value.trim() : '';
      const subject = subjectEl ? subjectEl.value.trim() : '';
      const message = messageEl ? messageEl.value.trim() : '';
      const fullName = `${firstName} ${lastName}`.trim() || firstName || lastName || '访客';

      if (!fullName || !email || !message) {
        alert('请填写姓名、邮箱和留言内容');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '发送中...';
      hideSuccessMessage(form);

      try {
        const result = await submitContact({
          name: fullName,
          email,
          phone,
          subject: subject || '咨询',
          message,
        });

        console.log('联系信息提交成功:', result);
        form.reset();
        const successMessage = form.querySelector('#successMessage');
        if (successMessage) successMessage.style.display = 'block';
      } catch (error) {
        console.error('联系信息提交失败:', error);
        alert(error.message || '提交失败，请稍后再试');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '发送消息';
      }
    }, true);
  }

  function init() {
    const forms = document.querySelectorAll('#contactForm');
    forms.forEach(bindContactForm);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
