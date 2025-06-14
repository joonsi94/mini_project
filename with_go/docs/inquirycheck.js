document.addEventListener("keydown", function (event) {
  if (
    event.key === "Backspace" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    history.back(); // 이전 페이지로 이동
  }
});

function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchPostDetails(postId) {
  const { data, error } = await supabase
    .from("question")
    .select("*")
    .eq("text_num", postId);

  if (error) {
    console.error("게시글 조회 오류:", error);
    return null;
  }

  return data ? data[0] : null;
}

async function displayPostDetails() {
  const postId = getPostIdFromURL();

  if (!postId) {
    Swal.fire({
      title: "게시글 찾기 실패",
      text: "게시글을 찾을 수 없습니다.",
      icon: "error",
      confirmButtonText: "확인",
    });
    return;
  }

  const postDetails = await fetchPostDetails(postId);

  if (!postDetails) {
    Swal.fire({
      title: "게시글 찾기 실패",
      text: "게시글을 찾을 수 없습니다.",
      icon: "error",
      confirmButtonText: "확인",
    });
    return;
  }

  const postHeaderHTML1 = `
        <h1>${postDetails.title}</h1>
        <div>
            <p style="margin-right:25px; font-size: 15px;">작성자: ${
              postDetails.name
            }</p>
            <p style="font-size: 15px;">작성일: ${new Date(
              postDetails.created_at
            ).toLocaleDateString()} ${new Date(
    postDetails.created_at
  ).toLocaleTimeString()}</p>
        </div>
    `;
  const postHeaderHTML2 = `
            <p>${postDetails.question_txt}</p>
    `;

  let postHeaderHTML3 = `
    <p>첨부 파일: <a href="${
      postDetails.image_url
    }" target="_blank">${postDetails.image_url.split("/").pop()}</a></p>
`;

  let postHeaderHTML4 = `
    <h3>답변</h3>
    <pre><p>${postDetails.answer === null ? '' : postDetails.answer}</p></pre>`;

  // 첨부된 파일이 있는 경우
  if (postDetails.image_url) {
    // 파일 URL을 변수로 저장
    const fileUrl = postDetails.image_url;
    const fileName = fileUrl.split("/").pop(); // 파일 이름을 추출

    // 파일 확장자 확인
    const fileExtension = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(fileExtension)) {
      // 이미지일 경우 미리보기로 이미지를 표시
      postHeaderHTML3 += `
            <div style="text-align: left;">
                <img src="${fileUrl}" alt="첨부된 이미지" style="max-width: 200px; max-height: 200px; cursor: pointer; margin-top: 10px;">
            </a>
        `;
    }
  } else {
    // 첨부된 파일이 없는 경우
    postHeaderHTML3 = `<p>첨부 파일: 첨부된 파일이 없습니다.</p>`;
  }

  document.getElementById("cen_heder2").innerHTML = postHeaderHTML1;
  document.getElementById("cen_content").innerHTML = postHeaderHTML2;
  document.getElementById("cen_content2").innerHTML = postHeaderHTML3;
  document.getElementById("cen_content3").innerHTML = postHeaderHTML4;
}

async function deletePost(postId) {
  const { error } = await supabase
    .from("question")
    .delete()
    .eq("text_num", postId); // 해당 게시글 삭제

  if (error) {
    console.error("게시글 삭제 오류:", error);
    Swal.fire({
      title: "삭제 실패",
      text: "게시글 삭제에 실패했습니다.",
      icon: "error",
    });
    return;
  }

  Swal.fire({
    title: "삭제 완료",
    text: "게시글 삭제에 성공하였습니다.",
    icon: "success",
  }).then(() => {
    window.location.href = "inquiry.html"; // 삭제 후 목록 페이지로 이동
  });
}

// 비밀글 여부 확인
async function isSecretPost(postId) {
  const postDetails = await fetchPostDetails(postId);
  return postDetails && postDetails.secret === true; // 'secret' 컬럼이 true이면 비밀글
}

