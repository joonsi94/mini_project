// Supabase 연결
const supabaseUrl = "https://zgrjjnifqoactpuqolao.supabase.co";
const supabasePassword = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmpqbmlmcW9hY3RwdXFvbGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNDc0NTgsImV4cCI6MjA1NjgyMzQ1OH0._Vl-6CRKdMjeDRyNoxlfect7sgusZ7L0N5OYu0a5hT0";
const supabase = window.supabase.createClient(supabaseUrl, supabasePassword);

document.addEventListener("DOMContentLoaded", async function () {
  const fileInput = document.getElementById("upload_file");
  const fileNameSpan = document.getElementById("file_name");

  // 수정 모드 여부 확인
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode"); // 'edit' or null
  const reviewNum = urlParams.get("review_num");

  let originFileName = null; // 기존 파일 이름 저장 변수

  // 파일 선택 시 이름 표시
  fileInput.addEventListener("change", function () {
    fileNameSpan.textContent = this.files.length > 0 ? this.files[0].name : "선택된 파일 없음";
  });

  // 수정 모드일 경우 기존 데이터 불러오기
  if (mode === "edit" && reviewNum) {
    const { data, error } = await supabase
        .from("review")
        .select("*")
        .eq("review_num", reviewNum)
        .single();

    if (error || !data) {
      Swal.fire("불러오기 실패", "기존 데이터를 불러오지 못했습니다.", "error");
      return;
    }

    // 입력창에 기존 데이터 채우기
    document.getElementById("name").value = data.name;
    document.getElementById("password").value = data.password;
    document.getElementById("title").value = data.title;
    document.getElementById("review_text").value = data.review_txt;

    if (data.type === "배송") document.getElementById("type1").checked = true;
    if (data.type === "보관") document.getElementById("type2").checked = true;

    if (data.file_url) {
      originFileName = data.file_url.split("/").pop(); // 기존 파일명 추출
    }
  }

  // 확인 버튼 클릭 이벤트
  document.getElementById("submit-btn").addEventListener("click", async function () {
    const name = document.getElementById("name").value.trim();
    const password = document.getElementById("password").value.trim();
    const title = document.getElementById("title").value.trim();
    const type = document.querySelector('input[name="type"]:checked')?.value;
    const review_txt = document.getElementById("review_text").value.trim();
    const file = fileInput.files[0];

    const { data: userRes } = await supabase.auth.getUser();
    const user_id = userRes?.user?.id;

    // 필수 항목 검증
    if (!name || !password || !title || !type || !review_txt) {
      await Swal.fire("입력 실패", "* 표시된 항목을 모두 입력해 주세요.", "error");
      return;
    }

    let file_url = null;

    // 파일 업로드 처리
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = crypto.randomUUID() + "." + fileExt;
      const filePath = `review_uploads/${fileName}`;
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];


      const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

      if (uploadError) {
        Swal.fire("파일 업로드 실패", "파일 업로드 중 오류가 발생했습니다.", "error");
        return;
      }

      if (!allowedExtensions.includes(fileExt)) {
        Swal.fire({
          icon: "error",
          title: "파일 업로드 실패",
          html: "지원되지 않는 파일 형식입니다.<br>jpg, jpeg, png, gif, bmp 파일만 업로드 가능합니다.",
          confirmButtonText: '확인'
        });
        return;
      }

          const { data: publicUrl } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

      file_url = publicUrl.publicUrl;
    }

    // 수정 모드일 경우
    if (mode === "edit" && reviewNum) {
      // 새로 파일을 올렸다면 기존 파일 삭제
      if (file_url && originFileName) {
        const oldFilePath = `review_uploads/${originFileName}`;
        await supabase.storage.from("images").remove([oldFilePath]);
      }

      // 리뷰 업데이트 실행
      const { error: updateError } = await supabase
          .from("review")
          .update({
            name,
            password,
            title,
            type,
            review_txt,
            ...(file_url && { file_url }) // 새 이미지가 있을 경우만 업데이트
          })
          .eq("review_num", reviewNum);

      if (updateError) {
        Swal.fire("수정 실패", "후기 수정 중 오류가 발생했습니다.", "error");
        return;
      }

      await Swal.fire("수정 완료", "후기가 성공적으로 수정되었습니다.", "success");
      window.location.href = "review.html";
      return;
    }

    // 👉 새로 작성하는 경우 (insert)
    const { error } = await supabase.from("review").insert([
      {
        name,
        password,
        title,
        type,
        review_txt,
        user_id,
        created_at: new Date(new Date().getTime() + 9 * 60 * 60 * 1000),    // 한국 시간
        file_url
      }
    ]);

    if (error) {
      Swal.fire("등록 실패", "후기 등록에 실패했습니다.", "error");
      return;
    }

    await Swal.fire("등록 완료", "후기가 성공적으로 등록되었습니다.", "success");
    window.location.href = "review.html";
  });
});

// 숫자만 입력 가능
function validation_num(ev) {
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

  if (!/[0-9]/.test(ev.key) && !allowedKeys.includes(ev.key)) {
    ev.preventDefault();
  }
}