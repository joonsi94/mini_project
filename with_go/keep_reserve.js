let $totalPrice = document.querySelector('#total_price');

const $close = document.querySelectorAll('.close');
const $keep_location = document.querySelector('.keep_location');
const $keep_location_contents = document.querySelector('.keep_location_contents');
const $location = document.querySelector('#location');
const $select_location = document.querySelector('.select_location');
const $touModal_container = document.querySelector('.touModal_container');
const $storage_reservation = document.querySelector('#storage_reservation');

const $dateStart = document.querySelector('#date_start');
const $dateEnd = document.querySelector('#date_end');
const $mail = document.querySelector('#mail');
const $location_a = document.querySelector('#location_a');
const $country = document.querySelector('#country');
const $name = document.querySelector('#name');
const $phone = document.querySelector('#phone');
const small = document.querySelector('#small');
const medium = document.querySelector('#medium');
const large = document.querySelector('#large');
const agree = document.querySelector('#agree');

const $check_start_date = document.querySelector('#check_start_date');
const $check_end_date = document.querySelector('#check_end_date');
const $check_country = document.querySelector('#check_country');
const $check_location = document.querySelector('#check_location');
const $check_detail_adr = document.querySelector('#check_detail_adr');
const $check_name = document.querySelector('#check_name');
const $check_phone = document.querySelector('#check_phone');
const $keep_reservation_contents = document.querySelector('.keep_reservation_contents');
const $keep_reservation_check_contents = document.querySelector('.keep_reservation_check_contents');
const $check_small = document.querySelector('#check_small');
const $check_medium = document.querySelector('#check_medium');
const $check_large = document.querySelector('#check_large');
const $check_price = document.querySelector('#check_price');

function minus(a) {
    if (a.parentNode.children[1].value > 0) {
        a.parentNode.children[1].value--;
        $totalPrice.innerText = Number($totalPrice.innerText) - Number(a.parentNode.getAttribute('data-price'));
    }
}

function plus(a) {
    a.parentNode.children[1].value++;
    $totalPrice.innerText = Number($totalPrice.innerText) + Number(a.parentNode.getAttribute('data-price'));
}

function openModal() {
    event.preventDefault();
    $touModal_container.style.display = 'block';
}

function closeModal() {
    for (let i = 0; i < 2; i++) {
        const modal = $close[i].parentNode.parentNode;
        modal.style.display = 'none';
    }

}

async function storageSelect() {
    const arr = [$dateStart, $dateEnd, $mail, $location, $country, $name, $phone];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].value === '') {
            alert(`${arr[i].name}을(를) 입력해주세요.`);
            // Swal.fire({
            //     icon: "error",
            //     title: "알림",
            //     text: `${arr[i].name}을(를) 입력해주세요!`,
            // });
            window.scrollTo({top: arr[i].offsetTop, behavior: 'smooth'});
            return;
        }
    }

    if (agree.checked === false) {
        alert('이용약관을 확인해주세요.');
        window.scrollTo({top: agree.offsetTop, behavior: 'smooth'});
        return;
    }

    if (Number($totalPrice.innerText) === 0) {
        alert('짐 개수를 선택해주세요.');
    } else {
        const brr = [$check_start_date, $check_end_date, $check_location, $check_detail_adr, $check_name, $check_phone, $check_country];
        for (let i = 0; i < brr.length; i++) {
            brr[i].innerHTML = arr[i].value;
        }

        $check_name.innerHTML = $name.value;
        $check_phone.innerHTML = $phone.value;
        $check_country.innerHTML = $country.value;
        $check_detail_adr.innerHTML = $mail.value;
        $check_location.innerHTML = $location_a.value;
        $check_small.innerHTML = small.value;
        $check_medium.innerHTML = medium.value;
        $check_large.innerHTML = large.value;
        $check_price.innerHTML = Number($totalPrice.innerText);
        $keep_reservation_contents.style.display = 'none';
        $keep_reservation_check_contents.style.display = 'block';

        window.scrollTo({top: 0, behavior: 'smooth'});

    }
}

async function paymentSubmit() {
    const res = await supabase.from('storage').insert([
        {
            name: $name.value,
            phone: $phone.value,
            storage_start_date: $dateStart.value,
            storage_end_date: $dateEnd.value,
            location: $location_a.value,
            mail: $mail.value,
            reservation_country: $country.value,
            small: small.value,
            medium: medium.value,
            large: large.value,
            price: Number($totalPrice.innerText)
        }
    ]).select();
    console.log(res);
    await Swal.fire({
        title: "보관예약이 완료되었습니다!",
        icon: "success",
        draggable: true
    })
    location.href = 'index.html';
}

// $close.addEventListener('click',function () {
//     $keep_location.classList.remove('fade_in');
//     $keep_location_contents.classList.remove('up');
//     $keep_location.style.display = 'block';
// })

function openKeepLocation() {
    if (!!$keep_location) {
        $keep_location.classList.add('fade_in');
        $keep_location_contents.classList.add('up');
        $keep_location.style.display = 'flex';
    }
}

$select_location.addEventListener('click', function () {
    if (!!document.querySelector('input[name="keep_location"]:checked')) {
        $location_a.value = document.querySelector('input[name="keep_location"]:checked').parentNode.children[1].innerText;

        closeModal();
    } else {
        alert("보관장소를 선택해주세요.")
    }
});