// 비밀번호 입력 팝업
async function promptForPassword(postId) {
  const { value: password } = await Swal.fire({
    title: "비밀번호 확인",
    text: "등록한 비밀번호를 입력하세요",
    input: "password",
    inputAttributes: {
      autocapitalize: "off",
      placeholder: "비밀번호",
      inputMode: "numeric", // 모바일에서 숫자 키패드로 입력할 수 있도록 설정
      maxlength: 6, // 최대 6자리 입력 가능
      pattern: "^[0-9]{1,6}$",
      autocomplete: "off",
    },
    showCancelButton: true,
    confirmButtonText: "확인",
    cancelButtonText: "취소",
    reverseButtons: true,
    inputValidator: (value) => {
      if (!value) {
        return "비밀번호를 입력해주세요.";
      }
      if (!/^\d{1,6}$/.test(value)) {
        return "숫자만 입력 가능합니다.";
      }
    },
  });

  if (password) {
    const postDetails = await fetchPostDetails(postId); // 게시글의 세부 정보 가져오기
    if (postDetails && postDetails.pw === password) {
      // 비밀번호 비교
      return true; // 비밀번호가 맞으면 true 반환
    } else {
      Swal.fire({
        title: "비밀번호 오류",
        text: "입력하신 비밀번호가 올바르지 않습니다.",
        icon: "error",
      });
      return false; // 비밀번호가 틀리면 false 반환
    }
  }
  return false; // 취소 버튼을 클릭하면 false 반환
}

document.addEventListener("DOMContentLoaded", displayPostDetails);

// document.getElementById("modify").addEventListener("click", function (event) {
//     event.preventDefault();
//     window.location.href = `modify.html?id=${getPostIdFromURL()}`;
// });

document
  .getElementById("modify")
  .addEventListener("click", async function (event) {
    event.preventDefault(); // 기본 동작(페이지 이동)을 막음

    const postId = getPostIdFromURL(); // URL에서 게시글 ID 가져오기
    if (!postId) {
      Swal.fire({
        title: "Error!",
        text: "게시글 ID를 찾을 수 없습니다.",
        icon: "error",
      });
      return;
    }

    const isSecret = await isSecretPost(postId); // 비밀글 여부 확인

    if (isSecret) {
      // 비밀글인 경우 비밀번호 확인 없이 바로 수정 페이지로 이동
      window.location.href = `modify.html?id=${postId}`;
    } else {
      // 비밀글이 아닌 경우 비밀번호 입력 팝업을 띄우고, 비밀번호가 맞으면 수정 페이지로 이동
      const isPasswordCorrect = await promptForPassword(postId);
      if (isPasswordCorrect) {
        window.location.href = `modify.html?id=${postId}`;
      }
    }
  });

document
  .getElementById("delete")
  .addEventListener("click", async function (event) {
    event.preventDefault(); // 기본 동작(페이지 이동)을 막음

    const postId = getPostIdFromURL(); // URL에서 게시글 ID 가져오기
    if (!postId) {
      Swal.fire({
        title: "Error!",
        text: "게시글 ID를 찾을 수 없습니다.",
        icon: "error",
      });
      return;
    }

    const isSecret = await isSecretPost(postId); // 비밀글 여부 확인

    if (isSecret) {
      // 비밀글인 경우, 비밀번호 확인 없이 바로 삭제
      Swal.fire({
        title: "정말 삭제하시겠습니까?",
        text: "삭제된 후기는 복구할 수 없습니다.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "삭제",
        cancelButtonText: "취소",
      }).then((result) => {
        if (result.isConfirmed) {
          deletePost(postId); // 삭제 함수 호출
        }
      });
    } else {
      // 비밀글이 아닌 경우 비밀번호 입력 팝업을 띄움
      const isPasswordCorrect = await promptForPassword(postId);

      if (isPasswordCorrect) {
        deletePost(postId); // 비밀번호가 맞으면 삭제
      }
    }
  });

// // 삭제 버튼 클릭 시 게시글 삭제
// document.getElementById("delete").addEventListener("click", async function (event) {
//     event.preventDefault();  // 기본 동작(페이지 이동)을 막음

//     const postId = getPostIdFromURL();
//     if (!postId) {
//         Swal.fire({
//             title: "Error!",
//             text: "게시글 ID를 찾을 수 없습니다.",
//             icon: "error"
//         });
//         return;
//     }

//     const isSecret = await isSecretPost(postId);  // 비밀글 여부 확인

//     if (isSecret) {
//         // 비밀글이면 비밀번호 입력 없이 바로 삭제
//         Swal.fire({
//             title: "정말 삭제하시겠습니까?",
//             text: "삭제된 후기는 복구할 수 없습니다.",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonText: "삭제",
//             cancelButtonText: "취소",
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 deletePost(postId);  // 삭제 함수 호출
//             }
//         });
//     } else {
//         // 비밀글이 아니면 비밀번호 입력 팝업
//         promptForPassword(postId);
//     }
// });
