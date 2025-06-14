document.addEventListener("keydown", function (event) {
  if (
    event.key === "Backspace" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    history.back(); // 이전 페이지로 이동
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("name").focus(); // 이름 입력창에 포커스
});

document.addEventListener("DOMContentLoaded", async function () {
  // URL에서 text_num 파라미터를 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const textNum = urlParams.get("id"); // 'text_num'이 URL에 포함된 값을 가져옵니다.

  // text_num이 없으면 오류 처리
  if (!textNum) {
    Swal.fire({
      title: "잘못된 접근",
      text: "잘못된 접근입니다.",
      icon: "error",
      confirmButtonText: "확인",
    }).then(() => {
      window.location.href = "inquirycheck.html"; // 잘못된 접근시 목록 페이지로 이동
    });
  }

  const { data, error } = await supabase
    .from("question") // 게시글이 저장된 테이블 이름
    .select("*")
    .eq("text_num", textNum) // 해당 ID의 게시글을 가져옴
    .single(); // 하나의 레코드만 가져옴

  if (error) {
    console.error("게시글을 불러오는 데 실패했습니다:", error);
    Swal.fire({
      title: "오류 발생",
      text: "게시글을 불러오지 못했습니다.",
      icon: "error",
      confirmButtonText: "확인",
    });
    return;
  }

  // 불러온 데이터로 입력 필드 채우기
  document.getElementById("name").value = data.name;
  document.getElementById("password").value = data.pw;
  document.getElementById("title").value = data.title;
  document.getElementById("write_text").value = data.question_txt;
  document.getElementById("secret-toggle").checked = data.secret;

  // 예약 종류 (라디오 버튼) 처리
  const typeRadio = document.querySelector(
    `input[name="type"][value="${data.type}"]`
  );
  if (typeRadio) {
    typeRadio.checked = true;
  }

  // 첨부파일 처리 (필요에 따라 파일 URL을 처리할 수 있습니다)
  // 예를 들어, `data.file_url`이 있을 경우 처리할 수 있음

  // 수정 버튼 클릭 시
  document
    .getElementById("input-btn")
    .addEventListener("click", async function () {
      const name = document.getElementById("name").value;
      const password = document.getElementById("password").value;
      const title = document.getElementById("title").value;
      const content = document.getElementById("write_text").value;
      const secret = document.getElementById("secret-toggle").checked;
      const type = document.querySelector('input[name="type"]:checked').value;
      const file = document.querySelector("#file").files[0];

      let fileUrl = data.file_url; // 기존 파일 URL을 사용 (파일을 수정하지 않으면 기존 파일 유지)

      // 파일이 업로드된 경우 새로운 파일을 Supabase에 업로드하고 URL을 가져옴
      if (file) {
        const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp"];
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
          Swal.fire({
            icon: "error",
            title: "파일 업로드 실패",
            html: "지원되지 않는 파일 형식입니다.<br>jpg, jpeg, png, gif, bmp 파일만 업로드 가능합니다.",
            confirmButtonText: "확인",
          });
          return;
        }

        const filename = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
        const { data: fileData, error: uploadError } = await supabase.storage
          .from("images/question_uploads")
          .upload(filename, file);

        if (uploadError) {
          console.error("파일 업로드 실패:", uploadError);
          Swal.fire({
            title: "파일 업로드 실패",
            text: "파일 업로드에 실패했습니다.",
            icon: "error",
            confirmButtonText: "확인",
          });
          return;
        }

        // 파일 업로드 성공 후 URL을 가져옴
        const { data: fileUrlData, error: getUrlError } = await supabase.storage
          .from("images/question_uploads")
          .getPublicUrl(filename);

        if (getUrlError) {
          console.error("파일 URL을 가져오는 데 실패했습니다:", getUrlError);
          Swal.fire({
            title: "파일 URL 가져오기 실패",
            text: "파일 URL을 가져오는 데 실패했습니다.",
            icon: "error",
            confirmButtonText: "확인",
          });
          return;
        }

        fileUrl = fileUrlData.publicUrl; // 새로운 파일 URL로 업데이트
      }

      // 입력된 데이터를 Supabase에 업데이트
      const { data: updatedData, error: updateError } = await supabase
        .from("question")
        .update({
          name: name,
          pw: password,
          title: title,
          question_txt: content,
          secret: secret,
          type: type,
          image_url: fileUrl, // 새로운 파일 URL을 저장
        })
        .eq("text_num", textNum); // 수정할 게시글 ID를 지정

      if (updateError) {
        console.error("수정 실패", updateError);
        Swal.fire({
          title: "수정 실패",
          text: "수정에 실패했습니다.",
          icon: "error",
          confirmButtonText: "확인",
        });
      } else {
        Swal.fire({
          title: "수정 완료",
          text: "수정 완료되었습니다.",
          icon: "success",
          confirmButtonText: "확인",
        }).then(() => {
          window.location.href = "inquiry.html"; // 수정 완료 후 목록 페이지로 리디렉션
        });
      }
    });
});

const passwordtext = document.getElementById("password");

passwordtext.addEventListener("input", function (event) {
  let inputValue = passwordtext.value;
  passwordtext.value = inputValue.replace(/[^0-9]/g, "");

  if (passwordtext.value.length > 6) {
    passwordtext.value = passwordtext.value.substring(0, 6);
  }
});
