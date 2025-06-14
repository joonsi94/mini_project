// Supabase 연결
const supabaseUrl = "https://zgrjjnifqoactpuqolao.supabase.co";
const supabasePassword = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmpqbmlmcW9hY3RwdXFvbGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNDc0NTgsImV4cCI6MjA1NjgyMzQ1OH0._Vl-6CRKdMjeDRyNoxlfect7sgusZ7L0N5OYu0a5hT0";
const supabase = window.supabase.createClient(supabaseUrl, supabasePassword);

// 페이지 설정
const perPage = 5;
let currentPage = 1;
let currentType = 'all';
const groupSize = 10;

// 오늘 날짜는 시간, 그 외는 날짜로 포맷
function formatCreatedAt(dateString) {
    const date = new Date(dateString);
    const today = new Date();

    const isToday = date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

    return isToday
        ? date.toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })  // 오늘: 날짜+시간
        : date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }); // 나머지: 날짜만
}

// 후기 불러오기
async function fetchReviews(page = 1, type = 'all') {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
    .from("review")
    .select("*", { count: "exact" })
    .order("is_best", { ascending: false }) 
    .order("created_at", { ascending: false }) 
    .range(from, to);

    if (type !== "all") query = query.eq("type", type);

    const {data, error, count} = await query;
    if (error) {
        console.error("데이터 오류:", error.message);
        return;
    }

    renderReviews(data);
    renderPagination(Math.ceil(count / perPage));
}

// 후기 카드 렌더링
function renderReviews(reviews) {
    const list = document.getElementById('review-list');
    list.innerHTML = '';

    reviews.forEach((item) => {
        const div = document.createElement("div");
        div.className = "review-item";

        const formattedDate = formatCreatedAt(item.created_at);

        div.innerHTML = `
        <div class="review-content">
            <div class="review-text">
                ${item.is_best ? `<div class="best-badge"><img src="../src/images/best.png" alt="BEST" class="best-icon" /></div>` : ''}
                <div class="title">
                    <div class="type">[${item.type}]</div>
                    <div class="title-text">${item.title}</div>
                </div>
                <div class="content">${item.review_txt}</div>
                <div class="name-date">
                    <span class="name">${item.name}</span>
                    <span class="date">${formattedDate}</span>
                </div>
            </div>
            <div class="review-image-box">
                ${item.file_url ? `<img src="${item.file_url}" class="review-image" />` : ""}
            </div>
        </div>
        `;

        div.addEventListener("click", () => openModal(item));
        list.appendChild(div);
    });
}


