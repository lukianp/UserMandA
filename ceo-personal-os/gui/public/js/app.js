document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const pageTitle = document.getElementById('page-title');
    const content = document.getElementById('content');
    const fileList = document.getElementById('file-list');
    const markdownView = document.getElementById('markdown-view');
    const markdownEdit = document.getElementById('markdown-edit');
    const editToggle = document.getElementById('edit-toggle');
    const saveBtn = document.getElementById('save-btn');

    let currentFile = null;
    let isEditMode = false;

    // Navigation
    sidebar.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            navigateTo(section);
        }
    });

    // Edit toggle
    editToggle.addEventListener('click', () => {
        if (currentFile) {
            isEditMode = !isEditMode;
            updateEditMode();
        }
    });

    // Save
    saveBtn.addEventListener('click', saveFile);

    function navigateTo(section) {
        pageTitle.textContent = section;
        fileList.innerHTML = '';
        markdownView.innerHTML = '';
        markdownEdit.value = '';
        currentFile = null;
        isEditMode = false;
        updateEditMode();

        if (section.endsWith('.md')) {
            loadFile(section);
        } else if (section === 'uploads') {
            showUploads();
        } else {
            listFolder(section);
        }
    }

    function loadFile(filePath) {
        fetch(`/api/files/${filePath}`)
            .then(res => res.json())
            .then(data => {
                currentFile = filePath;
                markdownView.innerHTML = marked.parse(data.content);
                markdownEdit.value = data.content;
                editToggle.style.display = 'inline-block';
            })
            .catch(err => console.error('Error loading file:', err));
    }

    function listFolder(folderPath) {
        fetch(`/api/list/${folderPath}`)
            .then(res => res.json())
            .then(data => {
                if (data.files.length > 0) {
                    fileList.innerHTML = '<h3>Files:</h3>';
                    data.files.forEach(file => {
                        const link = document.createElement('a');
                        link.href = '#';
                        link.textContent = file;
                        link.addEventListener('click', () => loadFile(`${folderPath}/${file}`));
                        fileList.appendChild(link);
                    });
                }

                // Add create new button for reviews
                if (folderPath.startsWith('reviews/')) {
                    const createBtn = document.createElement('button');
                    createBtn.textContent = 'Create New Review';
                    createBtn.addEventListener('click', () => createNewReview(folderPath));
                    fileList.appendChild(createBtn);
                }
            })
            .catch(err => console.error('Error listing folder:', err));
    }

    function createNewReview(folderPath) {
        const templateMap = {
            'reviews/daily': 'reviews/daily/daily_checkin_template.md',
            'reviews/weekly': 'reviews/weekly/weekly_review_template.md',
            'reviews/quarterly': 'reviews/quarterly/quarterly_review_template.md',
            'reviews/annual': 'reviews/annual/annual_review_template.md'
        };
        const template = templateMap[folderPath];
        if (template) {
            const date = new Date().toISOString().split('T')[0];
            const newFile = `${folderPath}/${date}.md`;
            fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templatePath: template, newPath: newFile })
            })
            .then(res => res.text())
            .then(() => {
                listFolder(folderPath); // Refresh list
            })
            .catch(err => console.error('Error creating file:', err));
        }
    }

    function showUploads() {
        fileList.innerHTML = `
            <h3>Upload Past Reviews</h3>
            <form id="upload-form-past" enctype="multipart/form-data">
                <input type="file" name="file" required>
                <button type="submit">Upload</button>
            </form>
            <h3>Upload Notes</h3>
            <form id="upload-form-notes" enctype="multipart/form-data">
                <input type="file" name="file" required>
                <button type="submit">Upload</button>
            </form>
        `;

        document.getElementById('upload-form-past').addEventListener('submit', (e) => {
            e.preventDefault();
            uploadFile(e.target, 'past_annual_reviews');
        });

        document.getElementById('upload-form-notes').addEventListener('submit', (e) => {
            e.preventDefault();
            uploadFile(e.target, 'notes');
        });
    }

    function uploadFile(form, folder) {
        const formData = new FormData(form);
        fetch(`/api/upload/${folder}`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => alert('File uploaded'))
        .catch(err => console.error('Error uploading:', err));
    }

    function updateEditMode() {
        if (isEditMode) {
            markdownView.style.display = 'none';
            markdownEdit.style.display = 'block';
            saveBtn.style.display = 'inline-block';
            editToggle.textContent = 'View';
        } else {
            markdownView.style.display = 'block';
            markdownEdit.style.display = 'none';
            saveBtn.style.display = 'none';
            editToggle.textContent = 'Edit';
        }
    }

    function saveFile() {
        const content = markdownEdit.value;
        fetch(`/api/files/${currentFile}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        })
        .then(res => res.text())
        .then(() => {
            markdownView.innerHTML = marked.parse(content);
            alert('File saved');
        })
        .catch(err => console.error('Error saving file:', err));
    }

    // Load home on startup
    navigateTo('README.md');
});