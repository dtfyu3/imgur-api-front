document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const preview = document.getElementById('preview');
    const resultDiv = document.getElementById('result');
    const uploadArea = document.querySelector('.upload-area');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const keyBtn = document.getElementById('keyBtn');
    const token = window.localStorage.getItem('token');


    if (token) {
        apiKeyInput.style.display = 'none';
        keyBtn.textContent = '🔒';
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
    // Обработчик выбора файла
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            showPreview(file);
            uploadBtn.disabled = false;
        }
    });

    // Обработчик drag and drop
    uploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#1bb76e';
    });

    uploadArea.addEventListener('dragleave', function () {
        uploadArea.style.borderColor = '#ccc';
    });

    uploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';

        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            fileInput.files = e.dataTransfer.files;
            showPreview(file);
            uploadBtn.disabled = false;
        }
    });

    // Показать превью изображения
    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Загрузка на Imgur
    uploadBtn.addEventListener('click', function () {
        const file = fileInput.files[0];
        if (!file) return;

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Загрузка...';
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
                            <p>Изображение успешно загружено!</p>
                            <p><a href="${link}" target="_blank">${link}</a></p>`;
                } else {
                    resultDiv.textContent = 'Ошибка: ' + (data.data.error || 'Неизвестная ошибка');
                }
            })
            .catch(error => {
                resultDiv.textContent = 'Ошибка: ' + error.message;
            })
            .finally(() => {
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Загрузить на Imgur';
            });
    });

})

