    const restore_btn = document.createElement('button');
    restore_btn.classList.add('rdb_post_restorer');
    restore_btn.setAttribute('onclick', "event.preventDefault();rdb_restore_post();");
    restore_btn.innerText = 'Restore Last Post';
    document.querySelector('.sticky-controls').appendChild(restore_btn);

    function rdb_restore_post(){
        var ebody = document.getElementById('body_content');
        var eheaders = document.getElementById('header_content');
      
        if (ebody.value.length > 30){
            if (!confirm("Overwrite your current post with previous post?"))return;
        }

        ebody.value= localStorage.getItem('body');
        eheaders.innerText = localStorage.getItem('headers');
    }
    function rdb_save_post(){
        setTimeout(function(){rdb_save_post();}, 10000);
        console.log(localStorage);
        var body = document.getElementById('body_content').value;
        var headers = document.getElementById('header_content').innerText;
        if (body.length < 50){
            console.log("Body less than 50 chars. Not saving.");
            return;
        }
        localStorage.setItem('body', body);
        localStorage.setItem('headers', headers);
        console.log("Post saved locally",localStorage);
    }
    setTimeout(function(){rdb_save_post();}, 10000);