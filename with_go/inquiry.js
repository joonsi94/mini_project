document.addEventListener("DOMContentLoaded", async () => {
  await loadPostsAndPagination();
  setupSearch();
});

document.addEventListener("keydown", function (event) {
  if (
    event.key === "Backspace" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    history.back(); // 이전 페이지로 이동
  }
});

let currentPage = 1;
const itemsPerPage = 10;
const groupSize = 10;
let sortDirection = "desc";
let searchQuery = "";
let searchResults = []; // 검색 결과를 저장할 배열
let totalSearchResults = 0; // 검색 결과의 총 개수

// 검색 기능 초기화
function setupSearch() {
  const searchInput = document.getElementById("searchinput");
  const searchIcon = document.getElementById("searchIcon");
  const searchSelect = document.getElementById("search_select"); // 검색 옵션 select

  // 검색 아이콘 클릭 시
  searchIcon.addEventListener("click", async () => {
    executeSearch();
  });

  // Enter 키 입력 시 검색
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      executeSearch();
      event.preventDefault(); // 기본 동작 방지
    }
  });
}

// 검색 실행 함수 (공통)
async function executeSearch() {
  const searchInput = document.getElementById("searchinput");
  const searchSelect = document.getElementById("search_select"); // 검색 옵션 select

  const inputValue = searchInput.value.trim();
  const searchOption = searchSelect.value; // 선택된 옵션 가져오기

  // 검색어가 2글자 이상인지 확인
  if (inputValue.length >= 2 && inputValue.replace(/\s/g, "").length > 0) {
    searchQuery = inputValue.toLowerCase(); // 검색어 저장
    currentPage = 1; // 첫 페이지로 리셋
    await loadSearchResults(searchOption); // 검색 결과 로드
  } else {
    Swal.fire({
      icon: "error",
      title: "검색 오류",
      text: "검색어는 2글자 이상이어야 하며, 빈 칸만 입력할 수 없습니다.",
    });
  }
}

// 검색 결과 로드 (옵션별 검색 적용)
async function loadSearchResults(searchOption) {
  let query = supabase.from("question").select("*", { count: "exact" });
  // 비밀글 제외 조건 (작성자 검색 제외)
  if (searchOption !== "작성자") {
    query = query.not("secret", "eq", true);
  }
  // 검색 옵션에 따라 조건 적용
  switch (searchOption) {
    case "제목":
      query = query.ilike("title", `%${searchQuery}%`);
      break;
    case "제목+내용":
      query = query.or(
        `title.ilike.%${searchQuery}%,question_txt.ilike.%${searchQuery}%`
      );
      break;
    case "작성자":
      query = query.ilike("name", `%${searchQuery}%`);
      break;
    default:
      query = query.ilike("title", `%${searchQuery}%`);
  }

  // 정렬 적용
  query = query.order("created_at", { ascending: sortDirection === "asc" });

  // 검색 실행
  const { data, count, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  searchResults = data; // 검색 결과 저장
  totalSearchResults = count; // 검색된 게시글 개수

  renderSearchPagination(); // 페이지네이션 갱신
  loadSearchPage(currentPage); // 첫 페이지 로드
}

// 검색 결과에 해당하는 페이지 로드
async function loadSearchPage(page) {
  const offset = (page - 1) * itemsPerPage;
  const to = page * itemsPerPage - 1;

  const boardList = document.getElementById("board_list");
  boardList.innerHTML = "";

  const pageResults = searchResults.slice(offset, to + 1); // 페이지에 해당하는 게시글만 필터링

  if (pageResults.length === 0) {
    boardList.innerHTML = `<tr><td colspan="6">검색된 게시글이 없습니다.</td></tr>`;
    return;
  }

  let today = new getdate();
  pageResults.forEach((item) => {
    const row = document.createElement("tr");

    let displayTitle = "";

    if (item.secret) {
      displayTitle = "🔑 비밀글입니다.";
    } else {
      displayTitle = item.title || "제목 오류입니다.";
    }

    const inquiryUrl = `inquirycheck.html?id=${item.text_num}`;

    if (
      item.created_at != null &&
      today.fullDate == item.created_at.slice(0, 10)
    ) {
      let localTime = new getdate(item.created_at);
      row.innerHTML = `
                <td>${item.text_num}</td>
                <td>${item.type}</td>
                <td class="title"><a href="${inquiryUrl}">${displayTitle}</a></td>
                <td>${item.name}</td>
                <td>${localTime.getTime}</td>
                <td>${item.stat}</td>
            `;
    } else if (item.created_at != null) {
      row.innerHTML = `
                <td>${item.text_num}</td>
                <td>${item.type}</td>
                <td class="title"><a href="${inquiryUrl}">${displayTitle}</a></td>
                <td>${item.name}</td>
                <td>${item.created_at.slice(0, 10)}</td>
                <td>${item.stat}</td>
            `;
    } else {
      row.innerHTML = `
                <td>${item.text_num}</td>
                <td>${item.type}</td>
                <td class="title"><a href="${inquiryUrl}">${displayTitle}</a></td>
                <td>${item.name}</td>
                <td>저장오류</td>
                <td>${item.stat}</td>
            `;
    }
    const titleLink = row.querySelector(".title a");

    if (item.secret) {
      titleLink.addEventListener("click", (e) => {
        e.preventDefault();
        showPasswordPopup(item.text_num); // 비밀번호 팝업을 띄움
      });
    }

    boardList.appendChild(row);
  });
}

// 검색 결과에 대한 페이지네이션 렌더링
function renderSearchPagination() {
  const pageBtnsContainer = document.getElementById("pageBtns");
  pageBtnsContainer.innerHTML = "";

  const totalPages = Math.ceil(totalSearchResults / itemsPerPage);
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  const currentGroup = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGroup * groupSize + 1;
  let endPage = startPage + groupSize - 1;
  if (endPage > totalPages) endPage = totalPages;

  leftBtn.disabled = currentGroup === 0;
  leftBtn.onclick = () => {
    if (currentGroup > 0) {
      currentPage = (currentGroup - 1) * groupSize + 1;
      loadSearchPage(currentPage);
      renderSearchPagination();
    }
  };

  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadSearchPage(currentPage);
      renderSearchPagination();
    }
  };

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.classList.add("page-btn");
    if (i === currentPage) pageBtn.classList.add("active");

    pageBtn.onclick = () => {
      currentPage = i;
      loadSearchPage(currentPage);
      renderSearchPagination(); // 페이지네이션 리렌더링
    };
    pageBtnsContainer.appendChild(pageBtn);
  }

  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadSearchPage(currentPage);
      renderSearchPagination();
    }
  };

  rightBtn.disabled = endPage === totalPages;
  rightBtn.onclick = () => {
    if (endPage < totalPages) {
      currentPage = endPage + 1;
      loadSearchPage(currentPage);
      renderSearchPagination();
    }
  };
}

function getCurrentPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  const pageNum = params.get("pageNum");
  return pageNum ? parseInt(pageNum) : 1;
}

async function getTotalItems() {
  const { data, error, count } = await supabase
    .from("question")
    .select("*", { count: "exact" });

  return count;
}

async function loadPostsAndPagination() {
  currentPage = getCurrentPageFromURL();

  const totalItems = await getTotalItems();

  if (totalItems === 0) {
    document.getElementById("pageBtns").innerHTML = "등록된 게시글이 없습니다.";
    return;
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  renderPagination(totalPages);
  loadPage(currentPage);
}

function renderPagination(totalPages) {
  const pageBtnsContainer = document.getElementById("pageBtns");
  pageBtnsContainer.innerHTML = "";

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  const currentGroup = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGroup * groupSize + 1;
  let endPage = startPage + groupSize - 1;
  if (endPage > totalPages) endPage = totalPages;

  leftBtn.disabled = currentGroup === 0;
  leftBtn.onclick = () => {
    if (currentGroup > 0) {
      currentPage = (currentGroup - 1) * groupSize + 1;
      updatePage(totalPages);
    }
  };

  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      updatePage(totalPages);
    }
  };

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.classList.add("page-btn");
    if (i === currentPage) pageBtn.classList.add("active");

    pageBtn.onclick = () => {
      currentPage = i;
      updatePage(totalPages);
    };
    pageBtnsContainer.appendChild(pageBtn);
  }

  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      updatePage(totalPages);
    }
  };

  rightBtn.disabled = endPage === totalPages;
  rightBtn.onclick = () => {
    if (endPage < totalPages) {
      currentPage = endPage + 1;
      updatePage(totalPages);
    }
  };
}

function updatePage(totalPages) {
  renderPagination(totalPages);
  fetchReviews(currentPage, currentType);
}

function updatePage(totalPages) {
  const url = new URL(window.location);
  url.searchParams.set("pageNum", currentPage);
  window.history.pushState({}, "", url);

  renderPagination(totalPages);
  loadPage(currentPage);
}

