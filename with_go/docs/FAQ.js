
document.addEventListener("DOMContentLoaded", async function () {
    const faqData = await loadFAQ();
    if (faqData.length > 0) {
        renderFAQ(faqData);
        showPage(1);
    } else {
        console.error("📌 FAQ 데이터가 없습니다!");
    }

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("question")) {
            const answer = event.target.nextElementSibling;
            document.querySelectorAll(".answer").forEach((ans) => {
                if (ans !== answer) {
                    ans.classList.remove("active");
                    ans.style.maxHeight = "0";
                    ans.style.opacity = "0";
                }
            });

            answer.classList.toggle("active");
            if (answer.classList.contains("active")) {
                setTimeout(() => {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                    answer.style.opacity = "1";
                }, 10);
            } else {
                answer.style.maxHeight = "0";
                answer.style.opacity = "0";
            }
        }
    });
});

async function loadFAQ() {
    let { data, error } = await supabase
        .from("withgo_faqs")
        .select("*")
        .eq("status", "공개")
        .order("created_at", { ascending: true });

    if (error) {
        console.error("FAQ 데이터를 불러오는 중 오류 발생:", error);
        return [];
    }
    return data;
}

function renderFAQ(faqData) {
    const page1Container = document.getElementById("page1");
    const page2Container = document.getElementById("page2");

    page1Container.innerHTML = "";
    page2Container.innerHTML = "";

    faqData.forEach((item, index) => {
        const faqItem = document.createElement("div");
        faqItem.classList.add("faq-item");

        const question = document.createElement("div");
        question.classList.add("question");
        question.innerHTML = item.question;

        const answer = document.createElement("div");
        answer.classList.add("answer");
        answer.innerHTML = `
          <span class="label-a">A</span>
          <span class="answer-text">${item.answer}</span>
        `;

        faqItem.appendChild(question);
        faqItem.appendChild(answer);

        if (index < 8) {
            page1Container.appendChild(faqItem);
        } else {
            page2Container.appendChild(faqItem);
        }
    });
}

function showPage(page) {
    document.getElementById("page1").style.display = page === 1 ? "block" : "none";
    document.getElementById("page2").style.display = page === 2 ? "block" : "none";

    document.querySelectorAll(".page-button").forEach((btn) => btn.classList.remove("active"));
    const buttons = document.querySelectorAll(".page-button");
    if (buttons[page - 1]) {
        buttons[page - 1].classList.add("active");
    }
}

window.showPage = showPage;
