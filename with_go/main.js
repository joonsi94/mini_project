document.addEventListener("DOMContentLoaded", function () {
    const sections = [
        document.querySelector(".main_section"),
        document.querySelector(".main_section2"),
        document.querySelector(".main_section3")
    ];

    let currentIndex = 0;
    let isScrolling = false;
    let lastScrollTime = 0;
    const scrollCooldown = 800;

    window.addEventListener("wheel", function (e) {
        const now = Date.now();
        if (now - lastScrollTime < scrollCooldown || isScrolling) return;
        isScrolling = true;

        if (e.deltaY > 30) {
            currentIndex = Math.min(currentIndex + 1, sections.length - 1);
        } else if (e.deltaY < -30) {
            currentIndex = Math.max(currentIndex - 1, 0);
        } else {
            isScrolling = false;
            return;
        }

        sections[currentIndex].scrollIntoView({ behavior: "smooth" });
        lastScrollTime = now;

        setTimeout(() => {
            isScrolling = false;
        }, scrollCooldown);
    });

    // ✅ 약관 전문보기 버튼 클릭 시 모달 열기
    document.querySelector(".privacy_open").addEventListener("click", function () {
        document.getElementById("privacyModal").style.display = "block";
    });

    // ✅ 약관 모달 닫기 함수 (전역)
    window.closePrivacyModal = function () {
        document.getElementById("privacyModal").style.display = "none";
    };
});

// ✅ [신청하기] 클릭 시 실행 함수
function goToReservation() {
    const name = document.querySelector('input[name="name"]').value.trim();
    const tel1 = document.querySelector('input[name="B_TEL1"]').value.trim();
    const tel2 = document.querySelector('input[name="B_TEL2"]').value.trim();
    const tel3 = document.querySelector('input[name="B_TEL3"]').value.trim();
    const phone = tel1 + tel2 + tel3;

    const carrierSelect = document.querySelector('select[name="package"]');
    const carrier = carrierSelect.options[carrierSelect.selectedIndex].text;

    const isAgreed = document.querySelector('#agree').checked;

    // 필수 체크
    if (!name || !tel1 || !tel2 || !tel3 || phone.length < 10 || carrier === "패키지 종류") {
        alert("이름, 연락처, 캐리어 종류를 모두 입력해주세요");
        return;
    }

    if (!isAgreed) {
        alert("이용약관에 동의해 주세요.");
        return;
    }

    // 저장 (선택된 텍스트로 저장)
    localStorage.setItem("reservation_name", name);
    localStorage.setItem("reservation_phone", phone);
    localStorage.setItem("reservation_carrier", carrier);

    // 👉 reservation.html로 이동 (보관/배송 선택하는 곳)
    window.location.href = "reservation.html";
}