// 수정 버튼
function openModal(review) {
    const modal = document.getElementById('review-modal');
    const modalBody = document.getElementById('modal-body');
    const createdDate = formatCreatedAt(review.created_at);

    modalBody.innerHTML = `
    <h2>
        ${review.is_best ? `<img src="../src/images/best.png" alt="BEST" class="best-icon" /> ` : ''}
        [${review.type}] ${review.title}
    </h2><br>
    <p><strong>작성자:</strong> ${review.name}</p>
    <p><strong>작성일:</strong> ${createdDate}</p>
    <p>${review.review_txt}</p>
    ${review.file_url ? `<div class="image-box"><img src="${review.file_url}" /></div>` : ""}
`;

    document.getElementById('edit-btn').onclick = async function handlePasswordPrompt() {
        const {value: password} = await Swal.fire({
            title: "비밀번호 확인",
            input: "password",
            inputLabel: "등록한 비밀번호를 입력해주세요",
            inputPlaceholder: "비밀번호",
            inputAttributes: {
                maxlength: 6,
                autocapitalize: "off",
                autocorrect: "off"
            },
            showCancelButton: true,
            cancelButtonText: "취소",
            confirmButtonText: "확인",
            reverseButtons: true
        });

        if (password === null) return;

        if (password.trim() === "") {
            await Swal.fire({
                title: "입력 오류",
                text: "비밀번호를 입력해주세요.",
                icon: "warning",
                confirmButtonText: "확인"
            });
            handlePasswordPrompt();
            return;
        }

        const {data, error} = await supabase
            .from("review")
            .select("password")
            .eq("review_num", review.review_num)
            .single();

        if (error || !data || data.password !== password) {
            await Swal.fire({
                title: "비밀번호 불일치",
                text: "비밀번호가 일치하지 않습니다.",
                icon: "error",
                confirmButtonText: "확인"
            });
            handlePasswordPrompt();
            return;
        }

        window.location.href = `review_write.html?mode=edit&review_num=${review.review_num}`;
    };

    // 삭제 버튼
    document.getElementById('delete-btn').onclick = async function handlePasswordPrompt() {
        // 비밀번호 입력 먼저
        const {value: password} = await Swal.fire({
            title: "비밀번호 확인",
            input: "password",
            inputLabel: "등록한 비밀번호를 입력해주세요",
            inputPlaceholder: "비밀번호",
            inputAttributes: {
                maxlength: 6,
                autocapitalize: "off",
                autocorrect: "off"
            },
            showCancelButton: true,
            cancelButtonText: "취소",
            confirmButtonText: "확인",
            reverseButtons: true,
        });

        if (password === null) return;  // 취소 버튼 누른 경우

        if (password.trim() === "") {
            await Swal.fire({
                title: "입력 오류",
                text: "비밀번호를 입력해주세요.",
                icon: "warning",
                confirmButtonText: "확인"
            });
            handlePasswordPrompt();
            return;
        }

        // 비밀번호 검증
        const {data, error} = await supabase
            .from("review")
            .select("password")
            .eq("review_num", review.review_num)
            .single();

        if (error || !data || data.password !== password) {
            await Swal.fire({
                title: "비밀번호 불일치",
                text: "비밀번호가 일치하지 않습니다.",
                icon: "error",
                confirmButtonText: "확인"
            });
            handlePasswordPrompt();
            return;
        }

        // 비밀번호 일치 → 삭제 확인
        const result = await Swal.fire({
            title: "정말 삭제하시겠습니까?",
            text: "삭제된 후기는 복구할 수 없습니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소"
        });

        if (result.isConfirmed) {
            const {error: deleteError} = await supabase
                .from("review")
                .delete()
                .eq("review_num", review.review_num);

            if (deleteError) {
                Swal.fire("삭제 실패", "후기 삭제 중 문제가 발생했습니다.", "error");
            } else {
                Swal.fire("삭제 완료", "후기가 삭제되었습니다.", "success").then(() => {
                    document.getElementById("review-modal").style.display = "none";
                    fetchReviews(currentPage, currentType); // 목록 갱신
                });
            }
        }
    };


    modal.style.display = 'block';
}

// 모달 닫기
document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('review-modal').style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target.id === 'review-modal') {
        document.getElementById('review-modal').style.display = 'none';
    }
});

// 페이지네이션
function renderPagination(totalPages) {
    const pageBtnsContainer = document.getElementById("pageBtns");
    pageBtnsContainer.innerHTML = "";

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const leftBtn = document.getElementById("leftBtn");
    const rightBtn = document.getElementById("rightBtn");

    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const startPage = currentGroup * groupSize + 1;
    let endPage = startPage + groupSize - 1;
    if (endPage > totalPages) endPage = totalPages;

    leftBtn.disabled = currentGroup === 0;
    leftBtn.onclick = () => {
        if (currentGroup > 0) {
            currentPage = (currentGroup - 1) * groupSize + 1;
            updatePage(totalPages);
        }
    };

    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            updatePage(totalPages);
        }
    };

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.classList.add("page-btn");
        if (i === currentPage) pageBtn.classList.add("active");

        pageBtn.onclick = () => {
            currentPage = i;
            updatePage(totalPages);
        };
        pageBtnsContainer.appendChild(pageBtn);
    }

    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePage(totalPages);
        }
    };

    rightBtn.disabled = endPage === totalPages;
    rightBtn.onclick = () => {
        if (endPage < totalPages) {
            currentPage = endPage + 1;
            updatePage(totalPages);
        }
    };
}

function updatePage(totalPages) {
    renderPagination(totalPages);
    fetchReviews(currentPage, currentType);
}

// 필터 버튼
document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        currentType = e.target.dataset.type.trim();
        currentPage = 1;
        fetchReviews(currentPage, currentType);

        document.querySelectorAll(".filter-btn").forEach((b) =>
            b.classList.remove("active")
        );
        e.target.classList.add("active");
    });
});

// 글쓰기 버튼
document.getElementById("write-btn")?.addEventListener("click", async (e) => {
    e.preventDefault();
    const {data, error} = await supabase.auth.getUser();

    if (error || !data?.user?.id) {
        await Swal.fire({
            icon: "warning",
            title: "로그인이 필요합니다",
            text: "로그인 후 이용해주세요.",
        });
        return;
    }

    window.location.href = "review_write.html";
});

// 초기 실행
document.addEventListener("DOMContentLoaded", () => {
    fetchReviews(currentPage, currentType);
});
