const searchBtn = document.querySelector('#search_btn');
const changeContainer = document.querySelector('.change_btn_container');
const tableContainer = document.querySelector('.table_container');
const $checkbox1 = document.querySelector('#keep_btn');
const $checkbox2 = document.querySelector('#delivery_btn');
const $search_reserveBox = document.querySelector('#search_reserveBox');
const $storage_table = document.querySelector('.storage_table');
const $delivery_table = document.querySelector('.delivery_table');
const $view_table_container = document.querySelector('.view_table_container');
const $search_check = document.querySelector('.search_check');
const $search_checkBox = document.querySelector('#search_checkBox');
const $search_check_btn = document.querySelector('.search_check_btn');
const $check_detail = document.querySelector('.check_detail');
const $check_detail_contents = document.querySelector('.check_detail_contents');
const $cancelBtn = document.querySelector('.cancelBtn');

if ($checkbox1) {
    $checkbox1.addEventListener('change', function () {
            if (this.checked) {
                if ($checkbox2) {
                    $checkbox2.checked = false;
                }
            }
        }
    )
    ;
}

if ($checkbox2) {
    $checkbox2.addEventListener('change', function () {
            if (this.checked) {
                if ($checkbox1) {
                    $checkbox1.checked = false;
                }
            }
        }
    )
    ;
}

const checkboxWrappers = changeContainer ? changeContainer.querySelectorAll('.change_btn') : [];
if (checkboxWrappers) {
    checkboxWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', function () {
            this.classList.toggle('checked');
            const checkbox = this.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
            }
        });
    });
}

if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
        await searchReserve();
    });
}

