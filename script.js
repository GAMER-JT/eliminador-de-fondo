document.addEventListener('DOMContentLoaded', function() {
  const imageInput = document.getElementById('imageInput');
  const originalImage = document.getElementById('originalImage');
  const processedImage = document.getElementById('processedImage');
  const removeBackgroundBtn = document.getElementById('removeBackground');
  const downloadButton = document.getElementById('downloadButton');
  const imageBoxes = document.querySelectorAll('.image-box');
  
  const API_KEY = 'cLoFoEa3jQbvkNhNB5itfjm2';
  let originalImageData = null;

  // Add hover effect to image boxes
  imageBoxes.forEach(box => {
    box.addEventListener('mousemove', (e) => {
      const rect = box.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xPercent = (x / rect.width - 0.5) * 10;
      const yPercent = (y / rect.height - 0.5) * 10;
      
      box.style.transform = `perspective(1000px) rotateX(${-yPercent}deg) rotateY(${xPercent}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    box.addEventListener('mouseleave', () => {
      box.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });

  imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        originalImageData = event.target.result;
        originalImage.src = originalImageData;
        originalImage.classList.add('success-animation');
        removeBackgroundBtn.disabled = false;
        downloadButton.disabled = true;
        processedImage.src = 'placeholder.svg';
      };
      reader.readAsDataURL(file);
    }
  });

  removeBackgroundBtn.addEventListener('click', async function() {
    if (!originalImageData) return;

    try {
      removeBackgroundBtn.disabled = true;
      removeBackgroundBtn.classList.add('loading');
      removeBackgroundBtn.textContent = 'Procesando...';

      const formData = new FormData();
      const blob = await fetch(originalImageData).then(r => r.blob());
      formData.append('image_file', blob);
      formData.append('size', 'auto');
      formData.append('format', 'png');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al procesar la imagen');
      }

      const processedImageBlob = await response.blob();
      const processedImageUrl = URL.createObjectURL(processedImageBlob);
      processedImage.src = processedImageUrl;
      processedImage.classList.add('success-animation');
      downloadButton.disabled = false;

    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al procesar la imagen: ' + error.message);
    } finally {
      removeBackgroundBtn.disabled = false;
      removeBackgroundBtn.classList.remove('loading');
      removeBackgroundBtn.textContent = 'Remover Fondo';
    }
  });

  downloadButton.addEventListener('click', async function() {
    if (processedImage.src && processedImage.src !== 'placeholder.svg') {
      downloadButton.classList.add('success-animation');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        const fontSize = Math.max(20, img.width * 0.04);
        ctx.font = `${fontSize}px Inter`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        
        const text = 'aeroflow.ia';
        const metrics = ctx.measureText(text);
        const padding = fontSize;
        const x = canvas.width - metrics.width - padding;
        const y = canvas.height - padding;
        
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        
        canvas.toBlob(function(blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'aeroflow-imagen.png';
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        });
      };
      
      img.src = processedImage.src;
      
      setTimeout(() => {
        downloadButton.classList.remove('success-animation');
      }, 500);
    }
  });
});