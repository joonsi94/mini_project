document.addEventListener("DOMContentLoaded", async function () {
    const res = await supabase.auth.getUser();
    console.log(res);
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector('.header').innerHTML = data;

            const $menu = document.querySelector('.menu');
            const $sub_menu_container = document.querySelector('.sub_menu_container');
            const $sub_menu = document.querySelector('.sub_menu');
            const $header_check = document.querySelector('#header_check');
            const $header_acc = document.querySelector('#header_acc');
            const $header_keep = document.querySelector('#header_keep');
            const $select_login = document.querySelector('.select_login');
            const $header_reserve = document.querySelector('#header_reserve');
            //
            // const $menu_img = document.querySelector('.menu_img');
            // const $sub_menu_modal_container = document.querySelector('.sub_menu_modal_container');
            // const $sub_menu_modal = document.querySelector('.sub_menu_modal');

            // 메뉴 위에 마우스가 올라갔을 때
            $menu.addEventListener('mouseover', function () {
                $sub_menu_container.classList.add('visible');
            });

            // 메뉴에서 마우스가 벗어났을 때
            $menu.addEventListener('mouseout', function () {
                $sub_menu_container.classList.remove('visible');
            });

            $sub_menu.addEventListener('mouseover', function () {
                $sub_menu_container.classList.add('visible');
            });

            $sub_menu.addEventListener('mouseout', function () {
                $sub_menu_container.classList.remove('visible');
            });
            //
            //
            // $menu_img.addEventListener('click', () => {
            //     $sub_menu_modal_container.classList.add('active');
            //     $sub_menu_modal.classList.add('slide');
            // });
            //
            // $sub_menu_modal_container.addEventListener('click', () => {
            //     $sub_menu_modal_container.classList.add('active2');
            //     $sub_menu_modal.classList.add('slide2');
            //
            // })

            document.querySelector('.login').addEventListener('mouseover', function () {
                document.querySelector('.login_container').classList.add('down');
                document.querySelector('.logout_container').classList.add('down2');
            });

            document.querySelector('.login').addEventListener('mouseout', function () {
                document.querySelector('.login_container').classList.remove('down');
                document.querySelector('.logout_container').classList.remove('down2');
            });

            document.querySelector('#kakao_login').addEventListener('click', async function () {
                await supabase.auth.signInWithOAuth({
                    provider: 'kakao',
                    options: {
                        redirectTo: 'https://cjo3o.github.io/with_go/' // 배포 URL로 설정
                    }
                })
            });

            document.querySelector('.logout').addEventListener('click', async function () {
                await supabase.auth.signOut();
                location.reload();
            });

            if (res.data.user !== null) {
                const $select_login = document.querySelector('.select_login');
                const nick = res.data.user.email.split('@').slice(0, 1);
                const $logout = document.querySelector('.logout');
                const $login_container = document.querySelector('.login_container');
                $select_login.innerHTML = `${nick} 님`;
                $login_container.style.display = 'none';
                $logout.style.display = 'block';

            } else {
                const $login_content = document.querySelectorAll('.login_content');
                const $logout = document.querySelector('.logout');
                const $login_container = document.querySelector('.login_container');
                $login_container.style.display = 'block';
                $logout.style.display = 'none';
            }


            $header_check.addEventListener('click', function (event) {
                const $check_container = document.querySelector('.check_container');
                event.preventDefault();
                if ($check_container) {
                    window.scrollTo({top: $check_container.offsetTop, behavior: 'smooth'});
                } else {
                    location.href = 'reservation.html';
                    window.scrollTo({top: $check_container.offsetTop, behavior: 'smooth'});
                }
            });
            $header_reserve.addEventListener('click', function (event) {
                const $reservation_infor_contents_container = document.querySelector('.reservation_infor_contents_container');
                event.preventDefault();
                if ($reservation_infor_contents_container) {
                    window.scrollTo({top: 0, behavior: 'smooth'});
                } else {
                    location.href = 'reservation.html';
                }
            });
            $header_acc.addEventListener('click', function (event) {
                const $keep_container = document.querySelector('.keep_container');
                event.preventDefault();
                if ($keep_container) {
                    window.scrollTo({top: $keep_container.offsetTop, behavior: 'smooth'});
                } else {
                    location.href = 'reservation.html';
                }
            });
            $header_keep.addEventListener('click', function (event) {
                const $keep_container = document.querySelector('.keep_container');
                event.preventDefault();
                if ($keep_container) {
                    window.scrollTo({top: $keep_container.offsetTop, behavior: 'smooth'});
                } else {
                    location.href = 'reservation.html';
                }
            });

        });

    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector(".footer").innerHTML = data;
        });

    document.querySelector('#storReserve').addEventListener('click', function() {
        if (res.data.user === null) {
            alert('로그인 후 이용해 주세요.');
        } else {
            location.href = 'keep_reservation.html';
        }
    });

    document.querySelector('#deliverReserve').addEventListener('click', function() {
        if (res.data.user === null) {
            alert('로그인 후 이용해 주세요.');
        } else {
            location.href = 'delivery_reservation.html';
        }
    });
});