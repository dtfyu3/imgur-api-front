document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const preview = document.getElementById('preview');
    const resultDiv = document.getElementById('result');
    const uploadArea = document.querySelector('.upload-area');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const keyBtn = document.getElementById('keyBtn');
    let token = window.localStorage.getItem('token');


    if (token) {
        apiKeyInput.style.display = 'none';
        keyBtn.innerHTML = '<i class="fa-solid fa-eraser"></i>';
    }
    else {
        apiKeyInput.style.display = 'block';
        keyBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i>';
        keyBtn.disabled = true;
        apiKeyInput.focus();
        uploadBtn.disabled = true;
    }
    keyBtn.addEventListener('click', function () {
        if (token) {
            window.localStorage.removeItem('token');
            apiKeyInput.style.display = 'block';
            apiKeyInput.focus();
        }
        else {
            if (apiKeyInput.value.trim() !== '') {
                token = window.localStorage.setItem('token', apiKeyInput.value);
                apiKeyInput.value = '';
                apiKeyInput.style.display = 'none';
                keyBtn.innerHTML = '<i class="fa-solid fa-eraser"></i>';
            }
        }
    });
    apiKeyInput.addEventListener('input', function () {
        if (apiKeyInput.value.trim() !== '') {
            keyBtn.disabled = false;
        }
        else {
            keyBtn.disabled = true;
        }
    })
    
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            showPreview(file);
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            removeImage();
        }
    })
    
    uploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#1bb76e';
    });

    uploadArea.addEventListener('dragleave', function () {
        uploadArea.style.borderColor = '#ccc';
    });
    uploadArea.addEventListener('', function () { })
    document.addEventListener('paste', function (e) {
        handlePastedItems(e.clipboardData || window.clipboardData);
    });

    function handlePastedItems(clipboardData) {
        const items = clipboardData.items;
        const files = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file) files.push(file);
            }
        }
        if (files.length > 0) {
            handleDroppedFiles(files);
        }
    }
    function handleDroppedFiles(files) {
        const images = [];
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                images.push(file);
            }
        });

        if (images.length > 0) {
            const dataTransfer = new DataTransfer();
            images.forEach(file => dataTransfer.items.add(file));
            fileInput.files = dataTransfer.files;
            handleMultipleImages(images, fileInput);
        }


    }
    function handleMultipleImages(files, input) {
        const dataTransfer = new DataTransfer();
        for (const file of files) {
            dataTransfer.items.add(file);
        }
        input.files = dataTransfer.files;
        preview.innerHTML = '';

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                showPreview(file);
            };
            reader.readAsDataURL(file);
        });
    }
    uploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';

        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            fileInput.files = e.dataTransfer.files;
            showPreview(file);
        }
    });

    function showPreview(file) {
        const reader = new FileReader();
        let removeBtn;
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
        if (!document.querySelector('.remove-btn')) {
            removeBtn = document.createElement('button');
            removeBtn.textContent = 'Х';
            removeBtn.classList.add('remove-btn');
            removeBtn.addEventListener('click', function () {
                removeImage();
            });
        }
        document.querySelector('.drag-text').style.display = 'none';
        if (removeBtn) uploadArea.appendChild(removeBtn)
        uploadBtn.disabled = false;
    }

    function removeImage() {
        const removeBtn = document.querySelector('.remove-btn');
        fileInput.value = '';
        preview.src = '';
        preview.style.display = 'none';
        removeBtn.remove();
        document.querySelector('.drag-text').style.display = 'flex';
        uploadBtn.disabled = true;
    }

    uploadBtn.addEventListener('click', function () {
        const file = fileInput.files[0];
        if (!file) return;

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';
        resultDiv.textContent = '';

        const formData = new FormData();
        formData.append('image', file);

        fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                'Authorization': `Client-ID ${token}`
            },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const link = data.data.link;
                    resultDiv.innerHTML = `
                            <p>Image uploaded successfully!</p>
                            <p><a href="${link}" target="_blank">${link}</a></p>`;
                } else {
                    resultDiv.textContent = 'Error: ' + (data.data.error || 'Unknown error');
                }
            })
            .catch(error => {
                resultDiv.textContent = 'Error: ' + error.message;
            })
            .finally(() => {
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload to Imgur';
            });
    });

})

