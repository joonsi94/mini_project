document.addEventListener('DOMContentLoaded', async function () {
    const res = await supabase.auth.getUser();
    console.log(res);

    document.querySelector('.login').addEventListener('mouseover', function () {
        document.querySelector('.login_container').classList.add('down');
    });

    document.querySelector('.login').addEventListener('mouseout', function () {
        document.querySelector('.login_container').classList.remove('down');
    });

    document.querySelector('.kakao_login').addEventListener('click', async function () {
        await supabase.auth.signInWithOAuth({
            provider: 'kakao'
        })
        alert('로그인');
    });

    document.querySelector('.logout').addEventListener('click', async function () {
        await supabase.auth.signOut();
        alert('로그아웃');
        location.href = 'index.html';
    });

    if (localStorage.length > 0) {
        const $select_login = document.querySelector('.select_login');
        const nick = res.data.user.email.split('@').slice(0, 1);
        const $logout = document.querySelector('.logout');
        const $kakao_login = document.querySelector('.kakao_login');
        $select_login.innerHTML = `${nick} 님`;
        $logout.style.display = 'block';
        $kakao_login.style.display = 'none';
    } else {
        const $kakao_login = document.querySelector('.kakao_login');
        const $logout = document.querySelector('.logout');
        $kakao_login.style.display = 'block';
        $logout.style.display = 'none';
    }
})