class getdate {
  constructor(a) {
    a ? (this.date = new Date(a)) : (this.date = new Date());
  }
  get fullDate() {
    let fullmonth = this.date.getMonth() + 1;
    let fulldate = this.date.getDate();
    if (fullmonth < 10) {
      fullmonth = "0" + fullmonth;
    }
    if (fulldate < 10) {
      fulldate = "0" + fulldate;
    }

    return this.date.getFullYear() + "-" + fullmonth + "-" + fulldate;
  }
  get getTime() {
    let hours = this.date.getHours();
    let minutes = this.date.getMinutes();
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    return hours + ":" + minutes;
  }
}
async function loadPage(page) {
  const offset = (page - 1) * itemsPerPage;
  const to = page * itemsPerPage - 1;

  const { data } = await supabase
    .from("question")
    .select("text_num, type, title, name, secret, created_at, stat, answer")
    .order("created_at", { ascending: sortDirection === "asc" })
    .range(offset, to);

  const boardList = document.getElementById("board_list");
  boardList.innerHTML = "";

  if (data.length === 0) {
    boardList.innerHTML = `<tr><td colspan="6">등록된 게시글이 없습니다.</td></tr>`;
    return;
  }

  let today = new getdate();
  data.forEach((item) => {
    // 비밀글은 검색 시 목록에서 제외
    if (item.secret && searchQuery) {
      return; // 비밀글은 검색 결과에서 제외
    }

    // 검색어에 맞는 게시글만 필터링
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery) &&
      !item.name.toLowerCase().includes(searchQuery)
    ) {
      return; // 검색어에 맞지 않으면 skip
    }

    const row = document.createElement("tr");

    let displayTitle = "";

    if (item.secret) {
      displayTitle = "🔑 비밀글입니다.";
    } else {
      if (
        item.title === undefined ||
        item.title === null ||
        item.title === ""
      ) {
        displayTitle = "제목 오류입니다.";
      } else {
        displayTitle = item.title;
      }
    }

    const inquiryUrl = `inquirycheck.html?id=${item.text_num}`;

    if (
      item.created_at != null &&
      today.fullDate == item.created_at.slice(0, 10)
    ) {
      let localTime = new getdate(item.created_at);
      row.innerHTML = `
             <td>${item.text_num}</td>
    <td>${item.type}</td>
    <td class="title"><a href="${inquiryUrl}">${displayTitle}</a></td>
    <td>${item.name}</td>
    <td>${localTime.getTime}</td>
    <td>${item.stat}</td>
    <td>${item.answer ? item.answer : "-"}</td> <!-- ✅ 답변 추가 -->
`;
    } else if (item.created_at != null) {
      row.innerHTML = `
            <td>${item.text_num}</td>
            <td>${item.type}</td>
            <td class="title"><a href="${inquiryUrl}">${displayTitle}</a></td>
            <td>${item.name}</td>
            <td>${item.created_at.slice(0, 10)}</td>
            <td>${item.stat}</td>
        `;
    } else {
      row.innerHTML = `
            <td>${item.text_num}</td>
            <td>${item.type}</td>
            <td class="title"><a href="${inquiryUrl}">${displayTitle}</a></td>
            <td>${item.name}</td>
            <td>저장오류</td>
            <td>${item.stat}</td>
        `;
    }

    const titleLink = row.querySelector(".title a");

    if (item.secret) {
      titleLink.addEventListener("click", (e) => {
        e.preventDefault();
        showPasswordPopup(item.text_num); // 비밀번호 팝업을 띄움
      });
    }

    // row.onclick = () => {
    //     window.location.href = `inquirycheck.html?id=${item.text_num}`;
    // };

    boardList.appendChild(row);
  });
}

async function showPasswordPopup(postId) {
  // Swal.fire로 비밀번호 입력 팝업 생성
  const { value: enteredPassword, isConfirmed } = await Swal.fire({
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
        return "비밀번호가 입력해주세요.";
      }
      if (!/^\d{1,6}$/.test(value)) {
        return "숫자만 입력 가능하며, 최대 6자리까지 가능합니다.";
      }
    },
    customClass: {
      input: "custom-input", // custom class 추가
    },
    didOpen: () => {
      // 'custom-input' 클래스에 CSS를 적용
      const inputElement = document.querySelector(".swal2-input");
      if (inputElement) {
        event.target.value = event.target.value.replace(/[^0-9]/g, "");
      }
    },
  });

  // 사용자가 비밀번호 입력을 취소했거나 비밀번호가 입력되지 않았을 경우
  if (!isConfirmed || !enteredPassword) {
    return;
  }

  // 비밀번호 확인 과정 (예시)
  const { data, error } = await supabase
    .from("question")
    .select("pw")
    .eq("text_num", postId)
    .single();

  if (error) {
    Swal.fire({
      icon: "error",
      title: "게시글을 찾을 수 없습니다.",
      text: "게시글을 찾는 데 실패했습니다.",
    });
    return;
  }

  if (data.pw === enteredPassword) {
    // 비밀번호가 맞으면 상세 페이지로 이동
    window.location.href = `inquirycheck.html?id=${postId}`;
  } else {
    Swal.fire({
      icon: "error",
      title: "비밀번호가 틀렸습니다.",
      text: "입력한 비밀번호가 맞지 않습니다.",
    });
  }
}
