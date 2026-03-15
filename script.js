const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download');
const loader = document.getElementById('loader');

const frameImage = new Image();
frameImage.src = 'frame.png'; // <-- PUT YOUR PNG FRAME FILENAME HERE

uploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    loader.classList.remove('hidden');
    downloadBtn.disabled = true;

    try {
        // 1. Remove Background using imgly
        const blob = await imglyRemoveBackground(file);
        const noBgImageUrl = URL.createObjectURL(blob);
        
        const userImg = new Image();
        userImg.src = noBgImageUrl;

        userImg.onload = () => {
            // 2. Clear Canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 3. Draw User Image (Scales to fit center)
            const scale = Math.max(canvas.width / userImg.width, canvas.height / userImg.height);
            const x = (canvas.width / 2) - (userImg.width / 2) * scale;
            const y = (canvas.height / 2) - (userImg.height / 2) * scale;
            ctx.drawImage(userImg, x, y, userImg.width * scale, userImg.height * scale);

            // 4. Overlay the Frame
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

            loader.classList.add('hidden');
            downloadBtn.disabled = false;
        };
    } catch (error) {
        console.error("Error:", error);
        alert("Background removal failed. Please try a different photo.");
        loader.classList.add('hidden');
    }
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'event-photo.png';
    link.href = canvas.toDataURL();
    link.click();
});