async function searchReserve() {
    if (!supabase) {
        console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
        alert('데이터베이스 연결에 문제가 발생했습니다.');
        return;
    }

    if (!tableContainer) {
        console.error('테이블 컨테이너 요소를 찾을 수 없습니다.');
        return;
    }

    tableContainer.innerHTML = '';
    let rows = '';

    const checkedOptions = [];
    if ($checkbox1 && $checkbox1.checked) checkedOptions.push('keep_btn');
    if ($checkbox2 && $checkbox2.checked) checkedOptions.push('delivery_btn');

    if (checkedOptions.length === 0) {
        alert('검색할 옵션을 선택해주세요.');
        return;
    }

    if (!$search_reserveBox || !$search_reserveBox.value) {
        alert('전화번호를 입력해주세요.');
        return;
    }

    let hasResults = false;

    console.log("검색 시작!");
    console.log("입력된 전화번호:", $search_reserveBox.value);


    if (checkedOptions.includes('keep_btn')) {
        const {data, error} = await supabase
            .from('storage')
            .select('*')
            .eq('phone', $search_reserveBox.value)
            .order('storage_start_date', {ascending: false});

        console.log("Supabase 응답:", data, error);

        if (error) {
            console.error('Supabase 데이터 조회 오류 (보관):', error);
            alert('데이터 조회 중 오류가 발생했습니다 (보관).');
            return;
        }

        if (data && data.length > 0) {
            hasResults = true;
            rows = data.map(item => `
                <tr onclick="openDetail_st(this)">
                    <td>${item.name}</td>
                    <td>${item.phone}</td>
                    <td>${item.storage_start_date}</td>
                    <td>${item.storage_end_date}</td>
                    <td>${item.small}</td>
                    <td>${item.medium}</td>
                    <td>${item.large}</td>
                    <td>${item.price}</td>
                </tr>
            `).join('');

            if ($storage_table) {
                const itemsPerPage = 10;
                const totalPages = Math.ceil(data.length / itemsPerPage);
                let currentPage = 1;

                function displayPage(page) {
                    const start = (page - 1) * itemsPerPage;
                    const end = start + itemsPerPage;
                    const pageRows = data.slice(start, end).map(item => `
                        <tr onclick="openDetail_st(this)">
                            <td>${item.name}</td>
                            <td>${item.phone}</td>
                            <td>${item.storage_start_date}</td>
                            <td>${item.storage_end_date}</td>
                            <td>${item.small}</td>
                            <td>${item.medium}</td>
                            <td>${item.large}</td>
                            <td>${item.price}</td>
                        </tr>
                    `).join('');

                    $view_table_container.innerHTML = `
                        <div class="table-container">
                            <table class="styled-table">
                                <thead>
                                    <tr>
                                        <th>이름</th>
                                        <th>연락처</th>
                                        <th>보관일자</th>
                                        <th>보관종료</th>
                                        <th>소형</th>
                                        <th>중형</th>
                                        <th>대형</th>
                                        <th>가격</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pageRows}
                                </tbody>
                            </table>
                            <div class="pagination">
                                <button onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>처음</button>
                                <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>이전</button>
                                <span>${currentPage} / ${totalPages}</span>
                                <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>다음</button>
                                <button onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>마지막</button>
                            </div>
                        </div>
                    `;
                }

                window.changePage = function (page) {
                    if (page >= 1 && page <= totalPages) {
                        currentPage = page;
                        displayPage(currentPage);
                    }
                };

                displayPage(1);
            }
        }
    }

    if (checkedOptions.includes('delivery_btn')) {
        const {data, error} = await supabase
            .from('delivery')
            .select('*')
            .eq('phone', $search_reserveBox.value)
            .order('delivery_date', {ascending: false});

        console.log("Supabase 응답:", data, error);

        if (error) {
            console.error('Supabase 데이터 조회 오류 (배송):', error);
            alert('데이터 조회 중 오류가 발생했습니다 (배송).');
            return;
        }

        if (data && data.length > 0) {
            hasResults = true;
            rows = data.map(item => `
                <tr onclick="openDetail_de(this)">
                    <td>${item.delivery_date}</td>
                    <td>${item.name}</td>
                    <td>${item.phone}</td>
                    <td>${item.delivery_start}</td>
                    <td>${item.delivery_arrive}</td>
                    <td>${item.under}</td>
                    <td>${item.over}</td>
                    <td>${item.price}</td>
                </tr>
            `).join('');

            if ($delivery_table) {
                const itemsPerPage = 10;
                const totalPages = Math.ceil(data.length / itemsPerPage);
                let currentPage = 1;

                $view_table_container.innerHTML = `
                <div class="table-container">
                    <table class="styled-table">
                        <thead>
                            <tr>
                                <th>배송일자</th>
                                <th>이름</th>
                                <th>연락처</th>
                                <th>배송 출발지</th>
                                <th>배송 도착지</th>
                                <th>26인치이하</th>
                                <th>26인치초과</th>
                                <th>가격</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                    <div class="pagination">
                                <button onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>처음</button>
                                <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>이전</button>
                                <span>${currentPage} / ${totalPages}</span>
                                <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>다음</button>
                                <button onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>마지막</button>
                            </div>
                </div>
                `;
                $delivery_table.style.display = 'block';
                $search_check.style.display = 'flex';
            }
            window.changePage = function (page) {
                if (page >= 1 && page <= totalPages) {
                    currentPage = page;
                    displayPage(currentPage);
                }
            };

            displayPage(1);
        }
    }

    if (!hasResults) {
        alert('검색 결과가 없습니다.');
    }
}

