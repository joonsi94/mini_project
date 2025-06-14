
document.addEventListener("DOMContentLoaded", () => {
    const supabaseUrl = "https://zgrjjnifqoactpuqolao.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmpqbmlmcW9hY3RwdXFvbGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNDc0NTgsImV4cCI6MjA1NjgyMzQ1OH0._Vl-6CRKdMjeDRyNoxlfect7sgusZ7L0N5OYu0a5hT0";
    const client = supabase.createClient(supabaseUrl, supabaseKey);

    const $check_detail = document.querySelector('.check_detail');
    const $search_check = document.querySelector('.search_check');
    const $view_table_container = document.querySelector('.view_table_container');
    const $delivery_table = document.querySelector('.delivery_table');
    const $search_reserveBox = document.querySelector('#search_reserveBox');
    const $searchBtn = document.querySelector('#searchBtn');
    const carrier = localStorage.getItem("reservation_carrier");
    if (carrier) {
        const select = document.querySelector('select[name="package"]');
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].text === carrier) {
                select.selectedIndex = i;
                break;
            }
        }
    }

// ✅ 조회 함수
    async function searchReserve() {
        const phone = $search_reserveBox.value.trim();
        if (!phone) return;

        const { data, error } = await client
            .from('delivery')
            .select()
            .eq('phone', phone)
            .order('delivery_date', { ascending: false });

        if (error || !data || data.length === 0) {
            await Swal.fire({
                icon: "error",
                title: "조회할 내역이 존재하지 않습니다.",
                text: "연락처를 확인해 주세요."
            });
            return;
        }

        let rows = '';
        data.forEach((item) => {
            const encoded = encodeURIComponent(JSON.stringify(item));
            rows += `
            <tr onclick='openDetailFromString("${encoded}")'>
                <td>${item.delivery_date}</td>
                <td>${item.name}</td>
                <td>${item.phone}</td>
                <td>${item.delivery_start}</td>
                <td>${item.delivery_arrive}</td>
                <td>${item.small}</td>
                <td>${item.medium}</td>
                <td>${item.large}</td>
                <td>${item.price}</td>
            </tr>`;
        });

        $delivery_table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>배송일자</th>
                        <th>이름</th>
                        <th>연락처</th>
                        <th>배송 출발지</th>
                        <th>배송 도착지</th>
                        <th>소형</th>
                        <th>중형</th>
                        <th>대형</th>
                        <th>가격</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>`;

        $view_table_container.style.display = 'block';
        $search_check.style.display = 'none';
    }

// ✅ 문자열 형태 전달값 디코딩
    window.openDetailFromString = function (itemStr) {
        const item = JSON.parse(decodeURIComponent(itemStr));
        openDetail(item);
    };

// ✅ 모달 열기
    function openDetail(item) {
        const {
            id,
            delivery_date,
            name,
            phone,
            delivery_start,
            delivery_arrive,
            small,
            medium,
            large,
            price
        } = item;

        // 모달 전체 영역 구성
        $check_detail.innerHTML = `
        <div class="check_detail_contents slide_up">
            <div class="detail-modal">
                <span class="close" style="cursor:pointer; float:right; font-size: 20px;">&times;</span>
                <h2>조회 상세 정보</h2>
                <div class="data">
                <div class="info-row"><span class="label">배송일자</span><span class="value">${delivery_date}</span></div>
  <div class="info-row"><span class="label">출 발 지</span><span class="value">${delivery_start}</span></div>
  <div class="info-row"><span class="label">도 착 지</span><span class="value">${delivery_arrive}</span></div>
  <div class="info-row"><span class="label">이 름</span><span class="value">${name}</span></div>
  <div class="info-row"><span class="label">연 락 처</span><span class="value">${phone}</span></div>
                </div>
                <hr>
            
                <div class="size">
                <p>ㆍ소형 : ${small}</p>
                <p>ㆍ중형 : ${medium}</p>
                <p>ㆍ대형 : ${large}</p>
                </div>
                <hr>
                <div class="d-total">
                    <strong>총 합</strong>
                    <span>${price} 원</span>
<!--                    <span>원</span>-->
                </div>
            </div>
        </div>
        <div class="cancelBtn-wrapper">
            <button class="cancelBtn" onclick="cancelReservation('${id}')">예약 취소</button>
        </div>
    `;

        $check_detail.classList.add('fade_in');

        const $close = $check_detail.querySelector('.close');
        $close.addEventListener('click', () => {
            $check_detail.classList.remove('fade_in');
        });
    }

    // ✅ 예약 취소
    window.cancelReservation = async function (id) {
        const confirmCancel = confirm("정말로 예약을 취소하시겠습니까?");
        if (!confirmCancel) return;

        const { error } = await client
            .from("delivery")
            .delete()
            .eq("id", id);

        if (error) {
            alert("취소 실패했습니다");
        } else {
            alert("예약이 취소되었습니다");
            location.reload();
        }
    };

    // ✅ 검색 버튼 클릭 연결
    $searchBtn?.addEventListener("click", searchReserve);
});