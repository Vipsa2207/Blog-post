document.addEventListener('DOMContentLoaded', () => {
    let posts = [];
    const views = {
        home: document.getElementById('home-view'),
        post: document.getElementById('post-view'),
        editor: document.getElementById('editor-view')
    };
    
    const newPostBtn = document.getElementById('new-post-btn');
    const postsList = document.getElementById('posts-list');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const postViewVideoContainer = document.getElementById('post-view-video-container');
    const postViewImage = document.getElementById('post-view-image');
    const postViewTitle = document.getElementById('post-view-title');
    const postViewContent = document.getElementById('post-view-content');
    const editPostBtn = document.getElementById('edit-post-btn');
    const deletePostBtn = document.getElementById('delete-post-btn');
    const postForm = document.getElementById('post-form');
    const editorTitle = document.getElementById('editor-title');
    const postIdInput = document.getElementById('post-id-input');
    const postTitleInput = document.getElementById('post-title-input');
    const postImageInput = document.getElementById('post-image-input');
    const postVideoInput = document.getElementById('post-video-input');
    const postContentInput = document.getElementById('post-content-input');
    const cancelBtn = document.getElementById('cancel-btn');
    function getVideoEmbedHTML(url) {
        let embedHTML = null;
        if (!url) return null;

        let youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
        if (youtubeMatch) {
            const videoId = youtubeMatch[1].split('&')[0];
            embedHTML = `<div class="video-responsive-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
            return embedHTML;
        }
        let vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/.+\/)?(\d+)/);
        if (vimeoMatch) {
            const videoId = vimeoMatch[1];
            embedHTML = `<div class="video-responsive-wrapper"><iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`;
            return embedHTML;
        }
        if (url.match(/\.(mp4|webm)$/)) {
            embedHTML = `<div class="video-responsive-wrapper"><video controls><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video></div>`;
            return embedHTML;
        }

        return null;
    }

    function showView(viewName) {
        Object.values(views).forEach(view => view.classList.remove('active'));
        views[viewName].classList.add('active');
    }

    function savePosts() {
        localStorage.setItem('blogPosts', JSON.stringify(posts));
    }

    function loadPosts() {
        const savedPosts = localStorage.getItem('blogPosts');
        if (savedPosts) {
            posts = JSON.parse(savedPosts);
        }
    }
    function renderPostsList() {
        postsList.innerHTML = '';
        if (posts.length === 0) {
            postsList.innerHTML = '<p>No posts yet. Create one!</p>';
            return;
        }

        const sortedPosts = [...posts].sort((a, b) => b.id - a.id);

        sortedPosts.forEach(post => {
            const postItem = document.createElement('div');
            postItem.className = 'post-item';
            postItem.dataset.id = post.id;
            
            const preview = post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '');

            let imageHTML = '';
            if (post.imageUrl) {
                imageHTML = `<img src="${post.imageUrl}" alt="${post.title}" class="post-item-image">`;
            }

            postItem.innerHTML = `
                ${imageHTML}
                <div class="post-item-content">
                    <h3>${post.title}</h3>
                    <p>${preview}</p>
                </div>
            `;
            postsList.appendChild(postItem);
        });
    }

    
    newPostBtn.addEventListener('click', () => {
        editorTitle.textContent = 'Create a New Post';
        postForm.reset();
        postIdInput.value = '';
        showView('editor');
    });

    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = postTitleInput.value.trim();
        const imageUrl = postImageInput.value.trim();
        const videoUrl = postVideoInput.value.trim();
        const content = postContentInput.value.trim();
        const id = postIdInput.value;

        if (!title || !content) {
            alert('Title and content cannot be empty.');
            return;
        }

        const postData = { title, imageUrl, videoUrl, content };

        if (id) { 
            const post = posts.find(p => p.id == id);
            if (post) { Object.assign(post, postData); }
        } else { 
            posts.push({ id: Date.now(), ...postData });
        }
        
        savePosts();
        renderPostsList();
        showView('home');
    });

    postsList.addEventListener('click', (e) => {
        const postItem = e.target.closest('.post-item');
        if (postItem) {
            const postId = postItem.dataset.id;
            const post = posts.find(p => p.id == postId);
            if (post) {
                
                postViewImage.style.display = 'none';
                postViewVideoContainer.style.display = 'none';
                postViewVideoContainer.innerHTML = '';
                
                
                const videoHTML = getVideoEmbedHTML(post.videoUrl);
                
                if (videoHTML) {
                    postViewVideoContainer.innerHTML = videoHTML;
                    postViewVideoContainer.style.display = 'block';
                } else if (post.imageUrl) {
                    postViewImage.src = post.imageUrl;
                    postViewImage.style.display = 'block';
                }

                postViewTitle.textContent = post.title;
                postViewContent.textContent = post.content;
                views.post.dataset.id = post.id;
                showView('post');
            }
        }
    });

    backToHomeBtn.addEventListener('click', () => showView('home'));
    cancelBtn.addEventListener('click', () => showView('home'));

    editPostBtn.addEventListener('click', () => {
        const postId = views.post.dataset.id;
        const post = posts.find(p => p.id == postId);
        if (post) {
            editorTitle.textContent = 'Edit Post';
            postIdInput.value = post.id;
            postTitleInput.value = post.title;
            postImageInput.value = post.imageUrl || '';
            postVideoInput.value = post.videoUrl || '';
            postContentInput.value = post.content;
            showView('editor');
        }
    });

    deletePostBtn.addEventListener('click', () => {
        const postId = views.post.dataset.id;
        if (confirm('Are you sure you want to delete this post? This cannot be undone.')) {
            posts = posts.filter(p => p.id != postId);
            savePosts();
            renderPostsList();
            showView('home');
        }
    });

    function init() {
        loadPosts();
        renderPostsList();
        showView('home');
    }

    init();
});