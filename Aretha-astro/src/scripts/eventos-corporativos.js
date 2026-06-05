/* ==========================================================================
   EVENTOS CORPORATIVOS SCOPED SCRIPTS — Aretha Kitchen
   ========================================================================== */

const initTestimonials = () => {
  const container = document.querySelector('.meus-depoimentos-container');
  if (container) {
    const cards = container.querySelectorAll('.testimonial-card');

    cards.forEach(card => {
      // Evita duplicar botões se a função for chamada múltiplas vezes
      if (card.querySelector('.read-more-btn')) return;

      const textContent = card.querySelector('.text-content');
      
      // Checa de forma precisa se o conteúdo REAL do texto transborda a área visível
      if (textContent && textContent.scrollHeight > textContent.clientHeight) {
        const readMoreBtn = document.createElement('button');
        readMoreBtn.innerText = 'Ver mais';
        readMoreBtn.className = 'read-more-btn';
        readMoreBtn.type = 'button';
        
        card.appendChild(readMoreBtn);

        readMoreBtn.addEventListener('click', function(e) {
          e.preventDefault();
          card.classList.toggle('expanded');
          this.innerText = card.classList.contains('expanded') ? 'Ver menos' : 'Ver mais';
        });
      }
    });
  }
};

// Executa assim que o script carregar, garantindo que o DOM e imagens estejam computados
if (document.readyState === 'complete') {
  initTestimonials();
} else {
  window.addEventListener('load', initTestimonials);
}