const startDatePicker = document.getElementById('date_start');
const endDatePicker = document.getElementById('date_end');

// 시작 날짜 선택 제한 설정
startDatePicker.addEventListener('change', function () {
    const selectedDate = new Date(this.value);
    const today = new Date();

    if (selectedDate < today) {
        const todayFormatted = today.toISOString().split('T')[0];
        this.value = todayFormatted;
    }
});

const today = new Date();
const todayFormatted = today.toISOString().split('T')[0];
startDatePicker.setAttribute('min', todayFormatted);

// 종료 날짜 선택 제한 설정 (시작 날짜 이후만 선택 가능하도록)
endDatePicker.addEventListener('change', function () {
    const startDate = new Date(startDatePicker.value);
    const selectedDate = new Date(this.value);

    if (selectedDate < startDate) {
        this.value = startDatePicker.value;
    }
});

endDatePicker.setAttribute('min', startDatePicker.value);

// 시작 날짜가 변경될 때 종료 날짜의 min 속성 업데이트
startDatePicker.addEventListener('change', function () {
    endDatePicker.setAttribute('min', this.value);
    // 종료 날짜가 시작 날짜보다 이전으로 설정된 경우, 종료 날짜를 시작 날짜로 업데이트
    if (new Date(endDatePicker.value) < new Date(this.value)) {
        endDatePicker.value = this.value;
    }
});

// const startDatePicker = document.getElementById('date_start');
// const endDatePicker = document.getElementById('date_end');
//
// startDatePicker.addEventListener('focus', function () {
//     if (this.value === 'YYYY-MM-DD') {
//         this.value = '';
//         this.style.color = 'black';
//     }
// });
//
// startDatePicker.addEventListener('blur', function () {
//     if (this.value === '') {
//         this.value = 'YYYY-MM-DD';
//         this.style.color = 'gray';
//     }
// });
//
// endDatePicker.addEventListener('focus', function () {
//     if (this.value === 'YYYY-MM-DD') {
//         this.value = '';
//         this.style.color = 'black';
//     }
// });
//
// endDatePicker.addEventListener('blur', function () {
//     if (this.value === '') {
//         this.value = 'YYYY-MM-DD';
//         this.style.color = 'gray';
//     }
// });


document.addEventListener('DOMContentLoaded', () => {
    const name = localStorage.getItem("reservation_name");
    const phone = localStorage.getItem("reservation_phone");
    const carrier = localStorage.getItem("reservation_carrier");

    if (name) document.getElementById("name").value = name;
    if (phone) document.getElementById("phone").value = phone;

    // ✅ select 요소에 기본값만 세팅 (사용자 선택 가능)
    const $carrierSelect = document.getElementById("carrier");
    if ($carrierSelect && carrier) {
        const option = [...$carrierSelect.options].find(opt => opt.text === carrier);
        if (option) $carrierSelect.value = option.value;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const radioButtons = document.querySelectorAll('input[name="kl"]');
    const keepBox = document.querySelector('.keep_box');
    const stayBox = document.querySelector('.stay_box');

    radioButtons.forEach((radio, index) => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                radioButtons.forEach(rb => rb.classList.remove('active'));
                radio.classList.add('active');

                if (index === 0) {
                    keepBox.style.display = 'block';
                    stayBox.style.display = 'none';
                } else {
                    keepBox.style.display = 'none';
                    stayBox.style.display = 'block';
                }
            }
        });
    });

    // 페이지 진입 시 '보관함'이 기본 선택되도록
    radioButtons[0].checked = true;
    radioButtons[0].classList.add('active');
    keepBox.style.display = 'block';
    stayBox.style.display = 'none';

    loadStoragePlaces();
    loadPartnerPlaces();
});


async function loadStoragePlaces() {
    const { data, error } = await supabase
        .from("storage_place")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("보관 장소 불러오기 실패:", error);
        return;
    }

    const container = document.querySelector(".keep_box");
    container.innerHTML = "";

    data.forEach((place) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
      <label>
        <div class="card_title">
          <input type="radio" name="keep_location" value="${place.name}">
          <h3>${place.name}</h3>
        </div>
        <div class="card_body">
          <p>운영시간 : "오전10시 ~ 오후10시"</p>
          <p>${place.address}</p>
        </div>
      </label>
    `;
        container.appendChild(card);
    });
}

async function loadPartnerPlaces() {
    const { data, error } = await supabase
        .from("partner_place")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("숙소 목록 불러오기 실패:", error);
        return;
    }

    const container = document.querySelector(".stay_box");
    container.innerHTML = "";

    data.forEach((hotel) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
      <label>
        <div class="card_title">
          <input type="radio" name="keep_location" value="${hotel.name}">
          <h3>${hotel.name}</h3>
        </div>
        <div class="card_body">
          <p>운영시간 : "오전10시 ~ 오후10시"</p>
          <p>${hotel.address}</p>
        </div>
      </label>
    `;
        container.appendChild(card);
    });
}

document.getElementById('phone').addEventListener('input', function (e) {
    let num = e.target.value.replace(/[^0-9]/g, '');

    if (num.length < 4) {
        e.target.value = num;
    } else if (num.length < 8) {
        e.target.value = `${num.slice(0, 3)}-${num.slice(3)}`;
    } else {
        e.target.value = `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
    }
});
