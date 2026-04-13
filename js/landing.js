/* landing.js */
document.addEventListener('DOMContentLoaded', () => {
  // Hero count-up for big editorial number
  const heroCount = document.getElementById('heroCount');
  if (heroCount) {
    const ob = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        let n = 12300, target = 12849;
        const step = () => {
          n = Math.min(n + Math.ceil((target - n) / 12), target);
          heroCount.textContent = n.toLocaleString();
          if (n < target) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        ob.unobserve(heroCount);
      }
    }, { threshold: 0.5 });
    ob.observe(heroCount);
  }
});
