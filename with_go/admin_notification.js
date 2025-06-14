let supabase;

document.addEventListener("DOMContentLoaded", async function () {
    await loadHeaderAndFooter();

    const supabaseUrl = "https://zgrjjnifqoactpuqolao.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmpqbmlmcW9hY3RwdXFvbGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNDc0NTgsImV4cCI6MjA1NjgyMzQ1OH0._Vl-6CRKdMjeDRyNoxlfect7sgusZ7L0N5OYu0a5hT0";
    supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

    // ✅ '추가' 버튼 하나로 처리
    const submitBtn = document.querySelector(".bt1");
    if (submitBtn) submitBtn.addEventListener("click", handleNoticeSubmit);

    const textarea = document.getElementById("notice-content");
    textarea.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
    });

    await loadNotices();
});


async function loadHeaderAndFooter() {
    try {
        const headerRes = await fetch("header.html");
        const footerRes = await fetch("footer.html");

        if (headerRes.ok) {
            document.querySelector(".header").innerHTML = await headerRes.text();
        }
        if (footerRes.ok) {
            document.querySelector(".footer").innerHTML = await footerRes.text();
        }
    } catch (error) {
        console.error("헤더/푸터 로드 실패:", error);
    }
}

async function loadNotices() {
    const { data, error } = await supabase
        .from("withgo_notifications")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("공지사항 불러오기 실패:", error);
        return;
    }
    const noticeList = document.getElementById("notice-list");
    noticeList.innerHTML = "";

    data.forEach(notice => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${notice.id}</td>
      <td class="clickable-title" onclick="editNotice(${notice.id})">${notice.title}</td>
      <td>${new Date(notice.created_at).toLocaleDateString()}</td>
      <td>
        <button class="edit-btn" onclick="editNotice(${notice.id})">수정</button>
        <button class="delete-btn" onclick="deleteNotice(${notice.id})">삭제</button>
      </td>
    `;
        noticeList.appendChild(row);
    });
}


async function handleNoticeSubmit(event) {
    event.preventDefault();

    const id = document.getElementById("notice-id").value.trim();
    const title = document.getElementById("notice-title").value.trim();
    const content = document.getElementById("notice-content").value.trim();

    if (!title || !content) {
        alert("모든 필드를 입력해주세요!");
        return;
    }

    if (id) {

        const { error } = await supabase
            .from("withgo_notifications")
            .update({ title, content })
            .eq("id", id)

        if (error) {
            console.error("공지 수정 실패:", error);
            alert("공지 수정 중 오류 발생!");
            return;
        }

        alert("공지사항이 수정되었습니다!");
    } else {

        const { error } = await supabase
            .from("withgo_notifications")
            .insert([{ title, content,}]);

        if (error) {
            console.error("공지 추가 실패:", error);
            alert("공지 추가 중 오류 발생!");
            return;
        }

        alert("공지사항이 등록되었습니다!");
    }


    await loadNotices();
    resetForm();
}


async function editNotice(id) {
    const { data, error } = await supabase
        .from("withgo_notifications")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("공지사항 조회 실패:", error);
        return;
    }


    const plainContent = data.content.replace(/<[^>]*>?/gm, '');

    document.getElementById("notice-id").value = data.id;
    document.getElementById("notice-title").value = data.title;
    document.getElementById("notice-content").value = plainContent;
}


async function deleteNotice(id) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const { error } = await supabase
        .from("withgo_notifications")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("공지 삭제 실패:", error);
        alert("삭제 중 오류 발생!");
        return;
    }

    alert("공지사항이 삭제되었습니다!");
    await loadNotices();
}


function resetForm() {
    document.getElementById("notice-id").value = "";
    document.getElementById("notice-title").value = "";
    document.getElementById("notice-content").value = "";
}