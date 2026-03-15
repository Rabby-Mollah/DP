const config = {
    // Changed to UNPKG CDN for better compatibility
    publicPath: "https://unpkg.com/@imgly/background-removal@1.4.5/dist/",
};

const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download');
const loader = document.getElementById('loader');

const frameImage = new Image();
frameImage.src = './frame.png';

frameImage.onload = () => drawCanvas();

let processedUserImg = null;

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (processedUserImg) {
        const scale = Math.max(canvas.width / processedUserImg.width, canvas.height / processedUserImg.height);
        const x = (canvas.width / 2) - (processedUserImg.width / 2) * scale;
        const y = (canvas.height / 2) - (processedUserImg.height / 2) * scale;
        ctx.drawImage(processedUserImg, x, y, processedUserImg.width * scale, processedUserImg.height * scale);
    }
    if (frameImage.complete) {
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
    }
}

uploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    loader.classList.remove('hidden');
    loader.innerText = "Processing... (Downloading AI Model)";
    downloadBtn.disabled = true;

    try {
        // We call the function explicitly from the window object
        const blob = await window.imglyRemoveBackground(file, config);
        const url = URL.createObjectURL(blob);
        
        const img = new Image();
        img.src = url;
        img.onload = () => {
            processedUserImg = img;
            drawCanvas();
            loader.classList.add('hidden');
            downloadBtn.disabled = false;
        };
    } catch (error) {
        console.error("Full Error Object:", error);
        // This will tell us if it's a security header issue
        if (error.message.includes('SharedArrayBuffer')) {
            alert("Security Error: COOP/COEP headers are not active. Check vercel.json.");
        } else {
            alert("Error: " + error.message);
        }
        loader.classList.add('hidden');
    }
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'framed-photo.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
