document.addEventListener("DOMContentLoaded", function () {
    const $checkboxes = document.querySelectorAll(".hm");
    const $ul = document.querySelector("ul");
    const $que = document.querySelector("#que");
    const $section = document.querySelector("section");
    const $form = document.querySelector("form");

    $checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            const li = this.closest("li");
            const content = this.nextElementSibling.nextElementSibling;
            // const $form = this.parentElement.parentElement.parentElement.parentElement.parentElement;
            // const $section = this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
            // const $list = document.getElementById("list");
            // const $pages = document.getElementById("pages");

            if (this.checked) {
                content.style.display = "block";
                li.style.height = content.scrollHeight + 50 + "px";
                $form.style.height = content.scrollHeight + 430 + "px";
                $section.style.height = content.scrollHeight + 850 + "px";
                $que.style.height = content.scrollHeight + 200 + "px";
                // $list.style.height = content.scrollHeight + 10 + "px";
                // $pages.style.height = content.scrollHeight + 0 + "px";
            } else {
                content.style.display = "none";
                li.style.height = "50px";
                $form.style.height = "430px";
                $section.style.height = "800px";
                $que.style.height = "200px";
                // $list.style.height = "auto";
                // $pages.style.height = "20px";
            }

            updateHeight(); // 이 함수가 정의되어 있어야 합니다.
        });
    });
});
