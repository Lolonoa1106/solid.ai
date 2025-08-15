document.addEventListener("DOMContentLoaded", () => {

  const popupWrapper   = document.getElementById('form-block');
  const messageWrapper = document.getElementById('form-block-message');
  const popupClose     = document.getElementById('form-message-button');

  if(!popupWrapper){
    return;
  }

  document.addEventListener( 'wpcf7mailsent', function( event ) {

    let formId = event.detail.contactFormId;
    if(4775 === formId){
      return;
    }
    if(10656 === formId){
      return;
    }
    if(10675 === formId){
      return;
    }
    if(10834 === formId){
      return;
    }
    popupWrapper.style.display = 'none';
    messageWrapper.style.display = 'block';
  }, false );

  popupClose.addEventListener('click', function() {
    messageWrapper.style.display = 'none';
    popupWrapper.style.display = 'block';
  }, false );


  const productForm   = document.getElementById('product-form');
  if(!productForm){
    return;
  }

  document.addEventListener( 'wpcf7mailsent', function( event ) {
    productForm.classList.add('animated-popup');
  }, false );

});