function openDetail_st(trTag) {
    const name = trTag.children[0].innerText;
    const phone = trTag.children[1].innerText;
    const storage_start_date = trTag.children[2].innerText;
    const storage_end_date = trTag.children[3].innerText;
    const small = trTag.children[4].innerText;
    const medium = trTag.children[5].innerText;
    const large = trTag.children[6].innerText;
    const price = trTag.children[7].innerText;
    // const $cancelBtn = document.querySelector('.cancelBtn');

    $check_detail_contents.innerHTML = `
                                        <span class="close" onclick="closeDetail()">&times;</span>
                                        <h2>조회 상세 정보</h2>
                                        <div class="data">
                <div class="info-row"><span class="label">보관일자</span><span class="value">${storage_start_date}</span></div>
  <div class="info-row"><span class="label">보관종료</span><span class="value">${storage_end_date}</span></div>
  <div class="info-row"><span class="label">이 름</span><span class="value">${name}</span></div>
  <div class="info-row"><span class="label">연 락 처</span><span class="value">${phone}</span></div>
                </div>
                                        <ul>
                                            <li>소형 : ${small}</li>
                                            <li>중형 : ${medium}</li>
                                            <li>대형 : ${large}</li>
                                        </ul>
                                        <hr>
                                        <div class="d-total">
                    <strong>총 합</strong>
                    <span>${price} 원</span>
<!--                    <span>원</span>-->
                </div>
                                       `;
    $cancelBtn.innerHTML = `
                            <button class="cancelReserve" onclick="cancelReserve()">
                                예약취소
                            </button>
                           `;
    $check_detail.classList.add('fade_in');
    $check_detail_contents.classList.add('slide_up');
    $cancelBtn.classList.add('slide_up');
}

function closeDetail() {
    $check_detail_contents.classList.remove('slide_up');
    $cancelBtn.classList.remove('slide_up');
    $check_detail.classList.remove('fade_in');
}

async function cancelReserve() {
    const result = await Swal.fire({
        title: "정말 취소하시겠습니까?",
        text: "취소하시면 복구하실 수 없습니다!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "확인",
        cancelButtonText: "예약취소"
    });
}

function openDetail_de(trTag) {
    const date = trTag.children[0].innerText;
    const name = trTag.children[1].innerText;
    const phone = trTag.children[2].innerText;
    const start = trTag.children[3].innerText;
    const arrive = trTag.children[4].innerText;
    const under = trTag.children[5].innerText;
    const over = trTag.children[6].innerText;
    const price = trTag.children[7].innerText;
    // const $cancelBtn = document.querySelector('.cancelBtn');

    $check_detail_contents.innerHTML = `
                                        <span class="close" onclick="closeDetail()">&times;</span>
                                        <h2>조회 상세 정보</h2>
                <div class="data">
                <div class="info-row"><span class="label">배송일자</span><span class="value">${date}</span></div>
  <div class="info-row"><span class="label">출 발 지</span><span class="value">${start}</span></div>
  <div class="info-row"><span class="label">도 착 지</span><span class="value">${arrive}</span></div>
  <div class="info-row"><span class="label">이 름</span><span class="value">${name}</span></div>
  <div class="info-row"><span class="label">연 락 처</span><span class="value">${phone}</span></div>
                </div>
                <hr>
            
                <div class="size">
                <p>ㆍ26인치이하 : ${under}</p>
                <p>ㆍ26인치초과 : ${over}</p>
                </div>
                <hr>
                <div class="d-total">
                    <strong>총 합</strong>
                    <span>${price} 원</span>
<!--                    <span>원</span>-->
                </div>
                                       `;
    $cancelBtn.innerHTML = `
                            <button class="cancelReserve" onclick="cancelReserve()">
                                예약취소
                            </button>
                           `;
    $check_detail.classList.add('fade_in');
    $check_detail_contents.classList.add('slide_up');
    $cancelBtn.classList.add('slide_up');
}

function closeDetail() {
    $check_detail_contents.classList.remove('slide_up');
    $cancelBtn.classList.remove('slide_up');
    $check_detail.classList.remove('fade_in');
}

async function cancelReserve() {
    const result = await Swal.fire({
        title: "정말 취소하시겠습니까?",
        text: "취소하시면 복구하실 수 없습니다!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "확인",
        cancelButtonText: "취소"
    });
}

document.getElementById('search_reserveBox').addEventListener('input', function (e) {
    let num = e.target.value.replace(/[^0-9]/g, '');

    if (num.length < 4) {
        e.target.value = num;
    } else if (num.length < 8) {
        e.target.value = `${num.slice(0, 3)}-${num.slice(3)}`;
    } else {
        e.target.value = `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
    }
});