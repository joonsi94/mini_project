document.addEventListener("DOMContentLoaded", function () {
    const formWrapper = document.querySelector(".form-wrapper");
    const formContainer = document.querySelector(".form-container");

    if (!formWrapper || !formContainer) {
        console.error("⚠️ .form-wrapper 또는 .form-container를 찾을 수 없음!");
        return;
    }

    formContainer.addEventListener("click", function (event) {
        event.stopPropagation();
        formWrapper.classList.toggle("open"); // ✅ 'open' 클래스를 추가/제거
        console.log("✅ form-wrapper 클래스 토글됨:", formWrapper.classList.contains("open"));
    });

    // 바깥 클릭하면 다시 숨기기
    document.addEventListener("click", function (event) {
        if (!formWrapper.contains(event.target)) {
            formWrapper.classList.remove("open");
            console.log("❌ form-wrapper 닫힘");
        }
    });
});