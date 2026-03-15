// 1. Configuration
const config = {
    publicPath: "https://unpkg.com/@imgly/background-removal@1.4.5/dist/",
};

const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download');
const loader = document.getElementById('loader');

// 2. Initialize Frame
const frameImage = new Image();
frameImage.src = './frame.jpg'; 
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

// 3. Main Logic
uploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // CHECK: Is the library actually loaded?
    const removeFn = window.imglyRemoveBackground;
    
    if (typeof removeFn !== 'function') {
        alert("The AI library is still loading. Please wait 5 seconds and try again.");
        return;
    }

    loader.classList.remove('hidden');
    loader.innerText = "AI is processing... please wait.";
    downloadBtn.disabled = true;

    try {
        // Use the function now that we know it exists
        const blob = await removeFn(file, config);
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
        console.error("AI Error:", error);
        alert("Error: " + error.message);
        loader.classList.add('hidden');
    }
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'framed-photo.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
