/**
 * Configuration for the background removal library.
 * The publicPath is essential for hosted environments like Vercel.
 */
const config = {
    publicPath: "https://static.img.ly/packages/@imgly/background-removal@1.4.5/dist/",
};

const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download');
const loader = document.getElementById('loader');

// 1. Initialize the Frame Image
const frameImage = new Image();
frameImage.src = './frame.jpg'; // Ensure your file is named exactly frame.png in your GitHub repo

// Draw the frame once it loads so the user sees the empty frame initially
frameImage.onload = () => {
    drawCanvas();
};

frameImage.onerror = () => {
    console.error("Frame failed to load. Check if frame.png exists in your root folder.");
};

// Variable to store the processed user image
let processedUserImg = null;

/**
 * Main function to draw the canvas layers
 */
function drawCanvas() {
    // Clear the canvas (1080x1080)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (processedUserImg) {
        // LAYER 1: The User Photo (Background)
        // Calculate scaling to fill the 1:1 area (Aspect Ratio Cover)
        const scale = Math.max(canvas.width / processedUserImg.width, canvas.height / processedUserImg.height);
        const x = (canvas.width / 2) - (processedUserImg.width / 2) * scale;
        const y = (canvas.height / 2) - (processedUserImg.height / 2) * scale;
        
        ctx.drawImage(processedUserImg, x, y, processedUserImg.width * scale, processedUserImg.height * scale);
    }

    // LAYER 2: The PNG Frame (Foreground)
    // This is drawn last so it sits on top of the photo
    if (frameImage.complete) {
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
    }
}

/**
 * Handle File Upload and AI Processing
 */
uploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // UI Feedback
    loader.classList.remove('hidden');
    loader.innerText = "AI is removing background... (First time may take 10-20s)";
    downloadBtn.disabled = true;

    try {
        // Call the background removal library
        const blob = await imglyRemoveBackground(file, config);
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
        console.error("Background Removal Error:", error);
        alert("Failed to remove background. Ensure you are using a modern browser like Chrome/Edge and that your vercel.json is configured.");
        loader.classList.add('hidden');
    }
});

/**
 * Handle Download
 */
downloadBtn.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'framed-photo.png';
    link.href = dataUrl;
    link.click();
});
